'use client';

import React from 'react';
import { Wifi } from 'lucide-react';
import ConnectWallet from './ui/ConnectWallet';
import { useContractData } from '../hooks/useContractData';

const Ticker: React.FC = () => {
  const { poolA, poolB, sentinelConnected } = useContractData();

  // Format rate: 500 bps -> 5.00%
  const formatRate = (bps: number | undefined) => bps ? (bps / 100).toFixed(2) : '0.00';

  return (
    <div className="w-full h-10 bg-[#050505] border-b border-[#333333] flex items-center overflow-hidden relative z-40">
      <div className="absolute left-0 h-full bg-[#050505] z-10 px-4 flex items-center border-r border-[#333333]">
        <span className="text-[#00FF00] font-bold text-xs flex items-center gap-2">
            <Wifi size={14} className="animate-pulse" />
            LIVE_FEED
        </span>
      </div>
      <div className="absolute right-0 h-full bg-[#050505] z-10 px-4 flex items-center border-l border-[#333333]">
        <ConnectWallet />
      </div>
      
      <div className="whitespace-nowrap animate-marquee flex items-center gap-12 text-sm text-[#00FF00] font-medium tracking-wider">
        <span>[POOL-A: {formatRate(poolA?.supplyRate)}% ↑] <span className="text-[10px] text-gray-500 ml-1">Source: Reactive Indexer 0x...</span></span>
        <span className="text-[#00FFFF]">[POOL-B: {formatRate(poolB?.supplyRate)}% ↑] <span className="text-[10px] text-gray-500 ml-1">Source: Reactive Indexer 0x...</span></span>
        <span className="text-[#FFB100]">[GAS-PRICE: 18 GWEI]</span>
        <span className="text-[#00FF00]">[SENTINEL-STATUS: {sentinelConnected ? 'ACTIVE' : 'SYNCING'}]</span>
        <span className="text-[#00FFFF]">[SEPOLIA_BLOCK: 4,291,002]</span>
        <span className="text-[#00FF00]">[REBALANCE_EFFICIENCY: 99.8%]</span>
        <span>[POOL-A: {formatRate(poolA?.supplyRate)}% ↑] <span className="text-[10px] text-gray-500 ml-1">Source: Reactive Indexer 0x...</span></span>
        <span className="text-[#00FFFF]">[POOL-B: {formatRate(poolB?.supplyRate)}% ↑] <span className="text-[10px] text-gray-500 ml-1">Source: Reactive Indexer 0x...</span></span>
        <span className="text-[#FFB100]">[GAS-PRICE: 19 GWEI]</span>
        <span className="text-[#00FF00]">[SENTINEL-STATUS: {sentinelConnected ? 'ACTIVE' : 'SYNCING'}]</span>
      </div>
    </div>
  );
};

export default Ticker;
