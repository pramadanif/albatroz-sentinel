'use client';

import React, { useState, useEffect } from 'react';

interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'decision';
}

const TerminalLog: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 1, timestamp: '14:02:01', message: 'SCANNING POOLS...', type: 'info' },
    { id: 2, timestamp: '14:02:05', message: 'DETECTED: POOL_B YIELD SPIKE (+2.75%)', type: 'success' },
    { id: 3, timestamp: '14:02:06', message: 'ANALYSIS: PROFIT > GAS_COST (0.85% GAP)', type: 'success' },
    { id: 4, timestamp: '14:02:10', message: 'SENTINEL DECISION: INITIATE_REBALANCE', type: 'decision' },
    { id: 5, timestamp: '14:02:15', message: 'CALLBACK_SENT TO LASNA...', type: 'info' },
    { id: 6, timestamp: '14:02:20', message: 'REBALANCE_COMPLETE: 1000 USDC MOVED', type: 'success' },
  ]);

  const [strategy, setStrategy] = useState<'conservative' | 'aggressive'>('conservative');

  // Simulate new logs
  useEffect(() => {
    const interval = setInterval(() => {
      const messages = [
        'SCANNING POOLS...',
        'YIELD UPDATE: POOL_A +0.05%',
        'YIELD UPDATE: POOL_B +0.08%',
        'PROFIT CALCULATION IN PROGRESS...',
        'GAS COST ESTIMATE: 12 GWEI',
        'EXECUTING REBALANCE LOGIC...',
      ];
      
      const types: Array<LogEntry['type']> = ['info', 'success', 'warning', 'info'];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      const randomType = types[Math.floor(Math.random() * types.length)];
      
      const now = new Date();
      const timeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      setLogs(prev => [
        ...prev.slice(-9),
        { id: Date.now(), timestamp: timeString, message: randomMsg, type: randomType }
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getLogColor = (type: LogEntry['type']) => {
    switch(type) {
      case 'success': return 'text-[#00FF00]';
      case 'warning': return 'text-[#FFB100]';
      case 'decision': return 'text-[#00FFFF] font-bold';
      default: return 'text-[#999]';
    }
  };

  return (
    <div className="h-full border border-[#333333] bg-[#000000] flex flex-col relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-[#00FFFF] opacity-50"></div>
      
      {/* Header */}
      <div className="p-4 border-b border-[#333333] bg-[#111111] flex justify-between items-center">
        <div>
          <div className="text-[#00FFFF] text-xs font-bold tracking-wider">INTELLIGENCE_TERMINAL</div>
          <div className="text-[10px] text-[#666] mt-1">Decision Log</div>
        </div>
        <div className="text-xs text-[#00FFFF] animate-pulse">● LIVE</div>
      </div>

      {/* Terminal Logs */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-2 bg-[#050505]/50">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 hover:bg-[#111111] p-2 transition-colors">
            <span className="text-[#666] flex-shrink-0">[{log.timestamp}]</span>
            <span className={`${getLogColor(log.type)} flex-1`}>
              {log.type === 'decision' ? '→ ' : '> '}
              {log.message}
            </span>
          </div>
        ))}
      </div>

      {/* Strategy Toggle */}
      <div className="border-t border-[#333333] bg-[#111111] p-4">
        <div className="text-[#999] text-xs mb-3">STRATEGY_MODE</div>
        <div className="flex gap-3">
          <button
            onClick={() => setStrategy('conservative')}
            className={`flex-1 py-2 px-3 text-xs font-mono uppercase font-bold border transition-all ${
              strategy === 'conservative'
                ? 'border-[#00FF00] bg-[#00FF00]/10 text-[#00FF00]'
                : 'border-[#333333] text-[#666] hover:border-[#00FF00] hover:text-[#00FF00]'
            }`}
          >
            [CONSERVATIVE]
          </button>
          <button
            onClick={() => setStrategy('aggressive')}
            className={`flex-1 py-2 px-3 text-xs font-mono uppercase font-bold border transition-all ${
              strategy === 'aggressive'
                ? 'border-[#FFB100] bg-[#FFB100]/10 text-[#FFB100]'
                : 'border-[#333333] text-[#666] hover:border-[#FFB100] hover:text-[#FFB100]'
            }`}
          >
            [AGGRESSIVE]
          </button>
        </div>
        <div className="text-[10px] text-[#666] mt-2">
          {strategy === 'conservative' 
            ? 'Stable yields, low frequency rebalances'
            : 'High frequency, alpha-focused strategies'}
        </div>
      </div>
    </div>
  );
};

export default TerminalLog;
