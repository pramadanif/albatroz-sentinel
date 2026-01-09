// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../../contracts/sepolia/MockLendingPool.sol";
import "../../contracts/sepolia/MockUSDC.sol";

contract MockLendingPoolTest is Test {
    MockLendingPool public pool;
    MockUSDC public usdc;
    
    address public user1;
    address public user2;
    
    uint256 public constant INITIAL_RATE = 500; // 5%
    uint256 public constant DEPOSIT_AMOUNT = 10_000 * 10**6;
    
    event RateUpdated(uint256 newRate, uint256 newUtil);
    
    function setUp() public {
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        // Deploy MockUSDC
        usdc = new MockUSDC();
        
        // Deploy MockLendingPool
        pool = new MockLendingPool(address(usdc), INITIAL_RATE);
        
        // Distribute USDC to users
        usdc.mint(user1, DEPOSIT_AMOUNT * 10);
        usdc.mint(user2, DEPOSIT_AMOUNT * 10);
        
        // Fund pool for withdrawals
        usdc.mint(address(pool), DEPOSIT_AMOUNT * 100);
    }
    
    // ==================== CONSTRUCTOR TESTS ====================
    
    function test_ConstructorSetsAsset() public view {
        assertEq(address(pool.asset()), address(usdc));
    }
    
    function test_ConstructorSetsInitialRate() public view {
        assertEq(pool.supplyRate(), INITIAL_RATE);
    }
    
    function test_InitialUtilizationIsZero() public view {
        assertEq(pool.utilizationRate(), 0);
    }
    
    // ==================== DEPOSIT TESTS ====================
    
    function test_DepositTransfersTokens() public {
        vm.startPrank(user1);
        usdc.approve(address(pool), DEPOSIT_AMOUNT);
        
        uint256 poolBalanceBefore = usdc.balanceOf(address(pool));
        pool.deposit(DEPOSIT_AMOUNT);
        uint256 poolBalanceAfter = usdc.balanceOf(address(pool));
        
        assertEq(poolBalanceAfter - poolBalanceBefore, DEPOSIT_AMOUNT);
        vm.stopPrank();
    }
    
    function test_DepositDeductsFromUser() public {
        vm.startPrank(user1);
        usdc.approve(address(pool), DEPOSIT_AMOUNT);
        
        uint256 userBalanceBefore = usdc.balanceOf(user1);
        pool.deposit(DEPOSIT_AMOUNT);
        uint256 userBalanceAfter = usdc.balanceOf(user1);
        
        assertEq(userBalanceBefore - userBalanceAfter, DEPOSIT_AMOUNT);
        vm.stopPrank();
    }
    
    function test_DepositRevertsWithoutApproval() public {
        vm.startPrank(user1);
        vm.expectRevert();
        pool.deposit(DEPOSIT_AMOUNT);
        vm.stopPrank();
    }
    
    function test_MultipleDeposits() public {
        vm.startPrank(user1);
        usdc.approve(address(pool), DEPOSIT_AMOUNT * 3);
        
        uint256 poolBalanceBefore = usdc.balanceOf(address(pool));
        pool.deposit(DEPOSIT_AMOUNT);
        pool.deposit(DEPOSIT_AMOUNT);
        pool.deposit(DEPOSIT_AMOUNT);
        uint256 poolBalanceAfter = usdc.balanceOf(address(pool));
        
        assertEq(poolBalanceAfter - poolBalanceBefore, DEPOSIT_AMOUNT * 3);
        vm.stopPrank();
    }
    
    // ==================== WITHDRAW TESTS ====================
    
    function test_WithdrawTransfersTokens() public {
        vm.startPrank(user1);
        
        uint256 userBalanceBefore = usdc.balanceOf(user1);
        pool.withdraw(DEPOSIT_AMOUNT);
        uint256 userBalanceAfter = usdc.balanceOf(user1);
        
        assertEq(userBalanceAfter - userBalanceBefore, DEPOSIT_AMOUNT);
        vm.stopPrank();
    }
    
    function test_WithdrawDeductsFromPool() public {
        uint256 poolBalanceBefore = usdc.balanceOf(address(pool));
        
        vm.prank(user1);
        pool.withdraw(DEPOSIT_AMOUNT);
        
        uint256 poolBalanceAfter = usdc.balanceOf(address(pool));
        assertEq(poolBalanceBefore - poolBalanceAfter, DEPOSIT_AMOUNT);
    }
    
    function test_WithdrawRevertsIfInsufficientBalance() public {
        // Drain the pool first
        uint256 poolBalance = usdc.balanceOf(address(pool));
        vm.prank(user1);
        pool.withdraw(poolBalance);
        
        // Try to withdraw more
        vm.prank(user2);
        vm.expectRevert();
        pool.withdraw(DEPOSIT_AMOUNT);
    }
    
    // ==================== MARKET CONDITIONS TESTS ====================
    
    function test_SetMarketConditionsUpdatesRate() public {
        uint256 newRate = 1000; // 10%
        uint256 newUtil = 7500; // 75%
        
        pool.setMarketConditions(newRate, newUtil);
        
        assertEq(pool.supplyRate(), newRate);
        assertEq(pool.utilizationRate(), newUtil);
    }
    
    function test_SetMarketConditionsEmitsEvent() public {
        uint256 newRate = 1000;
        uint256 newUtil = 7500;
        
        vm.expectEmit(true, true, false, true);
        emit RateUpdated(newRate, newUtil);
        pool.setMarketConditions(newRate, newUtil);
    }
    
    function test_SetMarketConditionsMultipleTimes() public {
        pool.setMarketConditions(500, 5000);
        assertEq(pool.supplyRate(), 500);
        assertEq(pool.utilizationRate(), 5000);
        
        pool.setMarketConditions(800, 8000);
        assertEq(pool.supplyRate(), 800);
        assertEq(pool.utilizationRate(), 8000);
        
        pool.setMarketConditions(300, 3000);
        assertEq(pool.supplyRate(), 300);
        assertEq(pool.utilizationRate(), 3000);
    }
    
    function test_SetMarketConditionsZeroValues() public {
        pool.setMarketConditions(0, 0);
        
        assertEq(pool.supplyRate(), 0);
        assertEq(pool.utilizationRate(), 0);
    }
    
    function test_SetMarketConditionsMaxValues() public {
        uint256 maxRate = 10000; // 100%
        uint256 maxUtil = 10000; // 100%
        
        pool.setMarketConditions(maxRate, maxUtil);
        
        assertEq(pool.supplyRate(), maxRate);
        assertEq(pool.utilizationRate(), maxUtil);
    }
    
    // ==================== INTEGRATION TESTS ====================
    
    function test_DepositThenWithdraw() public {
        vm.startPrank(user1);
        usdc.approve(address(pool), DEPOSIT_AMOUNT);
        
        uint256 balanceBefore = usdc.balanceOf(user1);
        pool.deposit(DEPOSIT_AMOUNT);
        pool.withdraw(DEPOSIT_AMOUNT);
        uint256 balanceAfter = usdc.balanceOf(user1);
        
        assertEq(balanceBefore, balanceAfter);
        vm.stopPrank();
    }
    
    function test_MultipleUsersDepositAndWithdraw() public {
        // User1 deposits
        vm.startPrank(user1);
        usdc.approve(address(pool), DEPOSIT_AMOUNT);
        pool.deposit(DEPOSIT_AMOUNT);
        vm.stopPrank();
        
        // User2 deposits
        vm.startPrank(user2);
        usdc.approve(address(pool), DEPOSIT_AMOUNT);
        pool.deposit(DEPOSIT_AMOUNT);
        vm.stopPrank();
        
        // Both users withdraw
        vm.prank(user1);
        pool.withdraw(DEPOSIT_AMOUNT);
        
        vm.prank(user2);
        pool.withdraw(DEPOSIT_AMOUNT);
        
        // Check balances restored (accounting for initial pool funding)
        assertEq(usdc.balanceOf(user1), DEPOSIT_AMOUNT * 10);
        assertEq(usdc.balanceOf(user2), DEPOSIT_AMOUNT * 10);
    }
    
    // ==================== FUZZ TESTS ====================
    
    function testFuzz_SetMarketConditions(uint256 rate, uint256 util) public {
        // Bound to reasonable values
        rate = bound(rate, 0, 100000);
        util = bound(util, 0, 10000);
        
        pool.setMarketConditions(rate, util);
        
        assertEq(pool.supplyRate(), rate);
        assertEq(pool.utilizationRate(), util);
    }
    
    function testFuzz_DepositAmount(uint256 amount) public {
        // Bound to reasonable range
        amount = bound(amount, 1, DEPOSIT_AMOUNT);
        
        usdc.mint(user1, amount);
        
        vm.startPrank(user1);
        usdc.approve(address(pool), amount);
        
        uint256 poolBalanceBefore = usdc.balanceOf(address(pool));
        pool.deposit(amount);
        uint256 poolBalanceAfter = usdc.balanceOf(address(pool));
        
        assertEq(poolBalanceAfter - poolBalanceBefore, amount);
        vm.stopPrank();
    }
}
