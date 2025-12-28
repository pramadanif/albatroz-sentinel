'use client';

import React from 'react';
import { useWallet } from '../../hooks/useWallet';

const ConnectWallet: React.FC = () => {
  const { address, isConnected, balance, chainId, connect, disconnect, error, isConnecting } = useWallet();

  const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '';
  const wrongChain = isConnected && chainId !== 11155111;

  return (
    <div className="flex items-center gap-3">
      {error && (
        <span className="text-[10px] text-[#FF6B6B] font-mono hidden sm:inline">{error}</span>
      )}

      {!isConnected ? (
        <button
          onClick={connect}
          disabled={isConnecting}
          className="px-3 py-1 text-[11px] font-mono font-bold border border-[#00FFFF] bg-[#00FFFF]/10 text-[#00FFFF] hover:bg-[#00FFFF]/20 transition-all disabled:opacity-50"
          aria-label="Connect Wallet"
        >
          {isConnecting ? 'CONNECTING...' : 'CONNECT WALLET'}
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-mono ${wrongChain ? 'text-[#FFB100]' : 'text-[#00FF00]'}`}>
            {shortAddr} {balance ? `• ${Number(balance).toFixed(4)} ETH` : ''}
          </span>
          <button
            onClick={disconnect}
            className="px-2 py-1 text-[10px] font-mono border border-[#333333] text-[#999] hover:border-[#666] hover:text-[#ccc]"
            aria-label="Disconnect Wallet"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default ConnectWallet;
