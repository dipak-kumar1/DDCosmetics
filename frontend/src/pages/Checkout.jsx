import React, { useContext, useMemo, useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Truck, Package, Info, CheckCircle, AlertCircle, MapPin, CreditCard, ChevronRight, Plus, MessageCircle } from 'lucide-react';
import api from '../services/api';

const PHONE_REGEX = /^[6-9]\d{9}$/;
const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); // 1: Delivery, 2: Summary, 3: Payment
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successOrderDetails, setSuccessOrderDetails] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [error, setError] = useState('');
  
  const [savedAddresses, setSavedAddresses] = useState(user?.addresses || []);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [isDeliverable, setIsDeliverable] = useState(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.mobile || '',
    orderType: 'delivery',
    pincode: '',
    locality: '',
    address: '',
    city: '',
    state: '',
    landmark: '',
    alternatePhone: '',
    type: 'Home'
  });

  useEffect(() => {
    loadScript('https://checkout.razorpay.com/v1/checkout.js');
    
    const fetchLatestUser = async () => {
      try {
        const res = await api.get('/auth/me');
        const userData = res.data.user || res.data;
        if (userData?.addresses?.length > 0) {
          setSavedAddresses(userData.addresses);
          const defaultAddr = userData.addresses.find(a => a.isDefault) || userData.addresses[0];
          setSelectedAddress(defaultAddr);
          setIsAddingNewAddress(false);
          updateUser(userData);
        } else {
          setSavedAddresses([]);
          setIsAddingNewAddress(true);
        }
      } catch (err) {
        console.error('Failed to fetch user addresses:', err);
        // Fallback to context
        if (user?.addresses?.length > 0) {
          setSavedAddresses(user.addresses);
          const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
          setSelectedAddress(defaultAddr);
          setIsAddingNewAddress(false);
        } else {
          setIsAddingNewAddress(true);
        }
      }
    };

    fetchLatestUser();
  }, [updateUser, user?.addresses]);

  const checkoutItems = useMemo(() => cart.map((item) => ({
    product: item._id,
    quantity: item.quantity,
  })), [cart]);

  if (cart.length === 0 && !success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <button onClick={() => navigate('/shop')} className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700">
          Start Shopping
        </button>
      </div>
    );
  }

  const handleAddressChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateAddressForm = () => {
    if (!formData.name.trim()) return 'Full name is required.';
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!PHONE_REGEX.test(cleanPhone)) return 'Please enter a valid 10-digit Indian phone number.';
    if (!PINCODE_REGEX.test(formData.pincode)) return 'Please enter a valid 6-digit Pincode.';
    if (!formData.address.trim()) return 'Address line is required.';
    if (!formData.city.trim()) return 'City is required.';
    if (!formData.state.trim()) return 'State is required.';
    return '';
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setError('');
    const validationError = validateAddressForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      let res;
      let addrToSelect;
      if (editingAddressId) {
        res = await api.put(`/users/addresses/${editingAddressId}`, formData);
        setSavedAddresses(res.data);
        addrToSelect = res.data.find(a => a._id === editingAddressId) || res.data[res.data.length - 1];
        updateUser({ ...user, addresses: res.data });
      } else {
        res = await api.post('/users/addresses', formData);
        setSavedAddresses(res.data);
        addrToSelect = res.data[res.data.length - 1];
        updateUser({ ...user, addresses: res.data });
      }
      setSelectedAddress(addrToSelect);
      setIsAddingNewAddress(false);
      setEditingAddressId(null);
      await checkDelivery(addrToSelect.pincode);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save address.');
    } finally {
      setLoading(false);
    }
  };

  const checkDelivery = async (pincode) => {
    setLoading(true);
    setIsDeliverable(null);
    try {
      const res = await api.post('/orders/check-delivery', { pincode });
      setIsDeliverable(res.data.deliverable);
      if (res.data.deliverable) {
        setStep(2); // Move to summary
      } else {
        setError(res.data.message || 'Delivery not available to this location.');
      }
    } catch (err) {
      setError('Failed to check delivery availability.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAddress = async (addr) => {
    setSelectedAddress(addr);
    setIsAddingNewAddress(false);
    await checkDelivery(addr.pincode);
  };

  const startPayment = async () => {
    setError('');
    setPaymentFailed(false);
    
    if (!selectedAddress) {
      setError('Please select a delivery address');
      setStep(1);
      return;
    }

    if (!window.Razorpay) {
      setError('Razorpay SDK failed to load. Please refresh and try again.');
      return;
    }

    setLoading(true);
    try {
      // Create Order on Backend
      const orderPayload = {
        items: checkoutItems,
      };
      
      const createOrderRes = await api.post('/payments/create-order', orderPayload);
      const { orderId: razorpayOrderId, amount, currency, key } = createOrderRes.data;

      const options = {
        key,
        amount,
        currency,
        name: 'DDCosmetics',
        description: 'Order Payment',
        order_id: razorpayOrderId,
        prefill: {
          name: selectedAddress.name,
          email: user?.email || '',
          contact: selectedAddress.phone.replace(/\D/g, ''),
        },
        theme: { color: '#db2777' },
        config: {
          display: {
            blocks: {
              upi: { name: 'Pay via UPI / QR Code', instruments: [{ method: 'upi' }] }
            },
            sequence: ['block.upi'],
            preferences: { show_default_blocks: true }
          }
        },
        handler: async function (response) {
          try {
            setLoading(true);
            const verifyRes = await api.post('/payments/verify-payment', {
              ...response,
              customer: {
                fullName: selectedAddress.name,
                phoneNumber: selectedAddress.phone,
                orderType: 'delivery',
                address: `${selectedAddress.address}, ${selectedAddress.locality}`,
                city: selectedAddress.city,
                zipCode: selectedAddress.pincode,
              },
              items: checkoutItems,
            });

            setSuccessOrderDetails({
              orderId: verifyRes.data.orderId,
              items: [...cart],
              totalAmount: totalPrice(),
              address: selectedAddress,
              estimatedDelivery: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
            });
            setOrderId(verifyRes.data.orderId);
            setSuccess(true);
            clearCart();
          } catch (verifyErr) {
            console.error(verifyErr);
            setPaymentFailed(true);
            setError(verifyErr.response?.data?.message || 'Payment succeeded but verification failed.');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setPaymentFailed(true);
            setError('Payment was cancelled. You can try again.');
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', function (response) {
        setLoading(false);
        setPaymentFailed(true);
        setError(response.error?.description || 'Payment failed. Please try again.');
      });
      razorpay.open();
    } catch (err) {
      console.error(err);
      setLoading(false);
      setPaymentFailed(true);
      setError(err.response?.data?.message || 'Failed to start payment. Please try again.');
    }
  };

  const shareOnWhatsApp = () => {
    if (!successOrderDetails) return;
    const { orderId, items, totalAmount, estimatedDelivery } = successOrderDetails;
    let message = `*Order Successfully Placed! 🎉*\n\n*Order ID:* #${orderId.slice(-6).toUpperCase()}\n*Total Amount:* ₹${totalAmount}\n*Estimated Delivery:* ${estimatedDelivery.toLocaleDateString()}\n\n*Products:*\n`;
    items.forEach(item => {
      message += `- ${item.name} (Qty: ${item.quantity})\n`;
    });
    message += `\nThank you for shopping with DDCosmetics!`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // SUCCESS SCREEN
  if (success && successOrderDetails) {
    const { orderId, items, totalAmount, address, estimatedDelivery } = successOrderDetails;
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-500 to-rose-500"></div>
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
            <p className="text-gray-500 mb-6">Thank you for your order. We've received your payment.</p>
            <div className="inline-block bg-gray-50 border border-gray-100 rounded-xl px-6 py-3">
              <p className="text-sm text-gray-500 mb-1">Order ID</p>
              <p className="font-mono font-bold text-gray-900 text-lg">#{orderId.slice(-6).toUpperCase()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Delivery Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" /> Delivery Details
              </h3>
              <div className="space-y-3">
                <p className="font-bold text-gray-800">{address.name}</p>
                <p className="text-sm text-gray-600">{address.address}, {address.locality}</p>
                <p className="text-sm text-gray-600">{address.city}, {address.state} - {address.pincode}</p>
                <p className="text-sm text-gray-600 flex items-center gap-1 mt-2">
                  <Info className="w-4 h-4 text-gray-400" /> {address.phone}
                </p>
              </div>
              <div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-xl">
                <p className="text-xs text-green-800 font-bold uppercase mb-1">Estimated Delivery</p>
                <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                  <Truck className="w-4 h-4" /> By {estimatedDelivery.toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-400" /> Payment Summary
              </h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-3 border-t border-gray-100">
                  <span>Total Paid</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
                <p className="text-sm font-medium text-blue-800">Payment Successful</p>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-gray-400" /> Order Items ({items.length})
            </h3>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={index} className="flex gap-4 p-4 border border-gray-50 rounded-xl bg-gray-50/50">
                  <img src={item.images?.[0] || 'https://via.placeholder.com/60'} alt={item.name} className="w-16 h-16 object-cover rounded-lg bg-white border border-gray-100" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</p>
                  </div>
                  <div className="font-bold text-gray-900">
                    ₹{item.discountPrice || item.price}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button onClick={shareOnWhatsApp} className="flex-1 bg-green-500 text-white py-4 rounded-xl font-bold hover:bg-green-600 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-green-200">
              <MessageCircle className="w-5 h-5" /> Share via WhatsApp
            </button>
            <button onClick={() => navigate('/shop')} className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Progress Bar */}
        <div className="mb-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -z-10 -translate-y-1/2 mx-12"></div>
          
          <div className="flex flex-col items-center flex-1 z-10 bg-white px-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              <MapPin className="w-5 h-5" />
            </div>
            <span className={`text-xs mt-2 font-medium ${step >= 1 ? 'text-pink-600' : 'text-gray-500'}`}>Address</span>
          </div>
          
          <div className="flex flex-col items-center flex-1 z-10 bg-white px-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors duration-300 ${step >= 2 ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              <Package className="w-5 h-5" />
            </div>
            <span className={`text-xs mt-2 font-medium ${step >= 2 ? 'text-pink-600' : 'text-gray-500'}`}>Summary</span>
          </div>

          <div className="flex flex-col items-center flex-1 z-10 bg-white px-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors duration-300 ${step >= 3 ? 'bg-pink-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
              <CreditCard className="w-5 h-5" />
            </div>
            <span className={`text-xs mt-2 font-medium ${step >= 3 ? 'text-pink-600' : 'text-gray-500'}`}>Payment</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Left Content based on Steps */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* STEP 1: ADDRESS */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gray-900 px-6 py-4">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="bg-pink-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">1</span>
                    Select Delivery Address
                  </h2>
                </div>

                <div className="p-6">
                  {savedAddresses.length > 0 && !isAddingNewAddress ? (
                    <div className="space-y-4">
                      {savedAddresses.map((addr) => (
                        <div key={addr._id || addr.pincode} 
                             className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedAddress?._id === addr._id ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-200'}`}
                             onClick={() => setSelectedAddress(addr)}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <input type="radio" checked={selectedAddress?._id === addr._id} readOnly className="text-pink-600 w-4 h-4" />
                              <span className="font-bold text-gray-900">{addr.name}</span>
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">{addr.type}</span>
                            </div>
                            {selectedAddress?._id === addr._id && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setFormData(addr);
                                  setEditingAddressId(addr._id);
                                  setIsAddingNewAddress(true);
                                }}
                                className="text-xs font-bold text-pink-600 hover:text-pink-700 bg-pink-50 px-3 py-1 rounded-md transition-colors"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm ml-6">{addr.address}, {addr.locality}</p>
                          <p className="text-gray-600 text-sm ml-6">{addr.city}, {addr.state} - <span className="font-medium text-gray-900">{addr.pincode}</span></p>
                          <p className="text-gray-600 text-sm ml-6 mt-1 flex items-center gap-1"><Info className="w-3 h-3"/> {addr.phone}</p>
                          
                          {selectedAddress?._id === addr._id && (
                            <div className="mt-4 ml-6">
                              <button onClick={() => checkDelivery(addr.pincode)} disabled={loading} className="bg-pink-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-pink-700 transition-colors flex items-center gap-2 disabled:opacity-70">
                                {loading ? 'Checking...' : 'Deliver Here'}
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                      <button onClick={() => {
                        setFormData({
                          name: user?.name || '', phone: user?.mobile || '', orderType: 'delivery', pincode: '', locality: '', address: '', city: '', state: '', landmark: '', alternatePhone: '', type: 'Home'
                        });
                        setEditingAddressId(null);
                        setIsAddingNewAddress(true);
                      }} className="flex items-center gap-2 text-pink-600 font-medium mt-4 p-2 hover:bg-pink-50 rounded-lg transition-colors w-full justify-center border border-dashed border-pink-300">
                        <Plus className="w-4 h-4" /> Add a New Address
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSaveAddress} className="space-y-5">
                      <h3 className="font-bold text-gray-900 border-b pb-2">{editingAddressId ? 'Edit Address' : 'Add a New Address'}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                          <input type="text" name="name" value={formData.name} onChange={handleAddressChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">10-digit Mobile Number *</label>
                          <input type="tel" name="phone" value={formData.phone} onChange={handleAddressChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 outline-none transition-all" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
                          <input type="text" name="pincode" value={formData.pincode} onChange={handleAddressChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Locality / Town *</label>
                          <input type="text" name="locality" value={formData.locality} onChange={handleAddressChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 outline-none transition-all" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address (House No, Building, Street, Area) *</label>
                        <textarea name="address" value={formData.address} onChange={handleAddressChange} required rows="2" className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 outline-none transition-all" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">City/District *</label>
                          <input type="text" name="city" value={formData.city} onChange={handleAddressChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                          <input type="text" name="state" value={formData.state} onChange={handleAddressChange} required className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 outline-none transition-all" />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                        <div className="flex gap-4 mt-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="type" value="Home" checked={formData.type === 'Home'} onChange={handleAddressChange} className="text-pink-600" />
                            <span className="text-sm">Home (All day delivery)</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="radio" name="type" value="Work" checked={formData.type === 'Work'} onChange={handleAddressChange} className="text-pink-600" />
                            <span className="text-sm">Work (Delivery between 10 AM - 5 PM)</span>
                          </label>
                        </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                        <button type="submit" disabled={loading} className="bg-pink-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-pink-700 transition-colors flex-1 shadow-md shadow-pink-200">
                          {loading ? 'Saving...' : 'Save and Deliver Here'}
                        </button>
                        {savedAddresses.length > 0 && (
                          <button type="button" onClick={() => {
                            setIsAddingNewAddress(false);
                            setEditingAddressId(null);
                          }} className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: SUMMARY & STEP 3: PAYMENT WAITING */}
            {step >= 2 && (
              <div className="space-y-6">
                
                {/* Collapsed Address Block */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex items-center justify-between p-4 px-6">
                  <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Delivery Address</h3>
                    <p className="font-bold text-gray-900">{selectedAddress?.name} <span className="font-normal text-gray-600 ml-2">{selectedAddress?.address}, {selectedAddress?.city} - {selectedAddress?.pincode}</span></p>
                  </div>
                  {step === 2 && (
                    <button onClick={() => setStep(1)} className="text-pink-600 font-medium hover:bg-pink-50 px-4 py-2 rounded-lg transition-colors border border-pink-100">
                      Change
                    </button>
                  )}
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gray-900 px-6 py-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="bg-pink-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">2</span>
                      Order Summary
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-6 mb-6 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                      {cart.map((item) => (
                        <div key={item._id} className="flex gap-6 border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                          <img src={item.images?.[0] || 'https://via.placeholder.com/100'} alt={item.name} className="w-24 h-24 object-cover rounded-xl bg-gray-50 border border-gray-100" />
                          <div className="flex-1">
                            <h4 className="text-base font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-500 mt-1">Quantity: <span className="font-medium text-gray-900">{item.quantity}</span></p>
                            <div className="mt-3 flex items-center gap-3">
                              <span className="text-xl font-bold text-gray-900">₹{item.discountPrice || item.price}</span>
                              {item.discountPrice && (
                                <span className="text-sm text-gray-400 line-through">₹{item.price}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {step === 2 && (
                      <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-green-800">Delivery Available</p>
                          <p className="text-sm text-green-600 mt-1">Your order will be delivered to {selectedAddress?.pincode} in 3-5 business days.</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
          </div>

          {/* Right Sidebar - Price Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Price Details</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Price ({cart.length} items)</span>
                  <span>₹{totalPrice()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Charges</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t border-gray-100 border-dashed mt-2">
                  <span>Total Amount</span>
                  <span>₹{totalPrice()}</span>
                </div>
              </div>

              {step === 2 && (
                <button
                  onClick={() => setStep(3)}
                  className="w-full bg-pink-600 text-white py-4 rounded-xl font-bold hover:bg-pink-700 transition-colors shadow-lg shadow-pink-200 flex items-center justify-center gap-2"
                >
                  Proceed to Payment <ChevronRight className="w-5 h-5" />
                </button>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-xs text-blue-800 font-medium">
                    <p className="flex items-start gap-2">
                      <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      Razorpay test mode is active. Choose any payment method to complete the test.
                    </p>
                  </div>
                  <button
                    onClick={startPayment}
                    disabled={loading}
                    className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      'Pay Now'
                    )}
                  </button>
                  {paymentFailed && (
                    <p className="text-red-500 text-xs text-center font-medium mt-2">Payment failed, you can retry.</p>
                  )}
                </div>
              )}
              
              <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-xs font-medium">
                <CheckCircle className="w-4 h-4" /> 100% Safe and Secure Payments
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
