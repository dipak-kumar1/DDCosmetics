import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingBag, Heart, ChevronLeft, ChevronRight, Flame, Clock } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import CategorySection from '../components/CategorySection';
import Hero from '../components/Hero';
import ProductCarousel from '../components/ProductCarousel';

const ProductCard = ({ product, badge }) => {
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product._id);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product);
  };

  // Calculate discount percentage
  const discountPercent = product.discountPrice && product.price
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <Link 
      to={`/product/${product._id}`}
      className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 flex flex-col h-full relative"
    >
      {/* Floating Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 pointer-events-none">
        {badge && (
          <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-wider rounded-full shadow-xs text-white ${
            badge === 'Trending' ? 'bg-gradient-to-r from-orange-400 to-pink-500' :
            badge === 'New' ? 'bg-indigo-600' :
            'bg-slate-900'
          }`}>
            {badge}
          </span>
        )}
        {discountPercent > 0 && (
          <span className="px-3 py-1 text-[10px] font-black bg-[#fc2779] text-white rounded-full shadow-xs w-fit">
            -{discountPercent}%
          </span>
        )}
      </div>

      {/* Floating Wishlist Button */}
      <button 
        onClick={handleWishlist}
        className={`absolute top-4 right-4 z-10 p-2.5 rounded-full shadow-md backdrop-blur-md transition-all duration-300 ${
          isWishlisted 
            ? 'bg-pink-50 text-[#fc2779]' 
            : 'bg-white/80 text-slate-400 hover:bg-white hover:text-[#fc2779]'
        }`}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
      </button>

      {/* Product Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
        <img 
          src={product.images?.[0] || 'https://via.placeholder.com/400x500?text=No+Image'} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        
        {/* Quick Add to Cart (Desktop only) */}
        <div className="absolute inset-x-4 bottom-4 translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-350 hidden md:block">
          <button 
            onClick={handleAddToCart}
            className="w-full bg-white/95 backdrop-blur-xs hover:bg-[#fc2779] hover:text-white text-slate-800 py-3 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all border border-slate-100"
          >
            <ShoppingBag className="w-4.5 h-4.5" /> Quick Add
          </button>
        </div>
      </div>

      {/* Product Details */}
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 truncate">
          {product.category}
        </span>
        <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2 group-hover:text-[#fc2779] transition-colors mb-2" title={product.name}>
          {product.name}
        </h3>
        
        {/* Rating Row */}
        <div className="flex items-center gap-1.5 mb-3 mt-auto">
          <div className="flex text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-3.5 h-3.5 ${i < Math.round(product.ratings || 4.5) ? 'fill-current' : 'text-slate-100'}`} />
            ))}
          </div>
          <span className="text-[10px] font-bold text-slate-400">({product.numReviews || 12})</span>
        </div>

        {/* Price Row */}
        <div className="flex items-end justify-between gap-2">
          <div className="flex items-baseline gap-2">
            {product.discountPrice ? (
              <>
                <span className="text-lg font-black text-slate-800">₹{product.discountPrice}</span>
                <span className="text-xs text-slate-400 line-through">₹{product.price}</span>
              </>
            ) : (
              <span className="text-lg font-black text-slate-800">₹{product.price}</span>
            )}
          </div>
          
          {/* Quick Add Button (Mobile only) */}
          <button 
            onClick={handleAddToCart}
            className="md:hidden p-2.5 bg-slate-50 text-slate-700 hover:bg-pink-50 hover:text-[#fc2779] border border-slate-100 rounded-xl transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Link>
  );
};

