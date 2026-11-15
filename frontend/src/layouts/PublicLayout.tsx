import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicNav } from '../components/navigation';

const PublicLayout: React.FC = () => (
  <div className="min-h-screen bg-[#0a0f1d] text-slate-100 flex flex-col selection:bg-indigo-500/30 selection:text-indigo-200">
    <PublicNav />
    <main className="flex-1">
      <Outlet />
    </main>
  </div>
);

export default PublicLayout;
