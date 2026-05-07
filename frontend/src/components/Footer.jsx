import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, Clock, Mail, Truck, Package, ShoppingBag } from 'lucide-react';

const InstagramIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 pt-16 pb-8 font-sans border-t-4 border-pink-600">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* ================= USP SECTION (Local Store Highlights) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 border-b border-gray-800 pb-12">
          <div className="flex items-center gap-4 bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-pink-500/30 transition-colors">
            <div className="w-12 h-12 bg-pink-900/30 rounded-full flex items-center justify-center text-pink-500">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-lg">Same Day Pickup</h4>
              <p className="text-sm text-gray-400">Order online, pick up in-store today.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-pink-500/30 transition-colors">
            <div className="w-12 h-12 bg-pink-900/30 rounded-full flex items-center justify-center text-pink-500">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-lg">Free Local Delivery</h4>
              <p className="text-sm text-gray-400">Free delivery within 3km radius.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-pink-500/30 transition-colors">
            <div className="w-12 h-12 bg-pink-900/30 rounded-full flex items-center justify-center text-pink-500">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-white text-lg">Bulk Orders Accepted</h4>
              <p className="text-sm text-gray-400">Special rates for wholesale orders.</p>
            </div>
          </div>
        </div>

        {/* ================= MAIN FOOTER CONTENT ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          
          {/* Column 1: About Store */}
          <div>
            <h3 className="text-2xl font-serif font-bold text-white mb-6 flex items-center gap-2">
              <span className="text-pink-500">DD</span>Cosmetics
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Premium cosmetic products at best prices. Serving customers locally with 100% original brands. Your trusted beauty partner in Karimpur.
            </p>
            <div className="bg-gray-800/50 rounded-lg p-4 border-l-4 border-pink-500">
              <p className="text-sm font-medium text-white italic">"Trusted Cosmetic Store in Karimpur"</p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-pink-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-pink-500 transition-colors"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-gray-400 hover:text-pink-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-pink-500 transition-colors"></span>
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/categories" className="text-gray-400 hover:text-pink-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-pink-500 transition-colors"></span>
                  Categories
                </Link>
              </li>
              <li>
                <Link to="/wholesale" className="text-gray-400 hover:text-pink-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-pink-500 transition-colors"></span>
                  Wholesale
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-pink-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-pink-500 transition-colors"></span>
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Shop Categories */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Top Categories</h4>
            <ul className="space-y-3">
              {['Makeup', 'Skincare', 'Haircare', 'Fragrances', 'Bath & Body'].map((cat) => (
                <li key={cat}>
                  <Link to={`/shop?category=${cat.toLowerCase()}`} className="text-gray-400 hover:text-pink-500 transition-colors flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-pink-500 transition-colors"></span>
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Information */}
          <div>
            <h4 className="text-lg font-bold text-white mb-6">Store Info</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-pink-500 mt-1 flex-shrink-0" />
                <span className="text-gray-400">
                  Shop No. 12, Main Market Road, Near City Center, Karimpur, India 741152
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-pink-500 flex-shrink-0" />
                <a href="tel:+919876543210" className="text-gray-400 hover:text-white transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  +91 98765 43210 (WhatsApp)
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-pink-500 mt-1 flex-shrink-0" />
                <div className="text-gray-400">
                  <p>Mon - Sat: 10:00 AM - 9:00 PM</p>
                  <p>Sun: Closed</p>
                </div>
              </li>
            </ul>

            {/* Social Media */}
            <div className="mt-8">
              <h5 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Follow Us</h5>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white transition-all transform hover:-translate-y-1">
                  <InstagramIcon className="w-5 h-5" />
                </a>
                <a href="https://wa.me/919876543210" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-green-500 hover:text-white transition-all transform hover:-translate-y-1">
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM STRIP ================= */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {currentYear} DDCosmetics. All Rights Reserved.</p>
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="hover:text-pink-500 transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-pink-500 transition-colors">Terms & Conditions</Link>
            <Link to="/return-policy" className="hover:text-pink-500 transition-colors">Return Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
