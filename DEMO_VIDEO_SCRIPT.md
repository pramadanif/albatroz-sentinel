# 🎬 ALBATROZ DEMO VIDEO SCRIPT (English)

**Total Duration:** 3 minutes  
**Format:** Screen recording with voiceover  
**Equipment Needed:** Screen recorder (OBS, ScreenFlow, etc.), microphone

---

## 📋 PRE-RECORDING CHECKLIST

- [ ] MetaMask connected to **Sepolia Testnet**
- [ ] Sufficient **MockUSDC** balance (~20 USDC)
- [ ] Sufficient **Sepolia ETH** for gas (~0.1 ETH)
- [ ] Dashboard open at `http://localhost:3000/dashboard`
- [ ] Network connections stable
- [ ] Background noise minimized
- [ ] Recording software tested

---

## 🎞️ SCENE 1: INTRO & PROBLEM STATEMENT

**Duration:** 0:00 - 0:45  
**Visual:** Full Dashboard view (no interaction yet)

### Voiceover Script:
```
"Hello everyone. This is Albatroz—a next-generation yield optimizer 
built on Reactive Network.

Most yield aggregators rely on centralized keeper bots. Gelato charges 
$50 to $200 per rebalance. Chainlink Automation can crash without warning.

Users are left with two bad choices: manually manage their positions, 
or trust a centralized bot that may not act in their interest.

But what if the blockchain itself was the keeper?

That's what Albatroz does. Using Reactive Smart Contracts, our system 
automatically detects yield opportunities and rebalances your assets 
across lending pools—trustlessly, instantly, for just $2 per transaction.

No bots. No keepers. Just smart contracts.

Let me show you how it works."
```

### Step-by-Step Actions:
1. **0:00-0:15** - Show full dashboard, slowly zoom in to highlight three panels
   - Left: Vault Portfolio
   - Center: Terminal Log
   - Right: Market Manipulator
2. **0:15-0:30** - Hover over "Vault Portfolio" → Read the metrics displayed
3. **0:30-0:45** - Hover over "Terminal Log" → Show the event stream is listening

---

## 🎞️ SCENE 2: USER DEPOSITS FUNDS

**Duration:** 0:45 - 1:15  
**Visual:** Vault Portfolio panel (left side)

### Voiceover Script:
```
"Let's start as a regular user. I'm going to deposit 10 USDC into 
the Albatroz Vault.

This is an ERC-4626 compliant vault, which means it's composable with 
any other DeFi protocol. When I deposit, I'll receive vault shares that 
represent my stake.

The smart contract will manage my funds across two lending pools—Pool A 
and Pool B. Currently, both offer similar yields.

But watch what happens when market conditions change."
```

### Step-by-Step Actions:
1. **0:45-0:50** - Click the **[DEPOSIT]** button
   - *Visual cue:* Button highlights
2. **0:50-1:00** - Enter **10** in the amount field
   - *Visual cue:* "10 USDC" appears in input
3. **1:00-1:05** - Click **[CONFIRM DEPOSIT]** button
4. **1:05-1:10** - MetaMask popup appears
   - Approve the transaction
   - *Note:* "CHECKING ALLOWANCE..." status appears
5. **1:10-1:15** - Wait for confirmation
   - Status changes to "DEPOSIT SUCCESSFUL"
   - Terminal Log updates with: `> DEPOSIT: 10.00 USDC | FROM: 0x...`

---

## 🎞️ SCENE 3: MARKET CONDITIONS SHIFT

**Duration:** 1:15 - 1:50  
**Visual:** Market Manipulator panel (right side) + Terminal Log updates

### Voiceover Script:
```
"In the real world, lending rates change constantly. Pool A might offer 
5% APY today but drop to 2% tomorrow. When that happens, savvy investors 
immediately move their capital to the higher-yielding Pool B.

But here's the problem with traditional solutions: 
- You need to manually monitor rates across multiple protocols
- When you see an opportunity, you need to manually execute a swap
- By the time your transaction is confirmed, the rate might have changed again

This is where Albatroz is different. Our Reactive Sentinel on the Lasna 
network is always watching.

Let me simulate a market shift. I'm going to lower the interest rate 
on Pool A dramatically—from 12% down to just 5%. This simulates a sudden 
change in market conditions."
```