const Home = () => {
  const [heroConfig, setHeroConfig] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [basedOnInterests, setBasedOnInterests] = useState([]);
  const [promoBanners, setPromoBanners] = useState([]);
  const [trending, setTrending] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const newArrivalsRef = useRef(null);
  const categoriesRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const heroRes = await api.get('/hero-config');
        if (heroRes.data) {
          setHeroConfig(heroRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    const fetchRecommendations = async () => {
      try {
        const res = await api.get('/recommendations/personalized');
        if (res.data) {
          setRecommended(res.data.recommendedForYou || []);
          setBasedOnInterests(res.data.basedOnInterests || []);
        }
      } catch (err) {
        console.error('Failed to fetch personalized recommendations:', err);
      }
    };

    const fetchPromoBanners = async () => {
      try {
        const res = await api.get('/promo-banners');
        if (res.data) {
          setPromoBanners(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch promo banners:', err);
      }
    };

    const fetchHomeSectionsData = async () => {
      try {
        const [trendingRes, newRes, catRes] = await Promise.all([
          api.get('/products/trending'),
          api.get('/products/new-arrivals'),
          api.get('/categories')
        ]);
        setTrending(trendingRes.data || []);
        setNewArrivals(newRes.data || []);
        setCategories(catRes.data ? catRes.data.filter(c => c.isActive) : []);
      } catch (err) {
        console.error('Failed to fetch homepage categories/products:', err);
      }
    };

    fetchData();
    fetchRecommendations();
    fetchPromoBanners();
    fetchHomeSectionsData();
  }, []);

  const scrollNewArrivals = (direction) => {
    if (newArrivalsRef.current) {
      const { current } = newArrivalsRef;
      const scrollAmount = direction === 'left' ? -current.offsetWidth : current.offsetWidth;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollCategories = (direction) => {
    if (categoriesRef.current) {
      const { current } = categoriesRef;
      const scrollAmount = direction === 'left' ? -current.offsetWidth : current.offsetWidth;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans selection:bg-pink-100 selection:text-pink-900">
      {/* ================= HERO SECTION ================= */}
      {heroConfig?.isActive && (
        <Hero heroConfig={heroConfig} />
      )}

      {/* ================= PERSONALIZED RECOMMENDATIONS & PROMO POSTERS ================= */}
      {(recommended.length > 0 || basedOnInterests.length > 0 || promoBanners.length > 0) && (
        <section className="py-10 md:py-14 bg-[#fafafa]">
          <div className="container mx-auto px-4">
            {recommended.length > 0 && (
              <ProductCarousel title="Recommended For You" products={recommended} />
            )}

            {/* Promotional Banners / Posters */}
            {promoBanners.length > 0 && (
              <div className={recommended.length > 0 ? "my-16" : "mb-16"}>
                <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-6 no-scrollbar pb-4 md:pb-0 snap-x">
                  {promoBanners.slice(0, 3).map((banner) => {
                    const isExternal = banner.link && (banner.link.startsWith('http://') || banner.link.startsWith('https://'));
                    const CardComponent = isExternal ? 'a' : Link;
                    const cardProps = isExternal 
                      ? { href: banner.link, target: '_blank', rel: 'noopener noreferrer' }
                      : { to: banner.link || '#' };

                    return (
                      <CardComponent
                        key={banner._id}
                        {...cardProps}
                        className="group relative h-64 md:h-80 min-w-[285px] md:min-w-0 flex-1 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block bg-slate-50 border border-slate-100 snap-start"
                      >
                        <img
                          src={banner.image}
                          alt={banner.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 text-white">
                          {banner.subtitle && (
                            <span className="text-xs font-extrabold uppercase tracking-widest text-pink-400 mb-1 drop-shadow-sm">
                              {banner.subtitle}
                            </span>
                          )}
                          <h3 className="text-xl font-bold mb-3 font-serif leading-tight drop-shadow-sm group-hover:text-pink-100 transition-colors">
                            {banner.title}
                          </h3>
                          <button className="px-4 py-2 bg-white/90 hover:bg-pink-600 hover:text-white text-gray-900 rounded-xl text-xs font-bold uppercase tracking-wider transition-all w-fit shadow-md">
                            {banner.buttonText || 'Shop Now'}
                          </button>
                        </div>
                      </CardComponent>
                    );
                  })}
                </div>
              </div>
            )}

            {basedOnInterests.length > 0 && (
              <div className="mt-16">
                <ProductCarousel title="Based on Your Interests" products={basedOnInterests} />
              </div>
            )}
          </div>
        </section>
      )}

      {/* ================= TRENDING PRODUCTS ================= */}
      {trending.length > 0 && (
        <section className="py-10 md:py-14 bg-white border-t border-slate-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
              <div>
                <div className="flex items-center gap-2 text-pink-500 font-bold uppercase tracking-wider text-xs mb-2">
                  <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                  <span>Hot Picks</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-black text-slate-800">Trending Now</h2>
              </div>
              <Link 
                to="/shop?sort=trending"
                className="text-sm font-bold text-slate-600 hover:text-[#fc2779] transition-colors border-b-2 border-slate-200 hover:border-[#fc2779] pb-0.5"
              >
                View All Trending
              </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {trending.slice(0, 8).map((product) => (
                <ProductCard key={product._id} product={product} badge="Trending" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= SHOP BY CATEGORY (Homepage Premium Card Grid) ================= */}
      {categories.length > 0 && (
        <section className="py-10 bg-slate-50/50 border-t border-b border-slate-100">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 relative">
              <div>
                <span className="text-[10px] font-bold text-pink-500 uppercase tracking-widest block mb-1">Collections</span>
                <h2 className="text-3xl md:text-4xl font-serif font-black text-slate-800">Shop by Category</h2>
                <p className="text-xs text-slate-400 mt-2 font-medium">Find the perfect products for your personalized beauty routine</p>
              </div>
              
              {/* Slider Controls */}
              <div className="flex gap-2">
                <button 
                  onClick={() => scrollCategories('left')}
                  className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer bg-white"
                  aria-label="Previous categories"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <button 
                  onClick={() => scrollCategories('right')}
                  className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer bg-white"
                  aria-label="Next categories"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Scrollable Container */}
            <div 
              ref={categoriesRef}
              className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scroll-smooth no-scrollbar scrollbar-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {categories.map((cat, index) => {
                // Placeholder images mapping if category doesn't have an image
                const placeholders = [
                  'https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=300&h=300&fit=crop', // Makeup
                  'https://images.unsplash.com/photo-1571781535009-5363219b1772?w=300&h=300&fit=crop', // Skincare
                  'https://images.unsplash.com/photo-1522335789203-abd6538d8ad3?w=300&h=300&fit=crop', // Lipstick
                  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&h=300&fit=crop', // Perfume
                  'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=300&h=300&fit=crop', // Eye
                  'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=300&h=300&fit=crop', // Palette
                ];
                const catImg = cat.image || placeholders[index % placeholders.length];

                return (
                  <Link
                    key={cat._id}
                    to={`/shop?category=${cat.slug}`}
                    className="group relative aspect-square w-[150px] sm:w-[190px] flex-none rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 block bg-slate-100 border border-slate-100/50 snap-start"
                  >
                    {/* Background Image */}
                    <img
                      src={catImg}
                      alt={cat.name}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    />
                    
                    {/* Premium Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent group-hover:from-[#fc2779]/90 group-hover:via-[#fc2779]/45 transition-colors duration-500 flex flex-col justify-end p-4 text-white">
                      <h3 className="font-extrabold text-xs uppercase tracking-wider text-center drop-shadow-sm group-hover:scale-105 transition-transform duration-300">
                        {cat.name}
                      </h3>
                      
                      {/* Interactive underline helper */}
                      <span className="w-6 h-0.5 bg-white/70 mx-auto mt-2 scale-x-0 group-hover:scale-x-100 transition-transform duration-350 origin-center"></span>
                    </div>
                  </Link>
                );
              })}

              {/* View All Card */}
              <Link
                to="/categories"
                className="group relative aspect-square w-[150px] sm:w-[190px] flex-none rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 border-2 border-dashed border-pink-200 hover:border-pink-500 transition-all duration-300 flex flex-col items-center justify-center bg-pink-50/20 snap-start p-4 text-center cursor-pointer"
              >
                <div className="w-12 h-12 bg-pink-100 text-[#fc2779] group-hover:bg-[#fc2779] group-hover:text-white rounded-full flex items-center justify-center transition-colors duration-300 mb-3 shadow-inner">
                  <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform duration-205" />
                </div>
                <span className="font-extrabold text-xs uppercase tracking-wider text-[#fc2779]">
                  View All
                </span>
                <span className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-wider">
                  Categories
                </span>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ================= NEW ARRIVALS ================= */}
      {newArrivals.length > 0 && (
        <section className="py-10 md:py-14 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-end mb-10 relative">
              <div>
                <div className="flex items-center gap-2 text-pink-500 font-bold uppercase tracking-wider text-xs mb-2">
                  <Clock className="w-4 h-4 text-indigo-650" />
                  <span>Just Landed</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-black text-slate-800">New Arrivals</h2>
              </div>
              
              {/* Slider Controls */}
              <div className="flex gap-2">
                <button 
                  onClick={() => scrollNewArrivals('left')}
                  className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5 text-slate-600" />
                </button>
                <button 
                  onClick={() => scrollNewArrivals('right')}
                  className="p-2.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5 text-slate-600" />
                </button>
              </div>
            </div>

            {/* Scrollable Container */}
            <div 
              ref={newArrivalsRef}
              className="flex overflow-x-auto gap-6 pb-6 snap-x snap-mandatory scroll-smooth no-scrollbar scrollbar-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {newArrivals.map((product) => (
                <div key={product._id} className="flex-none w-[240px] sm:w-[285px] snap-start">
                  <ProductCard product={product} badge="New" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}


    </div>
  );
};

export default Home;
