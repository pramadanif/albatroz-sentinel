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

// MockLendingPool ABI (minimal - just setMarketConditions)
const POOL_ABI = [
  {
    inputs: [
      { internalType: "uint256", name: "_rate", type: "uint256" },
      { internalType: "uint256", name: "_util", type: "uint256" },
    ],
    name: "setMarketConditions",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: false, internalType: "uint256", name: "newRate", type: "uint256" },
      { indexed: false, internalType: "uint256", name: "newUtil", type: "uint256" },
    ],
    name: "RateUpdated",
    type: "event",
  },
];

async function simulateRebalance() {
  console.log("🚀 Starting Reactive Network simulation...\n");

  // Initialize provider and signer
  const rpcUrl = process.env.SEPOLIA_RPC || "https://sepolia.drpc.org";
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

    // Pool A: Change from 450 bps (4.5%) supply rate to 520 bps (5.2%)
    // Also increase utilization from 6000 bps (60%) to 7500 bps (75%)
    console.log("Pool A: Updating supply rate from 450 bps to 520 bps");
    console.log("        Updating utilization from 6000 bps to 7500 bps");
    const tx1 = await poolA.setMarketConditions(520, 7500);
    console.log(`⏳ Transaction sent: ${tx1.hash}`);
    const receipt1 = await tx1.wait();
    console.log(`✅ Pool A updated at block ${receipt1.blockNumber}\n`);

    // Pool B: Change from 725 bps (7.25%) supply rate to 650 bps (6.5%)
    // Also decrease utilization from 8500 bps (85%) to 7200 bps (72%)
    console.log("Pool B: Updating supply rate from 725 bps to 650 bps");
    console.log("        Updating utilization from 8500 bps to 7200 bps");
    const tx2 = await poolB.setMarketConditions(650, 7200);
    console.log(`⏳ Transaction sent: ${tx2.hash}`);
    const receipt2 = await tx2.wait();
    console.log(`✅ Pool B updated at block ${receipt2.blockNumber}\n`);

    // Get the updated rates from contracts
    console.log("📝 Fetching updated contract state...\n");

    const supplyRateA = await poolA.supplyRate();
    const utilizationA = await poolA.utilizationRate();
    console.log(`Pool A new state:`);
    console.log(`  Supply Rate: ${supplyRateA} bps (${supplyRateA / 100}%)`);
    console.log(`  Utilization: ${utilizationA} bps (${utilizationA / 100}%)\n`);

    const supplyRateB = await poolB.supplyRate();
    const utilizationB = await poolB.utilizationRate();
    console.log(`Pool B new state:`);
    console.log(`  Supply Rate: ${supplyRateB} bps (${supplyRateB / 100}%)`);
    console.log(`  Utilization: ${utilizationB} bps (${utilizationB / 100}%)\n`);

    console.log("🎯 Reactive Network Flow:");
    console.log("  1. ✅ RateUpdated events emitted from MockLendingPool contracts on Sepolia");
    console.log("  2. ⏳ Reactive Network listens for these events (topic: 0xb38780dd...)");
    console.log("  3. ⏳ AlbatrozSentinel.onEvent() called with new rates/utilization");
    console.log("  4. ⏳ _optimize() calculates new rebalance strategy");
    console.log("  5. ⏳ Emit Callback to execute rebalancing on vault\n");

    console.log("✨ Simulation complete! Monitor the Reactive Network faucet for callbacks.");
    console.log(`📍 Check AlbatrozSentinel at: 0x93dBc50500C7817eEFFA29E44750D388687D19F4`);
    console.log(`🔗 Lasna Explorer: https://lasna.reactscan.net`);
  } catch (error) {
    console.error("❌ Error during simulation:", error.message);
    if (error.data) {
      console.error("Error data:", error.data);
    }
    process.exit(1);
  }
}

simulateRebalance();