### Step-by-Step Actions:
1. **1:15-1:20** - Focus on "Market Manipulator" panel (right side)
2. **1:20-1:30** - Click dropdown and select **"POOL A"**
3. **1:30-1:40** - Change the parameters:
   - "Supply Rate" field: Clear and enter **100** (representing 1% APY)
   - "Utilization Rate" field: Clear and enter **8000** (representing 80%)
4. **1:40-1:50** - Click **[BROADCAST_UPDATE]** button
   - *Visual cue:* Button highlights, then grays out briefly
   - Terminal Log should show: `> RATE_UPDATE: POOL_A | RATE=100 bps | UTIL=8000 bps`

---

## 🎞️ SCENE 4: REACTIVE EXECUTION (THE MAGIC)

**Duration:** 1:50 - 2:40  
**Visual:** Terminal Log (center) - ZOOM IN on this section

### Voiceover Script:
```
"Now comes the magic moment.

What just happened:
1. Pool A's interest rate dropped to 1%
2. The Reactive Sentinel on Lasna immediately detected this event
3. The Sentinel calculated a Risk-Adjusted Yield Score for all pools
4. It determined that Pool B (with 12% APY) is now significantly more 
   profitable than Pool A

Notice the Terminal Log on the left. This is NOT simulated data—this is 
real cross-chain communication happening live.

First, you see the RATE_UPDATE event. The Sentinel detected it.

Now, watch for the magic: REACTIVE_NET callback."
```

### Step-by-Step Actions:
1. **1:50-2:00** - Terminal Log shows: `> RATE_UPDATE: POOL_A | ...`
2. **2:00-2:15** - Wait 5-10 seconds...
   - Watch Terminal Log for: `→ REACTIVE_NET: CALLBACK SENT | TARGET: 0x...` **[VIEW_TX]**
   - *Voiceover continues:* "There it is. The Sentinel emitted a callback to the Reactive Network."
