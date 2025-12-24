Berikut adalah visualisasi **Architecture System** dan **Logic Flow** menggunakan Mermaid untuk proyek Albatroz Sentinel. Diagram ini akan sangat membantu juri memahami bagaimana "otak" Reactive Network berkomunikasi dengan "otot" di Sepolia.

### 1. System Architecture Diagram
Diagram ini menunjukkan struktur komponen di dua jaringan yang berbeda dan bagaimana data mengalir di antara keduanya.

```mermaid
graph TB
    subgraph "Ethereum Sepolia (Execution Layer)"
        User((User/Investor))
        Vault[AlbatrozVault ERC-4626]
        PoolA[Mock Lending Pool A]
        PoolB[Mock Lending Pool B]
        USDC[MockUSDC Token]
        Proxy[Reactive Callback Proxy]
    end

    subgraph "Reactive Network (Intelligence Layer)"
        Sentinel[AlbatrozSentinel Contract]
        System[Reactive System Contract]
    end

    %% Data Flow
    User -->|Deposit| Vault
    Vault -->|Allocate| PoolA
    
    PoolA -.->|Emit RateUpdated Event| System
    PoolB -.->|Emit RateUpdated Event| System
    
    System -.->|Forward Event Data| Sentinel
    
    Sentinel -->|Decision Logic| Sentinel
    Sentinel --x|Request Callback| System
    
    System -.->|Execute Callback| Proxy
    Proxy -->|Call rebalance| Vault
    
    Vault -->|Withdraw| PoolA
    Vault -->|Deposit| PoolB

    style Sentinel fill:#00FF00,stroke:#333,stroke-width:4px,color:#000
    style Vault fill:#00FFFF,stroke:#333,stroke-width:2px,color:#000
    style System fill:#FFB100,stroke:#333,stroke-width:2px,color:#000
```

---

### 2. Sequence Diagram: Autonomous Rebalancing Flow
Diagram ini menjelaskan urutan kejadian (step-by-step) mulai dari perubahan bunga di pasar hingga eksekusi dana.

```mermaid
sequenceDiagram
    autonumber
    participant Market as Lending Market (Sepolia)
    participant RN as Reactive System Contract
    participant Sentinel as Albatroz Sentinel (Reactive)
    participant Vault as Albatroz Vault (Sepolia)

    Note over Market, Vault: State: Funds are in Pool A
    
    Market->>RN: Emit RateUpdated (Pool B Yield Spikes!)
    RN->>Sentinel: Trigger onEvent()
    
    Note over Sentinel: Compute RAYS Score
    Note over Sentinel: Score = (Rate*0.8) - (Util*0.2)
    
    alt Score B > Score A + Threshold + Gas
        Sentinel->>RN: requestCallback(rebalance payload)
        RN->>Vault: Executing rebalance(Pool A, Pool B)
        Vault->>Market: Withdraw from Pool A
        Vault->>Market: Deposit to Pool B
        Note over Vault: Event: StrategyExecuted
    else Logic Not Met
        Note over Sentinel: Log: Rebalance not profitable (Keep state)
    end
```

---

### 3. Penjelasan Arsitektur (Untuk Dokumentasi README)

**A. Execution Layer (Sepolia):**
*   **AlbatrozVault:** Bertindak sebagai *Gateway* tunggal bagi pengguna. Menggunakan standar ERC-4626 untuk kompatibilitas DeFi yang luas.
*   **Mock Lending Pools:** Sumber kebenaran (*Source of Truth*) data pasar. Setiap perubahan bunga memicu gelombang informasi ke jaringan reaktif.
*   **Callback Proxy:** Gerbang keamanan yang memastikan hanya instruksi valid dari Reactive Network yang bisa menggerakkan dana.

**B. Intelligence Layer (Reactive Network):**
*   **Subscription Model:** Sentinel tidak melakukan *polling* (yang memboroskan gas), melainkan berlangganan secara pasif. Ia hanya aktif ketika ada perubahan data yang relevan.
*   **Weighted Decision Engine:** Menggunakan rumus finansial (RAYS) untuk mengevaluasi apakah sebuah perpindahan dana menguntungkan setelah dikurangi biaya transaksi dan risiko likuiditas.
*   **Cross-Chain Orchestrator:** Sentinel bertindak sebagai konduktor orkestra, mengarahkan aset di Sepolia berdasarkan intelijen yang diproses secara otonom di Lasna.

---

### 4. Logic Summary (The "Brain" Logic)

| Tahap | Aktivitas | Rumus / Logika |
| :--- | :--- | :--- |
| **Ingestion** | Mendengar event `RateUpdated` | `abi.decode(data, (rate, util))` |
| **Analysis** | Menghitung Skor Risiko | `(Rate * 0.8) - (Util * 0.2)` |
| **Arbitrage** | Cek Keuntungan Netto | `DeltaScore > Threshold + GasCost` |
| **Safety** | Proteksi Aset | `minAmountOut = amount * 0.99` |
| **Action** | Callback Eksekusi | `rebalance(from, to, amount, minOut)` |

---

### Kesimpulan Final Verdict untuk README:
> "Arsitektur ini memisahkan **Kepemilikan Aset** (di Sepolia) dan **Logika Strategi** (di Reactive Network). Hasilnya adalah sistem yang memiliki keamanan setingkat *cold-storage* namun memiliki kelincahan setingkat *high-frequency trading bot*. Inilah manifestasi sejati dari **Smart Liquidity**."

Dengan diagram Mermaid ini, dokumentasi kamu akan terlihat sangat profesional dan memudahkan juri untuk memberikan nilai penuh pada aspek **Technical Design**. 🚀