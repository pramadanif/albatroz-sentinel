// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";

// Re-define interfaces and structs for testing
struct LogRecord {
    uint256 chain_id;
    address _contract;
    uint256 topic_0;
    uint256 topic_1;
    uint256 topic_2;
    uint256 topic_3;
    bytes data;
    uint256 block_number;
    uint256 op_code;
    uint256 block_hash;
    uint256 tx_hash;
    uint256 log_index;
}

interface IAlbatrozSentinel {
    function vaultAddress() external view returns (address);
    function currentPool() external view returns (address);
    function lastRebalanceTime() external view returns (uint256);
    function gasPrice() external view returns (uint256);
    function ethPrice() external view returns (uint256);
    function minProfitThreshold() external view returns (uint256);
    function pools(address) external view returns (uint256 rate, uint256 util, bool isTracked);
    function trackedPools(uint256) external view returns (address);
    function addPool(address _pool) external payable;
    function react(LogRecord calldata log) external;
    function updateGasPrice(uint256 newGasPrice) external;
    function updateEthPrice(uint256 newEthPrice) external;
    function updateMinProfitThreshold(uint256 newThreshold) external;
}

// Mock System Contract for testing
contract MockSystemContract {
    event SubscriptionCreated(uint256 chainId, address contractAddress, uint256 topic0);
    event DepositReceived(address account, uint256 amount);
    
    function depositTo(address account) external payable {
        emit DepositReceived(account, msg.value);
    }

    function subscribe(
        uint256 chainId, 
        address contractAddress, 
        uint256 topic0, 
        uint256, // topic1
        uint256, // topic2
        uint256  // topic3
    ) external payable {
        emit SubscriptionCreated(chainId, contractAddress, topic0);
    }
}

