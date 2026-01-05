'use client';

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useContractData, POOL_A_ADDRESS, POOL_B_ADDRESS } from '../../hooks/useContractData';
import { useWallet } from '../../hooks/useWallet';

// Minimal ABI for setMarketConditions
const POOL_ABI = [
  'function setMarketConditions(uint256 newSupplyRate, uint256 newUtilizationRate) external',
];

interface ManipulatorState {
  selectedPool: 'A' | 'B';
  newRate: string;
  newUtil: string;
  isSubmitting: boolean;
  txHashA: string | null;
  txHashB: string | null;
  txStatus: 'pending' | 'confirmed' | 'failed' | null;
  error: string | null;
}

const MarketManipulator: React.FC = () => {
  const { poolA, poolB } = useContractData();
  const { address, isConnected, signer, error: walletError, connect, isConnecting } = useWallet();

  const [state, setState] = useState<ManipulatorState>({
    selectedPool: 'A',
    newRate: '500',
    newUtil: '7500',
    isSubmitting: false,
    txHashA: null,
    txHashB: null,
    txStatus: null,
    error: null,
  });

  const currentPool = state.selectedPool === 'A' ? poolA : poolB;
  const poolAddress = state.selectedPool === 'A' ? POOL_A_ADDRESS : POOL_B_ADDRESS;

  // Single Pool Update (Manual Form)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signer) return;

    setState(prev => ({ ...prev, isSubmitting: true, error: null, txHashA: null, txHashB: null, txStatus: 'pending' }));

    try {
      const poolContract = new ethers.Contract(poolAddress, POOL_ABI, signer);
      const tx = await poolContract.setMarketConditions(BigInt(state.newRate), BigInt(state.newUtil));

      setState(prev => ({ ...prev, txHashA: tx.hash }));
      await tx.wait();

      setState(prev => ({ ...prev, txStatus: 'confirmed', isSubmitting: false }));
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message || 'Tx Failed', txStatus: 'failed', isSubmitting: false }));
    }
  };

  // Dual Pool Scenario Execution (Simulate Rebalance)
  const executeScenario = async (direction: 'A_TO_B' | 'B_TO_A') => {
    if (!signer) return;

    setState(prev => ({
      ...prev,
      isSubmitting: true,
      error: null,
      txHashA: null,
      txHashB: null,
      txStatus: 'pending'
    }));

    try {
      // 1. Define Conditions
      // BAD Pool: Rate 2% (200), Util 90% (9000)
      // GOOD Pool: Rate 12% (1200), Util 30% (3000)

      const poolAContract = new ethers.Contract(POOL_A_ADDRESS, POOL_ABI, signer);
      const poolBContract = new ethers.Contract(POOL_B_ADDRESS, POOL_ABI, signer);

      let txA: any;
      let txB: any;

      if (direction === 'A_TO_B') {
        // Crash A (Bad), Boost B (Good)
        txA = await poolAContract.setMarketConditions(BigInt(200), BigInt(9000));
        setState(prev => ({ ...prev, txHashA: txA.hash }));
        await txA.wait(); // Wait for A to confirm before sending B (safer for nonce)

        txB = await poolBContract.setMarketConditions(BigInt(1200), BigInt(3000));
        setState(prev => ({ ...prev, txHashB: txB.hash }));
        await txB.wait();
      } else {
        // Boost A (Good), Crash B (Bad)
        txA = await poolAContract.setMarketConditions(BigInt(1200), BigInt(3000));
        setState(prev => ({ ...prev, txHashA: txA.hash }));
        await txA.wait();

        txB = await poolBContract.setMarketConditions(BigInt(200), BigInt(9000));
        setState(prev => ({ ...prev, txHashB: txB.hash }));
        await txB.wait();
      }

      setState(prev => ({ ...prev, txStatus: 'confirmed', isSubmitting: false }));

    } catch (err: any) {
      console.error(err);
      setState(prev => ({
        ...prev,
        error: err.code === 'ACTION_REJECTED' ? 'User rejected transaction' : 'Simulation Failed',
        txStatus: 'failed',
        isSubmitting: false
      }));
    }
  };

  return (
    <div className="h-full border border-[#333333] bg-[#000000] flex flex-col">
      <div className="absolute top-0 left-0 w-full h-1 bg-[#FFB100] opacity-50"></div>

      {/* Header */}
      <div className="p-4 border-b border-[#333333] bg-[#111111]">
        <div className="text-[#FFB100] text-xs font-bold tracking-wider">MARKET_MANIPULATOR</div>
        <div className="text-[10px] text-[#666] mt-1">
          {isConnected ? `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Wallet Disconnected'}
        </div>
      </div>

      {/* Wallet Connection Alert */}
      {!isConnected && (
        <div className="border-b border-[#333333] bg-[#1a0a0a] p-4">
          <button onClick={connect} className="w-full px-3 py-2 text-[10px] font-mono font-bold border border-[#FFB100] bg-[#FFB100]/10 text-[#FFB100]">
            {isConnecting ? 'Connecting...' : 'CONNECT METAMASK'}
          </button>
        </div>
      )}

      {/* SCENARIO Shortcuts */}
      <div className="p-4 grid grid-cols-2 gap-3 border-b border-[#333333]">
        <button
          type="button"
          onClick={() => executeScenario('A_TO_B')}
          disabled={state.isSubmitting || !isConnected}
          className="py-3 px-2 text-[9px] font-mono font-bold border border-[#FF6B6B] text-[#FF6B6B] bg-[#FF6B6B]/10 hover:bg-[#FF6B6B]/20 transition-all disabled:opacity-50"
        >
          ⚡ EVACUATE POOL A
          <div className="text-[8px] font-normal mt-1 text-[#FF9999] opacity-70">
            (Crash A → Boost B)
          </div>
        </button>
        <button
          type="button"
          onClick={() => executeScenario('B_TO_A')}
          disabled={state.isSubmitting || !isConnected}
          className="py-3 px-2 text-[9px] font-mono font-bold border border-[#00FFFF] text-[#00FFFF] bg-[#00FFFF]/10 hover:bg-[#00FFFF]/20 transition-all disabled:opacity-50"
        >
          ⚡ EVACUATE POOL B
          <div className="text-[8px] font-normal mt-1 text-[#99FFFF] opacity-70">
            (Boost A ← Crash B)
          </div>
        </button>
      </div>

      {/* Manual Form */}
      <div className="flex-1 p-6 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Status Display */}
          {(state.txHashA || state.txHashB || state.error) && (
            <div className={`border p-3 rounded text-[9px] font-mono mb-4 ${state.txStatus === 'confirmed' ? 'border-[#00FF00] bg-[#0a3a0a]' : state.txStatus === 'failed' ? 'border-[#FF6B6B] bg-[#3a0a0a]' : 'border-[#FFB100]'}`}>
              <div className="font-bold mb-2">
                {state.txStatus === 'pending' ? '⏳ EXECUTING SCENARIO...' : state.txStatus === 'confirmed' ? '✓ SCENARIO COMPLETE' : '✗ FAILED'}
              </div>

              {state.txHashA && (
                <div className="mb-1">
                  <span className="text-[#666]">TX_A:</span>
                  <a href={`https://sepolia.etherscan.io/tx/${state.txHashA}`} target="_blank" className="text-[#00FFFF] ml-2 hover:underline">
                    {state.txHashA.slice(0, 10)}...
                  </a>
                </div>
              )}
              {state.txHashB && (
                <div>
                  <span className="text-[#666]">TX_B:</span>
                  <a href={`https://sepolia.etherscan.io/tx/${state.txHashB}`} target="_blank" className="text-[#00FFFF] ml-2 hover:underline">
                    {state.txHashB.slice(0, 10)}...
                  </a>
                </div>
              )}
              {state.error && <div className="text-[#FF6B6B] mt-2">{state.error}</div>}
            </div>
          )}

          <div className="text-[#666] text-[10px] font-bold border-b border-[#333] pb-2 mb-4">MANUAL OVERRIDE</div>

          {/* Pool Selection */}
          <div>
            <label className="text-[#999] text-xs font-mono block mb-3">TARGET POOL</label>
            <div className="flex gap-3">
              {(['A', 'B'] as const).map((pool) => (
                <button
                  key={pool}
                  type="button"
                  onClick={() => setState(prev => ({ ...prev, selectedPool: pool }))}
                  disabled={!isConnected}
                  className={`flex-1 py-2 px-4 text-xs font-mono font-bold border transition-all ${state.selectedPool === pool ? 'border-[#00FFFF] text-[#00FFFF]' : 'border-[#333] text-[#666]'}`}
                >
                  POOL_{pool}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[#666] text-[10px]">NEW RATE (bps)</label>
              <input
                type="number"
                value={state.newRate}
                onChange={e => setState(prev => ({ ...prev, newRate: e.target.value }))}
                className="w-full bg-transparent border border-[#333] text-[#fff] px-2 py-1 text-xs"
              />
            </div>
            <div>
              <label className="text-[#666] text-[10px]">NEW UTIL (bps)</label>
              <input
                type="number"
                value={state.newUtil}
                onChange={e => setState(prev => ({ ...prev, newUtil: e.target.value }))}
                className="w-full bg-transparent border border-[#333] text-[#fff] px-2 py-1 text-xs"
              />
            </div>
            <button type="submit" className="w-full bg-[#111] hover:bg-[#222] border border-[#333] text-[#00FFFF] py-2 text-xs font-bold">
              EXECUTE SINGLE UPDATE
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default MarketManipulator;
