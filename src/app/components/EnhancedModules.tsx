import React from 'react';
import { CheckCircle, Zap, Lock, Network } from 'lucide-react';

const EnhancedModules: React.FC = () => {
  const modules = [
    {
      id: '01',
      title: 'INTENT-BASED_YIELD_ENGINES',
      icon: <Zap size={32} className="text-[#00FF00]" />,
      copy: "Your goals, your rules. Choose between Aggressive Alpha for high-frequency yield chasing or Conservative Stability for long-term growth. The Sentinel adjusts its trigger thresholds dynamically based on your risk profile.",
      color: 'border-[#00FF00]',
      badge: 'DYNAMIC_OPTIMIZATION'
    },
    {
      id: '02',
      title: 'GAS-ADJUSTED_PROFITABILITY',
      icon: <CheckCircle size={32} className="text-[#FFB100]" />,
      copy: "Never lose money to network fees. The Sentinel's intelligence layer calculates the Net-Yield Delta by factoring in real-time gas costs on Ethereum Sepolia before initiating any transaction.",
      color: 'border-[#FFB100]',
      badge: 'FINANCIAL_MATURITY'
    },
    {
      id: '03',
      title: 'NATIVE_SLIPPAGE_GUARD',
      icon: <Lock size={32} className="text-[#00FFFF]" />,
      copy: "Institutional-grade security. Every cross-chain rebalance is protected by a mandatory slippage check. If the target pool lacks liquidity or the withdrawal amount doesn't meet the minAmountOut threshold, the execution reverts to protect your principal.",
      color: 'border-[#00FFFF]',
      badge: 'SAFETY_FIRST'
    },
    {
      id: '04',
      title: 'ZERO-BOT_INFRASTRUCTURE',
      icon: <Network size={32} className="text-[#00FF00]" />,
      copy: "Eliminating off-chain fragility. Albatroz Sentinel runs 100% on-chain through the Reactive Network. No centralized keepers, no external bots, and no single point of failure. Just pure, autonomous code.",
      color: 'border-[#00FF00]',
      badge: 'FULLY_DECENTRALIZED'
    }
  ];

  return (
    <section className="py-20 px-6 bg-[#050505] border-b border-[#333333]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-2">THE WINNING FORMULA</h2>
          <p className="text-gray-400 text-sm">Four institutional-grade modules that separate Albatroz from the rest</p>
          <div className="w-20 h-1 bg-gradient-to-r from-[#00FF00] to-[#FFB100] mt-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modules.map((module) => (
            <div
              key={module.id}
              className={`p-6 bg-[#000000] border ${module.color} hover:bg-[#111111] transition-all group cursor-pointer relative overflow-hidden`}
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity blur-xl pointer-events-none`} 
                   style={{
                     background: module.color.replace('border-', '').match(/#[0-9A-F]{6}/i)?.[0] || '#00FF00'
                   }}>
              </div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    {module.icon}
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded border ${module.color} text-gray-300`}>
                    {module.badge}
                  </span>
                </div>

                <h3 className={`text-lg font-bold mb-3 ${module.color.replace('border-', 'text-')}`}>
                  {module.title}
                </h3>

                <p className="text-gray-300 text-sm leading-relaxed border-l-2 border-[#333333] pl-4">
                  {module.copy}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-gradient-to-r from-[#FFB100]/10 to-[#00FF00]/10 border border-[#FFB100] rounded-none">
          <p className="text-center text-gray-300 text-sm leading-relaxed">
            <span className="text-[#FFB100] font-bold">[ SYSTEM_ANALYSIS ]</span> Each module is engineered to solve a specific DeFi pain point. Together, they form an unstoppable yield optimization engine that learns, adapts, and always profits.
          </p>
        </div>
      </div>
    </section>
  );
};

export default EnhancedModules;
