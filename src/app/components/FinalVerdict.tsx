import React from 'react';
import { Shield, Zap, Target } from 'lucide-react';

const FinalVerdict: React.FC = () => {
  return (
    <section className="py-20 px-6 bg-[#050505] border-b border-[#333333]">
      <div className="max-w-4xl mx-auto">
        {/* Main Verdict Box */}
        <div className="mb-12 p-8 bg-[#000000] border-2 border-[#FFB100] relative overflow-hidden group hover:border-[#FFB100] transition-all">
          {/* Glow effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity blur-2xl bg-[#FFB100]"></div>

          {/* Content */}
          <div className="relative z-10">
            <div className="mb-4 flex items-center gap-3">
              <div className="w-3 h-3 bg-[#FFB100] rounded-full animate-pulse"></div>
              <h2 className="text-2xl font-bold text-[#FFB100] tracking-wider">[ FINAL_VERDICT ]</h2>
              <div className="w-3 h-3 bg-[#FFB100] rounded-full animate-pulse"></div>
            </div>

            <p className="text-lg text-gray-200 leading-relaxed border-l-4 border-[#FFB100] pl-6 mb-6">
              Albatroz Sentinel is not just a vault; it is the first decentralized <span className="text-[#00FF00] font-bold">Risk-Aware Yield Engine</span>. While others build simple 'if-this-then-that' bots, Albatroz employs <span className="text-[#00FFFF] font-bold">deterministic financial logic</span> on the Reactive Network to ensure every rebalance is profitable, safe, and capital-efficient.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#050505] border border-[#FFB100]/30 flex items-center gap-3">
                <Shield size={24} className="text-[#FFB100] flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Complexity</p>
                  <p className="text-sm font-bold text-[#FFB100]">Made Simple</p>
                </div>
              </div>

              <div className="p-4 bg-[#050505] border border-[#FFB100]/30 flex items-center gap-3">
                <Zap size={24} className="text-[#FFB100] flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Problems</p>
                  <p className="text-sm font-bold text-[#FFB100]">Actually Solved</p>
                </div>
              </div>

              <div className="p-4 bg-[#050505] border border-[#FFB100]/30 flex items-center gap-3">
                <Target size={24} className="text-[#FFB100] flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Native</p>
                  <p className="text-sm font-bold text-[#FFB100]">Reactive Ready</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Why This Wins Section */}
        <div className="space-y-4 mb-12">
          <h3 className="text-xl font-bold text-white mb-6">[ WHY_THIS_WINS ]</h3>

          <div className="p-4 bg-[#0a0a0a] border-l-4 border-[#00FF00]">
            <p className="text-gray-300 text-sm mb-2">
              <span className="text-[#00FF00] font-bold">→ Complexity Made Simple:</span> We explain financial logic (Slippage, Gas, Scoring) with a visual Terminal Bloomberg interface that juries instinctively understand.
            </p>
          </div>

          <div className="p-4 bg-[#0a0a0a] border-l-4 border-[#00FFFF]">
            <p className="text-gray-300 text-sm mb-2">
              <span className="text-[#00FFFF] font-bold">→ Solves Real Problems:</span> We're not just moving money around. We ensure profitability (Gas Guard) and safety (Slippage Guard) in every single transaction.
            </p>
          </div>

          <div className="p-4 bg-[#0a0a0a] border-l-4 border-[#FFB100]">
            <p className="text-gray-300 text-sm mb-2">
              <span className="text-[#FFB100] font-bold">→ Reactive Native:</span> We leverage Reactive Network's Event-driven architecture (Subscription, Callback, State Proof) as our core infrastructure—this is the hackathon's entire purpose.
            </p>
          </div>

          <div className="p-4 bg-[#0a0a0a] border-l-4 border-[#00FF00]">
            <p className="text-gray-300 text-sm mb-2">
              <span className="text-[#00FF00] font-bold">→ Future-Proof Vision:</span> We bridge passive lending and institutional market-making. This is the next frontier of autonomous DeFi.
            </p>
          </div>
        </div>

        {/* Closing Statement */}
        <div className="p-8 bg-gradient-to-r from-[#000000] to-[#050505] border border-[#333333]">
          <p className="text-center text-gray-200 leading-relaxed mb-4">
            <span className="text-[#00FF00] font-bold text-lg">[ CLOSING_STATEMENT ]</span>
          </p>
          <p className="text-center text-gray-300 text-sm leading-relaxed italic">
            "Albatroz Sentinel solves the <span className="text-[#FFB100] font-bold">'Idle Capital Problem'</span> by bridging the gap between passive lending and institutional market-making. By leveraging Reactive Smart Contracts, we've built a system that doesn't just <span className="text-[#00FF00] font-bold">watch</span> the market—it <span className="text-[#00FF00] font-bold">understands the cost of capital</span>. This is the future of autonomous DeFi."
          </p>
        </div>
      </div>
    </section>
  );
};

export default FinalVerdict;
