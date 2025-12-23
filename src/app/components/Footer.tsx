import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#333333] bg-black py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#00FF00] rounded-full animate-ping"></div>
                <span className="text-[#00FF00] text-xs font-mono tracking-wider">SYSTEM_READY: All nodes operational.</span>
            </div>
            
            <div className="text-gray-600 text-[10px] font-mono uppercase text-center md:text-right">
                <p>(C) 2025 ALBATROZ_SENTINEL_RESEARCH_LAB</p>
                <p className="mt-1">Term_ID: #8821 // Session: 00:42:12</p>
            </div>
        </div>
    </footer>
  );
};

export default Footer;
