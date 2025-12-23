import React from 'react';
import { ChevronRight, Terminal } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <section className="relative w-full py-20 px-6 border-b border-[#333333] bg-[#000000]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Column: Text Content */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 text-[#FFB100] text-xs tracking-[0.2em] border border-[#FFB100] px-3 py-1 w-fit bg-[#FFB100]/5">
            <span className="w-2 h-2 bg-[#FFB100] rounded-full animate-pulse"></span>
            SYSTEM_V2.0_ONLINE
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white glitch" data-text="ALBATROZ SENTINEL">
            ALBATROZ SENTINEL
          </h1>
          
          <h2 className="text-xl md:text-2xl text-[#00FFFF] tracking-widest font-light">
            AUTONOMOUS YIELD NAVIGATION
          </h2>
          
          <p className="text-gray-400 max-w-2xl text-lg leading-relaxed border-l-2 border-[#333333] pl-6">
            Risk-Aware Cross-Chain Orchestration powered by <span className="text-[#00FF00]">Reactive Network</span>. 
            Institutional-grade yield optimization for the retail frontier.
          </p>
          
          <div className="flex flex-wrap gap-4 mt-6">
            <button className="group relative bg-[#00FF00]/10 border border-[#00FF00] text-[#00FF00] px-8 py-4 font-bold tracking-widest uppercase transition-all hover:bg-[#00FF00] hover:text-black hover:shadow-[0_0_20px_#00FF00]">
              <span className="flex items-center gap-2">
                <Terminal size={18} />
                [ EXECUTE_DASHBOARD ]
              </span>
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00FF00] -translate-x-1 -translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform"></div>
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00FF00] translate-x-1 translate-y-1 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform"></div>
            </button>
            
            <button className="group px-8 py-4 border border-[#333333] text-gray-400 font-bold tracking-widest uppercase hover:text-[#00FFFF] hover:border-[#00FFFF] transition-all">
              <span className="flex items-center gap-2">
                [ VIEW_CONTRACTS ]
                <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>
          </div>
        </div>

        {/* Right Column: ASCII Art / Abstract Visual */}
        <div className="lg:col-span-4 flex justify-center lg:justify-end opacity-50">
          <pre className="text-[#00FF00] text-[10px] leading-[10px] font-bold select-none">
{`
      /\\
     /  \\
    /    \\
   /      \\      ALBATROZ
  /________\\     PROTOCOL
 /__________\\
 |          |    [SECURE]
 |    __    |    [REACTIVE]
 |   |__|   |    [AUTONOMOUS]
 |          |
 \\__________/
  \\        /
   \\      /
    \\    /
     \\  /
      \\/
`}
          </pre>
        </div>

      </div>
    </section>
  );
};

export default Hero;
