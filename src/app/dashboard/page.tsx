import React from 'react';
import Dashboard from '../components/Dashboard/Dashboard';

export const metadata = {
  title: 'Albatroz Sentinel | Dashboard',
  description: 'Real-time vault management and intelligence terminal',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-[#00FF00] selection:text-black flex flex-col">
      <main className="flex-1 w-full flex flex-col">
        <Dashboard />
      </main>
    </div>
  );
}
