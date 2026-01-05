'use client';

import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';
import JsonTooltip from '../ui/JsonTooltip';
import { useContractEvents } from '../../hooks/useContractData';
import MarketManipulator from '../Dashboard/MarketManipulator';

// Types
interface Log {
  id: number;
  timestamp: string;
  source: string;
  event: string;
  value: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'link';
  url?: string;
}

const Terminal: React.FC = () => {
  // Logs State
  const [logs, setLogs] = useState<Log[]>([]);
  const [metrics, setMetrics] = useState([
    { subject: 'Yield', A: 145, fullMark: 150 },
    { subject: 'Util', A: 120, fullMark: 150 }, // B for Benchmark
    { subject: 'Risk', A: 30, fullMark: 150 },
    { subject: 'Gas', A: 80, fullMark: 150 },
    { subject: 'Vol', A: 60, fullMark: 150 },
    { subject: 'Liq', A: 130, fullMark: 150 },
  ]);

  // Hook into Real Contract Events
  useContractEvents((type, data) => {
    const now = new Date();
    const timeString = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
    let newLog: Log | null = null;
    const logId = Date.now() + Math.random();

    switch (type) {
      case 'RATE_UPDATE':
        newLog = {
          id: logId,
          timestamp: timeString,
          source: data.pool === 'A' ? 'POOL_A' : 'POOL_B',
          event: 'RateUpdated',
          value: `${data.rate}bps / ${data.util}bps`,
          type: 'warning',
          url: `https://sepolia.etherscan.io/tx/${data.txHash}`
        };
        // Update Metrics Visualization
        setMetrics(prev => prev.map(m =>
          m.subject === 'Yield' ? { ...m, A: Math.max(10, Math.min(150, data.rate / 10)) } :
            m.subject === 'Risk' ? { ...m, A: Math.max(10, Math.min(150, data.util / 50)) } : m
        ));
        break;

      case 'REACTIVE_CALLBACK':
        newLog = {
          id: logId,
          timestamp: timeString,
          source: 'SENTINEL',
          event: 'Callback',
          value: 'Detected Opportunity',
          type: 'success',
          url: `https://lasna.reactscan.net/tx/${data.txHash}`
        };
        break;

      case 'STRATEGY_EXECUTION':
        newLog = {
          id: logId,
          timestamp: timeString,
          source: 'VAULT',
          event: 'StrategyExecuted',
          value: `Moved ${parseFloat(data.amount).toFixed(2)} USDC`,
          type: 'success',
          url: `https://sepolia.etherscan.io/tx/${data.txHash}`
        };
        break;

      default:
        break;
    }

    if (newLog) {
      // @ts-ignore
      newLog.type = newLog.type === 'warning' ? (newLog.url ? 'link' : 'warning') : newLog.type;
      // @ts-ignore
      newLog.type = newLog.type === 'success' ? (newLog.url ? 'link' : 'success') : newLog.type;

      if (newLog.url) newLog.type = 'link';

      setLogs(prev => [newLog!, ...prev].slice(0, 50));
    }
  });


  // Keep alive heartbeat (System Status)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeString = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
      const newLog: Log = {
        id: Date.now(),
        timestamp: timeString,
        source: 'SYSTEM',
        event: 'Heartbeat',
        value: 'Monitoring Rates (0xbC92...)',
        type: 'info'
      };
      setLogs(prev => [newLog, ...prev].slice(0, 50));
    }, 15000); // Slower heartbeat
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="w-full py-12 px-6 bg-[#050505]">
      <div className="max-w-7xl mx-auto">

        {/* Section Header */}
        <div className="flex items-center justify-between mb-8 border-b border-[#333333] pb-4">
          <h3 className="text-xl text-[#00FF00] flex items-center gap-2">
            <Activity size={20} />
            SENTINEL_TERMINAL // LIVE_MONITOR
          </h3>
          <div className="text-xs text-[#333333]">ID: 0xbC92...37</div>
        </div>

        {/* 3-Pane Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px] lg:h-[500px]">

          {/* PANE 1: SENSORS (Live Logs) */}
          <div className="lg:col-span-5 border border-[#333333] bg-[#000000] flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#00FFFF] opacity-50"></div>
            <div className="p-3 border-b border-[#333333] bg-[#111111] flex justify-between items-center">
              <span className="text-[#00FFFF] text-xs font-bold tracking-wider">LIVE_EVENT_STREAM</span>
              <span className="text-xs text-[#00FFFF] animate-pulse">● CONNECTED</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
              {logs.length === 0 && (
                <div className="text-gray-600 italic text-center mt-10">Waiting for blockchain events...</div>
              )}
              {logs.map((log) => (
                <JsonTooltip key={log.id} data={log} className="block w-full">
                  <div className={`flex gap-3 border-b border-[#333333]/50 pb-2 hover:bg-[#111111] transition-colors ${log.type === 'link' ? 'cursor-pointer' : 'cursor-crosshair'}`}>
                    <span className="text-gray-500">[{log.timestamp}]</span>

                    <span className={`flex-1 ${log.type === 'success' ? 'text-[#00FF00]' :
                      log.type === 'warning' ? 'text-[#FFB100]' :
                        log.type === 'error' ? 'text-red-500' :
                          log.type === 'link' ? 'text-blue-400 underline decoration-blue-400/30' : 'text-[#00FFFF]'
                      }`}>
                      {log.type === 'link' ? (
                        <a href={log.url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-300">
                          {log.source}: {log.value} ↗
                        </a>
                      ) : (
                        `${log.source}: ${log.event}`
                      )}
                    </span>

                    {log.type !== 'link' && <span className="text-white font-bold">{log.value}</span>}
                  </div>
                </JsonTooltip>
              ))}
            </div>
          </div>

          {/* PANE 2: METRICS (Radar Chart) */}
          <div className="lg:col-span-3 border border-[#333333] bg-[#000000] flex flex-col relative text-[10px]">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#00FF00] opacity-50"></div>
            <div className="p-3 border-b border-[#333333] bg-[#111111] flex justify-between items-center">
              <span className="text-[#00FF00] text-xs font-bold tracking-wider">DECISION_MATRIX</span>
            </div>
            <div className="flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={metrics}>
                  <PolarGrid stroke="#333333" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                  <Radar name="Sentinel" dataKey="A" stroke="#00FF00" strokeWidth={2} fill="#00FF00" fillOpacity={0.2} />
                </RadarChart>
              </ResponsiveContainer>
              <div className="p-2 text-center text-gray-500">
                Real-time yield/risk visualization
              </div>
            </div>
          </div>

          {/* PANE 3: CONTROL (Market Manipulator) */}
          <div className="lg:col-span-4 border border-[#333333] bg-[#000000] flex flex-col relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FFB100] opacity-50"></div>
            {/* Embedded Market Manipulator */}
            <MarketManipulator />
          </div>

        </div>
      </div>
    </section>
  );
};

export default Terminal;
