'use client';

import React, { useState } from 'react';

interface JsonTooltipProps {
  data: Record<string, any>;
  children: React.ReactNode;
  className?: string;
}

const JsonTooltip: React.FC<JsonTooltipProps> = ({ data, children, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
      {isHovered && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-64 bg-black border border-[#333333] shadow-[0_0_15px_rgba(0,255,0,0.2)] p-3 text-xs pointer-events-none">
            <div className="text-[#00FFFF] mb-1 font-bold">RAW_DATA_PREVIEW</div>
            <pre className="text-[#00FF00] whitespace-pre-wrap leading-tight">
              {JSON.stringify(data, null, 2)}
            </pre>
            <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-black border-r border-b border-[#333333] rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default JsonTooltip;
