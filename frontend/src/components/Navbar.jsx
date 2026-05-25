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

  const [recentSearches, setRecentSearches] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Load recent searches
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        setRecentSearches([]);
      }
    }
  }, []);

  const saveSearchQuery = (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const updated = [trimmed, ...recentSearches.filter(q => q.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // Debounced Search Suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length > 1) {
        try {
          const res = await api.get('/products', {
            params: { search: searchQuery, limit: 5 }
          });
          setSuggestions(res.data);
        } catch (err) {
          console.error('Failed to fetch suggestions:', err);
        }
      } else {
        setSuggestions([]);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      saveSearchQuery(searchQuery);
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  const handleSuggestionClick = (productId) => {
    navigate(`/product/${productId}`);
    setShowSuggestions(false);
    setSearchQuery('');
    setActiveIndex(-1);
  };

  const handleKeywordSearch = (keyword) => {
    setSearchQuery(keyword);
    saveSearchQuery(keyword);
    navigate(`/shop?search=${encodeURIComponent(keyword)}`);
    setIsMobileMenuOpen(false);
    setShowSuggestions(false);
    setActiveIndex(-1);
  };

  const trendingSearches = ["Lipstick", "Perfume", "Foundation", "Sunscreen", "Face Wash", "Eyeliner"];

  const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const getNavigableItems = () => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) {
      const items = [];
      recentSearches.forEach(q => items.push({ type: 'query', value: q }));
      trendingSearches.forEach(q => items.push({ type: 'query', value: q }));
      return items;
    } else {
      const items = [];
      const matchedCats = categories.filter(c => 
        c.name.toLowerCase().includes(trimmedQuery.toLowerCase())
      ).slice(0, 2);
      matchedCats.forEach(cat => {
        items.push({ type: 'category', value: trimmedQuery, categorySlug: cat.slug, categoryName: cat.name });
      });
      suggestions.forEach(prod => {
        items.push({ type: 'product', value: prod._id, product: prod });
      });
      items.push({ type: 'view-all', value: trimmedQuery });
      return items;
    }
  };

  const handleKeyDown = (e) => {
    const items = getNavigableItems();
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % items.length);
      setShowSuggestions(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + items.length) % items.length);
      setShowSuggestions(true);
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < items.length) {
        e.preventDefault();
        const activeItem = items[activeIndex];
        if (activeItem.type === 'query') {
          handleKeywordSearch(activeItem.value);
        } else if (activeItem.type === 'category') {
          saveSearchQuery(activeItem.value);
          navigate(`/shop?search=${encodeURIComponent(activeItem.value)}&category=${activeItem.categorySlug}`);
          setShowSuggestions(false);
        } else if (activeItem.type === 'product') {
          handleSuggestionClick(activeItem.value);
        } else if (activeItem.type === 'view-all') {
          handleSearch();
        }
      } else {
        handleSearch(e);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setActiveIndex(-1);
    }
  };

  const renderSearchDropdown = (isMobile) => {
    if (!showSuggestions) return null;

    const items = getNavigableItems();
    if (items.length === 0) return null;

    let itemCounter = 0;

    if (!searchQuery.trim()) {
      return (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[150] p-4 text-left animate-in fade-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto">
          {recentSearches.length > 0 && (
            <div className="mb-4">
              <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                <span>Recent Searches</span>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRecentSearches([]);
                    localStorage.removeItem('recentSearches');
                  }}
                  className="hover:text-red-500 font-bold normal-case cursor-pointer"
                >
                  Clear All
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.map((query, idx) => {
                  const currentIdx = itemCounter++;
                  const isActive = activeIndex === currentIdx;
                  return (
                    <div 
                      key={`recent-${idx}`}
                      onClick={() => handleKeywordSearch(query)}
                      onMouseEnter={() => setActiveIndex(currentIdx)}
                      className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${isActive ? 'bg-pink-50 text-pink-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="text-gray-400">🕒</span>
                        {query}
                      </span>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const updated = recentSearches.filter((_, i) => i !== idx);
                          setRecentSearches(updated);
                          localStorage.setItem('recentSearches', JSON.stringify(updated));
                        }}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-gray-100 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              🔥 Trending Searches
            </div>
            <div className="grid grid-cols-2 gap-2">
              {trendingSearches.map((query, idx) => {
                const currentIdx = itemCounter++;
                const isActive = activeIndex === currentIdx;
                return (
                  <div
                    key={`trending-${idx}`}
                    onClick={() => handleKeywordSearch(query)}
                    onMouseEnter={() => setActiveIndex(currentIdx)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-colors ${isActive ? 'bg-pink-50 text-pink-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <span>⚡</span>
                    {query}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      );
    }

    const matchedCats = categories.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 2);

    return (
      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[150] text-left animate-in fade-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto">
        {matchedCats.length > 0 && (
          <div className="border-b border-gray-50 p-2">
            {matchedCats.map((cat, idx) => {
              const currentIdx = itemCounter++;
              const isActive = activeIndex === currentIdx;
              return (
                <div
                  key={`cat-${idx}`}
                  onClick={() => {
                    saveSearchQuery(searchQuery);
                    navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}&category=${cat.slug}`);
                    setShowSuggestions(false);
                  }}
                  onMouseEnter={() => setActiveIndex(currentIdx)}
                  className={`px-4 py-2.5 rounded-lg text-sm cursor-pointer transition-colors ${isActive ? 'bg-pink-50 text-pink-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  Search for "<span className="font-bold text-gray-900">{searchQuery}</span>" in <span className="text-[#4f46e5] font-semibold italic">{cat.name}</span>
                </div>
              );
            })}
          </div>
        )}

        <div className="p-2 space-y-1">
          {suggestions.length > 0 ? (
            suggestions.map((product) => {
              const currentIdx = itemCounter++;
              const isActive = activeIndex === currentIdx;
              
              const highlightText = (text, query) => {
                if (!query) return text;
                const escapedQuery = escapeRegExp(query);
                const parts = text.split(new RegExp(`(${escapedQuery})`, 'gi'));
                return (
                  <span>
                    {parts.map((part, i) => 
                      part.toLowerCase() === query.toLowerCase() 
                        ? <mark key={i} className="bg-yellow-100 text-gray-900 rounded-[2px] px-0.5 font-bold">{part}</mark>
                        : part
                    )}
                  </span>
                );
              };

              return (
                <div
                  key={product._id}
                  onClick={() => handleSuggestionClick(product._id)}
                  onMouseEnter={() => setActiveIndex(currentIdx)}
                  className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-colors ${isActive ? 'bg-pink-50' : 'hover:bg-gray-50'}`}
                >
                  <div className="w-10 h-10 flex-shrink-0 bg-gray-50 rounded-md overflow-hidden border border-gray-100">
                    <img 
                      src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/40'} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-medium truncate ${isActive ? 'text-pink-600' : 'text-gray-900'}`}>
                      {highlightText(product.name, searchQuery)}
                    </h4>
                    <p className="text-xs text-gray-400 truncate">{product.category}</p>
                  </div>
                  <div className={`text-sm font-bold ${isActive ? 'text-[#4f46e5]' : 'text-gray-800'}`}>
                    ₹{product.discountPrice || product.price}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-sm text-gray-400">
              No products found matching "{searchQuery}"
            </div>
          )}
        </div>

        {suggestions.length > 0 && (() => {
          const currentIdx = itemCounter++;
          const isActive = activeIndex === currentIdx;
          return (
            <div 
              onClick={handleSearch}
              onMouseEnter={() => setActiveIndex(currentIdx)}
              className={`p-3 text-center text-xs font-bold uppercase tracking-wider border-t border-gray-50 cursor-pointer transition-colors ${isActive ? 'bg-pink-600 text-white' : 'bg-gray-50 text-[#4f46e5] hover:bg-gray-100'}`}
            >
              View All Results for "{searchQuery}"
            </div>
          );
        })()}
      </div>
    );
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

      <div className="bg-white shadow-md relative lg:sticky lg:top-0 z-[100] w-full font-sans">
        {/* ================= DESKTOP (Top Row) ================= */}
        <div className="max-w-[1440px] mx-auto px-4 lg:px-10 w-full">
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

              <Link to="/wholesale" className="text-gray-700 hover:text-[#4f46e5] text-sm font-bold uppercase tracking-wide transition-colors duration-200">
                Wholesale
              </Link>
            </div>

            {/* DESKTOP SEARCH */}
            <div className="hidden lg:block flex-1 max-w-2xl" ref={searchRef}>
              <form onSubmit={handleSearch} className="relative group">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setActiveIndex(-1);
                  }}
                  onKeyDown={handleKeyDown}
                  onFocus={() => {
                    setShowSuggestions(true);
                  }}
                  onClick={() => {
                    setShowSuggestions(true);
                  }}
                  className="w-full pl-4 pr-16 py-2.5 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#4f46e5]/20 focus:border-[#4f46e5] transition-all duration-300"
                />
                <div className="absolute right-3 top-2 flex items-center gap-1.5">
                  {searchQuery && (
                    <button 
                      type="button" 
                      onClick={() => {
                        setSearchQuery('');
                        setActiveIndex(-1);
                      }} 
                      className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button type="submit" className="text-gray-400 group-hover:text-[#4f46e5] transition-colors p-0.5">
                    <Search className="h-5 w-5" />
                  </button>
                </div>

                {renderSearchDropdown(false)}
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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setActiveIndex(-1);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setShowSuggestions(true);
            }}
            onClick={() => {
              setShowSuggestions(true);
            }}
            className="w-full pl-10 pr-12 py-3 bg-gray-100 border-none rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4f46e5]/20 focus:bg-white transition-all"
          />
          <button type="submit" className="absolute left-3.5 top-3.5 text-gray-500 hover:text-[#4f46e5]">
            <Search className="h-5 w-5" />
          </button>
          {searchQuery && (
            <button 
              type="button" 
              onClick={() => {
                setSearchQuery('');
                setActiveIndex(-1);
              }} 
              className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {renderSearchDropdown(true)}
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
                to="/wholesale" 
                className="px-6 py-3 text-gray-700 font-medium hover:bg-[#4f46e5]/5 hover:text-[#4f46e5] border-l-4 border-transparent hover:border-[#4f46e5] transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Wholesale
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
