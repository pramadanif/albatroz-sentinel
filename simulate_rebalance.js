#!/usr/bin/env node

/**
 * Simulate a rate update on Sepolia to trigger Reactive Network callbacks
 * This script calls setMarketConditions() on the deployed MockLendingPool contracts
 * which will emit RateUpdated events that the AlbatrozSentinel listens for.
 */

const ethers = require("ethers");
require("dotenv").config();

// Contract addresses from deployment
const POOL_A_ADDRESS = "0x46eE74Bf6D3c6b06483Ec4BF4066a8117Fa8Cb47";
const POOL_B_ADDRESS = "0xBE2bcf983b84c030b0C851989aDF351816fA21D2";
const VAULT_ADDRESS = "0xB7c78ceCB25a1c40b3fa3382bAf3F34c9b5bdD66";
const sentinelAddress = "0xbC92DAD9027f3bcEC366EaBdC581d484590Ed337";

// MockLendingPool ABI (minimal - just setMarketConditions)
// MockLendingPool ABI (minimal)
const POOL_ABI = [
  "function setMarketConditions(uint256 _rate, uint256 _util) external",
  "function supplyRate() view returns (uint256)",
  "function utilizationRate() view returns (uint256)",
  "event RateUpdated(uint256 newRate, uint256 newUtil)"
];

async function simulateRebalance() {
  console.log("🚀 Starting Reactive Network simulation...\n");

  // Initialize provider and signer
  const rpcUrl = process.env.SEPOLIA_RPC || "https://ethereum-sepolia-rpc.publicnode.com";
  const privateKey = process.env.PRIVATE_KEY;

  if (!privateKey) {
    console.error("❌ Error: PRIVATE_KEY environment variable not set");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log(`📍 Connected to Sepolia: ${rpcUrl}`);
  console.log(`🔑 Deployer: ${wallet.address}\n`);

  try {
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💰 Account balance: ${ethers.formatEther(balance)} ETH\n`);

    if (balance === 0n) {
      console.error("❌ Error: Account has no balance for gas fees");
      process.exit(1);
    }

    // Create contract instances
    const poolA = new ethers.Contract(POOL_A_ADDRESS, POOL_ABI, wallet);
    const poolB = new ethers.Contract(POOL_B_ADDRESS, POOL_ABI, wallet);

    // Simulate different market conditions
    console.log("📊 Simulating market condition updates...\n");

    // Nonce management to avoid "already known" errors
    let nonce = await provider.getTransactionCount(wallet.address, "pending");

    // Pool A Update (BAD conditions - funds are here, should want to leave)
    try {
      // Low Rate + High Util = Very Low Score (BAD pool)
      const rateA = 200;   // 2% - LOW
      const utilA = 9000;  // 90% - HIGH
      console.log(`Pool A: Updating supply rate to ${rateA} bps (LOW - BAD)`);
      console.log(`        Updating utilization to ${utilA} bps (HIGH - BAD)`);
      const tx1 = await poolA.setMarketConditions(rateA, utilA, { nonce: nonce++ });
      console.log(`⏳ Transaction sent: ${tx1.hash}`);
      const receipt1 = await tx1.wait();
      console.log(`✅ Pool A updated at block ${receipt1.blockNumber}\n`);
    } catch (err) {
      if (err.message.includes("already known")) {
        console.warn("⚠️ Transaction already known (mempool collision), proceeding...");
      } else {
        console.warn(`⚠️ Pool A update failed: ${err.message}`);
      }
    }

    // Pool B Update (GOOD conditions - should move funds here)
    try {
      // High Rate + Low Util = Very High Score (GOOD pool)
      const rateB = 1200;  // 12% - HIGH
      const utilB = 3000;  // 30% - LOW
      console.log(`Pool B: Updating supply rate to ${rateB} bps (HIGH - GOOD)`);
      console.log(`        Updating utilization to ${utilB} bps (LOW - GOOD)`);
      const tx2 = await poolB.setMarketConditions(rateB, utilB, { nonce: nonce++ });
      console.log(`⏳ Transaction sent: ${tx2.hash}`);
      const receipt2 = await tx2.wait();
      console.log(`✅ Pool B updated at block ${receipt2.blockNumber}\n`);
    } catch (err) {
      if (err.message.includes("already known")) {
        console.warn("⚠️ Transaction already known (mempool collision), proceeding...");
      } else {
        console.warn(`⚠️ Pool B update failed: ${err.message}`);
      }
    }

    // Get the updated rates from contracts
    console.log("📝 Fetching updated contract state...\n");

    const supplyRateA = await poolA.supplyRate();
    const utilizationA = await poolA.utilizationRate();
    console.log(`Pool A new state:`);
    console.log(`  Supply Rate: ${supplyRateA} bps (${Number(supplyRateA) / 100}%)`);
    console.log(`  Utilization: ${utilizationA} bps (${Number(utilizationA) / 100}%)\n`);

    const supplyRateB = await poolB.supplyRate();
    const utilizationB = await poolB.utilizationRate();
    console.log(`Pool B new state:`);
    console.log(`  Supply Rate: ${supplyRateB} bps (${Number(supplyRateB) / 100}%)`);
    console.log(`  Utilization: ${utilizationB} bps (${Number(utilizationB) / 100}%)\n`);

    console.log("🎯 Reactive Network Flow:");
    console.log("  1. ✅ RateUpdated events emitted from MockLendingPool contracts on Sepolia");
    console.log("  2. ⏳ Reactive Network listens for these events (topic: 0xb38780dd...)");
    console.log("  3. ⏳ AlbatrozSentinel.react() called with new rates/utilization");
    console.log("");
    console.log("========================================");
    console.log("  SIMULATION COMPLETE - CHECK EXPLORER");
    console.log("========================================");
    console.log("");
    console.log("📊 Explorer Links (click to verify):");
    console.log(`  🔹 Sentinel (Lasna): https://lasna.reactscan.net/address/${sentinelAddress}`);
    console.log(`  🔹 Vault (Sepolia):  https://sepolia.etherscan.io/address/${VAULT_ADDRESS}`);
    console.log(`  🔹 Pool A (Sepolia): https://sepolia.etherscan.io/address/${POOL_A_ADDRESS}`);
    console.log(`  🔹 Pool B (Sepolia): https://sepolia.etherscan.io/address/${POOL_B_ADDRESS}`);
    console.log("");
    console.log("📝 Next Steps:");
    console.log("  1. Open Sentinel link above to check RVM Transactions");
    console.log("  2. Look for 'React to event' transactions");
    console.log("  3. Check 'Destination Transaction' for Sepolia callback");
    console.log("");
    console.log("✅ Simulation finished successfully!");

  } catch (error) {
    console.error("❌ Error during simulation:", error.message);
    process.exit(1);
  }
}

simulateRebalance();
