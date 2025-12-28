'use client';

import React, { useState, useEffect } from 'react';
import { useContractData, useContractEvents } from '../../hooks/useContractData';

interface LogEntry {
  id: number;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'decision';
  txHash?: string;
}

const TerminalLog: React.FC = () => {
  const { poolA, poolB } = useContractData();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [strategy, setStrategy] = useState<'conservative' | 'aggressive'>('conservative');
  const [mounted, setMounted] = useState(false);
  const [autoScroll, setAutoScroll] = useState(false);
  const logsEndRef = React.useRef<HTMLDivElement>(null);

  // Initialize logs only on client side to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    setLogs([
      { id: 1, timestamp: new Date().toLocaleTimeString(), message: 'SYSTEM_INITIALIZED', type: 'success' },
      { id: 2, timestamp: new Date().toLocaleTimeString(), message: 'LISTENING_TO_POOL_EVENTS...', type: 'info' },
      { id: 3, timestamp: new Date().toLocaleTimeString(), message: 'SENTINEL_STATUS: ACTIVE (0xdde...f5d)', type: 'success' },
      { id: 4, timestamp: new Date().toLocaleTimeString(), message: 'VAULT_PROXY: CONNECTED (0x894...c97)', type: 'success' },
    ]);
  }, []);

  // Auto-scroll to latest log
  useEffect(() => {
    if (autoScroll) {
      logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  // Listen for contract events
  useContractEvents((type, data) => {
    if (!mounted) return;
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    let message = '';
    let logType: LogEntry['type'] = 'info';
    let txHash: string | undefined = undefined;

    if (type === 'RATE_UPDATE') {
        message = `RATE_UPDATE: POOL_${data.pool} | RATE=${data.rate} bps | UTIL=${data.util} bps`;
        logType = 'success';
    } else if (type === 'STRATEGY_EXECUTION') {
        message = `STRATEGY_EXECUTED: ${data.reason} | MOVED ${Number(data.amount).toFixed(2)} USDC`;
        logType = 'decision';
        txHash = data.txHash;
    } else if (type === 'DEPOSIT') {
        message = `DEPOSIT: ${Number(data.assets).toFixed(2)} USDC | FROM: ${data.sender.slice(0,6)}...`;
        logType = 'success';
        txHash = data.txHash;
    } else if (type === 'WITHDRAW') {
        message = `WITHDRAW: ${Number(data.assets).toFixed(2)} USDC | TO: ${data.receiver.slice(0,6)}...`;
        logType = 'warning';
        txHash = data.txHash;
    } else if (type === 'REACTIVE_CALLBACK') {
        message = `REACTIVE_NET: CALLBACK SENT | TARGET: ${data.target.slice(0,6)}...`;
        logType = 'decision';
        txHash = data.txHash;
    }

    if (message) {
        setLogs(prev => [
          ...prev.slice(-9),
          { 
            id: Date.now() + Math.random(), 
            timestamp: timeString, 
            message, 
            type: logType,
            txHash
          }
        ]);
    }
  });

  // Removed simulation logic to ensure all data is real
  useEffect(() => {
    // This effect is intentionally empty as we only listen to real events now
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
          <div className="text-[10px] text-[#666] mt-1">Reactive Event Stream</div>
        </div>
        <div className="flex items-center gap-4">
            <button 
                onClick={() => setAutoScroll(!autoScroll)}
                className={`text-[10px] font-mono px-2 py-1 border transition-colors ${autoScroll ? 'border-[#00FF00] text-[#00FF00] bg-[#00FF00]/10' : 'border-[#333] text-[#666] hover:border-[#666]'}`}
            >
                {autoScroll ? '[SCROLL: ON]' : '[SCROLL: OFF]'}
            </button>
            <div className="text-xs text-[#00FF00] animate-pulse font-mono">
              {poolA && poolB ? '● LIVE' : '○ SYNCING'}
            </div>
        </div>
      </div>

      {/* Pool Status */}
      {poolA && poolB && (
        <div className="border-b border-[#333333] bg-[#050505]/50 px-4 py-3 text-[10px] font-mono grid grid-cols-2 gap-4">
          <div>
            <span className="text-[#666]">POOL_A:</span>
            <span className="text-[#00FFFF] ml-2">{poolA.supplyRate} bps</span>
            <span className="text-[#999] ml-2">util={poolA.utilizationRate} bps</span>
          </div>
          <div>
            <span className="text-[#666]">POOL_B:</span>
            <span className="text-[#FFB100] ml-2">{poolB.supplyRate} bps</span>
            <span className="text-[#999] ml-2">util={poolB.utilizationRate} bps</span>
          </div>
        </div>
      )}

      {/* Terminal Logs */}
      <div 
        className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1 bg-[#050505]/50 scroll-smooth"
      >
        {logs.map((log, idx) => (
          <div 
            key={log.id} 
            className="flex gap-3 hover:bg-[#111111] p-2 transition-all duration-300 animate-fadeIn"
            style={{
              animation: `fadeIn 0.3s ease-in ${idx * 0.05}s both`
            }}
          >
            <span className="text-[#666] flex-shrink-0">[{log.timestamp}]</span>
            <span className={`${getLogColor(log.type)} flex-1 break-words font-mono`}>
              {log.type === 'decision' ? '→ ' : '&gt; '}
              {log.message}
              {log.txHash && (
                <a 
                  href={log.message.includes('REACTIVE_NET') ? `https://lasna.rnk.dev/tx/${log.txHash}` : `https://sepolia.etherscan.io/tx/${log.txHash}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 text-[#00FFFF] underline hover:text-white text-[10px]"
                >
                  [VIEW_TX]
                </a>
              )}
            </span>
          </div>
        ))}
        <div ref={logsEndRef} />
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
