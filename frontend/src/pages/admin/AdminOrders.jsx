import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { ShoppingBag, Search, Filter, Truck, CheckCircle, Clock, AlertCircle, Package, Phone, MapPin, X } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('dd_admin_token');
      const res = await api.get('/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('dd_admin_token');
      await api.put(`/orders/${id}/status`, { status }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchOrders();
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Error updating order status');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.phoneNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Shipped': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Confirmed': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Ready for Pickup': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="w-3 h-3" />;
      case 'Shipped': return <Truck className="w-3 h-3" />;
      case 'Ready for Pickup': return <Package className="w-3 h-3" />;
      case 'Cancelled': return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Orders</h2>
          <p className="text-gray-500 mt-1">Manage and track customer orders</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by Order ID, Name or Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none text-sm"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="All">All Status</option>
              <option value="Pending Confirmation">Pending Confirmation</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Ready for Pickup">Ready for Pickup</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Info</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type & Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                      <div className="text-sm font-medium text-indigo-600 font-mono">#{order._id.slice(-6).toUpperCase()}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                      <div className="text-sm font-bold text-gray-900 mt-1">₹{order.totalAmount?.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-medium text-gray-900">{order.fullName}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {order.phoneNumber}
                        </div>
                        {order.orderType === 'delivery' && (
                          <div className="text-xs text-gray-500 flex items-start gap-1 max-w-[200px]">
                            <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" /> 
                            {order.address}, {order.city} - {order.zipCode}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="mb-2">
                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded border ${
                          order.orderType === 'pickup' 
                            ? 'bg-pink-50 text-pink-700 border-pink-200' 
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                          {order.orderType === 'pickup' ? 'Store Pickup' : 'Local Delivery'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {order.items?.length} items
                        <div className="mt-1 pl-2 border-l-2 border-gray-200">
                          {order.items?.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="truncate max-w-[150px]">
                              {item.quantity}x {item.product?.name || 'Unknown Product'}
                            </div>
                          ))}
                          {order.items?.length > 2 && (
                            <div className="text-gray-400 italic">+{order.items.length - 2} more</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex items-center gap-1 text-xs leading-5 font-semibold rounded-full border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className="text-sm border-gray-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 py-1 pl-2 pr-8"
                      >
                        <option value="Pending Confirmation">Pending</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Ready for Pickup">Ready for Pickup</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Order #{selectedOrder._id.slice(-6).toUpperCase()}
                  <span className={`px-2 py-0.5 text-xs rounded-full border ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-8">
              {/* Customer Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Customer Details</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p className="font-medium text-gray-900 text-lg">{selectedOrder.fullName}</p>
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <a href={`tel:${selectedOrder.phoneNumber}`} className="hover:text-indigo-600">{selectedOrder.phoneNumber}</a>
                    </p>
                    {selectedOrder.user?.email && (
                      <p className="flex items-center gap-2">
                        <span className="w-4 h-4 flex items-center justify-center text-xs font-bold text-gray-400">@</span>
                        {selectedOrder.user.email}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                    {selectedOrder.orderType === 'pickup' ? 'Pickup Info' : 'Delivery Address'}
                  </h4>
                  {selectedOrder.orderType === 'pickup' ? (
                    <div className="bg-pink-50 border border-pink-100 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-pink-700 font-bold mb-1">
                        <Package className="w-4 h-4" /> Store Pickup
                      </div>
                      <p className="text-sm text-pink-600">Customer will pick up from store.</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2 text-gray-900 font-bold mb-2">
                        <Truck className="w-4 h-4" /> Local Delivery
                      </div>
                      <p>{selectedOrder.address}</p>
                      <p>{selectedOrder.city} - {selectedOrder.zipCode}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Order Items ({selectedOrder.items.length})</h4>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Qty</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                {item.product?.images?.[0] && (
                                  <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                                )}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.product?.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center text-sm text-gray-600">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-600">₹{item.price}</td>
                          <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">₹{item.price * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan="3" className="px-4 py-3 text-right text-sm font-bold text-gray-900">Total Amount</td>
                        <td className="px-4 py-3 text-right text-lg font-bold text-gray-900">₹{selectedOrder.totalAmount}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
                <a 
                  href={`tel:${selectedOrder.phoneNumber}`}
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" /> Call Customer
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
