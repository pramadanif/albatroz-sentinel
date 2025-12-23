'use client';

import React from 'react';

const VaultStats: React.FC = () => {
  return (
    <div className="h-full border border-[#333333] bg-[#000000] flex flex-col relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-[#00FF00] opacity-50"></div>
      
      {/* Header */}
      <div className="p-4 border-b border-[#333333] bg-[#111111]">
        <div className="text-[#00FF00] text-xs font-bold tracking-wider">VAULT_PORTFOLIO</div>
        <div className="text-[10px] text-[#666] mt-1">ERC-4626 Compliant</div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        {/* Balance Section */}
        <div>
          <div className="mb-6">
            <div className="text-[#999] text-xs mb-2">VAULT_BALANCE</div>
            <div className="text-4xl font-bold text-[#00FF00] font-mono">
              9,450.00
              <span className="text-lg ml-2 text-[#00FFFF]">alYLD</span>
            </div>
          </div>

          <div className="mb-8">
            <div className="text-[#999] text-xs mb-2">UNDERLYING_VALUE</div>
            <div className="text-2xl font-bold text-[#00FFFF] font-mono">
              $9,560.23
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
              <span className="text-[#00FF00] font-bold">6.42%</span>
            </div>
            <div className="h-px bg-[#333333]"></div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#999]">Total Yield</span>
              <span className="text-[#00FFFF] font-bold">+$124.50</span>
            </div>
            <div className="h-px bg-[#333333]"></div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#999]">Rebalances</span>
              <span className="text-[#FFB100] font-bold">47</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button className="w-full group relative bg-[#00FF00]/10 border border-[#00FF00] text-[#00FF00] px-4 py-3 font-bold tracking-widest uppercase text-xs transition-all hover:bg-[#00FF00] hover:text-black hover:shadow-[0_0_20px_#00FF00]">
            [ DEPOSIT ]
          </button>
          
          <button className="w-full group relative bg-transparent border border-[#333333] text-gray-400 px-4 py-3 font-bold tracking-widest uppercase text-xs transition-all hover:text-[#00FFFF] hover:border-[#00FFFF] hover:shadow-[0_0_10px_#00FFFF]">
            [ WITHDRAW ]
          </button>
        </div>
      </div>
    </div>
  );
};

export default VaultStats;
