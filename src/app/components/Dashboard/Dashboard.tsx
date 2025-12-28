'use client';

import React from 'react';
import SystemMarquee from './SystemMarquee';
import VaultStats from './VaultStats';
import TerminalLog from './TerminalLog';
import MarketManipulator from './MarketManipulator';

const Dashboard: React.FC = () => {
  return (
    <section className="w-full bg-[#000000] py-6 px-6">
      <div className="max-w-[1920px] mx-auto">
        {/* System Marquee Header */}
        <div className="mb-6">
          <SystemMarquee />
        </div>

        {/* Main Grid: Left | Center | Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 h-[600px]">
          {/* Left Panel: Vault Stats */}
          <div className="lg:col-span-3">
            <VaultStats />
          </div>

          {/* Center Panel: Terminal Log */}
          <div className="lg:col-span-5">
            <TerminalLog />
          </div>

          {/* Right Panel: Market Manipulator */}
          <div className="lg:col-span-4">
            <MarketManipulator />
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center p-4 border border-[#333333] bg-[#050505]">
          <div className="text-[#00FFFF] text-xs font-mono mb-2">
            Reactive Event-Driven Architecture: Eliminating off-chain keepers through native cross-chain orchestration.
          </div>
          <div className="text-[10px] text-[#666] space-x-4">
            <a href="https://github.com/your-repo/albatroz" target="_blank" className="hover:text-[#00FF00] transition-colors">[GitHub]</a>
            <a href="https://lasna.rnk.dev/" target="_blank" className="hover:text-[#00FF00] transition-colors">[Lasna Explorer]</a>
            <a href="/docs" className="hover:text-[#00FF00] transition-colors">[Documentation]</a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;
