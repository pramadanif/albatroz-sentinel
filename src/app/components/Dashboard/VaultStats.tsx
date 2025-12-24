'use client';

import React, { useState } from 'react';
import { ethers } from 'ethers';
import { useContractData } from '../../hooks/useContractData';
import { useWallet } from '../../hooks/useWallet';

const VAULT_ADDRESS = '0xB7c78ceCB25a1c40b3fa3382bAf3F34c9b5bdD66';
const USDC_ADDRESS = '0x1C512b73599bB25aee2feE72f335Ccb9281f33D2';

const ERC20_ABI = [
  'function approve(address spender, uint256 amount) public returns (bool)',
  'function allowance(address owner, address spender) public view returns (uint256)',
  'function decimals() public view returns (uint8)'
];

const VAULT_ABI = [
  'function deposit(uint256 assets, address receiver) public returns (uint256)',
  'function withdraw(uint256 assets, address receiver, address owner) public returns (uint256)',
  'function redeem(uint256 shares, address receiver, address owner) public returns (uint256)'
];

const VaultStats: React.FC = () => {
  const { address, signer } = useWallet();
  const { vault, loading, error, sentinelConnected } = useContractData(address);
  
  const [mode, setMode] = useState<'deposit' | 'withdraw' | null>(null);
  const [amount, setAmount] = useState('');
  const [txStatus, setTxStatus] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const totalAssets = vault?.totalAssets ?? 0;
  const userBalance = vault?.userBalance ?? 0;
  const underlyingValue = vault?.underlyingValue ?? 0;
  
  // Calculate APY based on recent performance (mock calculation for display as real APY requires historical data)
  // In a real app, this would come from the contract or a subgraph
  const apy = 6.42; 
  const totalYield = underlyingValue - userBalance; // Simple yield calc

  const handleTransaction = async () => {
    if (!address || !amount || !mode) return;
    
    setIsProcessing(true);
    setTxStatus('INITIALIZING...');

    try {
      if (!signer) throw new Error('No signer available');

      const vaultContract = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);
      const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, signer);
      
      // Parse amount (assuming 6 decimals for USDC)
      const decimals = 6; 
      const amountBigInt = ethers.parseUnits(amount, decimals);

      if (mode === 'deposit') {
        setTxStatus('CHECKING ALLOWANCE...');
        const allowance = await usdcContract.allowance(address, VAULT_ADDRESS);
        
        if (allowance < amountBigInt) {
          setTxStatus('APPROVING USDC...');
          const approveTx = await usdcContract.approve(VAULT_ADDRESS, amountBigInt);
          await approveTx.wait();
        }

        setTxStatus('DEPOSITING...');
        const tx = await vaultContract.deposit(amountBigInt, address);
        await tx.wait();
        setTxStatus('DEPOSIT SUCCESSFUL');
      } else {
        setTxStatus('WITHDRAWING...');
        // Withdraw assets (USDC)
        const tx = await vaultContract.withdraw(amountBigInt, address, address);
        await tx.wait();
        setTxStatus('WITHDRAW SUCCESSFUL');
      }
      
      setAmount('');
      setTimeout(() => {
        setMode(null);
        setTxStatus('');
      }, 2000);

    } catch (err: any) {
      console.error(err);
      setTxStatus(`ERROR: ${err.reason || err.message || 'Transaction failed'}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="h-full border border-[#333333] bg-[#000000] flex flex-col relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-[#00FF00] opacity-50"></div>
      
      {/* Header */}
      <div className="p-4 border-b border-[#333333] bg-[#111111]">
        <div className="text-[#00FF00] text-xs font-bold tracking-wider">VAULT_PORTFOLIO</div>
        <div className="text-[10px] text-[#666] mt-1">ERC-4626 Compliant {sentinelConnected && '✓ LASNA_CONNECTED'}</div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        {/* Balance Section */}
        <div>
          <div className="mb-6">
            <div className="text-[#999] text-xs mb-2">YOUR_BALANCE</div>
            <div className="text-4xl font-bold text-[#00FF00] font-mono">
              {loading ? '...' : userBalance.toFixed(2)}
              <span className="text-lg ml-2 text-[#00FFFF]">alYLD</span>
            </div>
            {loading && <div className="text-[10px] text-[#666] mt-1">Fetching from Sepolia...</div>}
          </div>

          <div className="mb-8">
            <div className="text-[#999] text-xs mb-2">UNDERLYING_VALUE</div>
            <div className="text-2xl font-bold text-[#00FFFF] font-mono">
              ${loading ? '...' : underlyingValue.toFixed(2)}
              <span className="text-sm ml-2 text-[#999]">USDC</span>
            </div>
          </div>

          {/* Compliance Badge */}
          <div className="mb-8">
            <span className="text-[10px] font-mono border border-[#00FF00] px-2 py-1 text-[#00FF00] bg-[#00FF00]/5">
              [ERC-4626_COMPLIANT]
            </span>
          </div>

          {/* Performance Metrics */}
          <div className="space-y-3 mb-8">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#999]">APY (7d avg)</span>
              <span className="text-[#00FF00] font-bold">{apy.toFixed(2)}%</span>
            </div>
            <div className="h-px bg-[#333333]"></div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#999]">Total Yield</span>
              <span className="text-[#00FFFF] font-bold">{totalYield > 0 ? '+' : ''}${totalYield.toFixed(2)}</span>
            </div>
            <div className="h-px bg-[#333333]"></div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#999]">TVL</span>
              <span className="text-[#FFB100] font-bold">${totalAssets.toFixed(2)}</span>
            </div>
          </div>

          {/* Status Alert */}
          {error && (
            <div className="mb-4 p-3 border border-[#FF0000] bg-[#FF0000]/5 text-[#FF0000] text-xs rounded">
              ⚠️ {error}
            </div>
          )}
          
          {txStatus && (
             <div className="mb-4 p-3 border border-[#00FFFF] bg-[#00FFFF]/5 text-[#00FFFF] text-xs rounded animate-pulse">
             &gt; {txStatus}
           </div>
          )}
        </div>

        {/* Action Buttons / Input Form */}
        <div className="space-y-3">
          {mode ? (
            <div className="bg-[#111] p-3 border border-[#333]">
              <div className="text-[#00FF00] text-xs mb-2 uppercase">Amount to {mode} (USDC)</div>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-black border border-[#333] text-white p-2 text-sm mb-3 focus:border-[#00FF00] outline-none font-mono"
                placeholder="0.00"
                disabled={isProcessing}
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleTransaction}
                  disabled={isProcessing || !amount}
                  className="flex-1 bg-[#00FF00] text-black font-bold text-xs py-2 hover:bg-[#00CC00] disabled:opacity-50"
                >
                  {isProcessing ? 'PROCESSING...' : 'CONFIRM'}
                </button>
                <button 
                  onClick={() => { setMode(null); setTxStatus(''); }}
                  disabled={isProcessing}
                  className="flex-1 border border-[#333] text-[#999] font-bold text-xs py-2 hover:text-white hover:border-white"
                >
                  CANCEL
                </button>
              </div>
            </div>
          ) : (
            <>
              <button
                onClick={() => setMode('deposit')}
                className="w-full group relative bg-[#00FF00]/10 border border-[#00FF00] text-[#00FF00] px-4 py-3 font-bold tracking-widest uppercase text-xs transition-all hover:bg-[#00FF00] hover:text-black hover:shadow-[0_0_20px_#00FF00] disabled:opacity-50"
                disabled={loading || !address}
              >
                [ DEPOSIT ]
              </button>
              
              <button 
                onClick={() => setMode('withdraw')}
                className="w-full group relative bg-transparent border border-[#333333] text-gray-400 px-4 py-3 font-bold tracking-widest uppercase text-xs transition-all hover:text-[#00FFFF] hover:border-[#00FFFF] hover:shadow-[0_0_10px_#00FFFF] disabled:opacity-50"
                disabled={loading || !address}
              >
                [ WITHDRAW ]
              </button>
            </>
          )}
          
          {!address && (
             <div className="text-center text-[10px] text-[#666]">
               * Connect wallet to interact
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VaultStats;
