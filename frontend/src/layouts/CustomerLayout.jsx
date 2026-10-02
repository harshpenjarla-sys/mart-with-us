import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import MobileBottomNav from '../components/common/MobileBottomNav';
import CartDrawer from '../components/common/CartDrawer';
import LocationModal from '../components/common/LocationModal';

export default function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900">
      <Navbar />
      <LocationModal />
      <CartDrawer />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
