// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "openzeppelin/token/ERC20/IERC20.sol";

contract MockLendingPool {
    IERC20 public asset;
    uint256 public supplyRate; // In Basis Points (500 = 5%)
    uint256 public utilizationRate; // In Basis Points (8000 = 80%)

    event RateUpdated(uint256 newRate, uint256 newUtil);

    constructor(address _asset, uint256 _initialRate) {
        asset = IERC20(_asset);
        supplyRate = _initialRate;
    }

    // Crucial function for DEMO: Manually change interest rates
    function setMarketConditions(uint256 _rate, uint256 _util) external {
        supplyRate = _rate;
        utilizationRate = _util;
        emit RateUpdated(_rate, _util);
    }

    function deposit(uint256 amount) external {
        asset.transferFrom(msg.sender, address(this), amount);
    }

    function withdraw(uint256 amount) external {
        asset.transfer(msg.sender, amount);
    }
}