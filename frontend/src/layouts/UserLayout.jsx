import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const UserLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <Outlet />
      </main>
      {/* Optional: Add Footer here later */}
    </div>
  );
};

export default UserLayout;
