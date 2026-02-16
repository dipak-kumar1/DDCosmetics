import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';
import { ShoppingBag, Users, Package, DollarSign, TrendingUp, ArrowUpRight } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.get('/dashboard-stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { 
      title: 'Total Revenue', 
      value: `₹${stats.totalRevenue.toLocaleString()}`, 
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-100',
      trend: '+12.5% from last month'
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders, 
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
      trend: '+8.2% from last month'
    },
    { 
      title: 'Total Users', 
      value: stats.totalUsers, 
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
      trend: '+5.1% from last month'
    },
    { 
      title: 'Total Products', 
      value: stats.totalProducts, 
      icon: Package,
      color: 'text-pink-600',
      bg: 'bg-pink-100',
      trend: 'New items added'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${card.bg}`}>
                  <Icon className={`w-6 h-6 ${card.color}`} />
                </div>
                <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +2.4%
                </span>
              </div>
              <h3 className="text-gray-500 text-sm font-medium mb-1">{card.title}</h3>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-400 mt-2">{card.trend}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center">
              View All <ArrowUpRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="space-y-4">
            {/* Placeholder items */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500">
                    JD
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">John Doe</p>
                    <p className="text-sm text-gray-500">2 items • ₹450</p>
                  </div>
                </div>
                <span className="px-3 py-1 text-xs font-medium text-amber-600 bg-amber-50 rounded-full">
                  Pending
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Top Selling Products</h2>
            <button className="text-sm text-indigo-600 font-medium hover:text-indigo-700">View Report</button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-2">
                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                  <img src={`https://via.placeholder.com/50?text=P${i}`} alt="Product" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Premium Lipstick Shade {i}</p>
                  <p className="text-sm text-gray-500">Category: Makeup</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">₹1,200</p>
                  <p className="text-xs text-green-500">32 sales</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
