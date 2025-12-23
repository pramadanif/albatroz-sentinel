'use client';

import React, { useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Activity, Network, ArrowRight } from 'lucide-react';
import JsonTooltip from '../ui/JsonTooltip';

// Types
interface Log {
  id: number;
  timestamp: string;
  source: string;
  event: string;
  value: string;
  type: 'info' | 'success' | 'warning';
}

interface Step {
  id: string;
  label: string;
  status: 'idle' | 'active' | 'completed';
}

const Terminal: React.FC = () => {
  // State for simulated live data
  const [logs, setLogs] = useState<Log[]>([
    { id: 1, timestamp: '14:02:10', source: 'SEPOLIA', event: 'Event.RateUpdated [Pool_A]', value: '4.85%', type: 'info' },
    { id: 2, timestamp: '14:02:12', source: 'SEPOLIA', event: 'Event.RateUpdated [Pool_B]', value: '6.20%', type: 'info' },
  ]);
  const [currentStep, setCurrentStep] = useState(0);
  const [metrics, setMetrics] = useState([
    { subject: 'Yield', A: 120, fullMark: 150 },
    { subject: 'Util', A: 98, fullMark: 150 },
    { subject: 'Risk', A: 40, fullMark: 150 },
    { subject: 'Gas', A: 65, fullMark: 150 },
    { subject: 'Vol', A: 85, fullMark: 150 },
    { subject: 'Liq', A: 110, fullMark: 150 },
  ]);

  const steps: Step[] = [
    { id: '1', label: 'Reactive_Network Detect', status: 'idle' },
    { id: '2', label: 'Compute Profit Score', status: 'idle' },
    { id: '3', label: 'Sending_Callback', status: 'idle' },
    { id: '4', label: 'Sepolia_Proxy Verify', status: 'idle' },
    { id: '5', label: 'Vault.rebalance()', status: 'idle' },
  ];

  // Simulation Effect
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Add Log
      const now = new Date();
      const timeString = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
      const newLog: Log = {
        id: Date.now(),
        timestamp: timeString,
        source: 'REACTIVE',
        event: 'Logic.ProfitCalc',
        value: `Delta +${(Math.random() * 2).toFixed(2)}%`,
        type: 'success'
      };
      
      setLogs(prev => [newLog, ...prev].slice(0, 8));

      // 2. Randomize Metrics slightly
      setMetrics(prev => prev.map(m => ({ ...m, A: Math.min(140, Math.max(20, m.A + (Math.random() * 20 - 10))) })));

      // 3. Cycle Progress
      setCurrentStep(prev => (prev + 1) % 5);

    }, 2000);

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
          <div className="text-xs text-[#333333]">ID: 0xAF3...9921</div>
        </div>

        {/* 3-Pane Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[600px] lg:h-[500px]">
          
          {/* PANE 1: SENSORS (Logs) */}
          <div className="lg:col-span-4 border border-[#333333] bg-[#000000] flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#00FFFF] opacity-50"></div>
            <div className="p-3 border-b border-[#333333] bg-[#111111] flex justify-between items-center">
              <span className="text-[#00FFFF] text-xs font-bold tracking-wider">INPUT_SENSORS</span>
              <span className="text-xs text-[#00FFFF] animate-pulse">● LIVE</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
              {logs.map((log) => (
                <JsonTooltip key={log.id} data={log} className="block w-full">
                  <div className="flex gap-3 border-b border-[#333333]/50 pb-2 hover:bg-[#111111] cursor-crosshair transition-colors">
                    <span className="text-gray-500">[{log.timestamp}]</span>
                    <span className={`flex-1 ${
                      log.type === 'success' ? 'text-[#00FF00]' : 
                      log.type === 'warning' ? 'text-[#FFB100]' : 'text-[#00FFFF]'
                    }`}>
                      {log.source}: {log.event}
                    </span>
                    <span className="text-white font-bold">{log.value}</span>
                  </div>
                </JsonTooltip>
              ))}
            </div>
          </div>

          {/* PANE 2: DECISION MATRIX (Chart) */}
          <div className="lg:col-span-5 border border-[#333333] bg-[#000000] flex flex-col relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#00FF00] opacity-50"></div>
            <div className="p-3 border-b border-[#333333] bg-[#111111] flex justify-between items-center">
              <span className="text-[#00FF00] text-xs font-bold tracking-wider">DECISION_MATRIX</span>
              <span className="text-xs text-[#00FF00]">ALGO_v4.2</span>
            </div>
            
            <div className="flex-1 flex flex-col">
               <div className="h-[250px] w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                   <RadarChart cx="50%" cy="50%" outerRadius="70%" data={metrics}>
                     <PolarGrid stroke="#333333" />
                     <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 10 }} />
                     <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                     <Radar
                       name="Sentinel"
                       dataKey="A"
                       stroke="#00FF00"
                       strokeWidth={2}
                       fill="#00FF00"
                       fillOpacity={0.2}
                     />
                   </RadarChart>
                 </ResponsiveContainer>
                 {/* Overlay Stats */}
                 <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
                    <div className="text-[10px] text-gray-500">SCORE_CALC</div>
                    <div className="text-xs text-[#00FF00] font-bold">Score = (Yield * 0.8) - (Util * 0.2)</div>
                 </div>
               </div>

               {/* Status Footer inside Pane */}
               <div className="p-4 border-t border-[#333333] mt-auto">
                 <div className="flex items-center justify-between mb-2">
                   <span className="text-xs text-gray-400">DECISION STATUS</span>
                   <span className="text-sm font-bold text-[#00FF00] bg-[#00FF00]/10 px-2 py-1 border border-[#00FF00]">
                     [PROFITABLE]
                   </span>
                 </div>
                 <div className="flex items-center justify-between">
                   <span className="text-xs text-gray-400">ACTION</span>
                   <span className="text-xs font-bold text-[#00FFFF] animate-pulse">INITIATE_REBALANCE</span>
                 </div>
               </div>
            </div>
          </div>

          {/* PANE 3: EXECUTION (Steps) */}
          <div className="lg:col-span-3 border border-[#333333] bg-[#000000] flex flex-col relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FFB100] opacity-50"></div>
            <div className="p-3 border-b border-[#333333] bg-[#111111] flex justify-between items-center">
              <span className="text-[#FFB100] text-xs font-bold tracking-wider">EXECUTION_FLOW</span>
              <Network size={14} className="text-[#FFB100]" />
            </div>
            
            <div className="flex-1 p-6 flex flex-col justify-center relative">
               {/* Vertical Line */}
               <div className="absolute left-8 top-10 bottom-10 w-px bg-[#333333]"></div>
               
               <div className="space-y-6">
                 {steps.map((step, idx) => {
                   const isActive = idx === currentStep;
                   const isPast = idx < currentStep;
                   
                   return (
                     <div key={step.id} className="relative pl-10 flex items-center group">
                       <div className={`absolute left-[-5px] w-3 h-3 rounded-none border border-[#333333] bg-black z-10 
                         ${isActive ? 'bg-[#FFB100] border-[#FFB100] shadow-[0_0_10px_#FFB100]' : ''}
                         ${isPast ? 'bg-[#00FF00] border-[#00FF00]' : ''}
                       `}></div>
                       
                       <div className={`text-xs font-mono transition-colors ${
                         isActive ? 'text-[#FFB100] font-bold' : 
                         isPast ? 'text-[#00FF00] opacity-50' : 'text-gray-600'
                       }`}>
                         {step.label}
                       </div>
                       
                       {isActive && (
                         <ArrowRight size={12} className="ml-auto text-[#FFB100] animate-bounce-x" />
                       )}
                     </div>
                   );
                 })}
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Terminal;