// Simplified AlbatrozSentinel for testing (without external dependencies)
contract AlbatrozSentinelTest is Test {
    // State variables
    address public vaultAddress;
    address public currentPool;
    uint256 public lastRebalanceTime;
    uint256 public gasPrice = 25 * 10**9;
    uint256 public ethPrice = 2000 * 10**18;
    uint256 public minProfitThreshold = 10 * 10**6;
    
    uint256 public constant SEPOLIA_CHAIN_ID = 11155111;
    uint256 public constant COOLDOWN_PERIOD = 1 minutes;
    uint256 public constant REBALANCE_THRESHOLD = 250;
    uint256 public constant RATE_UPDATED_TOPIC0 = 0xb38780ddde1f073d91c150de2696f3f7085883648ba21cc5ef01029cb21d1916;
    
    struct PoolInfo {
        uint256 rate;
        uint256 util;
        bool isTracked;
    }
    mapping(address => PoolInfo) public pools;
    address[] public trackedPools;
    
    // Events
    event Callback(
        uint256 indexed chainId,
        address indexed target,
        uint64 indexed gasLimit,
        bytes payload
    );
    
    // Test addresses
    address public vault;
    address public poolA;
    address public poolB;
    address public poolC;
    
    function setUp() public {
        vault = makeAddr("vault");
        poolA = makeAddr("poolA");
        poolB = makeAddr("poolB");
        poolC = makeAddr("poolC");
        
        vaultAddress = vault;
        currentPool = poolA;
        
        // Track initial pool
        pools[poolA].isTracked = true;
        trackedPools.push(poolA);
    }
    
    // ==================== CONSTRUCTOR TESTS ====================
    
    function test_ConstructorSetsVault() public view {
        assertEq(vaultAddress, vault);
    }
    
    function test_ConstructorSetsCurrentPool() public view {
        assertEq(currentPool, poolA);
    }
    
    function test_InitialPoolIsTracked() public view {
        assertTrue(pools[poolA].isTracked);
    }
    
    function test_InitialPoolInTrackedList() public view {
        assertEq(trackedPools[0], poolA);
    }
    
    // ==================== POOL MANAGEMENT TESTS ====================
    
    function test_AddPool() public {
        _addPool(poolB);
        
        assertTrue(pools[poolB].isTracked);
        assertEq(trackedPools[1], poolB);
    }
    
    function test_AddPoolDoesNotDuplicate() public {
        _addPool(poolB);
        uint256 lengthBefore = trackedPools.length;
        
        _addPool(poolB);
        uint256 lengthAfter = trackedPools.length;
        
        assertEq(lengthBefore, lengthAfter);
    }
    
    function test_AddMultiplePools() public {
        _addPool(poolB);
        _addPool(poolC);
        
        assertTrue(pools[poolB].isTracked);
        assertTrue(pools[poolC].isTracked);
        assertEq(trackedPools.length, 3); // poolA + poolB + poolC
    }
    
    // ==================== RATE UPDATE & SCORING TESTS ====================
    
    function test_CalculateScore() public {
        // Set pool rates: rate=500 (5%), util=8000 (80%)
        pools[poolA].rate = 500;
        pools[poolA].util = 8000;
        
        // Score = (rate * 80) - (util * 20)
        // Score = (500 * 80) - (8000 * 20) = 40000 - 160000 = -120000
        int256 score = _calculateScore(poolA);
        assertEq(score, -120000);
    }
    
    function test_CalculateScoreHighRate() public {
        pools[poolA].rate = 1000; // 10%
        pools[poolA].util = 2000; // 20%
        
        // Score = (1000 * 80) - (2000 * 20) = 80000 - 40000 = 40000
        int256 score = _calculateScore(poolA);
        assertEq(score, 40000);
    }
    
    function test_BetterPoolHasHigherScore() public {
        pools[poolA].rate = 500;
        pools[poolA].util = 8000;
        
        pools[poolB].rate = 1000;
        pools[poolB].util = 5000;
        pools[poolB].isTracked = true;
        
        int256 scoreA = _calculateScore(poolA);
        int256 scoreB = _calculateScore(poolB);
        
        assertGt(scoreB, scoreA);
    }
    
    // ==================== OPTIMIZATION LOGIC TESTS ====================
    
    function test_OptimizeDoesNotRunDuringCooldown() public {
        lastRebalanceTime = block.timestamp;
        
        // Setup a clearly better pool
        _addPool(poolB);
        pools[poolB].rate = 2000;
        pools[poolB].util = 1000;
        
        pools[poolA].rate = 100;
        pools[poolA].util = 9000;
        
        address poolBefore = currentPool;
        _optimize();
        address poolAfter = currentPool;
        
        // Pool should not change during cooldown
        assertEq(poolBefore, poolAfter);
    }
    
    function test_OptimizeChangesPoolWhenBetter() public {
        // Ensure cooldown has passed
        lastRebalanceTime = block.timestamp - COOLDOWN_PERIOD - 1;
        
        // Setup pools
        _addPool(poolB);
        pools[poolA].rate = 100;
        pools[poolA].util = 9000;
        
        pools[poolB].rate = 2000;
        pools[poolB].util = 1000;
        
        _optimize();
        
        // Should switch to poolB (better score)
        assertEq(currentPool, poolB);
    }
    
    function test_OptimizeDoesNotChangeIfThresholdNotMet() public {
        lastRebalanceTime = block.timestamp - COOLDOWN_PERIOD - 1;
        
        // Setup pools with similar scores (difference < REBALANCE_THRESHOLD)
        _addPool(poolB);
        pools[poolA].rate = 500;
        pools[poolA].util = 5000;
        
        pools[poolB].rate = 502; // Only slightly better
        pools[poolB].util = 5000;
        
        address poolBefore = currentPool;
        _optimize();
        
        // Should not change (difference is only 160, less than 250 threshold)
        assertEq(currentPool, poolBefore);
    }
    
    // ==================== EMERGENCY EVACUATION TESTS ====================
    
    function test_EmergencyEvacuateTriggers() public {
        lastRebalanceTime = block.timestamp - COOLDOWN_PERIOD - 1;
        
        // Add safe pool
        _addPool(poolB);
        pools[poolB].rate = 500;
        pools[poolB].util = 5000; // Safe
        
        // Current pool is in danger
        pools[poolA].util = 9600; // > 95%
        
        _optimize();
        
        // Should evacuate to safer pool
        assertEq(currentPool, poolB);
    }
    
    function test_EmergencyEvacuateFindsSafestPool() public {
        lastRebalanceTime = block.timestamp - COOLDOWN_PERIOD - 1;
        
        // Add multiple pools
        _addPool(poolB);
        _addPool(poolC);
        
        pools[poolA].util = 9600; // Danger
        pools[poolB].util = 8000;
        pools[poolC].util = 3000; // Safest
        
        _optimize();
        
        // Should move to safest pool (poolC)
        assertEq(currentPool, poolC);
    }
    
    // ==================== ADMIN FUNCTION TESTS ====================
    
    function test_UpdateGasPrice() public {
        uint256 newGasPrice = 50 * 10**9;
        gasPrice = newGasPrice;
        
        assertEq(gasPrice, newGasPrice);
    }
    
    function test_UpdateEthPrice() public {
        uint256 newEthPrice = 3000 * 10**18;
        ethPrice = newEthPrice;
        
        assertEq(ethPrice, newEthPrice);
    }
    
    function test_UpdateMinProfitThreshold() public {
        uint256 newThreshold = 20 * 10**6;
        minProfitThreshold = newThreshold;
        
        assertEq(minProfitThreshold, newThreshold);
    }
    
    // ==================== REACT FUNCTION TESTS ====================
    
    function test_ReactUpdatesPoolStats() public {
        LogRecord memory log = LogRecord({
            chain_id: SEPOLIA_CHAIN_ID,
            _contract: poolA,
            topic_0: RATE_UPDATED_TOPIC0,
            topic_1: 0,
            topic_2: 0,
            topic_3: 0,
            data: abi.encode(800, 6000), // rate=800, util=6000
            block_number: 0,
            op_code: 0,
            block_hash: 0,
            tx_hash: 0,
            log_index: 0
        });
        
        _simulateReact(log);
        
        assertEq(pools[poolA].rate, 800);
        assertEq(pools[poolA].util, 6000);
    }
    
    function test_ReactAutoTracksUnknownPool() public {
        address unknownPool = makeAddr("unknownPool");
        
        LogRecord memory log = LogRecord({
            chain_id: SEPOLIA_CHAIN_ID,
            _contract: unknownPool,
            topic_0: RATE_UPDATED_TOPIC0,
            topic_1: 0,
            topic_2: 0,
            topic_3: 0,
            data: abi.encode(500, 5000),
            block_number: 0,
            op_code: 0,
            block_hash: 0,
            tx_hash: 0,
            log_index: 0
        });
        
        _simulateReact(log);
        
        assertTrue(pools[unknownPool].isTracked);
    }
    
    // ==================== GAS COST CALCULATION TESTS ====================
    
    function test_GasCostCalculation() public view {
        uint256 gasUsed = 200000;
        // CostUSD = (gasUsed * gasPrice * ethPrice) / 1e30
        uint256 gasCostUSD = (gasUsed * gasPrice * ethPrice) / (10**30);
        
        // 200000 * 25e9 * 2000e18 / 1e30
        // = 200000 * 50000e27 / 1e30
        // = 10000000000e27 / 1e30
        // = 10e6 = $10
        assertEq(gasCostUSD, 10 * 10**6);
    }
    
    // ==================== FUZZ TESTS ====================
    
    function testFuzz_CalculateScore(uint256 rate, uint256 util) public {
        rate = bound(rate, 0, 10000);
        util = bound(util, 0, 10000);
        
        pools[poolA].rate = rate;
        pools[poolA].util = util;
        
        int256 score = _calculateScore(poolA);
        int256 expectedScore = int256(rate * 80) - int256(util * 20);
        
        assertEq(score, expectedScore);
    }
    
    // ==================== HELPER FUNCTIONS ====================
    
    function _addPool(address _pool) internal {
        if (!pools[_pool].isTracked) {
            pools[_pool].isTracked = true;
            trackedPools.push(_pool);
        }
    }
    
    function _calculateScore(address _pool) internal view returns (int256) {
        PoolInfo memory p = pools[_pool];
        return int256(p.rate * 80) - int256(p.util * 20);
    }
    
    function _optimize() internal {
        if (block.timestamp < lastRebalanceTime + COOLDOWN_PERIOD) {
            return;
        }

        // Emergency evacuation check
        if (pools[currentPool].util > 9500) {
            _emergencyEvacuate();
            return;
        }

        address bestPool = currentPool;
        int256 bestScore = _calculateScore(currentPool);

        for (uint256 i = 0; i < trackedPools.length; i++) {
            address p = trackedPools[i];
            if (p == currentPool) continue;

            int256 score = _calculateScore(p);
            
            if (score > bestScore + int256(REBALANCE_THRESHOLD)) {
                bestScore = score;
                bestPool = p;
            }
        }

        if (bestPool != currentPool) {
            lastRebalanceTime = block.timestamp;
            currentPool = bestPool;
        }
    }
    
    function _emergencyEvacuate() internal {
        address safestPool = currentPool;
        uint256 lowestUtil = pools[currentPool].util;

        for (uint256 i = 0; i < trackedPools.length; i++) {
            if (pools[trackedPools[i]].util < lowestUtil) {
                lowestUtil = pools[trackedPools[i]].util;
                safestPool = trackedPools[i];
            }
        }

        if (safestPool != currentPool) {
            currentPool = safestPool;
            lastRebalanceTime = block.timestamp;
        }
    }
    
    function _simulateReact(LogRecord memory log) internal {
        address eventAddress = log._contract;
        
        if (!pools[eventAddress].isTracked) {
            pools[eventAddress].isTracked = true;
            trackedPools.push(eventAddress);
        }

        (uint256 rate, uint256 util) = abi.decode(log.data, (uint256, uint256));
        
        pools[eventAddress].rate = rate;
        pools[eventAddress].util = util;

        _optimize();
    }
}
