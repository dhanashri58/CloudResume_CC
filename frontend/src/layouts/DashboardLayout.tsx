import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, TopBar } from '../components/navigation';

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-[#FAF7F2] text-[#1C1917] overflow-hidden relative selection:bg-amber-500/20 selection:text-amber-900">
      {/* Warm ambient radiant light for depth */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[350px] bg-amber-500/5 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-1/3 w-[450px] h-[300px] bg-orange-500/5 rounded-full blur-[130px] pointer-events-none -z-10" />

      <Sidebar collapsed={collapsed} onCollapse={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
