import React from 'react';

const Specs: React.FC = () => {
  return (
    <section className="py-20 px-6 bg-[#050505]">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Technical Specifications</h2>
            <p className="text-gray-500 text-sm mt-2">TRUST_THROUGH_TRANSPARENCY</p>
        </div>

        <div className="border border-[#333333] bg-[#000000]">
            <table className="w-full text-left border-collapse">
                <tbody>
                    <tr className="border-b border-[#333333] hover:bg-[#111] transition-colors">
                        <td className="p-4 text-gray-500 font-mono text-sm w-1/3 border-r border-[#333333]">LAYER 1</td>
                        <td className="p-4 text-[#00FFFF] font-bold font-mono">Ethereum Sepolia (Execution)</td>
                    </tr>
                    <tr className="border-b border-[#333333] hover:bg-[#111] transition-colors">
                        <td className="p-4 text-gray-500 font-mono text-sm border-r border-[#333333]">INTELLIGENCE</td>
                        <td className="p-4 text-[#00FF00] font-bold font-mono">Reactive Network (Lasna)</td>
                    </tr>
                    <tr className="border-b border-[#333333] hover:bg-[#111] transition-colors">
                        <td className="p-4 text-gray-500 font-mono text-sm border-r border-[#333333]">STANDARD</td>
                        <td className="p-4 text-white font-mono">ERC-4626 Tokenized Vaults</td>
                    </tr>
                    <tr className="hover:bg-[#111] transition-colors">
                        <td className="p-4 text-gray-500 font-mono text-sm border-r border-[#333333]">SECURITY</td>
                        <td className="p-4 text-[#FFB100] font-bold font-mono">Proxy-Locked Callbacks</td>
                    </tr>
                </tbody>
            </table>
        </div>
        
        <div className="mt-8 flex justify-between text-[10px] text-[#333333] uppercase">
            <span>Verified: Etherscan</span>
            <span>Audited: None (Testnet)</span>
            <span>Uptime: 99.99%</span>
        </div>
      </div>
    </section>
  );
};

export default Specs;
