import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../services/api';
import { LayoutDashboard, ShoppingBag, User, MapPin, LogOut, Edit2, Loader, ChevronRight, ArrowLeft, Check, Truck, Package, X, Star, Camera, Heart } from 'lucide-react';

export default function Dashboard() {
  const { user, logout, updateUser } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get('tab');
    if (tab) return tab;
    if (window.location.pathname === '/profile') return 'profile';
    return 'dashboard';
  });
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

  // Review Modal States inside Dashboard
  const [reviewProduct, setReviewProduct] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(false);
  const [reviewEligibility, setReviewEligibility] = useState({ canReview: false, hasReviewed: false });
  
  const [dbRatingInput, setDbRatingInput] = useState(5);
  const [dbRatingHover, setDbRatingHover] = useState(0);
  const [dbCommentInput, setDbCommentInput] = useState('');
  const [dbSelectedFiles, setDbSelectedFiles] = useState([]);
  const [dbPreviewUrls, setDbPreviewUrls] = useState([]);
  const [dbSubmitting, setDbSubmitting] = useState(false);
  const [dbFormError, setDbFormError] = useState('');
  const [dbFormSuccess, setDbFormSuccess] = useState('');

  // Manage Addresses States
  const [userAddresses, setUserAddresses] = useState([]);
  const [isAddingNewAddr, setIsAddingNewAddr] = useState(false);
  const [editingAddrId, setEditingAddrId] = useState(null);
  const [addrFormData, setAddrFormData] = useState({
    name: '', phone: '', pincode: '', locality: '', address: '', city: '', state: '', landmark: '', alternatePhone: '', type: 'Home'
  });

  useEffect(() => {
    if (activeTab === 'orders' || activeTab === 'dashboard') {
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
          gender: userData.gender ? userData.gender.toLowerCase() : ''
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
      const updatedData = res.data;
      updateUser({ ...user, ...updatedData });
      setFormData({
        name: updatedData.name || '',
        email: updatedData.email || '',
        mobile: updatedData.mobile || '',
        gender: updatedData.gender ? updatedData.gender.toLowerCase() : ''
      });
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

  const handleOpenReviewModal = async (product) => {
    setReviewProduct(product);
    setIsReviewModalOpen(true);
    setCheckingEligibility(true);
    setDbRatingInput(5);
    setDbCommentInput('');
    setDbSelectedFiles([]);
    dbPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setDbPreviewUrls([]);
    setDbFormError('');
    setDbFormSuccess('');
    
    try {
      const res = await api.get(`/reviews/product/${product._id}/can-review`);
      setReviewEligibility(res.data);
    } catch (err) {
      console.error('Failed to check eligibility:', err);
      setDbFormError('Failed to verify review eligibility.');
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleDbFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [...dbSelectedFiles, ...files].slice(0, 5);
    setDbSelectedFiles(newFiles);

    dbPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    const urls = newFiles.map(file => URL.createObjectURL(file));
    setDbPreviewUrls(urls);
  };

  const removeDbFile = (index) => {
    const newFiles = dbSelectedFiles.filter((_, idx) => idx !== index);
    setDbSelectedFiles(newFiles);

    dbPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    const urls = newFiles.map(file => URL.createObjectURL(file));
    setDbPreviewUrls(urls);
  };

  const handleDbReviewSubmit = async (e) => {
    e.preventDefault();
    if (!dbCommentInput.trim()) {
      setDbFormError('Please enter a comment.');
      return;
    }
    setDbSubmitting(true);
    setDbFormError('');
    setDbFormSuccess('');

    const formData = new FormData();
    formData.append('rating', dbRatingInput);
    formData.append('comment', dbCommentInput);
    dbSelectedFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      await api.post(`/reviews/product/${reviewProduct._id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setDbFormSuccess('Review submitted successfully!');
      setDbCommentInput('');
      setDbSelectedFiles([]);
      dbPreviewUrls.forEach(url => URL.revokeObjectURL(url));
      setDbPreviewUrls([]);
      
      setReviewEligibility({ canReview: false, hasReviewed: true });
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewProduct(null);
      }, 1500);
    } catch (err) {
      console.error(err);
      setDbFormError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setDbSubmitting(false);
    }
  };

  const renderOrderDetails = () => {
    if (!selectedOrder) return null;

    const statuses = ['Pending Confirmation', 'Confirmed', 'Ready for Pickup', 'Shipped', 'Delivered'];
    const currentIdx = statuses.indexOf(selectedOrder.status);
    const isCancelled = selectedOrder.status === 'Cancelled';
    const canChangeAddress = ['Pending Confirmation', 'Confirmed', 'Ready for Pickup'].includes(selectedOrder.status);

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:p-8 animate-in fade-in slide-in-from-right-4 duration-300">
        <button 
          onClick={() => setSelectedOrder(null)} 
          className="flex items-center gap-2 text-slate-500 hover:text-[#fc2779] mb-6 transition-colors text-sm font-semibold cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center gap-3">
              Order <span className="font-mono text-[#fc2779]">#{selectedOrder._id.slice(-6).toUpperCase()}</span>
            </h2>
            <p className="text-slate-400 text-xs mt-1.5 font-medium">
              Placed on {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="text-left sm:text-right bg-slate-50 border border-slate-100 px-4 py-2.5 rounded-xl">
            <p className="text-xs text-slate-400 font-medium">Total Amount</p>
            <p className="text-xl font-extrabold text-[#fc2779] mt-0.5">₹{selectedOrder.totalAmount?.toLocaleString()}</p>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="mb-10 bg-slate-50/50 rounded-2xl p-6 border border-slate-100/60">
          <h3 className="font-bold text-slate-800 text-sm mb-6 uppercase tracking-wider">Order Status</h3>
          {isCancelled ? (
             <div className="flex items-center gap-3 text-rose-700 bg-rose-50 p-4 rounded-xl border border-rose-100 text-sm font-bold">
               <X className="w-5 h-5 bg-rose-100 rounded-full p-1" /> Order Cancelled
             </div>
          ) : (
            <div className="relative flex justify-between items-center max-w-2xl mx-auto px-4">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 w-full -z-10 rounded-full"></div>
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 -z-10 rounded-full transition-all duration-500" 
                style={{ width: `${Math.max(0, (currentIdx / (statuses.length - 1)) * 100)}%` }}
              ></div>
              
              {statuses.map((status, idx) => {
                const isCompleted = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <div key={status} className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                      isCompleted 
                        ? 'bg-green-500 text-white shadow-md shadow-green-100' 
                        : 'bg-slate-200 text-slate-400'
                    }`}>
                      {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                    </div>
                    <span className={`text-[10px] sm:text-xs font-semibold text-center hidden sm:block ${
                      isCurrent ? 'text-green-600 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                    }`}>
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
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Package className="w-5 h-5 text-slate-400" /> Order Items
            </h3>
            <div className="space-y-4">
              {selectedOrder.items.map((item, idx) => (
                <div key={idx} className="flex gap-4 p-4 border border-slate-100 rounded-2xl hover:border-pink-200 hover:shadow-sm transition-all bg-white group/item">
                  {item.product ? (
                    <Link to={`/product/${item.product._id}`} className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm hover:opacity-85 transition-opacity flex items-center justify-center">
                      {item.product.images?.[0] ? (
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-slate-400">No Img</span>
                      )}
                    </Link>
                  ) : (
                    <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm flex items-center justify-center">
                      {item.product?.images?.[0] ? (
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-slate-400">No Img</span>
                      )}
                    </div>
                  )}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      {item.product ? (
                        <Link to={`/product/${item.product._id}`} className="hover:text-[#fc2779] transition-colors inline-block">
                          <h4 className="font-bold text-slate-850 leading-snug text-sm">{item.product.name}</h4>
                        </Link>
                      ) : (
                        <h4 className="font-bold text-slate-850 leading-snug text-sm">{item.product?.name}</h4>
                      )}
                      <p className="text-xs text-slate-400 mt-1 font-semibold">Qty: {item.quantity}</p>
                    </div>
                    <div className="flex justify-between items-end mt-2">
                      <div className="font-bold text-slate-900 text-sm">
                        ₹{item.price?.toLocaleString()}
                      </div>
                      {selectedOrder.status === 'Delivered' && item.product && (
                        <button
                          onClick={() => handleOpenReviewModal(item.product)}
                          className="text-xs font-bold text-pink-600 hover:text-white hover:bg-pink-600 bg-pink-50/50 px-3 py-1.5 rounded-lg border border-pink-100 transition-all duration-250 cursor-pointer"
                        >
                          Write Review
                        </button>
                      )}
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
          <div className={`w-full lg:w-72 flex-shrink-0 ${activeTab === 'dashboard' ? 'block' : 'hidden lg:block'}`}>
            {/* Mobile Account Home View */}
            <div className="lg:hidden space-y-6 animate-in fade-in duration-300">
              {/* Profile Card Banner */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-[#fc2779] via-[#d61f66] to-[#4f46e5] p-6 text-white shadow-xl">
                <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-16 h-16 bg-white text-pink-600 rounded-full flex items-center justify-center font-bold text-2xl shadow-lg ring-4 ring-white/30">
                    {formData.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-pink-100 font-medium">Welcome back,</p>
                    <h3 className="font-bold text-lg truncate">{formData.name}</h3>
                    <p className="text-xs text-indigo-100 truncate mt-0.5">{formData.email}</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 gap-4">
                {[
                  { id: 'orders', label: 'My Orders', desc: 'Track, cancel or review orders', icon: ShoppingBag, color: 'bg-pink-50 text-[#fc2779]' },
                  { id: 'profile', label: 'My Profile', desc: 'Edit email, phone & gender', icon: User, color: 'bg-indigo-50 text-indigo-600' },
                  { id: 'addresses', label: 'Manage Addresses', desc: 'Save & edit delivery address', icon: MapPin, color: 'bg-teal-50 text-teal-600' },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-[#fc2779]/30 transition-all text-left group active:bg-gray-50 cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color} font-bold`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 group-hover:text-[#fc2779] transition-colors">{item.label}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#fc2779] transition-colors" />
                    </button>
                  );
                })}

                {/* Additional Link for Wishlist */}
                <Link
                  to="/wishlist"
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-[#fc2779]/30 transition-all text-left group active:bg-gray-50 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-rose-50 text-rose-600 font-bold">
                      <Heart className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 group-hover:text-rose-600 transition-colors">My Wishlist</h4>
                      <p className="text-xs text-gray-500 mt-0.5">Products saved to buy later</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-rose-600 transition-colors" />
                </Link>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="w-full py-4 px-6 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl border border-red-100 transition-colors flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
              >
                <LogOut className="w-5 h-5" />
                Log Out from Account
              </button>
            </div>

            {/* Desktop Account View */}
            <div className="hidden lg:block bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              {/* User Info Header */}
              <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-[#fc2779] font-bold text-xl">
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
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        activeTab === item.id
                          ? 'bg-pink-50 text-[#fc2779] font-semibold'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${activeTab === item.id ? 'text-[#fc2779]' : 'text-gray-400'}`} />
                      {item.label}
                    </button>
                  );
                })}
                
                <div className="my-2 border-t border-gray-100"></div>
                
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className={`flex-1 min-w-0 ${activeTab === 'dashboard' ? 'hidden lg:block' : 'block'}`}>
            {/* Mobile View Active Tab Header */}
            {activeTab !== 'dashboard' && (
              <div className="lg:hidden flex items-center gap-3 mb-6 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <button 
                  onClick={() => {
                    if (activeTab === 'orders' && selectedOrder) {
                      setSelectedOrder(null);
                    } else {
                      setActiveTab('dashboard');
                    }
                  }} 
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <span className="font-bold text-gray-900 text-sm uppercase tracking-wider">
                  {activeTab === 'profile' ? 'Personal Information' : 
                   activeTab === 'orders' ? (selectedOrder ? `Order Details` : 'My Orders') : 
                   'Manage Addresses'}
                </span>
              </div>
            )}
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
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Profile Card Banner */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-tr from-[#fc2779] via-[#d61f66] to-[#4f46e5] p-8 text-white shadow-xl">
                  <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                  <div className="absolute -left-10 -top-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                  
                  <div className="flex justify-between items-center relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-white text-pink-600 rounded-full flex items-center justify-center font-bold text-3xl shadow-lg ring-4 ring-white/30">
                        {formData.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm text-pink-100 font-medium">Hello & Welcome,</p>
                        <h2 className="font-bold text-2xl md:text-3xl mt-0.5">{formData.name}</h2>
                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-pink-50">
                          <span className="flex items-center gap-1">✉️ {formData.email}</span>
                          {formData.mobile && <span className="flex items-center gap-1">📞 {formData.mobile}</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="hidden md:flex gap-6 text-center text-white border-l border-white/20 pl-8">
                      <div>
                        <p className="text-2xl font-bold">{orders.length}</p>
                        <p className="text-xs text-pink-100 mt-1 uppercase font-semibold tracking-wider">Orders</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{userAddresses.length}</p>
                        <p className="text-xs text-pink-100 mt-1 uppercase font-semibold tracking-wider">Addresses</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Navigation Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { id: 'orders', label: 'My Orders', desc: 'Track, cancel or review orders', icon: ShoppingBag, color: 'bg-pink-50 text-[#fc2779]' },
                    { id: 'profile', label: 'My Profile', desc: 'Edit email, phone & gender', icon: User, color: 'bg-indigo-50 text-indigo-600' },
                    { id: 'addresses', label: 'Manage Addresses', desc: 'Save & edit delivery address', icon: MapPin, color: 'bg-teal-50 text-teal-600' },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className="flex flex-col p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-[#fc2779]/30 hover:shadow-md transition-all text-left group cursor-pointer"
                      >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.color} font-bold mb-4`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <h4 className="font-bold text-gray-900 group-hover:text-[#fc2779] transition-colors">{item.label}</h4>
                        <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                      </button>
                    );
                  })}

                  <Link
                    to="/wishlist"
                    className="flex flex-col p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:border-rose-600/30 hover:shadow-md transition-all text-left group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-rose-50 text-rose-600 font-bold mb-4">
                      <Heart className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-gray-900 group-hover:text-rose-600 transition-colors">My Wishlist</h4>
                    <p className="text-xs text-gray-500 mt-1">Products saved to buy later</p>
                  </Link>
                </div>

                {/* Recent Order Preview */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                  <h3 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                    📦 Recent Order
                  </h3>

                  {ordersLoading ? (
                    <div className="flex justify-center py-6">
                      <Loader className="w-6 h-6 animate-spin text-pink-500" />
                    </div>
                  ) : orders.length > 0 ? (
                    (() => {
                      const latestOrder = orders[0];
                      return (
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 p-5 border border-gray-100 rounded-xl bg-gray-50/50">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-gray-900">#{latestOrder._id.slice(-6).toUpperCase()}</span>
                              <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                                latestOrder.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                latestOrder.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}>
                                {latestOrder.status}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">
                              Placed on {new Date(latestOrder.createdAt).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-600">
                              Items: {latestOrder.items.map(item => item.product?.name).filter(Boolean).join(', ')}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                            <div className="text-left md:text-right">
                              <p className="text-lg font-bold text-gray-900">₹{latestOrder.totalAmount?.toLocaleString()}</p>
                              <p className="text-xs text-gray-500">{latestOrder.items.length} items</p>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedOrder(latestOrder);
                                setActiveTab('orders');
                              }}
                              className="px-4 py-2 bg-[#fc2779] text-white hover:bg-[#d61f66] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                            >
                              Track / Details
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm mb-4">You haven't placed any orders yet.</p>
                      <Link
                        to="/shop"
                        className="inline-block px-6 py-2 bg-[#fc2779] hover:bg-[#d61f66] text-white text-xs font-bold rounded-lg transition-colors"
                      >
                        Start Shopping
                      </Link>
                    </div>
                  )}
                </div>
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
                      {orders.map((order) => {
                        const dateFormatted = new Date(order.createdAt).toLocaleDateString('en-US', { 
                          day: 'numeric', 
                          month: 'short', 
                          year: 'numeric' 
                        });
                        
                        return (
                          <div 
                            key={order._id} 
                            onClick={() => setSelectedOrder(order)}
                            className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md hover:border-pink-200 transition-all duration-300 overflow-hidden flex flex-col group cursor-pointer"
                          >
                            {/* Card Header */}
                            <div className="bg-slate-50/80 px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex flex-wrap items-center gap-2.5">
                                <span className="font-mono text-sm font-bold text-slate-800">
                                  #{order._id.slice(-6).toUpperCase()}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border ${
                                  order.status === 'Delivered' 
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                                    : order.status === 'Cancelled' 
                                    ? 'bg-rose-50 text-rose-800 border-rose-100' 
                                    : 'bg-amber-50 text-amber-800 border-amber-100'
                                }`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${
                                    order.status === 'Delivered' 
                                      ? 'bg-emerald-500 animate-pulse' 
                                      : order.status === 'Cancelled' 
                                      ? 'bg-rose-500' 
                                      : 'bg-amber-500 animate-pulse'
                                  }`}></span>
                                  {order.status}
                                </span>
                              </div>
                              <span className="text-xs text-slate-400 font-medium">
                                Placed on {dateFormatted}
                              </span>
                            </div>

                            {/* Card Body (Products List) */}
                            <div className="p-5 space-y-4">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4 group/item">
                                  <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm flex items-center justify-center">
                                    {item.product?.images?.[0] ? (
                                      <img 
                                        src={item.product.images[0]} 
                                        alt={item.product.name} 
                                        className="w-full h-full object-cover group-hover/item:scale-105 transition-transform duration-200" 
                                      />
                                    ) : (
                                      <span className="text-xs text-slate-400">No Img</span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-slate-800 line-clamp-2 group-hover:text-[#fc2779] transition-colors duration-150">
                                      {item.product?.name || 'Product'}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1 font-medium">
                                      Qty: {item.quantity} • ₹{item.price?.toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Card Footer */}
                            <div className="bg-slate-50/40 px-5 py-3 border-t border-slate-100 flex items-center justify-between gap-4">
                              <div className="flex flex-col">
                                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Price</span>
                                <span className="text-base font-extrabold text-slate-800 mt-0.5">
                                  ₹{order.totalAmount?.toLocaleString()}
                                </span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedOrder(order);
                                }}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
                              >
                                <span>Track / Details</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
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
        {/* ================= REVIEW WRITING MODAL ================= */}
        {isReviewModalOpen && reviewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-900 text-lg">Write Product Review</h3>
                <button 
                  onClick={() => {
                    setIsReviewModalOpen(false);
                    setReviewProduct(null);
                  }}
                  className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 max-h-[75vh] overflow-y-auto">
                <div className="flex gap-4 items-center mb-6 pb-4 border-b border-gray-50">
                  <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex-shrink-0">
                    {reviewProduct.images?.[0] && (
                      <img src={reviewProduct.images[0]} alt={reviewProduct.name} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <h4 className="font-bold text-gray-800 leading-snug text-sm">{reviewProduct.name}</h4>
                </div>

                {checkingEligibility ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader className="w-8 h-8 animate-spin text-pink-600 mb-2" />
                    <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Verifying Eligibility...</p>
                  </div>
                ) : reviewEligibility.hasReviewed ? (
                  <div className="text-center py-8">
                    <Check className="w-12 h-12 text-green-500 mx-auto mb-3 bg-green-50 rounded-full p-2.5" />
                    <p className="text-gray-700 font-bold text-base mb-1">Already Reviewed</p>
                    <p className="text-gray-500 text-sm">You have already submitted a review for this product.</p>
                  </div>
                ) : (
                  <form onSubmit={handleDbReviewSubmit} className="space-y-4">
                    {/* Star Rating selector */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Overall Rating</label>
                      <div className="flex items-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onMouseEnter={() => setDbRatingHover(star)}
                            onMouseLeave={() => setDbRatingHover(0)}
                            onClick={() => setDbRatingInput(star)}
                            className="focus:outline-none transition-transform duration-100 active:scale-95"
                          >
                            <Star 
                              className={`w-7 h-7 cursor-pointer ${
                                (dbRatingHover || dbRatingInput) >= star 
                                  ? 'fill-amber-400 text-amber-400' 
                                  : 'text-gray-300 hover:text-amber-300'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Comment text */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Your Review</label>
                      <textarea
                        rows="3"
                        required
                        minLength={5}
                        placeholder="What did you like or dislike? Share your experience..."
                        value={dbCommentInput}
                        onChange={(e) => setDbCommentInput(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white placeholder-gray-400 text-slate-800 text-sm transition-all"
                      />
                    </div>

                    {/* Image selector & previews */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Upload product images (Max 5)</label>
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 hover:border-pink-500 cursor-pointer flex flex-col items-center justify-center text-gray-400 hover:text-pink-500 transition-colors">
                          <Camera className="w-5 h-5" />
                          <span className="text-[9px] font-bold mt-1">Add Image</span>
                          <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleDbFileChange}
                            className="hidden"
                            disabled={dbSelectedFiles.length >= 5}
                          />
                        </label>

                        {dbPreviewUrls.map((url, idx) => (
                          <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
                            <img src={url} alt="preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeDbFile(idx)}
                              className="absolute -top-1 -right-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 shadow-md transition-colors"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {dbFormError && (
                      <div className="text-sm text-red-600 font-medium bg-red-50 px-4 py-2.5 rounded-lg border border-red-100">
                        {dbFormError}
                      </div>
                    )}

                    {dbFormSuccess && (
                      <div className="text-sm text-green-600 font-medium bg-green-50 px-4 py-2.5 rounded-lg border border-green-100">
                        {dbFormSuccess}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={dbSubmitting}
                      className="w-full py-3 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-pink-100 hover:shadow-pink-200/50 transition-all duration-200 cursor-pointer text-sm"
                    >
                      {dbSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}