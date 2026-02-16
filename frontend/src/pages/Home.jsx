import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Heart, ShoppingBag, Truck, ShieldCheck, Sparkles, Leaf, ArrowRight, Star } from 'lucide-react';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories'),
          api.get('/products')
        ]);
        
        if (catRes.data) {
          setCategories(catRes.data.filter(cat => cat.isActive));
        }
        if (prodRes.data) {
          setFeaturedProducts(prodRes.data.slice(0, 8)); // Fetch more products for a grid
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAction = (e, action, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Check authentication for both actions
    if (!user) {
      navigate('/login');
      return;
    }

    if (action === 'cart') {
      addToCart(product);
    } else if (action === 'wishlist') {
      if (isInWishlist(product._id)) {
        removeFromWishlist(product._id);
      } else {
        addToWishlist(product);
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans selection:bg-pink-100 selection:text-pink-900">
      
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#fafafa]">
        {/* Abstract Background Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-r from-pink-200/40 to-purple-200/40 blur-3xl animate-blob"></div>
          <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-l from-rose-200/40 to-orange-100/40 blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-gradient-to-t from-indigo-200/40 to-blue-100/40 blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-sm border border-pink-100 shadow-sm mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-pink-500" />
            <span className="text-sm font-medium text-gray-600 tracking-wide uppercase">New Collection 2024</span>
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-medium text-gray-900 mb-8 leading-[1.1] tracking-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Redefine Your <br />
            <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 relative">
              True Beauty
              <svg className="absolute w-full h-3 -bottom-1 left-0 text-pink-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
              </svg>
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-500 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            Experience the fusion of nature and science. Premium cosmetics, skincare, and fragrances designed to illuminate your natural glow.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Link 
              to="/shop" 
              className="group relative px-8 py-4 bg-gray-900 text-white rounded-full overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <span className="relative z-10 flex items-center gap-2 font-medium">
                Shop Now <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
            <Link 
              to="/shop?category=new-arrivals" 
              className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-300"
            >
              View New Arrivals
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section className="py-12 bg-white border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { icon: Truck, title: "Free Shipping", desc: "On orders over ₹999" },
              { icon: ShieldCheck, title: "Secure Payment", desc: "100% protected payments" },
              { icon: Leaf, title: "100% Organic", desc: "Natural ingredients only" },
              { icon: Star, title: "Premium Quality", desc: "Certified top products" },
            ].map((feature, idx) => (
              <div key={idx} className="flex flex-col items-center text-center p-4 hover:bg-gray-50 rounded-xl transition-colors duration-300">
                <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= SHOP BY CATEGORY ================= */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-2">Shop by Category</h2>
              <p className="text-gray-500">Curated collections for every need.</p>
            </div>
            <Link to="/shop" className="text-pink-600 font-medium hover:text-pink-700 flex items-center gap-1 group">
              View All Categories <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.slice(0, 3).map((cat, idx) => (
                <Link 
                  key={cat._id} 
                  to={`/shop?category=${cat.slug}`}
                  className={`group relative overflow-hidden rounded-2xl aspect-[4/3] ${idx === 0 ? 'md:col-span-2 md:aspect-[2/1]' : ''}`}
                >
                  <div className="absolute inset-0 bg-gray-200">
                     {/* Placeholder gradient since we might not have real images */}
                    <div className={`w-full h-full bg-gradient-to-br ${
                      idx % 3 === 0 ? 'from-pink-100 to-rose-200' : 
                      idx % 3 === 1 ? 'from-purple-100 to-indigo-200' : 'from-orange-100 to-amber-200'
                    } group-hover:scale-105 transition-transform duration-700`}></div>
                  </div>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-300"></div>
                  <div className="absolute inset-0 flex flex-col justify-end p-8">
                    <h3 className="text-3xl font-bold text-gray-900 mb-2 group-hover:translate-x-2 transition-transform duration-300">{cat.name}</h3>
                    <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full w-fit group-hover:bg-white transition-colors">
                      Explore Collection <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </Link>
              ))}
              {categories.length > 3 && (
                 <Link 
                  to="/shop"
                  className="group relative overflow-hidden rounded-2xl aspect-[4/3] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center hover:border-pink-300 hover:bg-pink-50 transition-all duration-300"
                >
                  <span className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                    <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-pink-500" />
                  </span>
                  <span className="font-medium text-gray-500 group-hover:text-pink-600">View All Categories</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ================= TRENDING PRODUCTS ================= */}
      <section className="py-24 bg-[#fafafa]">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-pink-500 font-medium tracking-wider uppercase text-sm mb-2 block">Our Best Sellers</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-4">Trending Now</h2>
            <div className="w-16 h-1 bg-gray-900 mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product._id}
                className="group bg-white rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/product/${product._id}`)}
              >
                <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
                  <img
                    src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/300'}
                    alt={product.name}
                    className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-700"
                  />
                  
                  {/* Wishlist Button (Always Visible) */}
                  <button
                    onClick={(e) => handleAction(e, 'wishlist', product)}
                    className={`absolute top-3 right-3 p-2 rounded-full transition-colors shadow-sm backdrop-blur-sm z-10 ${
                      isInWishlist(product._id) 
                        ? 'bg-[#fc2779] text-white' 
                        : 'bg-white/80 text-gray-400 hover:text-[#fc2779] hover:bg-white'
                    }`}
                  >
                    <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="p-3 sm:p-5">
                  <p className="text-[10px] sm:text-xs font-medium text-gray-400 mb-1 uppercase tracking-wide truncate">{product.category}</p>
                  <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-1 sm:mb-2 truncate group-hover:text-[#fc2779] transition-colors">{product.name}</h3>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-2 sm:mt-0">
                    <span className="text-sm sm:text-lg font-serif font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                    
                    {/* Desktop Star Rating */}
                    <div className="flex text-amber-400 text-xs hidden sm:flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-current" />
                      ))}
                    </div>

                    {/* Add Button (Always Visible) */}
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

          <div className="text-center mt-16">
            <Link 
              to="/shop" 
              className="inline-block px-10 py-4 border-2 border-gray-900 text-gray-900 font-medium rounded-full hover:bg-gray-900 hover:text-white transition-all duration-300"
            >
              Shop All Products
            </Link>
          </div>
        </div>
      </section>

      {/* ================= NEWSLETTER ================= */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-6">Join the Glow Club</h2>
          <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-lg">
            Subscribe to our newsletter for exclusive offers, beauty tips, and early access to new launches.
          </p>
          
          <form className="max-w-md mx-auto flex gap-2" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="flex-1 px-6 py-4 rounded-full bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 backdrop-blur-sm"
            />
            <button 
              type="submit" 
              className="px-8 py-4 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-full transition-colors shadow-lg shadow-pink-600/30"
            >
              Subscribe
            </button>
          </form>
          <p className="text-xs text-gray-500 mt-4">We respect your privacy. Unsubscribe at any time.</p>
        </div>
      </section>

    </div>
  );
};

export default Home;
