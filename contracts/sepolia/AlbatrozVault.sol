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
    
    event StrategyExecuted(address fromPool, address toPool, uint256 amount, string reason);

    modifier onlyProxy() {
        require(msg.sender == reactiveProxy, "Only Reactive Proxy allowed");
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

    // MAIN FUNCTION: Called autonomously by Sentinel
    function rebalance(
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