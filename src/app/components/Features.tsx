import React from 'react';
import { ShieldCheck, Zap, Database } from 'lucide-react';
import JsonTooltip from './ui/JsonTooltip';

const features = [
  {
    id: '01',
    title: 'GAS_GUARD',
    icon: <ShieldCheck size={32} className="text-[#00FFFF]" />,
    desc: "Advanced arbitrage logic that halts rebalancing if Gas Fees > 10% of projected 7-day profit.",
    color: 'border-[#00FFFF]',
    data: { logic: "if (estGas > projProfit * 0.1) revert();", status: "Active" }
  },
  {
    id: '02',
    title: 'YIELD_ORACLE',
    icon: <Database size={32} className="text-[#00FF00]" />,
    desc: "Echo-compatible data feeds. Sentinel acts as a cross-chain Yield Oracle for 3rd party protocols.",
    color: 'border-[#00FF00]',
    data: { integration: "EIP-3668", feed_latency: "200ms" }
  },
  {
    id: '03',
    title: 'EMERGENCY_EXIT',
    icon: <Zap size={32} className="text-[#FFB100]" />,
    desc: "Instant liquidity evacuation if pool utilization exceeds 95% safety threshold.",
    color: 'border-[#FFB100]',
    data: { trigger: "utilization > 0.95", action: "emergencyWithdraw()" }
  }
];

const Features: React.FC = () => {
  return (
    <section className="py-20 px-6 bg-[#000000] border-b border-[#333333]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">INSTITUTIONAL MODULES</h2>
            <div className="w-20 h-1 bg-[#333333]"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((f) => (
            <JsonTooltip key={f.id} data={f.data} className="h-full">
                <div className={`h-full p-8 bg-[#050505] border ${f.color} hover:bg-[#0a0a0a] transition-colors relative group cursor-pointer`}>
                <div className="absolute top-4 right-4 text-xs font-mono text-gray-600 opacity-50">MOD_{f.id}</div>
                <div className="mb-6 group-hover:scale-110 transition-transform duration-300 origin-left">
                    {f.icon}
                </div>
                <h3 className={`text-xl font-bold mb-4 ${f.id === '02' ? 'text-[#00FF00]' : f.id === '03' ? 'text-[#FFB100]' : 'text-[#00FFFF]'}`}>
                    [{f.title}]
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed border-l border-[#333333] pl-4">
                    {f.desc}
                </p>
                </div>
            </JsonTooltip>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
