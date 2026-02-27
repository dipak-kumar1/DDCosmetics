import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, Truck, Package, Info, CheckCircle } from 'lucide-react';
import api from '../services/api';

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    orderType: 'pickup', // Default to pickup
    address: '',
    city: '',
    zipCode: ''
  });

  const [error, setError] = useState('');

  if (cart.length === 0 && !success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <button 
          onClick={() => navigate('/shop')}
          className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.phoneNumber.length < 10) {
      setError('Please enter a valid phone number (at least 10 digits).');
      setLoading(false);
      return;
    }

    if (formData.orderType === 'delivery' && !formData.address) {
      setError('Please provide a delivery address.');
      setLoading(false);
      return;
    }

    try {
      const orderData = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        orderType: formData.orderType,
        address: formData.orderType === 'delivery' ? formData.address : undefined,
        city: formData.orderType === 'delivery' ? formData.city : undefined,
        zipCode: formData.orderType === 'delivery' ? formData.zipCode : undefined,
        items: cart.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.discountPrice || item.price
        })),
        totalAmount: totalPrice()
      };

      const res = await api.post('/orders', orderData);
      setOrderId(res.data._id);
      setSuccess(true);
      clearCart();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.msg || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-500 mb-8 max-w-md">
          Thank you for shopping with us. Your order ID is <span className="font-mono font-bold text-gray-900">#{orderId?.slice(-6).toUpperCase()}</span>.
          <br/>
          <span className="block mt-4 text-pink-600 font-medium">
            Our team will contact you shortly via WhatsApp/Phone to confirm your order.
          </span>
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => navigate('/dashboard?tab=orders')}
            className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            View Order
          </button>
          <button 
            onClick={() => navigate('/shop')}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8 text-center">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Info className="w-5 h-5 text-pink-500" />
                Customer Information
              </h2>
              
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 outline-none transition-all"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                {/* Order Type Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Order Type <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition-all ${formData.orderType === 'pickup' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-200'}`}>
                      <input 
                        type="radio" 
                        name="orderType" 
                        value="pickup" 
                        checked={formData.orderType === 'pickup'} 
                        onChange={handleChange}
                        className="hidden" 
                      />
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.orderType === 'pickup' ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-500'}`}>
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block font-bold text-gray-900">Store Pickup</span>
                        <span className="text-xs text-gray-500">Ready in 2 hours</span>
                      </div>
                    </label>

                    <label className={`cursor-pointer border-2 rounded-xl p-4 flex items-center gap-3 transition-all ${formData.orderType === 'delivery' ? 'border-pink-500 bg-pink-50' : 'border-gray-200 hover:border-pink-200'}`}>
                      <input 
                        type="radio" 
                        name="orderType" 
                        value="delivery" 
                        checked={formData.orderType === 'delivery'} 
                        onChange={handleChange}
                        className="hidden" 
                      />
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.orderType === 'delivery' ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-500'}`}>
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block font-bold text-gray-900">Local Delivery</span>
                        <span className="text-xs text-gray-500">Free within 3km</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Address Fields (Conditional) */}
                {formData.orderType === 'delivery' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address <span className="text-red-500">*</span></label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required={formData.orderType === 'delivery'}
                        rows="3"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 outline-none transition-all"
                        placeholder="House No, Street, Landmark..."
                      ></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 outline-none transition-all"
                          placeholder="Karimpur"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-pink-100 focus:border-pink-500 outline-none transition-all"
                          placeholder="741152"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item._id} className="flex gap-4">
                    <img 
                      src={item.images?.[0] || 'https://via.placeholder.com/60'} 
                      alt={item.name} 
                      className="w-16 h-16 object-cover rounded-lg bg-gray-50"
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{item.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold text-gray-900 mt-1">₹{item.discountPrice || item.price}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{totalPrice()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100 mt-2">
                  <span>Total</span>
                  <span>₹{totalPrice()}</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                  {error}
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 mb-6">
                <p className="text-sm text-yellow-800 font-medium flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  Online payment is currently unavailable. Our team will contact you shortly to confirm your order.
                </p>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold hover:bg-pink-600 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Place Order <Truck className="w-5 h-5" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
