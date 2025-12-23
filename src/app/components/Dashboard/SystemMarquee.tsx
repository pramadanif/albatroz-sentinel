import React from 'react';

const SystemMarquee: React.FC = () => {
  return (
    <div className="w-full h-12 bg-[#050505] border-b border-[#333333] flex items-center overflow-hidden relative z-40">
      <div className="absolute left-0 h-full bg-[#050505] z-10 px-4 flex items-center border-r border-[#333333]">
        <span className="text-[#00FF00] font-bold text-xs flex items-center gap-2">
          ⚡ DASHBOARD
        </span>
      </div>
      
      <div className="whitespace-nowrap animate-marquee flex items-center gap-8 text-xs text-[#00FF00] font-medium tracking-wider ml-24">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-[#00FF00] rounded-full animate-pulse"></span>
          [SYS: OK]
        </span>
        <span className="text-[#00FFFF]">[SENTINEL: ACTIVE]</span>
        <span className="text-[#FFB100]">[ETH_SEPOLIA: 18 GWEI]</span>
        <span className="text-[#00FF00]">[mUSDC_POOL_A: 4.50% ↑]</span>
        <span className="text-[#00FFFF]">[mUSDC_POOL_B: 7.25% ↑]</span>
        <span className="text-[#FFB100]">[NETWORK: LASNA_TESTNET]</span>
        {/* Repeat for continuous scroll */}
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-[#00FF00] rounded-full animate-pulse"></span>
          [SYS: OK]
        </span>
        <span className="text-[#00FFFF]">[SENTINEL: ACTIVE]</span>
        <span className="text-[#FFB100]">[ETH_SEPOLIA: 18 GWEI]</span>
        <span className="text-[#00FF00]">[mUSDC_POOL_A: 4.50% ↑]</span>
        <span className="text-[#00FFFF]">[mUSDC_POOL_B: 7.25% ↑]</span>
        <span className="text-[#FFB100]">[NETWORK: LASNA_TESTNET]</span>
      </div>
    </div>
  );
};

export default SystemMarquee;
