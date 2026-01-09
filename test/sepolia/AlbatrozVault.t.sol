// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../../contracts/sepolia/AlbatrozVault.sol";
import "../../contracts/sepolia/MockUSDC.sol";
import "../../contracts/sepolia/MockLendingPool.sol";

contract AlbatrozVaultTest is Test {
    AlbatrozVault public vault;
    MockUSDC public usdc;
    MockLendingPool public poolA;
    MockLendingPool public poolB;
    
    address public owner;
    address public user1;
    address public user2;
    address public reactiveProxy;
    
    uint256 public constant INITIAL_MINT = 1_000_000 * 10**6;
    uint256 public constant DEPOSIT_AMOUNT = 10_000 * 10**6;
    
    event StrategyExecuted(address fromPool, address toPool, uint256 amount, string reason);
    
    function setUp() public {
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        reactiveProxy = makeAddr("reactiveProxy");
        
        // Deploy MockUSDC
        usdc = new MockUSDC();
        
        // Deploy Mock Lending Pools with different rates
        poolA = new MockLendingPool(address(usdc), 500); // 5% APY
        poolB = new MockLendingPool(address(usdc), 800); // 8% APY
        
        // Deploy AlbatrozVault
        vault = new AlbatrozVault(IERC20(address(usdc)), reactiveProxy);
        
        // Distribute USDC to test users
        usdc.mint(user1, DEPOSIT_AMOUNT * 10);
        usdc.mint(user2, DEPOSIT_AMOUNT * 10);
        
        // Fund pools with liquidity for withdrawals
        usdc.mint(address(poolA), DEPOSIT_AMOUNT * 5);
        usdc.mint(address(poolB), DEPOSIT_AMOUNT * 5);
    }
    
    // ==================== CONSTRUCTOR TESTS ====================
    
    function test_ConstructorSetsAsset() public view {
        assertEq(vault.asset(), address(usdc));
    }
    
    function test_ConstructorSetsProxy() public view {
        assertEq(vault.reactiveProxy(), reactiveProxy);
    }
    
    function test_VaultNameAndSymbol() public view {
        assertEq(vault.name(), "Albatroz Yield Token");
        assertEq(vault.symbol(), "alYLD");
    }
    
    // ==================== ERC4626 DEPOSIT/WITHDRAW TESTS ====================
    
    function test_DepositMintShares() public {
        vm.startPrank(user1);
        usdc.approve(address(vault), DEPOSIT_AMOUNT);
        
        uint256 sharesBefore = vault.balanceOf(user1);
        vault.deposit(DEPOSIT_AMOUNT, user1);
        uint256 sharesAfter = vault.balanceOf(user1);
        
        assertGt(sharesAfter, sharesBefore);
        assertEq(vault.totalAssets(), DEPOSIT_AMOUNT);
        vm.stopPrank();
    }
    
    function test_WithdrawBurnsShares() public {
        vm.startPrank(user1);
        usdc.approve(address(vault), DEPOSIT_AMOUNT);
        vault.deposit(DEPOSIT_AMOUNT, user1);
        
        uint256 shares = vault.balanceOf(user1);
        vault.redeem(shares, user1, user1);
        
        assertEq(vault.balanceOf(user1), 0);
        assertEq(vault.totalAssets(), 0);
        vm.stopPrank();
    }
    
    function test_MultipleUsersDeposit() public {
        vm.startPrank(user1);
        usdc.approve(address(vault), DEPOSIT_AMOUNT);
        vault.deposit(DEPOSIT_AMOUNT, user1);
        vm.stopPrank();
        
        vm.startPrank(user2);
        usdc.approve(address(vault), DEPOSIT_AMOUNT);
        vault.deposit(DEPOSIT_AMOUNT, user2);
        vm.stopPrank();
        
        assertEq(vault.totalAssets(), DEPOSIT_AMOUNT * 2);
        assertGt(vault.balanceOf(user1), 0);
        assertGt(vault.balanceOf(user2), 0);
    }
    
    // ==================== ACCESS CONTROL TESTS ====================
    
    function test_SetProxyOnlyOwner() public {
        address newProxy = makeAddr("newProxy");
        vault.setProxy(newProxy);
        assertEq(vault.reactiveProxy(), newProxy);
    }
    
    function test_SetProxyRevertsForNonOwner() public {
        address newProxy = makeAddr("newProxy");
        vm.prank(user1);
        vm.expectRevert();
        vault.setProxy(newProxy);
    }
    
    function test_RebalanceRevertsForNonProxy() public {
        vm.prank(user1);
        vm.expectRevert("Only Reactive Proxy allowed");
        vault.rebalance(address(poolA), address(poolB));
    }
    
    function test_RebalanceFullRevertsForNonProxy() public {
        vm.prank(user1);
        vm.expectRevert("Only Reactive Proxy allowed");
        vault.rebalanceFull(address(poolA), address(poolB), DEPOSIT_AMOUNT, 0);
    }
    
    // ==================== REBALANCE TESTS ====================
    
    function test_RebalanceMovesAssets() public {
        // First deposit to vault
        vm.startPrank(user1);
        usdc.approve(address(vault), DEPOSIT_AMOUNT);
        vault.deposit(DEPOSIT_AMOUNT, user1);
        vm.stopPrank();
        
        // Approve vault to interact with pools
        vm.prank(address(vault));
        usdc.approve(address(poolB), type(uint256).max);
        
        uint256 vaultBalanceBefore = usdc.balanceOf(address(vault));
        
        // Execute rebalance as reactive proxy
        vm.prank(reactiveProxy);
        vault.rebalance(address(poolA), address(poolB));
        
        // After rebalance, funds should be in poolB
        uint256 poolBBalance = usdc.balanceOf(address(poolB));
        assertGt(poolBBalance, 0);
    }
    
    function test_RebalanceEmitsEvent() public {
        // Deposit to vault first
        vm.startPrank(user1);
        usdc.approve(address(vault), DEPOSIT_AMOUNT);
        vault.deposit(DEPOSIT_AMOUNT, user1);
        vm.stopPrank();
        
        // Execute rebalance and expect event
        vm.prank(reactiveProxy);
        vm.expectEmit(true, true, false, true);
        emit StrategyExecuted(address(poolA), address(poolB), DEPOSIT_AMOUNT, "Autonomous Rebalance Success");
        vault.rebalance(address(poolA), address(poolB));
    }
    
    function test_RebalanceWithZeroBalance() public {
        // Vault has no balance - should try to withdraw from pool
        vm.prank(reactiveProxy);
        vault.rebalance(address(poolA), address(poolB));
        
        // Should have withdrawn 1000 USDC from poolA
        // poolA started with 50,000 USDC, should now have less
        uint256 poolABalance = usdc.balanceOf(address(poolA));
        assertLt(poolABalance, DEPOSIT_AMOUNT * 5);
    }
    
    // ==================== REBALANCE FULL TESTS ====================
    
    function test_RebalanceFullWithSlippageGuard() public {
        // Fund poolA with USDC
        usdc.mint(address(poolA), DEPOSIT_AMOUNT);
        
        vm.prank(reactiveProxy);
        vault.rebalanceFull(address(poolA), address(poolB), DEPOSIT_AMOUNT, DEPOSIT_AMOUNT);
        
        // Verify funds moved to poolB
        assertGt(usdc.balanceOf(address(poolB)), 0);
    }
    
    function test_RebalanceFullRevertsOnSlippage() public {
        // Fund poolA with less than expected
        usdc.mint(address(poolA), DEPOSIT_AMOUNT / 2);
        
        vm.prank(reactiveProxy);
        vm.expectRevert("Slippage too high");
        vault.rebalanceFull(address(poolA), address(poolB), DEPOSIT_AMOUNT, DEPOSIT_AMOUNT);
    }
    
    // ==================== REACTIVE CALLBACK TESTS ====================
    
    function test_ReactiveCallbackCanRebalance() public {
        address REACTIVE_CALLBACK = 0xc9f36411C9897e7F959D99ffca2a0Ba7ee0D7bDA;
        
        // Deposit to vault
        vm.startPrank(user1);
        usdc.approve(address(vault), DEPOSIT_AMOUNT);
        vault.deposit(DEPOSIT_AMOUNT, user1);
        vm.stopPrank();
        
        // Simulate call from Reactive Network Callback Contract
        vm.prank(REACTIVE_CALLBACK);
        vault.rebalance(address(poolA), address(poolB));
        
        // Should not revert
        assertTrue(true);
    }
    
    // ==================== FUZZ TESTS ====================
    
    function testFuzz_DepositAndWithdraw(uint256 amount) public {
        // Bound amount to reasonable range
        amount = bound(amount, 1, DEPOSIT_AMOUNT);
        
        usdc.mint(user1, amount);
        
        vm.startPrank(user1);
        usdc.approve(address(vault), amount);
        vault.deposit(amount, user1);
        
        uint256 shares = vault.balanceOf(user1);
        vault.redeem(shares, user1, user1);
        
        // User should get back their assets (minus any rounding)
        assertLe(usdc.balanceOf(user1), amount);
        vm.stopPrank();
    }
}
