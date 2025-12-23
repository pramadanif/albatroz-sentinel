'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';

const DataFlow: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 3);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const steps = [
    { label: 'SEP_POOL_EVENT', color: 'border-[#00FFFF]', description: 'Event: RateUpdated' },
    { label: 'REACTIVE_SENTINEL', color: 'border-[#FFB100]', description: 'Processing Data' },
    { label: 'ALBATROZ_VAULT', color: 'border-[#00FF00]', description: 'Execute Rebalance' },
  ];

  return (
    <div className="w-full border border-[#333333] bg-[#000000]">
      <div className="absolute top-0 left-0 w-full h-1 bg-[#00FF00] opacity-50"></div>
      
      {/* Header */}
      <div className="p-4 border-b border-[#333333] bg-[#111111]">
        <div className="text-[#00FF00] text-xs font-bold tracking-wider">DATA_FLOW_ARCHITECTURE</div>
        <div className="text-[10px] text-[#666] mt-1">Reactive Event-Driven Orchestration</div>
      </div>

      {/* Flow Diagram */}
      <div className="p-8 bg-[#050505]/50">
        <div className="flex items-center justify-between gap-8">
          {steps.map((step, idx) => (
            <React.Fragment key={idx}>
              {/* Step Box */}
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-full p-4 border-2 ${step.color} bg-[#000000] transition-all duration-500 ${
                    activeStep === idx ? 'shadow-[0_0_15px_rgba(255,255,255,0.3)]' : ''
                  }`}
                >
                  <div
                    className={`text-xs font-mono font-bold tracking-wider transition-colors ${
                      activeStep === idx
                        ? step.color === 'border-[#00FFFF]'
                          ? 'text-[#00FFFF]'
                          : step.color === 'border-[#FFB100]'
                          ? 'text-[#FFB100]'
                          : 'text-[#00FF00]'
                        : 'text-[#666]'
                    }`}
                  >
                    {step.label}
                  </div>
                  <div className="text-[10px] text-[#666] mt-2">{step.description}</div>
                </div>
                
                {/* Pulse indicator */}
                {activeStep === idx && (
                  <div className="mt-3 flex gap-1">
                    <div className="w-1.5 h-1.5 bg-current rounded-full animate-pulse"></div>
                    <div className="text-[10px] text-[#666]">Processing...</div>
                  </div>
                )}
              </div>

              {/* Arrow */}
              {idx < steps.length - 1 && (
                <div className="flex-shrink-0">
                  <div
                    className={`transition-all duration-500 ${
                      activeStep > idx ? 'text-[#00FF00]' : activeStep === idx ? 'text-[#FFB100]' : 'text-[#333333]'
                    }`}
                  >
                    <ArrowRight size={24} />
                  </div>
                  <div className="text-[10px] text-[#666] text-center mt-1 w-12">
                    {activeStep > idx || activeStep === idx ? 'Data Flow' : '---'}
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Description */}
        <div className="mt-8 p-4 border border-[#333333] bg-[#111111]">
          <div className="text-[#00FFFF] text-xs font-mono mb-2">HOW_IT_WORKS</div>
          <div className="text-xs text-[#999] leading-relaxed space-y-2">
            <p>
              <span className="text-[#00FFFF]">1. Event Subscription:</span> Albatroz Sentinel listens to on-chain events from Ethereum Sepolia.
            </p>
            <p>
              <span className="text-[#FFB100]">2. Reactive Processing:</span> Reactive Network processes data deterministically and triggers callbacks.
            </p>
            <p>
              <span className="text-[#00FF00]">3. Vault Execution:</span> Albatroz Vault executes rebalances only when conditions are profitable & safe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataFlow;
