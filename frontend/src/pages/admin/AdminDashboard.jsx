import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import { 
  ShoppingBag, 
  Users, 
  Package, 
  DollarSign, 
  TrendingUp, 
  ArrowUpRight, 
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100">
        <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
        <p className="text-sm font-bold text-gray-900">
          Revenue: <span className="text-indigo-600">₹{data.revenue.toLocaleString()}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Orders: <span className="font-semibold text-gray-700">{data.orders || 0}</span>
        </p>
      </div>
    );
  }
  return null;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [chartView, setChartView] = useState('daily');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    topSellingProducts: [],
    dailyRevenue: [],
    monthlyRevenue: [],
    lowStockProducts: []
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
      value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, 
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      trend: '+12.5% from last month',
      path: '/admin/orders'
    },
    { 
      title: 'Total Orders', 
      value: stats.totalOrders || 0, 
      icon: ShoppingBag,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      trend: '+8.2% from last month',
      path: '/admin/orders'
    },
    { 
      title: 'Total Users', 
      value: stats.totalUsers || 0, 
      icon: Users,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      trend: '+5.1% from last month',
      path: null
    },
    { 
      title: 'Total Products', 
      value: stats.totalProducts || 0, 
      icon: Package,
      color: 'text-pink-600',
      bg: 'bg-pink-50',
      trend: 'New items added',
      path: '/admin/products'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Low Stock Alerts Section */}
      {stats.lowStockProducts && stats.lowStockProducts.length > 0 && (
        <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-rose-100 text-rose-600 rounded-lg">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-rose-900 text-base">Low Stock Alerts</h3>
              <p className="text-xs text-rose-600/80">The following products/variants are running out of stock (less than 5 left).</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {stats.lowStockProducts.map((product) => {
              const img = product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/50?text=Product';
              return (
                <div key={product._id} className="bg-white border border-rose-100 hover:border-rose-300 rounded-xl p-3 flex items-center justify-between shadow-sm transition-all duration-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <img 
                      src={img} 
                      alt={product.name} 
                      className="w-10 h-10 rounded-md object-cover border border-gray-100 flex-shrink-0"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/50?text=Product' }}
                    />
                    <div className="min-w-0">
                      <h4 className="font-semibold text-gray-900 text-xs truncate" title={product.name}>{product.name}</h4>
                      <p className="text-[10px] text-gray-400 capitalize">{product.category}</p>
                      <span className="inline-block mt-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                        {product.stock} left
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/admin/edit-product/${product._id}`)}
                    className="flex items-center justify-center p-1.5 text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 rounded-lg transition-all duration-200 flex-shrink-0 ml-2"
                    title="Edit Product"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          const isClickable = !!card.path;
          return (
            <div 
              key={index} 
              onClick={() => isClickable && navigate(card.path)}
              className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all duration-200 ${
                isClickable ? 'cursor-pointer hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5' : ''
              }`}
            >
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

      {/* Sales Analytics Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Sales Analytics Overview</h2>
            <p className="text-xs text-gray-500">Track your daily and monthly store revenue</p>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setChartView('daily')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                chartView === 'daily'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-indigo-900'
              }`}
            >
              Daily (7d)
            </button>
            <button
              onClick={() => setChartView('monthly')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                chartView === 'monthly'
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-gray-600 hover:text-indigo-900'
              }`}
            >
              Monthly (6m)
            </button>
          </div>
        </div>

        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartView === 'daily' ? stats.dailyRevenue || [] : stats.monthlyRevenue || []}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey={chartView === 'daily' ? 'formattedDate' : 'month'} 
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#94a3b8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `₹${val.toLocaleString()}`}
              />
              <Tooltip 
                content={<CustomTooltip />}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#6366f1" 
                strokeWidth={2.5}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
            <button 
              onClick={() => navigate('/admin/orders')}
              className="text-sm text-indigo-600 font-medium hover:text-indigo-700 flex items-center transition-colors"
            >
              View All <ArrowUpRight className="w-4 h-4 ml-1" />
            </button>
          </div>
          <div className="space-y-4 flex-1">
            {stats.recentOrders && stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => {
                const name = order.fullName || 'Anonymous User';
                const initials = name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase();
                const itemsCount = order.items
                  ? order.items.reduce((sum, item) => sum + item.quantity, 0)
                  : 0;

                return (
                  <div 
                    key={order._id} 
                    onClick={() => navigate('/admin/orders')}
                    className="flex items-center justify-between p-4 hover:bg-slate-50/50 rounded-xl transition-all duration-150 border border-gray-50 hover:border-gray-200 cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                        {initials}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {itemsCount} {itemsCount === 1 ? 'item' : 'items'} • ₹{order.totalAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                      order.status === 'Delivered'
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-100'
                        : order.status === 'Cancelled'
                        ? 'text-rose-700 bg-rose-50 border-rose-100'
                        : 'text-amber-700 bg-amber-50 border-amber-100'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                <CheckCircle2 className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm italic">No recent orders yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Selling Products Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Top Selling Products</h2>
            <button 
              onClick={() => navigate('/admin/products')}
              className="text-sm text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
            >
              View Report
            </button>
          </div>
          <div className="space-y-4 flex-1">
            {stats.topSellingProducts && stats.topSellingProducts.length > 0 ? (
              stats.topSellingProducts.map((product, idx) => {
                const img = product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/50?text=Product';
                return (
                  <div 
                    key={product._id || idx} 
                    onClick={() => navigate('/admin/products')}
                    className="flex items-center gap-4 p-3 hover:bg-slate-50/50 rounded-xl transition-all duration-150 border border-transparent hover:border-gray-200 cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center flex-shrink-0">
                      <img 
                        src={img} 
                        alt={product.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/50?text=Product' }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{product.name}</p>
                      <p className="text-xs text-gray-500 capitalize mt-0.5">Category: {product.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">₹{product.price.toLocaleString()}</p>
                      <p className="text-xs text-emerald-600 font-semibold mt-0.5">{product.sales || 0} sales</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400">
                <Package className="w-8 h-8 text-gray-300 mb-2" />
                <p className="text-sm italic">No sales recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
