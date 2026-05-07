import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { LayoutDashboard, ShoppingBag, User, MapPin, LogOut, Edit2, Loader, ChevronRight, ArrowLeft, Check, Truck, Package, X } from 'lucide-react';

export default function Dashboard() {
  const { user, logout, updateUser } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [searchParams]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    gender: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [editAddressData, setEditAddressData] = useState({ address: '', city: '', zipCode: '' });

  // Manage Addresses States
  const [userAddresses, setUserAddresses] = useState([]);
  const [isAddingNewAddr, setIsAddingNewAddr] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState(null);
  const [addrFormData, setAddrFormData] = useState({
    name: '', phone: '', pincode: '', locality: '', address: '', city: '', state: '', landmark: '', alternatePhone: '', type: 'Home'
  });

  useEffect(() => {
    if (activeTab === 'orders') {
      fetchOrders();
    }
    setSelectedOrder(null);
  }, [activeTab]);

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const res = await api.get('/orders/myorders');
      setOrders(res.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me'); // Or a dedicated profile endpoint if available
        // If /auth/me returns the user object directly or nested
        const userData = res.data.user || res.data; 
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          mobile: userData.mobile || '',
          gender: userData.gender || ''
        });
        if (userData.addresses) {
          setUserAddresses(userData.addresses);
        }
        updateUser(userData);
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/users/profile', formData);
      updateUser({ ...user, ...res.data });
      setIsEditing(false);
      // Optionally show success message
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddrInputChange = (e) => {
    const { name, value } = e.target;
    setAddrFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveUserAddress = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingAddrId) {
        const res = await api.put(`/users/addresses/${editingAddrId}`, addrFormData);
        setUserAddresses(res.data);
        updateUser({ ...user, addresses: res.data });
      } else {
        const res = await api.post('/users/addresses', addrFormData);
        setUserAddresses(res.data);
        updateUser({ ...user, addresses: res.data });
      }
      setIsAddingNewAddr(false);
      setEditingAddrId(null);
    } catch (err) {
      console.error('Failed to save address:', err);
      alert(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUserAddress = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const res = await api.delete(`/users/addresses/${id}`);
      setUserAddresses(res.data);
      updateUser({ ...user, addresses: res.data });
    } catch (err) {
      console.error('Failed to delete address:', err);
    }
  };

  const openEditAddress = (addr) => {
    setAddrFormData(addr);
    setEditingAddrId(addr._id);
    setIsAddingNewAddr(true);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'addresses', label: 'Manage Addresses', icon: MapPin },
  ];

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    
    try {
      await api.put(`/orders/${orderId}/cancel`);
      fetchOrders(); // Refresh list
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: 'Cancelled' }));
      }
    } catch (err) {
      console.error('Failed to cancel order:', err);
      alert(err.response?.data?.msg || 'Failed to cancel order');
    }
  };

  const handleUpdateAddress = async () => {
    if (!editAddressData.address || !editAddressData.city || !editAddressData.zipCode) {
      alert("All address fields are required.");
      return;
    }
    try {
      setSaving(true);
      const res = await api.put(`/orders/${selectedOrder._id}/address`, editAddressData);
      setSelectedOrder(res.data);
      setIsEditingAddress(false);
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Failed to update address');
    } finally {
      setSaving(false);
    }
  };

  const renderOrderDetails = () => {
    if (!selectedOrder) return null;

    const statuses = ['Pending Confirmation', 'Confirmed', 'Ready for Pickup', 'Shipped', 'Delivered'];
    const currentIdx = statuses.indexOf(selectedOrder.status);
    const isCancelled = selectedOrder.status === 'Cancelled';
    const canChangeAddress = ['Pending Confirmation', 'Confirmed', 'Ready for Pickup'].includes(selectedOrder.status);

    return (
      <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
        <button 
          onClick={() => setSelectedOrder(null)} 
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Orders
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              Order #{selectedOrder._id.slice(-6).toUpperCase()}
            </h2>
            <p className="text-gray-500 mt-1">Placed on {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-2xl font-bold text-gray-900">₹{selectedOrder.totalAmount?.toLocaleString()}</p>
            <p className="text-sm text-gray-500">Paid via {selectedOrder.paymentMethod || 'Razorpay'}</p>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="mb-10 bg-gray-50 rounded-xl p-6 border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-6">Order Status</h3>
          {isCancelled ? (
             <div className="flex items-center gap-3 text-red-600 font-bold bg-red-50 p-4 rounded-lg border border-red-100">
               <X className="w-6 h-6" /> Order Cancelled
             </div>
          ) : (
            <div className="relative flex justify-between items-center max-w-2xl mx-auto">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 w-full -z-10 rounded-full"></div>
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 -z-10 rounded-full transition-all duration-500" 
                style={{ width: `${Math.max(0, (currentIdx / (statuses.length - 1)) * 100)}%` }}
              ></div>
              
              {statuses.map((status, idx) => {
                const isCompleted = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <div key={status} className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors duration-300 ${isCompleted ? 'bg-green-500 text-white shadow-lg shadow-green-200' : 'bg-gray-200 text-gray-400'}`}>
                      {isCompleted ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-medium text-center hidden sm:block ${isCurrent ? 'text-green-600 font-bold' : 'text-gray-500'}`}>
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Items */}
          <div className="md:col-span-2 space-y-6">
            <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-400" /> Order Items
            </h3>
            <div className="space-y-4">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors bg-white">
                  <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                    {item.product?.images?.[0] && (
                      <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-gray-900 leading-snug">{item.product?.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-bold text-gray-900 mt-2">
                      ₹{item.price?.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Details & Actions */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-rose-500"></div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-gray-400" /> Delivery Address
                </h3>
                {canChangeAddress && !isEditingAddress && (
                  <button 
                    onClick={() => {
                      setEditAddressData({
                        address: selectedOrder.address || '',
                        city: selectedOrder.city || '',
                        zipCode: selectedOrder.zipCode || ''
                      });
                      setIsEditingAddress(true);
                    }}
                    className="text-xs font-bold text-pink-600 hover:text-pink-700 bg-pink-50 px-2 py-1 rounded-md"
                  >
                    Edit
                  </button>
                )}
              </div>

              {isEditingAddress ? (
                <div className="space-y-3 animate-in fade-in">
                  <input 
                    type="text" 
                    value={editAddressData.address} 
                    onChange={e => setEditAddressData({...editAddressData, address: e.target.value})}
                    placeholder="Street Address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="text" 
                      value={editAddressData.city} 
                      onChange={e => setEditAddressData({...editAddressData, city: e.target.value})}
                      placeholder="City"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <input 
                      type="text" 
                      value={editAddressData.zipCode} 
                      onChange={e => setEditAddressData({...editAddressData, zipCode: e.target.value})}
                      placeholder="Pincode"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={handleUpdateAddress} disabled={saving} className="flex-1 bg-pink-600 text-white text-xs font-bold py-2 rounded-lg">
                      Save
                    </button>
                    <button onClick={() => setIsEditingAddress(false)} className="flex-1 bg-gray-200 text-gray-700 text-xs font-bold py-2 rounded-lg">
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-1 text-sm text-gray-600">
                  <p className="font-bold text-gray-900">{selectedOrder.fullName}</p>
                  <p>{selectedOrder.address}</p>
                  <p>{selectedOrder.city} - {selectedOrder.zipCode}</p>
                  <p className="pt-2 text-gray-500 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-gray-200 flex items-center justify-center text-[10px]">📞</span>
                    {selectedOrder.phoneNumber}
                  </p>
                </div>
              )}
            </div>

            {canChangeAddress && !isCancelled && (
              <button 
                onClick={() => handleCancelOrder(selectedOrder._id)}
                className="w-full py-3 px-4 border-2 border-red-100 text-red-600 hover:bg-red-50 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-5 h-5" /> Cancel Order
              </button>
            )}
            
            <a 
              href="https://wa.me/919876543210" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-3 px-4 bg-green-500 text-white hover:bg-green-600 font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-100"
            >
              Need Help? Chat with us
            </a>

          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 font-sans">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Welcome Header */}
        <div className="mb-8">
           {/* Can add a welcome banner here if needed */}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* User Info Header */}
              <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-600 font-bold text-xl">
                  {formData.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs text-gray-500">Hello,</p>
                  <h3 className="font-bold text-gray-900 truncate max-w-[150px]">{formData.name}</h3>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === item.id
                          ? 'bg-pink-50 text-pink-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${activeTab === item.id ? 'text-pink-600' : 'text-gray-400'}`} />
                      {item.label}
                    </button>
                  );
                })}
                
                <div className="my-2 border-t border-gray-100"></div>
                
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1">
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-gray-900">Personal Information</h2>
                  {!isEditing && (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 text-pink-600 font-medium hover:text-pink-700"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all outline-none"
                    />
                  </div>

                  {/* Email Address */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing} // Usually email is not editable or requires verification
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all outline-none"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Mobile Number</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Enter mobile number"
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 disabled:bg-gray-50 disabled:text-gray-500 transition-all outline-none"
                    />
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Gender</label>
                    <div className="flex gap-6 py-2.5">
                      {['Male', 'Female', 'Other'].map((option) => (
                        <label key={option} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="gender"
                            value={option.toLowerCase()}
                            checked={formData.gender === option.toLowerCase()}
                            onChange={handleInputChange}
                            disabled={!isEditing}
                            className="w-4 h-4 text-pink-600 focus:ring-pink-500 border-gray-300"
                          />
                          <span className={`text-sm ${!isEditing ? 'text-gray-500' : 'text-gray-700'}`}>
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Save/Cancel Buttons */}
                {isEditing && (
                  <div className="flex gap-4 mt-8">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-2.5 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
                      className="px-6 py-2.5 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'dashboard' && (
               <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
                 <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                    <LayoutDashboard className="w-8 h-8 text-pink-500" />
                 </div>
                 <h3 className="text-lg font-bold text-gray-900 mb-2">Welcome to your Dashboard</h3>
                 <p className="text-gray-500 max-w-sm">
                   From here you can manage your orders, check your profile details, and manage your addresses.
                 </p>
               </div>
            )}

            {activeTab === 'orders' && (
              selectedOrder ? renderOrderDetails() : (
                <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">My Orders</h2>
                  {ordersLoading ? (
                    <div className="flex justify-center py-12">
                      <Loader className="w-8 h-8 animate-spin text-pink-500" />
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
                      <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                        <ShoppingBag className="w-8 h-8 text-pink-500" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">No Orders Yet</h3>
                      <p className="text-gray-500 max-w-sm">
                        You haven't placed any orders yet. Start shopping to see your orders here!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div 
                          key={order._id} 
                          onClick={() => setSelectedOrder(order)}
                          className="border border-gray-200 rounded-xl p-4 sm:p-6 hover:border-pink-300 hover:shadow-md cursor-pointer transition-all bg-white group"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 border-b border-gray-100 pb-4 relative">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block pr-2">
                              <ChevronRight className="w-6 h-6 text-pink-400" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-mono text-sm font-bold text-gray-900">#{order._id.slice(-6).toUpperCase()}</span>
                                <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                  order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                  order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                  'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                Placed on {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right sm:pr-8">
                              <p className="text-lg font-bold text-gray-900">₹{order.totalAmount?.toLocaleString()}</p>
                              <p className="text-xs text-gray-500 mb-2">{order.items.length} Items</p>
                            </div>
                          </div>
                          
                          <div className="space-y-3">
                            {order.items.map((item, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                  {item.product?.images?.[0] && (
                                    <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{item.product?.name}</p>
                                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            )}

            {activeTab === 'addresses' && (
              <div className="bg-white rounded-xl shadow-sm p-6 lg:p-8">
                {!isAddingNewAddr ? (
                  <>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-bold text-gray-900">Saved Addresses</h2>
                      <button 
                        onClick={() => {
                          setAddrFormData({ name: '', phone: '', pincode: '', locality: '', address: '', city: '', state: '', landmark: '', alternatePhone: '', type: 'Home' });
                          setEditingAddrId(null);
                          setIsAddingNewAddr(true);
                        }}
                        className="px-4 py-2 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition-colors"
                      >
                        + Add New Address
                      </button>
                    </div>

                    {userAddresses.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-gray-200 rounded-xl">
                        <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                           <MapPin className="w-8 h-8 text-pink-500" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No Addresses Found</h3>
                        <p className="text-gray-500 max-w-sm mb-6">
                          Add a delivery address to checkout faster.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userAddresses.map(addr => (
                          <div key={addr._id} className="border border-gray-200 p-4 rounded-xl relative group hover:border-pink-300 transition-colors bg-white">
                            <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md font-bold mb-2">
                              {addr.type}
                            </span>
                            <h4 className="font-bold text-gray-900">{addr.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{addr.address}, {addr.locality}</p>
                            <p className="text-sm text-gray-600">{addr.city}, {addr.state} - <span className="font-bold">{addr.pincode}</span></p>
                            <p className="text-sm text-gray-600 mt-2">Phone: <span className="font-medium">{addr.phone}</span></p>
                            
                            <div className="flex gap-4 mt-4 pt-4 border-t border-gray-100">
                              <button onClick={() => openEditAddress(addr)} className="text-sm font-bold text-blue-600 hover:text-blue-700">Edit</button>
                              <button onClick={() => handleDeleteUserAddress(addr._id)} className="text-sm font-bold text-red-600 hover:text-red-700">Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <button onClick={() => setIsAddingNewAddr(false)} className="text-gray-500 hover:text-gray-900">
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                      <h2 className="text-xl font-bold text-gray-900">{editingAddrId ? 'Edit Address' : 'Add New Address'}</h2>
                    </div>

                    <form onSubmit={handleSaveUserAddress} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="name" value={addrFormData.name} onChange={handleAddrInputChange} placeholder="Full Name" required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-pink-500 outline-none" />
                        <input type="tel" name="phone" value={addrFormData.phone} onChange={handleAddrInputChange} placeholder="10-digit Mobile Number" required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-pink-500 outline-none" />
                        <input type="text" name="pincode" value={addrFormData.pincode} onChange={handleAddrInputChange} placeholder="Pincode" required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-pink-500 outline-none" />
                        <input type="text" name="locality" value={addrFormData.locality} onChange={handleAddrInputChange} placeholder="Locality" required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-pink-500 outline-none" />
                      </div>
                      <textarea name="address" value={addrFormData.address} onChange={handleAddrInputChange} placeholder="Address (Area and Street)" required rows="3" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-pink-500 outline-none"></textarea>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" name="city" value={addrFormData.city} onChange={handleAddrInputChange} placeholder="City/District/Town" required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-pink-500 outline-none" />
                        <input type="text" name="state" value={addrFormData.state} onChange={handleAddrInputChange} placeholder="State" required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-pink-500 outline-none" />
                        <input type="text" name="landmark" value={addrFormData.landmark} onChange={handleAddrInputChange} placeholder="Landmark (Optional)" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-pink-500 outline-none" />
                        <input type="tel" name="alternatePhone" value={addrFormData.alternatePhone} onChange={handleAddrInputChange} placeholder="Alternate Phone (Optional)" className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-pink-500 outline-none" />
                      </div>
                      
                      <div className="pt-2">
                        <p className="text-sm text-gray-600 mb-2 font-medium">Address Type</p>
                        <div className="flex gap-4">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="type" value="Home" checked={addrFormData.type === 'Home'} onChange={handleAddrInputChange} className="text-pink-600 focus:ring-pink-500" />
                            <span className="text-sm">Home (All day delivery)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="type" value="Work" checked={addrFormData.type === 'Work'} onChange={handleAddrInputChange} className="text-pink-600 focus:ring-pink-500" />
                            <span className="text-sm">Work (Delivery between 10 AM - 5 PM)</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={saving} className="px-8 py-3 bg-pink-600 text-white font-bold rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-70">
                          {saving ? 'Saving...' : 'Save Address'}
                        </button>
                        <button type="button" onClick={() => setIsAddingNewAddr(false)} className="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors">
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}