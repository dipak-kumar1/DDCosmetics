import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Star, TrendingUp, Flame, Gift, Clock, ArrowRight, Heart } from 'lucide-react';
import api from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

const ProductCard = ({ product, badge, showRating, type = 'standard' }) => {
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

  return (
    <Link 
      to={`/product/${product._id}`}
      className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full relative"
    >
      {/* Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {badge && (
          <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full shadow-sm text-white ${
            badge === 'Trending' ? 'bg-gradient-to-r from-orange-400 to-pink-500' :
            badge === 'New' ? 'bg-blue-500' :
            badge === 'Limited' ? 'bg-red-500' :
            'bg-gray-800'
          }`}>
            {badge}
          </span>
        )}
        {product.discountPrice && (
          <span className="px-3 py-1 text-xs font-bold bg-green-500 text-white rounded-full shadow-sm w-fit">
            -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button 
        onClick={handleWishlist}
        className={`absolute top-3 right-3 z-10 p-2 rounded-full shadow-md transition-all duration-300 ${
          isWishlisted ? 'bg-pink-50 text-pink-500' : 'bg-white/80 text-gray-400 hover:bg-white hover:text-pink-500'
        }`}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
      </button>

      {/* Image Container */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 group-hover:bg-gray-100 transition-colors">
        <img 
          src={product.images?.[0] || 'https://via.placeholder.com/400x500?text=No+Image'} 
          alt={product.name}
          className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-700 ease-in-out"
        />
        
        {/* Quick Add Button (Desktop) */}
        <div className="absolute inset-x-4 bottom-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
          <button 
            onClick={handleAddToCart}
            className="w-full bg-white/90 backdrop-blur-sm hover:bg-gray-900 hover:text-white text-gray-900 py-3 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all border border-gray-200"
          >
            <ShoppingBag className="w-4 h-4" /> Add to Cart
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="mb-2">
          {showRating && (
            <div className="flex items-center gap-1 mb-1">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < Math.round(product.ratings || 0) ? 'fill-current' : 'text-gray-200'}`} />
                ))}
              </div>
              <span className="text-xs text-gray-400">({product.numReviews || 0})</span>
            </div>
          )}
          <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-pink-600 transition-colors" title={product.name}>
            {product.name}
          </h3>
        </div>

        <div className="mt-auto flex items-end justify-between gap-2">
          <div className="flex flex-col">
            {product.discountPrice ? (
              <>
                <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                <span className="text-lg font-bold text-gray-900">₹{product.discountPrice}</span>
              </>
            ) : (
              <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
            )}
          </div>
          
          {/* Mobile Add Button */}
          <button 
            onClick={handleAddToCart}
            className="md:hidden p-2 bg-gray-100 text-gray-900 rounded-lg hover:bg-pink-50 hover:text-pink-600 transition-colors"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
        </div>
      </div>
    </Link>
  );
};

const SectionHeader = ({ title, subtitle, icon: Icon, link }) => (
  <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-12 gap-4 px-4">
    <div>
      <div className="flex items-center gap-2 text-pink-500 font-bold uppercase tracking-wider text-xs mb-2">
        {Icon && <Icon className="w-4 h-4" />}
        <span>{subtitle}</span>
      </div>
      <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">{title}</h2>
    </div>
    {link && (
      <Link 
        to={link}
        className="group flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-pink-600 transition-colors bg-gray-50 hover:bg-pink-50 px-4 py-2 rounded-full border border-gray-200 hover:border-pink-200"
      >
        View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    )}
  </div>
);

const HomeSections = () => {
  const [trending, setTrending] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [combos, setCombos] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingRes, bestSellerRes, combosRes, newRes] = await Promise.all([
          api.get('/products/trending'),
          api.get('/products/bestsellers'),
          api.get('/products/combos'),
          api.get('/products/new-arrivals')
        ]);

        setTrending(trendingRes.data);
        setBestSellers(bestSellerRes.data);
        setCombos(combosRes.data);
        setNewArrivals(newRes.data);
      } catch (err) {
        console.error('Failed to fetch home sections:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 md:gap-0">
      
      {/* 🔥 Trending Products */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-pink-50/30">
        <div className="container mx-auto px-4">
          <SectionHeader 
            title="Trending Now" 
            subtitle="Hot Picks" 
            icon={Flame} 
            link="/shop?sort=trending" 
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {trending.map(product => (
              <ProductCard key={product._id} product={product} badge="Trending" />
            ))}
          </div>
        </div>
      </section>

      {/* 💄 Best Sellers */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <SectionHeader 
            title="Best Sellers" 
            subtitle="Customer Favorites" 
            icon={TrendingUp} 
            link="/shop?sort=best-selling" 
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {bestSellers.map(product => (
              <ProductCard key={product._id} product={product} showRating={true} />
            ))}
          </div>
        </div>
      </section>

      {/* 🎁 Festival Combos (If any) */}
      {combos.length > 0 && (
        <section className="py-16 md:py-24 bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white relative overflow-hidden">
          {/* Background Decorations */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
             <div className="absolute -top-24 -left-24 w-96 h-96 bg-pink-500 rounded-full blur-3xl"></div>
             <div className="absolute top-1/2 right-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
              <div>
                <div className="flex items-center gap-2 text-yellow-400 font-bold uppercase tracking-wider text-xs mb-2">
                  <Gift className="w-4 h-4" />
                  <span>Limited Time Offer</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold text-white">Festival Combos</h2>
              </div>
              <Link 
                to="/shop?category=combos"
                className="group flex items-center gap-2 text-sm font-bold text-white hover:text-yellow-400 transition-colors bg-white/10 hover:bg-white/20 px-6 py-3 rounded-full border border-white/20 backdrop-blur-sm"
              >
                View All Combos <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
              {combos.map(product => (
                <ProductCard key={product._id} product={product} badge="Limited" />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 🆕 New Arrivals */}
      <section className="py-16 md:py-24 bg-[#fafafa]">
        <div className="container mx-auto px-4">
          <SectionHeader 
            title="Just Arrived" 
            subtitle="New Collection" 
            icon={Clock} 
            link="/shop?sort=newest" 
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
            {newArrivals.map(product => (
              <ProductCard key={product._id} product={product} badge="New" />
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomeSections;
