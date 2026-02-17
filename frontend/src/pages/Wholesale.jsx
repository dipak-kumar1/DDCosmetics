import React from 'react';
import { Package, Mail, Phone, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Wholesale = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">Wholesale Inquiries</h1>
        </div>
      </div>

      <div className="p-6 flex flex-col items-center justify-center text-center mt-8">
        <div className="w-20 h-20 bg-pink-50 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <Package className="w-10 h-10 text-[#fc2779]" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Buy in Bulk?</h2>
        <p className="text-gray-500 mb-8 max-w-xs">
          Get exclusive wholesale prices for your business. Contact us directly for bulk orders and partnerships.
        </p>

        <div className="w-full max-w-sm space-y-4">
          <a href="mailto:wholesale@ddcosmetics.com" className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all bg-white group">
            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-400 font-medium uppercase">Email Us</p>
              <p className="text-sm font-bold text-gray-900">wholesale@ddcosmetics.com</p>
            </div>
          </a>

          <a href="tel:+919876543210" className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all bg-white group">
            <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
              <Phone className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="text-xs text-gray-400 font-medium uppercase">Call Us</p>
              <p className="text-sm font-bold text-gray-900">+91 98765 43210</p>
            </div>
          </a>
        </div>

        <div className="mt-12 p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
          <p>Minimum Order Quantity (MOQ) applies.</p>
          <p>GST invoice available.</p>
        </div>
      </div>
    </div>
  );
};

export default Wholesale;