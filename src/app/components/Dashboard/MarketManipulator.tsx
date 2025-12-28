'use client';

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useContractData } from '../../hooks/useContractData';
import { useWallet } from '../../hooks/useWallet';

// Pool contract addresses
const POOL_A_ADDRESS = '0x46eE74Bf6D3c6b06483Ec4BF4066a8117Fa8Cb47';
const POOL_B_ADDRESS = '0xBE2bcf983b84c030b0C851989aDF351816fA21D2';

// Minimal ABI for setMarketConditions
const POOL_ABI = [
  'function setMarketConditions(uint256 newSupplyRate, uint256 newUtilizationRate) external',
];

interface ManipulatorState {
  selectedPool: 'A' | 'B';
  newRate: string;
  newUtil: string;
  isSubmitting: boolean;
  txHash: string | null;
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
    txHash: null,
    txStatus: null,
    error: null,
  });

  const currentPool = state.selectedPool === 'A' ? poolA : poolB;
  const poolAddress = state.selectedPool === 'A' ? POOL_A_ADDRESS : POOL_B_ADDRESS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signer) {
      setState(prev => ({ ...prev, error: 'Wallet not connected' }));
      return;
    }

    if (!state.newRate || !state.newUtil) {
      setState(prev => ({ ...prev, error: 'Please fill in all fields' }));
      return;
    }

    setState(prev => ({ ...prev, isSubmitting: true, error: null }));

    try {
      // Create contract instance with signer
      const poolContract = new ethers.Contract(poolAddress, POOL_ABI, signer);

      // Call setMarketConditions
      // Note: MockLendingPool expects raw basis points (e.g. 500 for 5%), not 18 decimals
      const tx = await poolContract.setMarketConditions(
        BigInt(state.newRate),
        BigInt(state.newUtil)
      );

      setState(prev => ({
        ...prev,
        txHash: tx.hash,
        txStatus: 'pending',
      }));

      // Wait for confirmation
      const receipt = await tx.wait();

      setState(prev => ({
        ...prev,
        txStatus: receipt ? 'confirmed' : 'failed',
      }));

      // Reset form after 5 seconds
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          txHash: null,
          txStatus: null,
          newRate: '500',
          newUtil: '7500',
          isSubmitting: false,
        }));
      }, 5000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Transaction failed';
      setState(prev => ({
        ...prev,
        error: errorMsg,
        isSubmitting: false,
        txStatus: 'failed',
      }));

      // Clear error after 5 seconds
      setTimeout(() => {
        setState(prev => ({
          ...prev,
          txHash: null,
          txStatus: null,
          error: null,
        }));
      }, 5000);
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
          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <div className="text-[#FF6B6B] text-xs font-mono mb-2">WALLET_REQUIRED</div>
              <div className="text-[10px] text-[#999]">
                {walletError || 'Connect MetaMask to execute real transactions'}
              </div>
            </div>
            <button
              onClick={connect}
              disabled={isConnecting}
              className="px-3 py-2 text-[10px] font-mono font-bold border border-[#FFB100] bg-[#FFB100]/10 text-[#FFB100] hover:bg-[#FFB100]/20 transition-all disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <div className="flex-1 p-6 overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
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
                  className={`flex-1 py-3 px-4 text-xs font-mono font-bold border transition-all disabled:opacity-50 ${
                    state.selectedPool === pool
                      ? pool === 'A'
                        ? 'border-[#00FFFF] bg-[#00FFFF]/10 text-[#00FFFF]'
                        : 'border-[#FFB100] bg-[#FFB100]/10 text-[#FFB100]'
                      : 'border-[#333333] text-[#666] hover:border-[#666]'
                  }`}
                >
                  POOL_{pool}
                </button>
              ))}
            </div>
          </div>

          {/* Current Values */}
          {currentPool && (
            <div className="bg-[#0a0a0a] border border-[#222222] p-4 rounded text-[10px] font-mono space-y-2">
              <div className="flex justify-between">
                <span className="text-[#666]">CURRENT_SUPPLY_RATE:</span>
                <span className="text-[#00FFFF]">{currentPool.supplyRate} bps</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">CURRENT_UTILIZATION:</span>
                <span className="text-[#00FFFF]">{currentPool.utilizationRate} bps</span>
              </div>
            </div>
          )}

          {/* New Supply Rate */}
          <div>
            <label className="text-[#999] text-xs font-mono block mb-2">NEW_SUPPLY_RATE (bps)</label>
            <input
              type="number"
              value={state.newRate}
              onChange={(e) => setState(prev => ({ ...prev, newRate: e.target.value }))}
              className="w-full bg-[#0a0a0a] border border-[#333333] text-[#00FFFF] px-3 py-2 text-xs font-mono focus:border-[#00FFFF] focus:outline-none disabled:opacity-50"
              placeholder="500"
              disabled={state.isSubmitting || !isConnected}
            />
            <div className="text-[#666] text-[9px] mt-1">
              Range: 100 - 2000 bps
            </div>
          </div>

          {/* New Utilization */}
          <div>
            <label className="text-[#999] text-xs font-mono block mb-2">NEW_UTILIZATION (bps)</label>
            <input
              type="number"
              value={state.newUtil}
              onChange={(e) => setState(prev => ({ ...prev, newUtil: e.target.value }))}
              className="w-full bg-[#0a0a0a] border border-[#333333] text-[#00FFFF] px-3 py-2 text-xs font-mono focus:border-[#00FFFF] focus:outline-none disabled:opacity-50"
              placeholder="7500"
              disabled={state.isSubmitting || !isConnected}
            />
            <div className="text-[#666] text-[9px] mt-1">
              Range: 0 - 10000 bps
            </div>
          </div>

          {/* TX Hash Display */}
          {state.txHash && (
            <div className={`border p-3 rounded text-[9px] font-mono ${
              state.txStatus === 'confirmed'
                ? 'bg-[#0a3a0a] border-[#00FF00]'
                : state.txStatus === 'failed'
                ? 'bg-[#3a0a0a] border-[#FF6B6B]'
                : 'bg-[#0a2a3a] border-[#00AAFF]'
            }`}>
              <div className={`mb-1 font-bold ${
                state.txStatus === 'confirmed'
                  ? 'text-[#00FF00]'
                  : state.txStatus === 'failed'
                  ? 'text-[#FF6B6B]'
                  : 'text-[#00AAFF]'
              }`}>
                {state.txStatus === 'pending' && '⏳ PENDING...'}
                {state.txStatus === 'confirmed' && '✓ CONFIRMED'}
                {state.txStatus === 'failed' && '✗ FAILED'}
              </div>
              <div className="text-[#666] break-all font-mono text-[8px]">{state.txHash}</div>
            </div>
          )}

          {/* Error Display */}
          {state.error && (
            <div className="bg-[#3a0a0a] border border-[#FF6B6B] p-3 rounded text-[9px] font-mono">
              <div className="text-[#FF6B6B] font-bold mb-1">ERROR</div>
              <div className="text-[#FF9999] break-words">{state.error}</div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={state.isSubmitting || !isConnected}
            className={`w-full py-3 px-4 text-xs font-mono font-bold border transition-all uppercase ${
              state.isSubmitting || !isConnected
                ? 'border-[#666] bg-[#666]/10 text-[#666] cursor-not-allowed'
                : 'border-[#FFB100] bg-[#FFB100]/10 text-[#FFB100] hover:bg-[#FFB100]/20'
            }`}
          >
            {!isConnected
              ? 'CONNECT_WALLET_FIRST'
              : state.isSubmitting
              ? 'EXECUTING...'
              : 'EXECUTE_RATE_UPDATE'}
          </button>
        </form>
      </div>

      {/* Footer Info */}
      <div className="border-t border-[#333333] bg-[#111111] p-4 text-[10px] text-[#666] space-y-1">
        <div>• Real transaction to {state.selectedPool === 'A' ? 'Pool A' : 'Pool B'}</div>
        <div>• Requires Sepolia ETH for gas</div>
        <div>• Callback execution visible in Terminal Log</div>
      </div>
    </div>
  );
};

export default MarketManipulator;
