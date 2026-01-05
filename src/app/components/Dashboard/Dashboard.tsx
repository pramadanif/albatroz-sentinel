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

      </div>
    </section>
  );
};

export default Dashboard;
