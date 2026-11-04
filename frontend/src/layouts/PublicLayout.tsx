import React from 'react';
import { Outlet } from 'react-router-dom';
import { PublicNav } from '../components/navigation';

const PublicLayout: React.FC = () => (
  <div className="min-h-screen bg-white">
    <PublicNav />
    <Outlet />
  </div>
);

export default PublicLayout;

