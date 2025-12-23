import React from 'react';
import { Wifi } from 'lucide-react';

const Ticker: React.FC = () => {
  return (
    <div className="w-full h-10 bg-[#050505] border-b border-[#333333] flex items-center overflow-hidden relative z-40">
      <div className="absolute left-0 h-full bg-[#050505] z-10 px-4 flex items-center border-r border-[#333333]">
        <span className="text-[#00FF00] font-bold text-xs flex items-center gap-2">
            <Wifi size={14} className="animate-pulse" />
            LIVE_FEED
        </span>
      </div>
      
      <div className="whitespace-nowrap animate-marquee flex items-center gap-12 text-sm text-[#00FF00] font-medium tracking-wider">
        <span>[POOL-A: 4.52% ↑]</span>
        <span className="text-[#00FFFF]">[POOL-B: 7.10% ↑]</span>
        <span className="text-[#FFB100]">[GAS-PRICE: 18 GWEI]</span>
        <span className="text-[#00FF00]">[SENTINEL-STATUS: ACTIVE]</span>
        <span className="text-[#00FFFF]">[SEPOLIA_BLOCK: 4,291,002]</span>
        <span className="text-[#00FF00]">[REBALANCE_EFFICIENCY: 99.8%]</span>
        <span>[POOL-A: 4.52% ↑]</span>
        <span className="text-[#00FFFF]">[POOL-B: 7.10% ↑]</span>
        <span className="text-[#FFB100]">[GAS-PRICE: 19 GWEI]</span>
        <span className="text-[#00FF00]">[SENTINEL-STATUS: ACTIVE]</span>
      </div>
    </div>
  );
};

export default Ticker;
