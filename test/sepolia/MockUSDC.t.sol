// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../../contracts/sepolia/MockUSDC.sol";

contract MockUSDCTest is Test {
    MockUSDC public usdc;
    
    address public deployer;
    address public user1;
    address public user2;
    
    uint256 public constant INITIAL_SUPPLY = 1_000_000 * 10**18;
    uint256 public constant MINT_AMOUNT = 10_000 * 10**18;
    
    function setUp() public {
        deployer = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        
        usdc = new MockUSDC();
    }
    
    // ==================== CONSTRUCTOR TESTS ====================
    
    function test_ConstructorSetsName() public view {
        assertEq(usdc.name(), "Mock USDC");
    }
    
    function test_ConstructorSetsSymbol() public view {
        assertEq(usdc.symbol(), "mUSDC");
    }
    
    function test_ConstructorMintsToDeployer() public view {
        assertEq(usdc.balanceOf(deployer), INITIAL_SUPPLY);
    }
    
    function test_TotalSupplyEqualsInitialMint() public view {
        assertEq(usdc.totalSupply(), INITIAL_SUPPLY);
    }
    
    function test_DecimalsIs18() public view {
        assertEq(usdc.decimals(), 18);
    }
    
    // ==================== MINT TESTS ====================
    
    function test_MintIncreasesBalance() public {
        uint256 balanceBefore = usdc.balanceOf(user1);
        usdc.mint(user1, MINT_AMOUNT);
        uint256 balanceAfter = usdc.balanceOf(user1);
        
        assertEq(balanceAfter - balanceBefore, MINT_AMOUNT);
    }
    
    function test_MintIncreasesTotalSupply() public {
        uint256 supplyBefore = usdc.totalSupply();
        usdc.mint(user1, MINT_AMOUNT);
        uint256 supplyAfter = usdc.totalSupply();
        
        assertEq(supplyAfter - supplyBefore, MINT_AMOUNT);
    }
    
    function test_MintToMultipleAddresses() public {
        usdc.mint(user1, MINT_AMOUNT);
        usdc.mint(user2, MINT_AMOUNT * 2);
        
        assertEq(usdc.balanceOf(user1), MINT_AMOUNT);
        assertEq(usdc.balanceOf(user2), MINT_AMOUNT * 2);
    }
    
    function test_MintZeroAmount() public {
        uint256 balanceBefore = usdc.balanceOf(user1);
        usdc.mint(user1, 0);
        uint256 balanceAfter = usdc.balanceOf(user1);
        
        assertEq(balanceAfter, balanceBefore);
    }
    
    function test_AnyoneCanMint() public {
        // Test that anyone can call mint (it's a mock contract)
        vm.prank(user1);
        usdc.mint(user2, MINT_AMOUNT);
        
        assertEq(usdc.balanceOf(user2), MINT_AMOUNT);
    }
    
    // ==================== ERC20 STANDARD TESTS ====================
    
    function test_Transfer() public {
        usdc.mint(user1, MINT_AMOUNT);
        
        vm.startPrank(user1);
        bool success = usdc.transfer(user2, MINT_AMOUNT / 2);
        vm.stopPrank();
        
        assertTrue(success);
        assertEq(usdc.balanceOf(user1), MINT_AMOUNT / 2);
        assertEq(usdc.balanceOf(user2), MINT_AMOUNT / 2);
    }
    
    function test_TransferRevertsIfInsufficientBalance() public {
        vm.startPrank(user1);
        vm.expectRevert();
        usdc.transfer(user2, MINT_AMOUNT);
        vm.stopPrank();
    }
    
    function test_Approve() public {
        vm.startPrank(user1);
        bool success = usdc.approve(user2, MINT_AMOUNT);
        vm.stopPrank();
        
        assertTrue(success);
        assertEq(usdc.allowance(user1, user2), MINT_AMOUNT);
    }
    
    function test_TransferFrom() public {
        usdc.mint(user1, MINT_AMOUNT);
        
        vm.prank(user1);
        usdc.approve(user2, MINT_AMOUNT);
        
        vm.prank(user2);
        bool success = usdc.transferFrom(user1, user2, MINT_AMOUNT);
        
        assertTrue(success);
        assertEq(usdc.balanceOf(user1), 0);
        assertEq(usdc.balanceOf(user2), MINT_AMOUNT);
    }
    
    function test_TransferFromRevertsWithoutApproval() public {
        usdc.mint(user1, MINT_AMOUNT);
        
        vm.startPrank(user2);
        vm.expectRevert();
        usdc.transferFrom(user1, user2, MINT_AMOUNT);
        vm.stopPrank();
    }
    
    function test_TransferFromDecreasesAllowance() public {
        usdc.mint(user1, MINT_AMOUNT);
        
        vm.prank(user1);
        usdc.approve(user2, MINT_AMOUNT);
        
        vm.prank(user2);
        usdc.transferFrom(user1, user2, MINT_AMOUNT / 2);
        
        assertEq(usdc.allowance(user1, user2), MINT_AMOUNT / 2);
    }
    
    // ==================== FUZZ TESTS ====================
    
    function testFuzz_Mint(address to, uint256 amount) public {
        vm.assume(to != address(0));
        amount = bound(amount, 0, type(uint128).max);
        
        uint256 balanceBefore = usdc.balanceOf(to);
        usdc.mint(to, amount);
        uint256 balanceAfter = usdc.balanceOf(to);
        
        assertEq(balanceAfter - balanceBefore, amount);
    }
    
    function testFuzz_Transfer(uint256 amount) public {
        amount = bound(amount, 1, MINT_AMOUNT);
        
        usdc.mint(user1, MINT_AMOUNT);
        
        vm.prank(user1);
        usdc.transfer(user2, amount);
        
        assertEq(usdc.balanceOf(user1), MINT_AMOUNT - amount);
        assertEq(usdc.balanceOf(user2), amount);
    }
}
