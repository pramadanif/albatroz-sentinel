// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../MockUSDC.sol";
import "../MockLendingPool.sol";
import "../AlbatrozVault.sol";
// Note: AlbatrozSentinel will be imported from the Reactive Network
// For now, we'll just deploy the vault and pools on Sepolia

contract DeployAlbatroz is Script {
    function run() external {
        // Get private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying from address:", deployer);
        console.log("Account balance:", deployer.balance);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy MockUSDC
        console.log("\n=== Deploying MockUSDC ===");
        MockUSDC usdc = new MockUSDC();
        console.log("MockUSDC deployed at:", address(usdc));

        // 2. Deploy MockLendingPool A (Conservative Pool)
        console.log("\n=== Deploying MockLendingPool A ===");
        MockLendingPool poolA = new MockLendingPool(
            address(usdc),
            450  // 4.50% base rate
        );
        console.log("MockLendingPool A deployed at:", address(poolA));
        poolA.setMarketConditions(450, 6000); // Set utilization to 60%

        // 3. Deploy MockLendingPool B (Aggressive Pool)
        console.log("\n=== Deploying MockLendingPool B ===");
        MockLendingPool poolB = new MockLendingPool(
            address(usdc),
            725  // 7.25% base rate
        );
        console.log("MockLendingPool B deployed at:", address(poolB));
        poolB.setMarketConditions(725, 8500); // Set utilization to 85%

        // 4. Deploy AlbatrozVault
        console.log("\n=== Deploying AlbatrozVault ===");
        AlbatrozVault vault = new AlbatrozVault(
            IERC20(address(usdc)),
            deployer  // Temporarily set deployer as proxy, will update after Sentinel deployment
        );
        console.log("AlbatrozVault deployed at:", address(vault));

        // 5. Mint some USDC to the vault for initial liquidity
        console.log("\n=== Minting initial USDC ===");
        usdc.mint(address(vault), 10000e6); // 10,000 USDC
        console.log("Minted 10,000 USDC to vault");

        // 6. Note: Deposit to Pool A skipped in script (would require sender address)
        // Users can manually deposit via UI
        console.log("\n=== Setup Complete ===");

        // 7. Skip AlbatrozSentinel for now - it will be on Reactive Network
        // Not deployed to Sepolia since it's for Reactive Network integration

        vm.stopBroadcast();

        // Print summary
        console.log("\n========== DEPLOYMENT SUMMARY ==========");
        console.log("MockUSDC:", address(usdc));
        console.log("MockLendingPool A:", address(poolA));
        console.log("MockLendingPool B:", address(poolB));
        console.log("AlbatrozVault:", address(vault));
        console.log("========================================\n");
        console.log("AlbatrozSentinel deployment will be on Reactive Network (Lasna)");
    }
}
