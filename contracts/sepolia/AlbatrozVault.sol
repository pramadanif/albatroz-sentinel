// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "openzeppelin/token/ERC20/extensions/ERC4626.sol";
import "openzeppelin/access/Ownable.sol";

interface IMockPool {
    function deposit(uint256 amount) external;
    function withdraw(uint256 amount) external;
}

contract AlbatrozVault is ERC4626, Ownable {
    address public reactiveProxy; // Callback address from Reactive Network
    address public constant REACTIVE_CALLBACK = 0xc9f36411C9897e7F959D99ffca2a0Ba7ee0D7bDA; // Reactive Network Callback Contract
    
    event StrategyExecuted(address fromPool, address toPool, uint256 amount, string reason);

    modifier onlyProxy() {
        require(
            msg.sender == reactiveProxy || msg.sender == REACTIVE_CALLBACK,
            "Only Reactive Proxy allowed"
        );
        _;
    }

    constructor(IERC20 _asset, address _proxy) 
        ERC4626(_asset) ERC20("Albatroz Yield Token", "alYLD") 
    {
        reactiveProxy = _proxy;
    }

    function setProxy(address _proxy) external onlyOwner {
        reactiveProxy = _proxy;
    }

    // SIMPLIFIED REBALANCE: Called by Sentinel via Reactive Network
    // Moves ALL vault balance from one pool to another
    function rebalance(address fromPool, address toPool) external onlyProxy {
        IERC20 assetToken = IERC20(asset());
        
        // Get current balance in fromPool (simplified: assume all funds are there)
        uint256 vaultBalance = assetToken.balanceOf(address(this));
        
        if (vaultBalance == 0) {
            // If no balance in vault, try to withdraw from fromPool
            // For demo: withdraw a fixed amount or all available
            IMockPool(fromPool).withdraw(1000 * 10**6); // 1000 USDC for demo
            vaultBalance = assetToken.balanceOf(address(this));
        }
        
        if (vaultBalance > 0) {
            // Deposit to new, more profitable pool
            assetToken.approve(toPool, vaultBalance);
            IMockPool(toPool).deposit(vaultBalance);
            
            emit StrategyExecuted(fromPool, toPool, vaultBalance, "Autonomous Rebalance Success");
        }
    }

    // FULL REBALANCE: For granular control
    function rebalanceFull(
        address fromPool, 
        address toPool, 
        uint256 amount,
        uint256 minAmountOut
    ) external onlyProxy {
        IERC20 assetToken = IERC20(asset());
        
        // 1. Withdraw from old pool
        uint256 balanceBefore = assetToken.balanceOf(address(this));
        IMockPool(fromPool).withdraw(amount);
        uint256 withdrawn = assetToken.balanceOf(address(this)) - balanceBefore;
        
        // 2. Slippage Guard
        require(withdrawn >= minAmountOut, "Slippage too high");

        // 3. Deposit to new, more profitable pool
        assetToken.approve(toPool, withdrawn);
        IMockPool(toPool).deposit(withdrawn);

        emit StrategyExecuted(fromPool, toPool, withdrawn, "Autonomous Rebalance Success");
    }
}