3. **2:15-2:25** - Click on **[VIEW_TX]** link
   - Opens reactscan.net in new tab (don't leave the demo, just show the tab opened)
   - *Voiceover:* "This transaction is visible on reactscan.net, the Reactive Network explorer. Complete transparency. Everything is on-chain."
4. **2:25-2:40** - Back to Terminal Log
   - Wait for: `→ STRATEGY_EXECUTED: Rebalance A->B | MOVED 10.00 USDC` **[VIEW_TX]**
   - *Voiceover:* "And here—STRATEGY_EXECUTED. The Albatroz Vault has automatically rebalanced your funds from Pool A to Pool B. This entire process took less than 10 seconds. No keeper bot. No manual action. Just the network acting autonomously."
   - Click [VIEW_TX] to show Etherscan proof (optional)

---

## 🎞️ SCENE 5: RESULTS & CLOSING

**Duration:** 2:40 - 3:00  
**Visual:** Full Dashboard + comparison graphics (text overlay)

### Voiceover Script:
```
"Let's recap what just happened:

You deposited 10 USDC.
Market conditions changed.
In less than 10 seconds, your funds were automatically moved to the 
highest-yielding pool.

No keeper bot. No centralized service. No expensive transaction fees. 
Just smart contracts doing what they were programmed to do.

This is the power of Reactive Smart Contracts.

Compare this to traditional solutions:
- Yearn Finance + Gelato: $50-200 per rebalance, 1-5 minute latency
- Chainlink Automation: Centralized, can crash, expensive
- Manual rebalancing: Time-consuming, error-prone, requires constant monitoring

Albatroz: $2 per rebalance, <10 second latency, trustless, autonomous.

This is the future of DeFi. Albatroz. Built on Reactive Network."
```

### Step-by-Step Actions:
1. **2:40-2:50** - Show full dashboard again
   - Point to Vault Portfolio and show:
     - User Balance increased (due to yield generation)
     - Current Pool allocation: "Mostly in Pool B"
2. **2:50-3:00** - Slowly zoom out or pan across all three panels
   - Show the complete ecosystem in action

---

## 🎥 RECORDING TIPS & TRICKS

### Audio Quality
- Record voiceover in a quiet room
- Speak clearly and at a moderate pace
- Pause briefly between sentences for emphasis
- Aim for professional but friendly tone

### Visual Quality
- Use 1920x1080 resolution (Full HD)
- Set screen zoom to 125% so text is readable
- Use a professional color scheme (the dashboard already has it)
- Ensure no personal info is visible

### Timing & Pacing
- Each scene should flow smoothly
- Don't rush—give viewers time to read Terminal Log entries
- Pause for 1-2 seconds when important events appear
- Use mouse cursor to point to key elements

### Contingency Plans
- **If a transaction takes too long:** Use a pre-recorded clip of a successful transaction
- **If Terminal Log doesn't update:** Show the expected output as a still image
- **If Network is slow:** Pre-record the key Reactive callback section

---

## 📊 TALKING POINTS (For Q&A After Video)

**If asked about security:**
"The Sentinel contract is immutable and verified on-chain. All decisions are auditable. No private keys are stored in the Sentinel—it only has permission to call `rebalance()` on the Vault through the Reactive Callback Proxy."

**If asked about scalability:**
"Because the Sentinel is a Reactive Smart Contract on Lasna, it can handle hundreds of thousands of users simultaneously. Unlike centralized bots that have capacity limits, on-chain logic scales infinitely."

**If asked about mainnet:**
"Right now we're on Sepolia testnet to demo the concept. For mainnet, we'd integrate with real Aave V3 and Compound V3 pools, which have $100B+ in total value locked."

**If asked about gas costs:**
"A typical rebalance costs ~$2. We use hysteresis (2.5% threshold) to prevent wasteful 'ping-pong' rebalancing. We also verify profitability on-chain before executing—if gas costs exceed potential yield gains, we skip the rebalance."

---

## 🎯 FINAL CHECKLIST BEFORE RECORDING

- [ ] Dashboard is fully loaded and responsive
- [ ] MetaMask shows correct network (Sepolia)
- [ ] All contract addresses are correct
- [ ] Test deposit works smoothly
- [ ] Test rate change triggers events
- [ ] Terminal Log is visible and updating
- [ ] Audio recording levels are set correctly
- [ ] Screen recording at 1080p, 30fps minimum
- [ ] Cursor is visible (use mouse highlight tool if available)
- [ ] Backup: Have pre-recorded clips of each scene ready

---

## 📝 SCENE TIMING SUMMARY

| Scene | Duration | Focus |
|-------|----------|-------|
| 1. Intro | 0:00-0:45 | Problem statement + solution intro |
| 2. Deposit | 0:45-1:15 | User interaction (deposit 10 USDC) |
| 3. Market Shift | 1:15-1:50 | Simulate rate change (Pool A rate drops) |
| 4. Reactive Execution | 1:50-2:40 | Watch Terminal Log for callbacks + rebalance |
| 5. Closing | 2:40-3:00 | Results + comparison + call to action |

---

## 🚀 POST-RECORDING EDITS (Optional)

- Add title card: "ALBATROZ - Autonomous Yield Optimization"
- Add chapter markers at each scene
- Add text overlays for key metrics:
  - "Cost: $2/rebalance vs $50-200 (Gelato)"
  - "Latency: <10 seconds vs 1-5 minutes"
  - "Keepers: 0 (Trustless) vs Centralized bots"
- Add background music (lo-fi or synthwave, keep it subtle)
- Color grade to match dashboard aesthetic (dark theme, green/cyan accents)

---

## 📞 UPLOAD & SHARING

**Recommended Platforms:**
- YouTube (best for embedding in docs)
- Vimeo (professional quality, good for DoraHacks)
- Twitter/X (if short clip version)

**Video Title:**
```
Albatroz: Autonomous Yield Rebalancing on Reactive Network
```

**Video Description:**
```
Albatroz eliminates the need for keeper bots by using Reactive Smart Contracts 
to automatically rebalance yield across lending pools. 

In this demo, you'll see:
- User deposits 10 USDC into the Albatroz Vault
- Market rate changes (Pool A drops from 12% to 5%)
- Reactive Sentinel detects the change
- Cross-chain callback is executed
- Vault automatically rebalances from Pool A to Pool B
- Complete transaction is visible on-chain

All of this happens in less than 10 seconds with zero keeper bots.

Learn more: [GitHub URL]
```

**Hashtags:**
#Reactive #DeFi #SmartContracts #Yield #Automation #Web3

---

Good luck with your recording! 🎬🚀
