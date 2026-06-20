import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, PlusCircle, Layers, ShoppingCart, Key, LogOut, Menu, User, Image as ImageIcon, Store, LayoutTemplate, Sliders, Settings, Download } from 'lucide-react';
import { usePWA } from '../context/PWAContext';

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('dd_admin_user') || '{}');
  const { isInstallable, isInstalled, installApp } = usePWA();

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('dd_admin_token');
    localStorage.removeItem('dd_admin_user');
    navigate('/admin/login');
  };

  const handleInstallClick = () => {
    if (isInstallable) {
      installApp();
    } else {
      // Check if user is on iOS device (iPhone/iPad)
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
      
      if (isIOS) {
        alert('iPhone/iPad (iOS) detect hua hai. Admin App install karne ke liye:\n\n1. Safari browser mein website open karein.\n2. Niche bane Share button (डिब्बा और ऊपर तीर) par click karein.\n3. Scroll karke "Add to Home Screen" select karein.');
      } else {
        alert('PWA Installation ready nahi hai. Kripya:\n1. Ensure karein ki aap Google Chrome (Android/Windows) ya Safari (iOS) use kar rahe hain.\n2. Page ko reload karein aur Service Worker load hone ke liye 5-10 seconds wait karein.\n3. Agar app pehle se installed hai to check karein.');
      }
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Add Product', path: '/admin/add-product', icon: PlusCircle },
    { name: 'Add Wholesale', path: '/admin/add-wholesale-product', icon: Store },
    { name: 'Categories', path: '/admin/categories', icon: Layers },
    { name: 'Hero Section', path: '/admin/hero', icon: LayoutTemplate },
    { name: 'Top Utility Bar', path: '/admin/utility-bar', icon: Sliders },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Banners', path: '/admin/banners', icon: ImageIcon },
    { name: 'Promo Banners', path: '/admin/promo-banners', icon: LayoutTemplate },
    { name: 'Branding Settings', path: '/admin/branding', icon: Settings },
    { name: 'Change Password', path: '/admin/change-password', icon: Key },
    { name: 'View Shop', path: '/', icon: Store },
  ];

  if (!isInstalled) {
    // Add "Install Admin App" right before "View Shop"
    menuItems.splice(menuItems.length - 1, 0, {
      name: 'Install Admin App',
      icon: Download,
      onClick: handleInstallClick
    });
  }



  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 w-72 bg-slate-900 text-white shadow-xl z-30 transition-transform duration-300 ease-in-out flex flex-col h-screen
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="font-bold text-white">D</span>
            </div>
            <span className="text-xl font-bold tracking-tight">DD Admin</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <LogOut className="w-5 h-5 rotate-180" />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            if (item.onClick) {
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    setIsSidebarOpen(false);
                    item.onClick();
                  }}
                  className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl transition-all duration-200 text-slate-400 hover:bg-slate-800 hover:text-white group"
                >
                  <Icon className="w-5 h-5 text-slate-500 group-hover:text-white" />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            }
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-xl transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 shadow-sm px-8 py-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSidebar}
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">
              {menuItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900">{user.name || 'Admin'}</p>
                <p className="text-xs text-gray-500">Super Administrator</p>
              </div>
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <User className="w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto animate-fade-in-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
