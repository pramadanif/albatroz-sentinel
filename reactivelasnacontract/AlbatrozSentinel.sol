// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
// Official interface according to Reactive Network standard
interface IReactive {
    event Callback(
        uint256 indexed chainId,
        address indexed target,
        uint256 gasLimit,
        bytes payload
    );
    function onEvent(
        uint256 chainId,
        address eventAddress,
        uint256 topic0,
        uint256 topic1,
        uint256 topic2,
        uint256 topic3,
        bytes calldata data
    ) external;
}
// Recommendation: Use ISystemContract only for subscription in constructor
interface ISystemContract {
    function subscribe(uint256 chainId, address contractAddress, uint256 topic0) external payable;
}
contract AlbatrozSentinel is IReactive {
    address public constant SYSTEM_CONTRACT = 0x0000000000000000000000000000000000fffFfF; 
    uint256 public constant SEPOLIA_CHAIN_ID = 11155111;
    address public vaultAddress;
    address public poolA;
    address public poolB;
    
    // Keccak256 hash of RateUpdated(uint256,uint256)
    uint256 public constant RATE_UPDATED_TOPIC0 = 0xb38780ddde1f073d91c150de2696f3f7085883648ba21cc5ef01029cb21d1916;
    uint256 public rateA;
    uint256 public utilA;
    uint256 public rateB;
    uint256 public utilB;

    // Cooldown Mechanism (Anti-Spam)
    uint256 public lastRebalanceTime;
    uint256 public constant COOLDOWN_PERIOD = 1 hours;
    
    // Gas Guard Config (Financial Prudence)
    uint256 public gasPrice = 25 * 10**9; // 25 Gwei (adjustable)
    uint256 public ethPrice = 2000 * 10**18; // $2000 per ETH (oracle-ready)
    uint256 public minProfitThreshold = 10 * 10**6; // Min $10 profit required (USDC = 6 decimals)

    constructor(address _vault, address _poolA, address _poolB) {
        vaultAddress = _vault;
        poolA = _poolA;
        poolB = _poolB;
        // Subscriptions will be configured via owner admin call or manually
    }
    // onEvent Signature Adjustment (Adding topic1-3 according to IReactive standard)
    function onEvent(
        uint256 chainId,
        address eventAddress,
        uint256 topic0,
        uint256, // topic1
        uint256, // topic2
        uint256, // topic3
        bytes calldata data
    ) external override {
        // Security: Only System Contract is allowed to trigger onEvent
        require(msg.sender == SYSTEM_CONTRACT, "Unauthorized");
        (uint256 rate, uint256 util) = abi.decode(data, (uint256, uint256));
        if (eventAddress == poolA) {
            rateA = rate; utilA = util;
        } else if (eventAddress == poolB) {
            rateB = rate; utilB = util;
        }
        _optimize();
    }
    function _optimize() internal {
        // Check Cooldown to save gas and prevent spam
        if (block.timestamp < lastRebalanceTime + COOLDOWN_PERIOD) {
            return;
        }

        int256 scoreA = int256(rateA * 80) - int256(utilA * 20);
        int256 scoreB = int256(rateB * 80) - int256(utilB * 20);
        
        if (scoreB > scoreA + 200) {
            // === GAS GUARD: Profitable Only ===
            // Estimate gas cost: 200,000 gas limit
            uint256 gasUsed = 200000;
            uint256 gasCostUSD = (gasUsed * gasPrice * ethPrice) / (10**18 * 10**9); // Convert to USD
            
            // Estimate profit from rate differential
            // Simplified: score difference = rate opportunity (in basis points)
            uint256 scoreDifference = uint256(scoreB - scoreA);
            uint256 baseRebalanceAmount = 1000 * 10**6; // 1000 USDC
            uint256 estimatedProfitUSD = (scoreDifference * baseRebalanceAmount) / 10000; // BPS to ratio
            
            // FINANCIAL CHECK: Only proceed if profit > gas cost + margin
            require(estimatedProfitUSD > gasCostUSD + minProfitThreshold, "GasGuard: Unprofitable rebalance");
            
            // Update last rebalance time
            lastRebalanceTime = block.timestamp;

            // Rebalance 1000 USDC (with safety margin)
            bytes memory payload = abi.encodeWithSignature(
                "rebalance(address,address,uint256,uint256)",
                poolA, poolB, baseRebalanceAmount, (baseRebalanceAmount * 99) / 100 // 1% slippage tolerance
            );
            // REACTIVE STANDARD: Using Callback event to trigger L1
            // gasLimit 200,000 is the safe standard for rebalance on Sepolia
            emit Callback(SEPOLIA_CHAIN_ID, vaultAddress, 200000, payload);
        }
    }
    
    // Admin function to update gas price (keeper bot or oracle integration)
    function updateGasPrice(uint256 newGasPrice) external {
        gasPrice = newGasPrice;
    }
    
    // Admin function to update ETH price (oracle integration ready)
    function updateEthPrice(uint256 newEthPrice) external {
        ethPrice = newEthPrice;
    }
    
    // Admin function to update minimum profit threshold
    function updateMinProfitThreshold(uint256 newThreshold) external {
        minProfitThreshold = newThreshold;
    }
}