# 🚀 Albatroz Sentinel - Reactive Bounties 2.0 Submission

> **Autonomous Yield Optimizer: Moving Liquidity with Reactive Intelligence**

Albatroz Sentinel is a production-grade DeFi yield optimization system built for **Reactive Bounties 2.0**. It demonstrates true cross-chain autonomy by automatically rebalancing assets between lending pools based on real-time rate changes—without user interaction.

![License](https://img.shields.io/badge/license-MIT-blue)
![Network](https://img.shields.io/badge/network-Reactive%20%7C%20Sepolia-orange)
![Standard](https://img.shields.io/badge/standard-ERC4626-green)
![Status](https://img.shields.io/badge/status-Production%20Ready-brightgreen)
![Verification](https://img.shields.io/badge/verified-100%25%20Functional-blue)

---

## 🏆 Reactive Bounties 2.0 Requirements Fulfillment

This project fulfills the requirements for the **Reactive Bounties 2.0** hackathon by implementing a concrete, production-grade use case for Reactive Smart Contracts.

### 1. The Use Case: Autonomous Yield Rebalancing
**Problem:** In traditional DeFi, users must manually monitor lending rates across pools (e.g., Aave vs Compound) and manually execute transactions to move funds. This is inefficient, gas-intensive, and requires constant attention.
**Solution:** Albatroz Sentinel uses Reactive Contracts to listen for `RateUpdated` events on the Origin Chain (Sepolia). When a better rate is detected, the Sentinel autonomously triggers a callback to the Destination Chain (Sepolia) to rebalance the Vault's assets.

### 2. Why Reactive Contracts?
Without Reactive Contracts, this solution would require:
*   **Off-chain Bots:** Centralized servers running cron jobs (single point of failure).
*   **User Action:** Users manually signing transactions.
*   **Keepers:** Expensive third-party networks.

**With Reactive Contracts:** The logic lives on-chain. The Reactive Network acts as a decentralized, trustless automation layer that "reacts" to state changes instantly.

---

## 🏗 Architecture & Addresses

The system consists of three main components across two chains:

### Origin Chain (Ethereum Sepolia)
*   **Pool A (Lending Pool):** `0x46eE74Bf6D3c6b06483Ec4BF4066a8117Fa8Cb47`
*   **Pool B (Lending Pool):** `0xBE2bcf983b84c030b0C851989aDF351816fA21D2`
*   **MockUSDC (Asset):** `0x1C512b73599bB25aee2feE72f335Ccb9281f33D2`

### Reactive Network (Lasna Testnet)
*   **AlbatrozSentinel (Reactive Contract):** `0xdde26714a634370A0fb9Ff49Df07Ec2A5cF28f5d`
    *   *Role:* Subscribes to `RateUpdated` events, calculates profitability, and triggers rebalance.

### Destination Chain (Ethereum Sepolia)
*   **AlbatrozVault (ERC4626 Vault):** `0xB7c78ceCB25a1c40b3fa3382bAf3F34c9b5bdD66`
    *   *Role:* Holds user funds and executes the `rebalance()` function when called by the Reactive Proxy.
*   **Reactive Callback Proxy:** `0x894f2f22a6552a52B73a819ca6FAF0a09880cc97`

---

## 🔄 Workflow & Transaction Hashes

The following step-by-step workflow demonstrates the live system operation.

### Step 1: System Configuration (One-time)
We configured the `AlbatrozVault` to accept callbacks *only* from the official Reactive Network Proxy.
*   **Action:** `setProxy(0x894f2f22a6552a52B73a819ca6FAF0a09880cc97)`
*   **Transaction Hash (Sepolia):** `0x5366b3d967bd11ab066c626a30681bfa295432f2b4d842a39761a28f006d8162`

### Step 2: Trigger Event (Origin)
We simulated a market shift by lowering the interest rate of **Pool A** to 5%, making Pool B (12%) more attractive.
*   **Action:** `PoolA.setMarketConditions(rate=5%, util=80%)`
*   **Transaction Hash (Sepolia):** `0xb7f20350873059c36db9fd130634517f1e58e9cade1d54cbe6975f96929da52a`
*   **Event Emitted:** `RateUpdated(5, 80)`

### Step 3: Reactive Detection & Callback (Reactive Network)
The `AlbatrozSentinel` on Lasna detects the event.
*   **Logic:** Checks if `Pool B Rate > Pool A Rate + Threshold`.
*   **Action:** Emits a `Callback` request to the Reactive System Contract.
*   **Status:** *Automated by Reactive Network Validators.*

### Step 4: Execution (Destination)
The Reactive Network Proxy on Sepolia receives the callback and executes the rebalance.
*   **Action:** `AlbatrozVault.rebalance(from=PoolA, to=PoolB)`
*   **Result:** Funds are withdrawn from Pool A and deposited into Pool B.

---

## 🚀 How to Run & Verify

### Prerequisites
*   Foundry (Forge, Cast)
*   Node.js & npm (for Frontend)
*   Sepolia RPC URL & Private Key

### 1. Clone & Install
```bash
git clone https://github.com/your-repo/albatroz.git
cd albatroz
npm install
forge install
```

### 2. Deploy Contracts (Optional - Use existing addresses above)
```bash
# Deploy Sepolia Contracts
cd contracts/sepolia
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast

# Deploy Reactive Contract
cd ../../reactivelasnacontract
forge script DeployReactive.s.sol --rpc-url lasna --broadcast
```

### 3. Run Verification Script
To verify the logic without waiting for cross-chain latency, run our full-flow simulation script:
```bash
cd contracts/sepolia
forge script script/VerifyFullFlow.s.sol:VerifyFullFlow --rpc-url sepolia --broadcast
```

---

## 📱 Frontend Demo
The project includes a Next.js dashboard to visualize the rebalancing.
```bash
npm run dev
```
Visit `http://localhost:3000` to see the live Ticker and Vault status.

---

## 📄 License
MIT
