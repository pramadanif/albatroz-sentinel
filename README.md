# 🦅 Albatroz Sentinel
### Autonomous Cross-Chain Yield Optimization Engine powered by Reactive Network

> **"Albatroz Sentinel uses the Reactive Network to eliminate the need for centralized keepers, providing a fully autonomous, risk-aware yield optimization engine."**

![License](https://img.shields.io/badge/license-MIT-blue)
![Network](https://img.shields.io/badge/network-Reactive%20%7C%20Sepolia-orange)
![Standard](https://img.shields.io/badge/standard-ERC4626-green)

## 📊 Project Overview

Albatroz Sentinel is not just a yield aggregator; it is an **institutional-grade autonomous agent** that monitors lending pools across chains. Unlike traditional auto-compounders that only look at APY, Albatroz uses a proprietary **RAYS (Risk-Adjusted Yield Score)** to move funds based on both *profitability* and *pool health*.

The system features a **Bloomberg Terminal-style Dashboard** that visualizes the invisible logic of the Reactive Network, making cross-chain state changes tangible and transparent.

## 🌟 Key Features

### 1. 🧠 Reactive Intelligence (The "Brain")
- **Autonomous Monitoring**: The `AlbatrozSentinel` contract on the Reactive Network continuously listens for `YieldUpdate` events on Sepolia.
- **RAYS Logic**: Implements a unique scoring algorithm:
  $$ \text{Score} = (\text{Rate} \times 80\%) - (\text{Utilization} \times 20\%) $$
  This ensures funds are not just chasing high APY into dangerous, illiquid pools.

### 2. 🛡️ Institutional Vault (The "Body")
- **ERC4626 Standard**: Built on the gold standard for tokenized vaults, ensuring composability with other DeFi protocols.
- **Slippage Protection**: Built-in `minAmountOut` checks during rebalancing to prevent sandwich attacks.
- **Security First**: `onlyProxy` modifiers ensure that only the Reactive Sentinel can trigger critical rebalance functions.

### 3. 🖥️ Bloomberg Terminal UI (The "Face")
- **Real-time Data Feed**: Live visualization of cross-chain messages and state changes.
- **Institutional Aesthetics**: High-density data display designed for professional traders.
- **Live Comparison**: Side-by-side analysis of Pool A vs. Pool B performance.

## 🏗️ Architecture

```mermaid
graph TD
    subgraph "Sepolia (L1)"
        Vault[AlbatrozVault (ERC4626)]
        PoolA[Mock Lending Pool A]
        PoolB[Mock Lending Pool B]
    end

    subgraph "Reactive Network"
        Sentinel[AlbatrozSentinel]
    end

    PoolA -- "1. Emit Yield Update" --> Sentinel
    PoolB -- "1. Emit Yield Update" --> Sentinel
    Sentinel -- "2. Calculate RAYS Score" --> Sentinel
    Sentinel -- "3. Callback (Rebalance)" --> Vault
    Vault -- "4. Move Funds" --> PoolB
```

## 📂 Project Structure

```
albatroz/
├── contracts/                 # Sepolia Smart Contracts
│   ├── AlbatrozVault.sol      # Main ERC4626 Vault
│   ├── MockLendingPool.sol    # Simulation of Aave/Compound
│   └── MockUSDC.sol           # Testnet Stablecoin
├── reactivelasnacontract/     # Reactive Network Contracts
│   └── AlbatrozSentinel.sol   # The Autonomous Listener
├── src/                       # Frontend Application
│   ├── components/Dashboard/  # Bloomberg UI Components
│   └── app/                   # Next.js App Router
└── public/                    # Static Assets
```

## 🚀 Getting Started

### Prerequisites
- [Foundry](https://book.getfoundry.sh/) (Forge)
- [Node.js](https://nodejs.org/) (v18+)

### 1. Smart Contract Setup
```bash
# Install dependencies
cd contracts
forge install

# Deploy Mock Environment (Sepolia)
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC --broadcast
```

### 2. Reactive Sentinel Setup
```bash
# Deploy Sentinel (Reactive Kopli/Lasna)
cd reactivelasnacontract
# (Follow Reactive Network deployment guide)
```

### 3. Frontend Setup
```bash
# Install dependencies
npm install

# Run Development Server
npm run dev
```

## 🎮 Demo Scenario

To demonstrate the power of Albatroz Sentinel to judges:

1.  **Initial State**: Funds are in **Pool A** (APY 5%).
2.  **Trigger**: Use `MockLendingPool.setMarketConditions()` to spike **Pool B** APY to 12%.
3.  **Reaction**:
    *   `AlbatrozSentinel` detects the event.
    *   Calculates RAYS Score: Pool B > Pool A.
    *   Emits a Callback request.
4.  **Execution**: `AlbatrozVault` receives the callback and automatically moves funds to Pool B.
5.  **Visualization**: Watch the "Terminal Log" on the UI light up with `[EXECUTING] Cross-chain rebalance`.

## 🔮 Future Roadmap

- [ ] **Dynamic Rebalancing**: Upgrade from fixed amounts to percentage-based rebalancing.
- [ ] **Cooldown Mechanism**: Implement `lastRebalanceTime` to optimize gas usage and prevent spam.
- [ ] **Multi-Chain Support**: Expand monitoring to Polygon and Arbitrum.

---

*Built for the Reactive Network Hackathon 2025.*