import React, { useState, useEffect, useContext, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Search, User, Heart, ShoppingBag, Menu, X, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const [categories, setCategories] = useState([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { user } = useContext(AuthContext);
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data) {
          const activeCats = res.data.filter(cat => cat.isActive);
          setCategories(activeCats);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Debounced Search Suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const res = await api.get('/products', {
            params: { search: searchQuery, limit: 5 }
          });
          setSuggestions(res.data);
          setShowSuggestions(true);
        } catch (err) {
          console.error('Failed to fetch suggestions:', err);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
      setSearchQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (productId) => {
    navigate(`/product/${productId}`);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsCategoryDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target) && mobileSearchRef.current && !mobileSearchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    if (user) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  return (
    <>
      {/* ================= TOP NOTIFICATION BAR ================= */}
      <div className="bg-gradient-to-r from-pink-500 to-indigo-600 text-white text-xs py-2 text-center font-medium tracking-wide font-sans">
        <p>Free Shipping on Orders Over ₹999 | Easy Returns & Exchange</p>
      </div>

      <div className="bg-white shadow-md sticky top-0 z-[100] w-full font-sans">
        {/* ================= DESKTOP (Top Row) ================= */}
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex justify-between items-center h-[80px] lg:gap-8">
            
            {/* LEFT: Logo & Hamburger */}
            <div className="flex items-center gap-4">
              {/* Mobile Hamburger */}
              <button 
                className="lg:hidden text-gray-700 hover:text-[#4f46e5] transition-colors p-1"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-7 w-7" />
              </button>

              {/* Brand Logo */}
              <Link to="/" className="text-2xl lg:text-3xl font-bold tracking-tighter hover:opacity-80 transition-opacity">
                <span className="text-indigo-600">DD</span><span className="bg-gradient-to-r from-pink-600 to-indigo-600 bg-clip-text text-transparent">Cosmetics</span>
              </Link>
            </div>

            {/* CENTER: Navigation Links (Desktop) */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link to="/home" className="text-gray-700 hover:text-[#4f46e5] text-sm font-bold uppercase tracking-wide transition-colors duration-200">
                Home
              </Link>
              <Link to="/shop" className="text-gray-700 hover:text-[#4f46e5] text-sm font-bold uppercase tracking-wide transition-colors duration-200">
                Shop
              </Link>
              
              {/* Categories Dropdown */}
              <div className="relative group" ref={dropdownRef}>
                <button 
                  className="flex items-center gap-1 text-gray-700 hover:text-[#4f46e5] text-sm font-bold uppercase tracking-wide transition-colors duration-200 focus:outline-none py-4"
                  onMouseEnter={() => setIsCategoryDropdownOpen(true)}
                  onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                >
                  Categories
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {(isCategoryDropdownOpen || false) && (
                  <div 
                    className="absolute top-[90%] left-0 mt-0 w-64 bg-white rounded-lg shadow-xl border border-gray-100 py-3 transform transition-all duration-200 origin-top-left z-50"
                    onMouseLeave={() => setIsCategoryDropdownOpen(false)}
                  >
                    {categories.length > 0 ? (
                      categories.map((cat) => (
                        <Link 
                          key={cat._id} 
                          to={`/shop?category=${cat.slug}`}
                          className="block px-6 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#4f46e5] transition-colors font-medium"
                          onClick={() => setIsCategoryDropdownOpen(false)}
                        >
                          {cat.name}
                        </Link>
                      ))
                    ) : (
                      <div className="px-6 py-3 text-gray-400 text-sm">No categories</div>
                    )}
                  </div>
                )}
              </div>

              <Link to="/offers" className="text-gray-700 hover:text-[#4f46e5] text-sm font-bold uppercase tracking-wide transition-colors duration-200">
                Offers
              </Link>
            </div>

            {/* DESKTOP SEARCH */}
            <div className="hidden lg:block flex-1 max-w-sm" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative group">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => {
                    if (searchQuery.length > 1 && suggestions.length > 0) setShowSuggestions(true);
                  }}
                  className="w-full pl-4 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all duration-300"
                />
                <button type="submit" className="absolute right-3 top-2.5 text-gray-400 group-hover:text-[#4f46e5] transition-colors">
                  <Search className="h-5 w-5" />
                </button>

                {/* Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
                    {suggestions.map((product) => (
                      <div
                        key={product._id}
                        onClick={() => handleSuggestionClick(product._id)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none transition-colors"
                      >
                        <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                          <img 
                            src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/40'} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                          <p className="text-xs text-gray-500 truncate">{product.category}</p>
                        </div>
                        <div className="text-sm font-bold text-[#4f46e5]">
                          ₹{product.discountPrice || product.price}
                        </div>
                      </div>
                    ))}
                    <div 
                      onClick={handleSearch}
                      className="p-3 text-center text-xs font-bold text-[#4f46e5] uppercase tracking-wide bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      View All Results
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* RIGHT: Icons */}
            <div className="flex items-center gap-8">
              <button onClick={handleProfileClick} className="hidden lg:flex flex-col items-center gap-1 text-gray-700 hover:text-[#4f46e5] transition-colors group">
                <User className="h-6 w-6" />
                <span className="hidden lg:block text-[11px] font-bold uppercase tracking-wide">Profile</span>
              </button>
              
              <Link to="/wishlist" className="flex flex-col items-center gap-1 text-gray-700 hover:text-[#4f46e5] transition-colors group relative">
                <div className="relative">
                  <Heart className="h-6 w-6" />
                  {getWishlistCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
                      {getWishlistCount()}
                    </span>
                  )}
                </div>
                <span className="hidden lg:block text-[11px] font-bold uppercase tracking-wide">Wishlist</span>
              </Link>
              
              <Link to="/cart" className="flex flex-col items-center gap-1 text-gray-700 hover:text-[#4f46e5] transition-colors group relative">
                <div className="relative">
                  <ShoppingBag className="h-6 w-6" />
                  {getCartCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#4f46e5] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center ring-2 ring-white">
                      {getCartCount()}
                    </span>
                  )}
                </div>
                <span className="hidden lg:block text-[11px] font-bold uppercase tracking-wide">Cart</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MOBILE SEARCH ROW (Below Navbar) ================= */}
      <div className="lg:hidden sticky top-0 z-40 px-4 pb-4 pt-4 bg-white shadow-md border-b border-gray-100" ref={mobileSearchRef}>
        <form onSubmit={handleSearch} className="relative">
          <input 
            type="text" 
            placeholder="Search for cosmetics, brands..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => {
              if (searchQuery.length > 1 && suggestions.length > 0) setShowSuggestions(true);
            }}
            className="w-full pl-10 pr-4 py-3 bg-gray-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:bg-white transition-all"
          />
          <button type="submit" className="absolute left-3.5 top-3 text-gray-500 hover:text-[#4f46e5]">
            <Search className="h-5 w-5" />
          </button>

          {/* Mobile Autocomplete Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50">
              {suggestions.map((product) => (
                <div
                  key={product._id}
                  onClick={() => handleSuggestionClick(product._id)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-none transition-colors"
                >
                  <div className="w-10 h-10 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                    <img 
                      src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/40'} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{product.category}</p>
                  </div>
                  <div className="text-sm font-bold text-[#4f46e5]">
                    ₹{product.discountPrice || product.price}
                  </div>
                </div>
              ))}
              <div 
                onClick={handleSearch}
                className="p-3 text-center text-xs font-bold text-[#4f46e5] uppercase tracking-wide bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
              >
                View All Results
              </div>
            </div>
          )}
        </form>
      </div>

      {/* ================= MOBILE MENU DRAWER ================= */}
      {/* Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={`fixed inset-y-0 left-0 z-[70] w-[80%] max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Drawer Header */}
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <span className="text-xl font-bold text-[#4f46e5]">DDCosmetics</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-500 hover:text-red-500">
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Drawer Links */}
          <div className="flex-1 overflow-y-auto py-4">
            <div className="flex flex-col space-y-1">
              <Link 
                to="/home" 
                className="px-6 py-3 text-gray-700 font-medium hover:bg-[#4f46e5]/5 hover:text-[#4f46e5] border-l-4 border-transparent hover:border-[#4f46e5] transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/shop" 
                className="px-6 py-3 text-gray-700 font-medium hover:bg-[#4f46e5]/5 hover:text-[#4f46e5] border-l-4 border-transparent hover:border-[#4f46e5] transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Shop
              </Link>
              
              {/* Mobile Categories Accordion */}
              <div className="border-t border-b border-gray-100 my-2 py-2">
                <div className="px-6 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Categories
                </div>
                {categories.map((cat) => (
                  <Link 
                    key={cat._id} 
                    to={`/shop?category=${cat.slug}`}
                    className="block px-6 py-3 text-gray-600 hover:text-[#4f46e5] hover:bg-gray-50 pl-8 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>

              <Link 
                to="/offers" 
                className="px-6 py-3 text-gray-700 font-medium hover:bg-[#4f46e5]/5 hover:text-[#4f46e5] border-l-4 border-transparent hover:border-[#4f46e5] transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Offers
              </Link>
            </div>
          </div>

          {/* Drawer Footer (Login/Profile) */}
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            {user ? (
              <div className="flex items-center gap-3 px-2">
                <div className="h-10 w-10 rounded-full bg-[#4f46e5] text-white flex items-center justify-center font-bold text-lg">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <Link to="/profile" className="text-sm text-[#4f46e5] hover:underline" onClick={() => setIsMobileMenuOpen(false)}>
                    View Profile
                  </Link>
                </div>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="flex items-center justify-center w-full py-3 bg-[#4f46e5] text-white rounded-lg font-semibold shadow-sm hover:bg-indigo-700 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login / Sign Up
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
