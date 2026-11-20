import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicNav } from '../components/navigation';

const PublicLayout: React.FC = () => (
  <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col transition-colors duration-300 selection:bg-amber-500/20 selection:text-amber-900">
    <PublicNav />
    <main className="flex-1">
      <Outlet />
    </main>
  </div>
);

export default PublicLayout;
