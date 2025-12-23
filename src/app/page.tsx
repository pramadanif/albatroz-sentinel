import React from 'react';
import Ticker from './components/Ticker';
import Hero from './components/Hero';
import Terminal from './components/Terminal/Terminal';
import Features from './components/Features';
import Specs from './components/Specs';
import EnhancedModules from './components/EnhancedModules';
import ComparisonTable from './components/ComparisonTable';
import FinalVerdict from './components/FinalVerdict';
import Dashboard from './components/Dashboard/Dashboard';
import Footer from './components/Footer';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#00FF00] selection:text-black flex flex-col">
      <Ticker />
      <main className="flex-1 w-full flex flex-col">
        <Hero />
        <Terminal />
        <Features />
        <Specs />
        {/* <Dashboard /> */}
        <EnhancedModules />
        <ComparisonTable />
        <FinalVerdict />
      </main>
      <Footer />
    </div>
  );
}
