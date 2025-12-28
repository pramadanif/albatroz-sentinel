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

interface ISystemContract {
    function subscribe(
        uint256 chainId, 
        address contractAddress, 
        uint256 topic0, 
        uint256 topic1, 
        uint256 topic2, 
        uint256 topic3
    ) external payable;
}

contract AlbatrozSentinel is IReactive {
    address public constant SYSTEM_CONTRACT = 0x0000000000000000000000000000000000fffFfF; 
    uint256 public constant SEPOLIA_CHAIN_ID = 11155111;
    uint256 public constant REACTIVE_IGNORE = 0xa65f96fc951c35ead38878e0f0b7a3c744a6f5ccc1476b313353ce31712313ad;
    
    address public vaultAddress;
    
    // --- ENHANCEMENT 4: SCALABILITY (Reusable Registry) ---
    struct PoolInfo {
        uint256 rate;
        uint256 util;
        bool isTracked;
    }
    mapping(address => PoolInfo) public pools;
    address[] public trackedPools;
    address public currentPool; // Where the funds currently are

    // Keccak256 hash of RateUpdated(uint256,uint256)
    uint256 public constant RATE_UPDATED_TOPIC0 = 0xb38780ddde1f073d91c150de2696f3f7085883648ba21cc5ef01029cb21d1916;

    // Cooldown Mechanism (Anti-Spam)
    uint256 public lastRebalanceTime;
    uint256 public constant COOLDOWN_PERIOD = 1 hours;
    
    // Gas Guard Config (Financial Prudence)
    uint256 public gasPrice = 25 * 10**9; // 25 Gwei (adjustable)
    uint256 public ethPrice = 2000 * 10**18; // $2000 per ETH (oracle-ready)
    uint256 public minProfitThreshold = 10 * 10**6; // Min $10 profit required (USDC = 6 decimals)

    // --- ENHANCEMENT 2: HYSTERESIS CONFIG ---
    uint256 public constant REBALANCE_THRESHOLD = 250; // 2.5% difference required to move back

    constructor(address _vault, address _initialPool) payable {
        vaultAddress = _vault;
        currentPool = _initialPool;
        // Initialize with at least one pool if needed, or add later via admin
        // addPool(_initialPool);
    }

    function addPool(address _pool) public payable {
        if (!pools[_pool].isTracked) {
            pools[_pool].isTracked = true;
            trackedPools.push(_pool);
            // Subscribe to the pool's events on Sepolia
            try ISystemContract(SYSTEM_CONTRACT).subscribe{value: 0.05 ether}(
                SEPOLIA_CHAIN_ID, 
                _pool, 
                RATE_UPDATED_TOPIC0, 
                REACTIVE_IGNORE, 
                REACTIVE_IGNORE, 
                REACTIVE_IGNORE
            ) {} catch {
                // Ignore failure during simulation
            }
        }
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
        
        // Only process events from tracked pools
        if (!pools[eventAddress].isTracked) return;

        (uint256 rate, uint256 util) = abi.decode(data, (uint256, uint256));
        
        // Update Pool Stats
        pools[eventAddress].rate = rate;
        pools[eventAddress].util = util;

        _optimize();
    }

    function _optimize() internal {
        // Check Cooldown to save gas and prevent spam
        if (block.timestamp < lastRebalanceTime + COOLDOWN_PERIOD) {
            return;
        }

        // --- ENHANCEMENT 1: SAFETY-FIRST (Circuit Breaker) ---
        // If current pool is in danger (util > 95%), force exit immediately
        if (pools[currentPool].util > 9500) { // Assuming 10000 basis points
             _emergencyEvacuate();
             return;
        }

        // Find the best pool
        address bestPool = currentPool;
        int256 bestScore = _calculateScore(currentPool);

        for (uint256 i = 0; i < trackedPools.length; i++) {
            address p = trackedPools[i];
            if (p == currentPool) continue;

            int256 score = _calculateScore(p);
            
            // --- ENHANCEMENT 2: HYSTERESIS LOGIC ---
            // New pool must be significantly better (Threshold) to justify moving
            if (score > bestScore + int256(REBALANCE_THRESHOLD)) {
                bestScore = score;
                bestPool = p;
            }
        }

        // If we found a better pool
        if (bestPool != currentPool) {
            _executeRebalance(bestPool, bestScore);
        }
    }

    function _calculateScore(address _pool) internal view returns (int256) {
        PoolInfo memory p = pools[_pool];
        // RAYS Score: (SupplyRate * 0.8) - (UtilizationRate * 0.2)
        return int256(p.rate * 80) - int256(p.util * 20);
    }

    function _emergencyEvacuate() internal {
        // Logic to find the safest pool (lowest utilization)
        address safestPool = currentPool;
        uint256 lowestUtil = pools[currentPool].util;

        for (uint256 i = 0; i < trackedPools.length; i++) {
            if (pools[trackedPools[i]].util < lowestUtil) {
                lowestUtil = pools[trackedPools[i]].util;
                safestPool = trackedPools[i];
            }
        }

        if (safestPool != currentPool) {
            // Bypass gas checks for emergency
            emit Callback(
                SEPOLIA_CHAIN_ID,
                vaultAddress,
                500000, // Higher gas limit for emergency
                abi.encodeWithSignature("rebalance(address,address)", currentPool, safestPool)
            );
            currentPool = safestPool;
            lastRebalanceTime = block.timestamp;
        }
    }

    function _executeRebalance(address _targetPool, int256 _targetScore) internal {
            // === GAS GUARD: Profitable Only ===
            // Estimate gas cost: 200,000 gas limit
            uint256 gasUsed = 200000;
            uint256 gasCostUSD = (gasUsed * gasPrice * ethPrice) / (10**18 * 10**9); // Convert to USD
            
            // Estimate profit from rate differential
            int256 currentScore = _calculateScore(currentPool);
            uint256 scoreDifference = uint256(_targetScore - currentScore);
            
            uint256 baseRebalanceAmount = 1000 * 10**6; // 1000 USDC
            uint256 estimatedProfitUSD = (scoreDifference * baseRebalanceAmount) / 10000; // BPS to ratio
            
            // FINANCIAL CHECK: Only proceed if profit > gas cost + margin
            require(estimatedProfitUSD > gasCostUSD + minProfitThreshold, "GasGuard: Unprofitable rebalance");
            
            // Update last rebalance time
            lastRebalanceTime = block.timestamp;
            
            // Emit Callback to Sepolia Vault
            emit Callback(
                SEPOLIA_CHAIN_ID,
                vaultAddress,
                200000,
                abi.encodeWithSignature("rebalance(address,address)", currentPool, _targetPool)
            );
            
            // Optimistically update state
            currentPool = _targetPool;
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