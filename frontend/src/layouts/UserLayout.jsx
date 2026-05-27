import React from 'react';
import { Outlet } from 'react-router-dom';
import TopUtilityBar from '../components/TopUtilityBar';
import Navbar from '../components/Navbar';
import MobileBottomNav from '../components/MobileBottomNav';
import Footer from '../components/Footer';

const UserLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <TopUtilityBar />
      <Navbar />
      <main className="flex-1 bg-gray-50">
        <Outlet />
      </main>
      <div className="pb-16 lg:pb-0">
        <Footer />
      </div>
      <MobileBottomNav />
    </div>
  );
};

export default UserLayout;
