import React, { useContext, useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { Heart, ShoppingBag, ArrowRight, ArrowUpDown, ChevronDown, Filter, X, Check } from 'lucide-react'
import api from '../services/api'
import CategorySection from '../components/CategorySection'

export default function Shop() {
  const { user } = useContext(AuthContext)
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [allProducts, setAllProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [banners, setBanners] = useState([])
  const [currentBanner, setCurrentBanner] = useState(0)
  const [loading, setLoading] = useState(true)
  const [hoveredProduct, setHoveredProduct] = useState(null)
  
  // Filter/Sort States
  const [activeModal, setActiveModal] = useState(null)
  const [sortOption, setSortOption] = useState('relevance')
  const [selectedGender, setSelectedGender] = useState(null)

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data) setCategories(res.data.filter(c => c.isActive));
      } catch (err) {
        console.error('Failed to fetch categories', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {};
        if (searchParams.get('category')) params.category = searchParams.get('category');
        if (searchParams.get('search')) params.search = searchParams.get('search');
        if (searchParams.get('tag')) params.tag = searchParams.get('tag');
        if (searchParams.get('discount')) params.discount = searchParams.get('discount');

        const hasFilters = Object.keys(params).length > 0;

        const promises = [
          api.get('/products', { params }),
          api.get('/banners')
        ];

        if (hasFilters) {
          promises.push(api.get('/products'));
        }

        const results = await Promise.all(promises);
        
        setProducts(results[0].data);
        if (results[1].data) {
          setBanners(results[1].data);
        }

        if (hasFilters && results[2]) {
          setAllProducts(results[2].data);
        } else {
          setAllProducts([]);
        }
      } catch (err) {
        console.error('Failed to fetch data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [searchParams])

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners]);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  // Client-side Sorting
  useEffect(() => {
    let sorted = [...products];
    if (sortOption === 'price_high') {
      sorted.sort((a, b) => {
        const priceA = a.discountPrice || a.price;
        const priceB = b.discountPrice || b.price;
        return priceB - priceA;
      });
    } else if (sortOption === 'price_low') {
      sorted.sort((a, b) => {
        const priceA = a.discountPrice || a.price;
        const priceB = b.discountPrice || b.price;
        return priceA - priceB;
      });
    } else if (sortOption === 'new') {
      sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    // For relevance, we keep the default order (usually createdAt desc from backend)
    
    // Only update if order changed to avoid infinite loop (simple check)
    if (JSON.stringify(sorted.map(p => p._id)) !== JSON.stringify(products.map(p => p._id))) {
      setProducts(sorted);
    }
  }, [sortOption, products]);

  const handleGenderSelect = (gender) => {
    setSelectedGender(gender);
    // Assuming we use 'tag' for gender in URL
    const newParams = new URLSearchParams(searchParams);
    if (gender) {
      newParams.set('tag', gender);
    } else {
      newParams.delete('tag');
    }
    setSearchParams(newParams);
    setActiveModal(null);
  };

  const handleCategorySelect = (slug) => {
    const newParams = new URLSearchParams(searchParams);
    if (slug) {
      newParams.set('category', slug);
    } else {
      newParams.delete('category');
    }
    setSearchParams(newParams);
    setActiveModal(null);
  };

  const handleAction = (e, action, product) => {
    e.preventDefault()
    e.stopPropagation()

    // Check authentication for both actions
    if (!user) {
      navigate('/login')
      return
    }

    if (action === 'cart') {
      const cartProduct = {
        ...product,
        price: (product.discountPrice && product.discountPrice < product.price) ? product.discountPrice : product.price,
        originalPrice: product.price
      };
      addToCart(cartProduct)
      // Optional: Add toast notification
    } else if (action === 'wishlist') {
      if (isInWishlist(product._id)) {
        removeFromWishlist(product._id)
      } else {
        addToWishlist(product)
      }
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-50 pt-2 lg:pt-4 pb-12 px-4 sm:px-6 lg:px-8">
      {/* Banner Section */}
      {banners.length > 0 && (
        <div className="-mx-4 sm:-mx-6 lg:-mx-8 mb-2 relative h-[150px] md:h-[250px] overflow-hidden shadow-md">
          {banners.map((banner, index) => (
            <div
              key={banner._id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentBanner ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {banner.link ? (
                <Link to={banner.link} className="block w-full h-full">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                </Link>
              ) : (
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          ))}
          
          {/* Slider Controls */}
          {banners.length > 1 && (
            <>
              <button
                onClick={prevBanner}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/50 hover:bg-white rounded-full transition-colors"
              >
                <ArrowRight className="w-5 h-5 rotate-180" />
              </button>
              <button
                onClick={nextBanner}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/50 hover:bg-white rounded-full transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {banners.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentBanner(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentBanner ? 'w-6 bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Header */}
      <div className="text-center mb-2">
        <h1 className="text-2xl font-bold text-gray-900 capitalize">
          Products For You
        </h1>
      </div>

      {/* Horizontal Category Scroll (Meesho Style) */}
      <CategorySection categories={categories} />

      {/* Filter Bar (Mobile Only) */}
      <div className="lg:hidden sticky top-[76px] z-[30] bg-white shadow-sm mb-2 border-t border-b border-gray-100 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-2 transition-all duration-300">
        <div className="flex divide-x divide-gray-100 overflow-x-auto no-scrollbar max-w-7xl mx-auto w-full">
          <button 
            onClick={() => setActiveModal('sort')} 
            className={`flex-1 flex items-center justify-center gap-2 py-2 min-w-[90px] hover:bg-gray-50 transition-colors ${sortOption !== 'relevance' ? 'text-[#fc2779] font-medium' : 'text-gray-700'}`}
          >
            <ArrowUpDown className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Sort</span>
            {sortOption !== 'relevance' && <div className="w-1.5 h-1.5 bg-[#fc2779] rounded-full" />}
          </button>
          
          <button 
            onClick={() => setActiveModal('category')} 
            className={`flex-1 flex items-center justify-center gap-2 py-2 min-w-[110px] hover:bg-gray-50 transition-colors ${searchParams.get('category') ? 'text-[#fc2779] font-medium' : 'text-gray-700'}`}
          >
            <span className="text-xs sm:text-sm">Category</span>
            <ChevronDown className="w-4 h-4" />
            {searchParams.get('category') && <div className="w-1.5 h-1.5 bg-[#fc2779] rounded-full" />}
          </button>
          
          <button 
            onClick={() => setActiveModal('gender')} 
            className={`flex-1 flex items-center justify-center gap-2 py-2 min-w-[100px] hover:bg-gray-50 transition-colors ${searchParams.get('tag') ? 'text-[#fc2779] font-medium' : 'text-gray-700'}`}
          >
            <span className="text-xs sm:text-sm">Gender</span>
            <ChevronDown className="w-4 h-4" />
            {searchParams.get('tag') && <div className="w-1.5 h-1.5 bg-[#fc2779] rounded-full" />}
          </button>
          
          <button 
            onClick={() => setActiveModal('filter')} 
            className={`flex-1 flex items-center justify-center gap-2 py-2 min-w-[100px] hover:bg-gray-50 transition-colors ${searchParams.get('discount') ? 'text-[#fc2779] font-medium' : 'text-gray-700'}`}
          >
            <Filter className="w-4 h-4" />
            <span className="text-xs sm:text-sm">Filters</span>
            {searchParams.get('discount') && <div className="w-1.5 h-1.5 bg-[#fc2779] rounded-full" />}
          </button>
        </div>
      </div>

      {/* Modals/Bottom Sheets */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setActiveModal(null)} />
          
          <div className="relative bg-white w-full sm:w-[400px] sm:rounded-xl rounded-t-xl shadow-2xl max-h-[80vh] overflow-y-auto animate-slide-up sm:animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
                {activeModal === 'sort' ? 'Sort By' : 
                 activeModal === 'category' ? 'Select Category' :
                 activeModal === 'gender' ? 'Select Gender' : 'Filters'}
              </h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Sort Options */}
            {activeModal === 'sort' && (
              <div className="p-2">
                {[
                  { id: 'relevance', label: 'Relevance' },
                  { id: 'new', label: 'New Arrivals' },
                  { id: 'price_high', label: 'Price (High to Low)' },
                  { id: 'price_low', label: 'Price (Low to High)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSortOption(opt.id);
                      setActiveModal(null);
                    }}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left border-b border-gray-50 last:border-none"
                  >
                    <span className={`text-sm ${sortOption === opt.id ? 'font-bold text-[#fc2779]' : 'text-gray-700'}`}>
                      {opt.label}
                    </span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${sortOption === opt.id ? 'border-[#fc2779]' : 'border-gray-300'}`}>
                      {sortOption === opt.id && <div className="w-2.5 h-2.5 bg-[#fc2779] rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Category Options */}
            {activeModal === 'category' && (
              <div className="p-2">
                <button
                  onClick={() => handleCategorySelect(null)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left border-b border-gray-50"
                >
                  <span className={`text-sm ${!searchParams.get('category') ? 'font-bold text-[#fc2779]' : 'text-gray-700'}`}>
                    All Categories
                  </span>
                  {!searchParams.get('category') && (
                    <div className="w-5 h-5 rounded-full border border-[#fc2779] flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-[#fc2779] rounded-full" />
                    </div>
                  )}
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left border-b border-gray-50 last:border-none"
                  >
                    <span className={`text-sm ${searchParams.get('category') === cat.slug ? 'font-bold text-[#fc2779]' : 'text-gray-700'}`}>
                      {cat.name}
                    </span>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${searchParams.get('category') === cat.slug ? 'border-[#fc2779]' : 'border-gray-300'}`}>
                      {searchParams.get('category') === cat.slug && <div className="w-2.5 h-2.5 bg-[#fc2779] rounded-full" />}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Gender Options */}
            {activeModal === 'gender' && (
              <div className="p-6 grid grid-cols-2 gap-6">
                {[
                  { label: 'Women', img: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=200&h=200&fit=crop' },
                  { label: 'Men', img: 'https://images.unsplash.com/photo-1550246140-5119980d5252?w=200&h=200&fit=crop' },
                  { label: 'Girls', img: 'https://images.unsplash.com/photo-1621452773781-0f992ed03591?w=200&h=200&fit=crop' },
                  { label: 'Boys', img: 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=200&h=200&fit=crop' },
                ].map((g) => (
                  <button
                    key={g.label}
                    onClick={() => handleGenderSelect(g.label)}
                    className="flex flex-col items-center gap-3 group"
                  >
                    <div className={`w-20 h-20 rounded-full overflow-hidden border-2 transition-all ${searchParams.get('tag') === g.label ? 'border-[#fc2779] scale-105' : 'border-gray-200 group-hover:border-[#fc2779]'}`}>
                      <img src={g.img} alt={g.label} className="w-full h-full object-cover" />
                    </div>
                    <span className={`text-sm font-medium ${searchParams.get('tag') === g.label ? 'text-[#fc2779]' : 'text-gray-700'}`}>
                      {g.label}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Filter Options */}
            {activeModal === 'filter' && (
              <div className="p-4">
                <p className="text-gray-500 text-sm mb-4">Refine your search</p>
                <div className="space-y-4">
                  <button
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set('discount', 'true');
                      setSearchParams(newParams);
                      setActiveModal(null);
                    }}
                    className={`w-full p-3 rounded-lg border text-sm font-medium flex justify-between items-center ${searchParams.get('discount') ? 'border-[#fc2779] bg-pink-50 text-[#fc2779]' : 'border-gray-200 text-gray-700'}`}
                  >
                    <span>On Discount</span>
                    {searchParams.get('discount') && <div className="w-2 h-2 bg-[#fc2779] rounded-full" />}
                  </button>
                  
                  <button
                    onClick={() => {
                      setSearchParams({});
                      setSortOption('relevance');
                      setActiveModal(null);
                    }}
                    className="w-full p-3 rounded-lg border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            )}
            
            {activeModal === 'gender' && (
              <div className="p-4 border-t border-gray-100">
                 <button 
                  onClick={() => setActiveModal(null)}
                  className="w-full py-3 bg-[#a6266e] text-white rounded-lg font-bold text-sm uppercase tracking-wide hover:bg-[#8e205e]"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Area: Sidebar + Grid */}
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24 space-y-8">
            {/* Sort Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wide text-sm">Sort By</h3>
              <div className="space-y-3">
                {[
                  { id: 'relevance', label: 'Relevance' },
                  { id: 'new', label: 'New Arrivals' },
                  { id: 'price_high', label: 'Price (High to Low)' },
                  { id: 'price_low', label: 'Price (Low to High)' },
                ].map((opt) => (
                  <label key={opt.id} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${sortOption === opt.id ? 'border-[#fc2779]' : 'border-gray-300 group-hover:border-[#fc2779]'}`}>
                      {sortOption === opt.id && <div className="w-2 h-2 bg-[#fc2779] rounded-full" />}
                    </div>
                    <span className={`text-sm ${sortOption === opt.id ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                      {opt.label}
                    </span>
                    <input 
                      type="radio" 
                      name="sort" 
                      className="hidden"
                      checked={sortOption === opt.id}
                      onChange={() => setSortOption(opt.id)}
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* Categories Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wide text-sm">Categories</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                <label className="flex items-center gap-3 cursor-pointer group">
                   <div className={`w-4 h-4 rounded border flex items-center justify-center ${!searchParams.get('category') ? 'bg-[#fc2779] border-[#fc2779]' : 'border-gray-300 group-hover:border-[#fc2779]'}`}>
                     {!searchParams.get('category') && <Check className="w-3 h-3 text-white" />}
                   </div>
                   <input 
                     type="radio" 
                     name="category"
                     checked={!searchParams.get('category')}
                     onChange={() => handleCategorySelect(null)}
                     className="hidden"
                   />
                   <span className={`text-sm ${!searchParams.get('category') ? 'text-[#fc2779] font-medium' : 'text-gray-600'}`}>All Categories</span>
                </label>
                {categories.map((cat) => (
                  <label key={cat._id} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${searchParams.get('category') === cat.slug ? 'bg-[#fc2779] border-[#fc2779]' : 'border-gray-300 group-hover:border-[#fc2779]'}`}>
                      {searchParams.get('category') === cat.slug && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <input 
                      type="radio" 
                      name="category"
                      checked={searchParams.get('category') === cat.slug}
                      onChange={() => handleCategorySelect(cat.slug)}
                      className="hidden"
                    />
                    <span className={`text-sm ${searchParams.get('category') === cat.slug ? 'text-[#fc2779] font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                      {cat.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Gender Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wide text-sm">Gender</h3>
              <div className="space-y-3">
                {['Women', 'Men', 'Girls', 'Boys'].map((g) => (
                   <label key={g} className="flex items-center gap-3 cursor-pointer group">
                     <div className={`w-4 h-4 border rounded flex items-center justify-center ${searchParams.get('tag') === g ? 'bg-[#fc2779] border-[#fc2779]' : 'border-gray-300 group-hover:border-[#fc2779]'}`}>
                       {searchParams.get('tag') === g && <Check className="w-3 h-3 text-white" />}
                     </div>
                     <span className={`text-sm ${searchParams.get('tag') === g ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                       {g}
                     </span>
                     <input 
                       type="checkbox" 
                       checked={searchParams.get('tag') === g}
                       onChange={() => handleGenderSelect(searchParams.get('tag') === g ? null : g)}
                       className="hidden"
                     />
                   </label>
                ))}
              </div>
            </div>

             {/* Filters Section */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="font-bold text-gray-900 mb-4 uppercase tracking-wide text-sm">Filters</h3>
              <label className="flex items-center gap-3 cursor-pointer group">
                 <div className={`w-4 h-4 border rounded flex items-center justify-center ${searchParams.get('discount') ? 'bg-[#fc2779] border-[#fc2779]' : 'border-gray-300 group-hover:border-[#fc2779]'}`}>
                   {searchParams.get('discount') && <Check className="w-3 h-3 text-white" />}
                 </div>
                 <span className={`text-sm ${searchParams.get('discount') ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
                   On Discount
                 </span>
                 <input 
                   type="checkbox" 
                   checked={!!searchParams.get('discount')}
                   onChange={() => {
                      const newParams = new URLSearchParams(searchParams);
                      if (searchParams.get('discount')) newParams.delete('discount');
                      else newParams.set('discount', 'true');
                      setSearchParams(newParams);
                   }}
                   className="hidden"
                 />
               </label>
            </div>

            {/* Clear Filters */}
            <button 
              onClick={() => {
                setSearchParams({});
                setSortOption('relevance');
              }}
              className="w-full py-3 border border-gray-200 rounded-lg text-sm font-bold uppercase tracking-wide text-gray-600 hover:border-red-200 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Product Grid Area */}
        <div className="flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 content-start">
        {products.map((product) => (
          <div
            key={product._id}
            className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
            onMouseEnter={() => setHoveredProduct(product._id)}
            onMouseLeave={() => setHoveredProduct(null)}
            onClick={() => navigate(`/product/${product._id}`)}
          >
            {/* Image Container */}
            <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 h-64 relative">
              <img
                src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/300'}
                alt={product.name}
                className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
              />
              
              {/* Wishlist Button (Top Right) */}
              <button
                onClick={(e) => handleAction(e, 'wishlist', product)}
                className={`absolute top-3 right-3 p-2 rounded-full transition-colors shadow-sm backdrop-blur-sm ${
                  isInWishlist(product._id) 
                    ? 'bg-pink-500 text-white' 
                    : 'bg-white/80 text-gray-400 hover:text-pink-500 hover:bg-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-5">
              <p className="text-xs sm:text-sm font-medium text-pink-500 mb-1 truncate">
                {product.category}
              </p>
              <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-2 truncate leading-tight">
                {product.name}
              </h3>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3">
                <div className="flex flex-col">
                  {product.discountPrice && product.discountPrice < product.price ? (
                    <>
                      <span className="text-base sm:text-xl font-bold text-[#fc2779]">
                        ₹{product.discountPrice.toFixed(2)}
                      </span>
                      <span className="text-xs text-gray-400 line-through">
                        ₹{product.price.toFixed(2)}
                      </span>
                    </>
                  ) : (
                    <span className="text-base sm:text-xl font-bold text-gray-900">
                      ₹{product.price.toFixed(2)}
                    </span>
                  )}
                </div>
                <button
                  onClick={(e) => handleAction(e, 'cart', product)}
                  className="flex items-center justify-center gap-2 bg-[#fc2779] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-[#d61f66] transition-colors transform active:scale-95 w-full sm:w-auto"
                >
                  <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* All Products Section (Shown when filtering) */}
      {allProducts.length > 0 && (
        <>
          <div className="my-12 flex items-center gap-4">
            <div className="h-px bg-gray-200 flex-1"></div>
            <h2 className="text-2xl font-bold text-gray-900">Explore All Products</h2>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>
          
          <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {allProducts
              .filter(p => !products.find(fp => fp._id === p._id))
              .map((product) => (
                <div
                  key={product._id}
                  className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden"
                  onMouseEnter={() => setHoveredProduct(product._id)}
                  onMouseLeave={() => setHoveredProduct(null)}
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  {/* Image Container */}
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 h-64 relative">
                    <img
                      src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/300'}
                      alt={product.name}
                      className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => handleAction(e, 'wishlist', product)}
                      className={`absolute top-3 right-3 p-2 rounded-full transition-colors shadow-sm backdrop-blur-sm ${
                        isInWishlist(product._id) 
                          ? 'bg-pink-500 text-white' 
                          : 'bg-white/80 text-gray-400 hover:text-pink-500 hover:bg-white'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-3 sm:p-5">
                    <p className="text-xs sm:text-sm font-medium text-pink-500 mb-1 truncate">
                      {product.category}
                    </p>
                    <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-2 truncate leading-tight">
                      {product.name}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3">
                      <div className="flex flex-col">
                        {product.discountPrice && product.discountPrice < product.price ? (
                          <>
                            <span className="text-base sm:text-xl font-bold text-[#fc2779]">
                              ₹{product.discountPrice.toFixed(2)}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                              ₹{product.price.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-base sm:text-xl font-bold text-gray-900">
                            ₹{product.price.toFixed(2)}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleAction(e, 'cart', product)}
                        className="flex items-center justify-center gap-2 bg-[#fc2779] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-[#d61f66] transition-colors transform active:scale-95 w-full sm:w-auto"
                      >
                        <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </>
      )}
        </div>
      </div>
    </div>
  )
}
