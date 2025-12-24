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
    function subscribe(uint256 chainId, address contractAddress, uint256 topic0) external;
}
contract AlbatrozSentinel is IReactive {
    address public constant SYSTEM_CONTRACT = 0x0000000000000000000000000000000000ffffFF; 
    uint256 public constant SEPOLIA_CHAIN_ID = 11155111;
    address public vaultAddress;
    address public poolA;
    address public poolB;
    
    // Keccak256 hash of RateUpdated(uint256,uint256)
    uint256 public constant RATE_UPDATED_TOPIC0 = 0x794936466378e9f5e92751f339242a9a7a6723223126f58479e0069e23730704;
    uint256 public rateA;
    uint256 public utilA;
    uint256 public rateB;
    uint256 public utilB;

    // Cooldown Mechanism (Anti-Spam)
    uint256 public lastRebalanceTime;
    uint256 public constant COOLDOWN_PERIOD = 1 hours;

    constructor(address _vault, address _poolA, address _poolB) {
        vaultAddress = _vault;
        poolA = _poolA;
        poolB = _poolB;
        
        // Subscribe through System Contract during deployment
        ISystemContract(SYSTEM_CONTRACT).subscribe(SEPOLIA_CHAIN_ID, poolA, RATE_UPDATED_TOPIC0);
        ISystemContract(SYSTEM_CONTRACT).subscribe(SEPOLIA_CHAIN_ID, poolB, RATE_UPDATED_TOPIC0);
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
            // Update last rebalance time
            lastRebalanceTime = block.timestamp;

            // Rebalance 1000 USDC
            // Note: In production, this should be dynamic or percentage-based.
            // For demo purposes, we move a fixed chunk to demonstrate the logic.
            bytes memory payload = abi.encodeWithSignature(
                "rebalance(address,address,uint256,uint256)",
                poolA, poolB, 1000 * 10**6, 990 * 10**6
            );
            // REACTIVE STANDARD: Using Callback event to trigger L1
            // gasLimit 200,000 is the safe standard for rebalance on Sepolia
            emit Callback(SEPOLIA_CHAIN_ID, vaultAddress, 200000, payload);
        }
    }
}