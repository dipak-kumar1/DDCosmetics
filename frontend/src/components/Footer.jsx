import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, MessageCircle, Clock, Mail } from 'lucide-react';

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
    <footer className="bg-gray-900 text-gray-300 pt-10 pb-6 font-sans border-t-4 border-pink-600">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* ================= MAIN FOOTER CONTENT ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Column 1: About Store */}
          <div>
            <h3 className="text-xl font-serif font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-pink-500">DD</span>Cosmetics
            </h3>
            <p className="text-gray-400 mb-4 text-sm leading-relaxed">
              Premium cosmetic products at best prices. Serving customers locally with 100% original brands. Your trusted beauty partner in Kohima.
            </p>
            <div className="bg-gray-800/50 rounded-lg p-3 border-l-4 border-pink-500">
              <p className="text-xs font-medium text-white italic">"Trusted Cosmetic Store in Kohima"</p>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-base font-bold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
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
                <Link to="/wishlist" className="text-gray-400 hover:text-pink-500 transition-colors flex items-center gap-2 group">
                  <span className="w-1.5 h-1.5 bg-gray-600 rounded-full group-hover:bg-pink-500 transition-colors"></span>
                  My Wishlist
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Information */}
          <div>
            <h4 className="text-base font-bold text-white mb-4">Store Info</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4.5 h-4.5 text-pink-500 mt-1 flex-shrink-0" />
                <span className="text-gray-400">
                  Shop Number B-20, T Khel Market BOC, Kohima, Nagaland, India 797120
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4.5 h-4.5 text-pink-500 flex-shrink-0" />
                <a href="tel:+917005009973" className="text-gray-400 hover:text-white transition-colors">
                  +91 70050 09973
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <MessageCircle className="w-4.5 h-4.5 text-green-500 flex-shrink-0" />
                <a href="https://wa.me/917005009973" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                  +91 70050 09973 (WhatsApp)
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4.5 h-4.5 text-pink-500 flex-shrink-0" />
                <a href="mailto:ddcosmetics@gmail.com" className="text-gray-400 hover:text-white transition-colors">
                  ddcosmetics@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4.5 h-4.5 text-pink-500 mt-1 flex-shrink-0" />
                <div className="text-gray-400">
                  <p>Mon - Sat: 10:00 AM - 9:00 PM</p>
                  <p>Sun: Closed</p>
                </div>
              </li>
            </ul>

            {/* Social Media */}
            <div className="mt-6">
              <h5 className="text-xs font-bold text-white mb-3 uppercase tracking-wider">Follow Us</h5>
              <div className="flex gap-3.5">
                <a href="#" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-pink-600 hover:text-white transition-all transform hover:-translate-y-1">
                  <InstagramIcon className="w-4.5 h-4.5" />
                </a>
                <a href="https://wa.me/917005009973" className="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-green-500 hover:text-white transition-all transform hover:-translate-y-1">
                  <MessageCircle className="w-4.5 h-4.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ================= BOTTOM STRIP ================= */}
        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {currentYear} DDCosmetics. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
