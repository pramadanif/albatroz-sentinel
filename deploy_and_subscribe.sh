#!/bin/bash

# Load environment variables
source .env

# Set RPC URL for Lasna
RPC_URL="https://lasna-rpc.rnk.dev/"

echo "🚀 Starting Albatroz Sentinel - Deployment & Setup"
echo "=================================================="

# Step 1: Deploy Contract
echo "📦 Deploying AlbatrozSentinel to Lasna..."
cd reactivelasnacontract

# Run forge script to deploy
# We use --json to capture output if possible, or just grep
forge_output=$(forge script DeployReactive.s.sol --rpc-url $RPC_URL --broadcast --legacy --skip-simulation)

# Extract contract address 
# This regex looks for "AlbatrozSentinel deployed at: 0x..." in logs
contract_address=$(echo "$forge_output" | grep "AlbatrozSentinel deployed at:" | awk '{print $4}')

if [ -z "$contract_address" ]; then
    echo "❌ Deployment failed or address not found in output."
    echo "Output:"
    echo "$forge_output"
    exit 1
fi

echo "✅ Contract Deployed at: $contract_address"
echo ""

# Step 2: Fund Ledger & Subscribe Pool A
echo "🔌 Subscribing Pool A & Funding Ledger..."
# Method: addPool(address) payable
# Value: 0.1 ether
cast send $contract_address "addPool(address)" 0x46eE74Bf6D3c6b06483Ec4BF4066a8117Fa8Cb47 \
  --value 0.1ether \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --legacy

echo "✅ Pool A Subscribed!"
echo ""

# Step 3: Subscribe Pool B
echo "🔌 Subscribing Pool B..."
# Method: addPool(address) payable
# Value: 0.1 ether
cast send $contract_address "addPool(address)" 0xBE2bcf983b84c030b0C851989aDF351816fA21D2 \
  --value 0.1ether \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY \
  --legacy

echo "✅ Pool B Subscribed!"
echo ""

echo "=================================================="
echo "🎉 DEPLOYMENT AND AUTOMATED SUBSCRIPTION COMPLETE!"
echo "=================================================="
echo "Sentinel Address: $contract_address"
echo "Next: node simulate_rebalance.js"
