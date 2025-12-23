import React from 'react';

const ComparisonTable: React.FC = () => {
  const features = [
    {
      feature: 'Logic Source',
      standard: 'Simple Yield Comparison',
      albatroz: 'Weighted Risk/Reward Scoring',
      winner: 'albatroz'
    },
    {
      feature: 'Gas Awareness',
      standard: 'No (Rebalances at a loss)',
      albatroz: 'Yes (Profitability Optimized)',
      winner: 'albatroz'
    },
    {
      feature: 'Security',
      standard: 'None',
      albatroz: 'Slippage Guard & Proxy-Lock',
      winner: 'albatroz'
    },
    {
      feature: 'Standard Compliance',
      standard: 'Custom Code',
      albatroz: 'ERC-4626 (Industry Standard)',
      winner: 'albatroz'
    },
    {
      feature: 'Orchestration',
      standard: 'Single Chain',
      albatroz: 'Native Cross-Chain (Lasna)',
      winner: 'albatroz'
    },
    {
      feature: 'Transparency',
      standard: 'Centralized Logic',
      albatroz: '100% On-Chain (Reactive Network)',
      winner: 'albatroz'
    }
  ];

  return (
    <section className="py-20 px-6 bg-[#000000] border-b border-[#333333]">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">THE COMPETITIVE EDGE</h2>
          <p className="text-gray-400 text-sm">Why Albatroz Sentinel leaves traditional automation in the dust</p>
        </div>

        <div className="border border-[#333333] bg-[#050505] overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#111111] border-b border-[#333333]">
                <th className="p-4 text-gray-400 font-mono text-sm font-bold uppercase tracking-wider border-r border-[#333333]">FEATURE</th>
                <th className="p-4 text-gray-500 font-mono text-sm font-bold uppercase tracking-wider border-r border-[#333333]">Standard Automation (90%)</th>
                <th className="p-4 text-[#00FF00] font-mono text-sm font-bold uppercase tracking-wider">Albatroz Sentinel (100%)</th>
              </tr>
            </thead>
            <tbody>
              {features.map((row, idx) => (
                <tr
                  key={idx}
                  className={`border-b border-[#333333] hover:bg-[#111111] transition-colors ${
                    idx % 2 === 0 ? 'bg-[#050505]' : 'bg-[#0a0a0a]'
                  }`}
                >
                  <td className="p-4 text-white font-mono text-sm font-bold border-r border-[#333333]">
                    {row.feature}
                  </td>
                  <td className="p-4 text-gray-500 font-mono text-sm border-r border-[#333333]">
                    {row.standard}
                  </td>
                  <td className="p-4 text-[#00FF00] font-mono text-sm font-bold">
                    {row.albatroz}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4 p-6 bg-[#0a0a0a] border border-[#00FF00]/30 rounded-none">
          <div className="w-3 h-3 bg-[#00FF00] rounded-full animate-pulse"></div>
          <p className="text-center text-[#00FF00] text-sm font-mono">
            [ VERDICT_FINAL ] Albatroz Sentinel: 6 out of 6 categories outperforming standard automation. WINNER.
          </p>
          <div className="w-3 h-3 bg-[#00FF00] rounded-full animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default ComparisonTable;
