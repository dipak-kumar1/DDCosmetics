import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, LayoutGrid, Home, Package, FileText, User } from 'lucide-react';

const MobileBottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { 
      id: 'shop',
      path: '/shop', 
      label: 'Shop', 
      icon: ShoppingBag,
      isActive: (pathname) => pathname === '/shop' || pathname === '/'
    },
    { 
      id: 'category',
      path: '/categories', 
      label: 'Category', 
      icon: LayoutGrid,
      isActive: (pathname) => pathname === '/categories'
    },
    { 
      id: 'home',
      path: '/home', 
      label: 'Home', 
      icon: Home,
      isActive: (pathname) => pathname === '/home'
    },
    { 
      id: 'wholesale',
      path: '/wholesale', 
      label: 'Wholesale', 
      icon: Package,
      isActive: (pathname) => pathname === '/wholesale'
    },
    { 
      id: 'dashboard',
      path: '/dashboard', 
      label: 'Account', 
      icon: User,
      isActive: (pathname) => pathname === '/dashboard' || pathname === '/profile'
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[50] bg-white border-t border-gray-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] lg:hidden pb-safe">
      <div className="flex justify-around items-center h-[60px]">
        {navItems.map((item) => {
          const active = item.isActive(location.pathname, location.search);

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
                active ? 'text-[#fc2779]' : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <div className={`relative p-1 rounded-full transition-all duration-300 ${active ? '-translate-y-1' : ''}`}>
                <item.icon className={`w-5 h-5 ${active ? 'fill-current stroke-none' : 'stroke-2'}`} />
                {active && (
                   <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#fc2779] rounded-full" />
                )}
              </div>
              <span className={`text-[10px] font-medium mt-0.5 ${active ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MobileBottomNav;