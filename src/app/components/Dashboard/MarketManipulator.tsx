'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MarketManipulator: React.FC = () => {
  const [poolARate, setPoolARate] = useState(4.5);
  const [poolBRate, setPoolBRate] = useState(7.25);

  const yieldGap = (poolBRate - poolARate).toFixed(2);
  const isPoolBBetter = poolBRate > poolARate;

  // Generate chart data based on rates
  const chartData = Array.from({ length: 12 }, (_, i) => ({
    time: `${14 + i}:00`,
    poolA: poolARate + (Math.random() - 0.5) * 0.5,
    poolB: poolBRate + (Math.random() - 0.5) * 0.5,
  }));

  return (
    <div className="h-full border border-[#333333] bg-[#000000] flex flex-col relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-[#FFB100] opacity-50"></div>
      
      {/* Header */}
      <div className="p-4 border-b border-[#333333] bg-[#111111]">
        <div className="text-[#FFB100] text-xs font-bold tracking-wider">MARKET_MANIPULATOR</div>
        <div className="text-[10px] text-[#666] mt-1">Live Rate Simulation</div>
      </div>

      {/* Sliders Section */}
      <div className="border-b border-[#333333] p-4 space-y-6 bg-[#050505]/50">
        {/* Pool A Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[#00FFFF] text-xs font-mono">POOL_A_SUPPLY_RATE</label>
            <span className="text-[#00FFFF] font-bold text-sm">{poolARate.toFixed(2)}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="15"
            step="0.05"
            value={poolARate}
            onChange={(e) => setPoolARate(parseFloat(e.target.value))}
            className="w-full h-1 bg-[#333333] rounded appearance-none cursor-pointer accent-[#00FFFF]"
          />
          <div className="text-[10px] text-[#666] mt-1">Drag to adjust mUSDC Supply APY on Pool A</div>
        </div>

        {/* Pool B Slider */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-[#00FF00] text-xs font-mono">POOL_B_SUPPLY_RATE</label>
            <span className="text-[#00FF00] font-bold text-sm">{poolBRate.toFixed(2)}%</span>
          </div>
          <input
            type="range"
            min="1"
            max="15"
            step="0.05"
            value={poolBRate}
            onChange={(e) => setPoolBRate(parseFloat(e.target.value))}
            className="w-full h-1 bg-[#333333] rounded appearance-none cursor-pointer accent-[#00FF00]"
          />
          <div className="text-[10px] text-[#666] mt-1">Drag to adjust mUSDC Supply APY on Pool B</div>
        </div>
      </div>

      {/* Yield Gap Indicator */}
      <div className="border-b border-[#333333] p-4 bg-[#050505]/50">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[#FFB100] text-xs font-mono">YIELD_GAP</span>
          <span className={`text-sm font-bold ${isPoolBBetter ? 'text-[#00FF00]' : 'text-[#FFB100]'}`}>
            {yieldGap}%
          </span>
        </div>
        <div className="h-2 bg-[#333333] rounded overflow-hidden">
          <div
            className={`h-full ${isPoolBBetter ? 'bg-[#00FF00]' : 'bg-[#FFB100]'} transition-all`}
            style={{ width: `${Math.min((Math.abs(parseFloat(yieldGap)) / 10) * 100, 100)}%` }}
          ></div>
        </div>
        <div className="text-[10px] text-[#666] mt-2">
          {isPoolBBetter ? `Pool B is ${yieldGap}% more profitable` : `Pool A is ${Math.abs(parseFloat(yieldGap))}% more profitable`}
        </div>
      </div>

      {/* Mini Chart */}
      <div className="flex-1 p-4 flex flex-col">
        <div className="text-[#00FF00] text-xs font-mono mb-2">YIELD_COMPARISON</div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid stroke="#333333" horizontal={true} vertical={false} />
              <XAxis dataKey="time" tick={{ fill: '#666', fontSize: 10 }} />
              <YAxis tick={{ fill: '#666', fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: '#000', border: '1px solid #333333', borderRadius: 0 }}
                labelStyle={{ color: '#00FF00' }}
              />
              <Line
                type="monotone"
                dataKey="poolA"
                stroke="#00FFFF"
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
              />
              <Line
                type="monotone"
                dataKey="poolB"
                stroke="#00FF00"
                strokeWidth={2}
                dot={false}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MarketManipulator;
