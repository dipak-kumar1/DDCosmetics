import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';

const UserLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50 pb-16 lg:pb-0">
        <Outlet />
      </main>
      <MobileBottomNav />
      {/* Optional: Add Footer here later */}
    </div>
  );
};

export default UserLayout;
