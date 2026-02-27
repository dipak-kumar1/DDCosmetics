import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { Heart, ShoppingBag, ArrowLeft, Star, Truck, ShieldCheck, ChevronRight, Share2, MapPin, Package } from 'lucide-react'
import api from '../services/api'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const [product, setProduct] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState('')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [pincode, setPincode] = useState('')
  const [relatedProducts, setRelatedProducts] = useState([])
  const [recentlyViewed, setRecentlyViewed] = useState([])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`)
        setProduct(res.data)
        if (res.data.images && res.data.images.length > 0) {
          setActiveImage(res.data.images[0])
        }
        
        // Fetch related products based on category
        if (res.data.category) {
          const relatedRes = await api.get('/products', { 
            params: { category: res.data.category } 
          })
          setRelatedProducts(
            relatedRes.data
              .filter(p => p._id !== res.data._id)
              .slice(0, 4) // Limit to 4 related products
          )
        }

        // Handle Recently Viewed
        const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
        
        // Remove current product if it exists (to move it to top)
        const filteredRecent = recent.filter(p => p._id !== res.data._id)
        
        // Add current product to top
        const newRecent = [res.data, ...filteredRecent].slice(0, 10) // Keep last 10
        
        localStorage.setItem('recentlyViewed', JSON.stringify(newRecent))
        
        // Set state for display (excluding current product)
        setRecentlyViewed(filteredRecent.slice(0, 8)) // Show 8 recent items
        
      } catch (err) {
        console.error('Failed to fetch product', err)
        navigate('/shop')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id, navigate])

  const handleScroll = (e) => {
    const scrollPosition = e.target.scrollLeft
    const width = e.target.offsetWidth
    const index = Math.round(scrollPosition / width)
    setCurrentSlide(index)
  }

  const handleAction = (action) => {
    if (!user && action !== 'share') {
      navigate('/login')
      return
    }

    if (action === 'cart') {
      addToCart(product, quantity)
    } else if (action === 'wishlist') {
      if (isInWishlist(product._id)) {
        removeFromWishlist(product._id)
      } else {
        addToWishlist(product)
      }
    } else if (action === 'share') {
      if (navigator.share) {
        navigator.share({
          title: product.name,
          text: `Check out ${product.name} on DDCosmetics!`,
          url: window.location.href,
        }).catch(console.error);
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    }
  }

  const handleBuyNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Add product to cart and immediately navigate to checkout
    addToCart(product, quantity);
    setTimeout(() => {
      navigate('/checkout');
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fc2779]"></div>
      </div>
    )
  }
  
  if (!product) return null

  const discount = 20; // Mock discount for Nykaa look
  const mrp = Math.round(product.price * (100 / (100 - discount)));

  return (
    <div className="min-h-screen bg-white pt-20 pb-12">
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center text-sm text-gray-500">
          <Link to="/" className="hover:text-[#fc2779]">Home</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <Link to="/shop" className="hover:text-[#fc2779]">Shop</Link>
          <ChevronRight className="w-4 h-4 mx-2" />
          <span className="capitalize text-gray-900 truncate">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Images (5 cols) */}
          <div className="lg:col-span-5">
            
            {/* Mobile Image Slider (< lg) */}
            <div className="lg:hidden mb-6 relative">
              <div 
                className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide aspect-[4/5]"
                onScroll={handleScroll}
              >
                {product.images && product.images.length > 0 ? (
                  product.images.map((img, index) => (
                    <div key={index} className="w-full flex-shrink-0 snap-center relative bg-gray-50 flex items-center justify-center">
                      <img
                        src={img}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))
                ) : (
                  <div className="w-full flex-shrink-0 snap-center relative bg-gray-50 flex items-center justify-center">
                      <img
                        src={'https://via.placeholder.com/600?text=No+Image'}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                  </div>
                )}
              </div>
              
              {/* Wishlist Button (Mobile) */}
              <button 
                onClick={() => handleAction('wishlist')}
                className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-md z-10"
              >
                  <Heart className={`w-6 h-6 ${isInWishlist(product._id) ? 'fill-[#fc2779] text-[#fc2779]' : 'text-gray-400'}`} />
              </button>

              {/* Share Button (Mobile) */}
              <button 
                onClick={() => handleAction('share')}
                className="absolute bottom-8 right-4 p-2 bg-white rounded-full shadow-md z-10"
              >
                  <Share2 className="w-5 h-5 text-gray-600" />
              </button>

              {/* Dots Indicator */}
              {product.images && product.images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
                  {product.images.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${
                        currentSlide === index ? 'bg-[#fc2779] w-6' : 'bg-gray-300 w-1.5'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Image Gallery (>= lg) */}
            <div className="hidden lg:block">
              <div className="flex gap-4">
                {/* Thumbnails (Left Side Vertical) */}
                {product.images && product.images.length > 0 && (
                  <div className="flex flex-col gap-3 w-20 max-h-[500px] overflow-y-auto scrollbar-hide">
                    {product.images.map((img, index) => (
                      <button
                        key={index}
                        onMouseEnter={() => setActiveImage(img)}
                        onClick={() => setActiveImage(img)}
                        className={`flex-shrink-0 w-20 h-20 border rounded-lg overflow-hidden transition-all duration-200 ${
                          activeImage === img 
                            ? 'border-[#fc2779] ring-1 ring-[#fc2779] shadow-sm' 
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Main Image (Right Side) */}
                <div className="flex-1 relative group">
                  <div className="border border-gray-100 rounded-lg overflow-hidden bg-white shadow-sm">
                    <img
                      src={activeImage || 'https://via.placeholder.com/600?text=No+Image'}
                      alt={product.name}
                      className="w-full h-auto object-contain max-h-[600px] cursor-crosshair hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <button 
                    onClick={() => handleAction('wishlist')}
                    className="absolute top-4 right-4 p-2.5 bg-white rounded-full shadow-md hover:scale-110 transition-transform z-10"
                  >
                     <Heart className={`w-5 h-5 ${isInWishlist(product._id) ? 'fill-[#fc2779] text-[#fc2779]' : 'text-gray-400'}`} />
                  </button>

                  <button 
                    onClick={() => handleAction('share')}
                    className="absolute bottom-4 right-4 p-2.5 bg-white rounded-full shadow-md hover:scale-110 transition-transform z-10"
                  >
                     <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Product Info (7 cols) */}
          <div className="lg:col-span-7">
            <div className="flex flex-col h-full">
              <h1 className="text-2xl font-medium text-gray-900 mb-2 leading-tight">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center bg-green-700 text-white px-2 py-0.5 rounded text-sm font-bold">
                  4.5 <Star className="w-3 h-3 ml-1 fill-current" />
                </div>
                <span className="text-gray-500 text-sm">128 ratings & 45 reviews</span>
              </div>

              <div className="border-b border-gray-200 pb-6 mb-6">
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-2xl font-bold text-gray-900">₹{product.price}</span>
                  <span className="text-gray-500 line-through text-sm">₹{mrp}</span>
                  <span className="text-green-600 font-bold text-sm">{discount}% Off</span>
                </div>
                <p className="text-gray-500 text-xs">inclusive of all taxes</p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={() => handleAction('cart')}
                  className="flex-1 bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </button>

                <button
                  onClick={handleBuyNow}
                  className="flex-1 bg-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-pink-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-pink-200"
                >
                  Buy Now
                </button>
              </div>
            
              {/* Trust Badges below buttons */}
              <div className="flex items-center justify-center gap-4 text-xs font-medium text-gray-500 bg-gray-50 py-3 rounded-lg border border-gray-100 mb-8">
                <span className="flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-pink-500" /> Same Day Pickup Available
                </span>
                <span className="w-px h-4 bg-gray-300"></span>
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-pink-500" /> Free Delivery within 3km
                </span>
              </div>

              {/* Delivery Section */}
              <div className="border border-gray-200 rounded-sm p-4 mb-8 bg-gray-50">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-bold text-gray-900">Delivery Options</span>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter Pincode" 
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="border border-gray-300 px-3 py-2 text-sm w-full max-w-[200px] rounded-sm focus:outline-none focus:border-[#fc2779]"
                  />
                  <button className="text-[#fc2779] font-bold text-sm uppercase hover:text-[#d61f66]">Check</button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4 mb-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="text-xs text-gray-600">100% Genuine</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="text-xs text-gray-600">Easy Returns</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Truck className="w-5 h-5 text-gray-600" />
                  </div>
                  <span className="text-xs text-gray-600">Free Shipping</span>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-bold text-gray-900 mb-4">Product Details</h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                  {product.description}
                </p>
                
                <div className="mt-6">
                  <h4 className="font-bold text-gray-900 mb-2 text-sm">Category</h4>
                  <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wide">
                    {product.category}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Similar Products</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((item) => (
                <div
                  key={item._id}
                  className="group relative bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    navigate(`/product/${item._id}`)
                    window.scrollTo(0, 0)
                  }}
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 h-48 sm:h-64 relative">
                    <img
                      src={item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/300'}
                      alt={item.name}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2">
                       <button className="p-1.5 bg-white/80 rounded-full text-gray-400 hover:text-[#fc2779] backdrop-blur-sm">
                          <Heart className="w-4 h-4" />
                       </button>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs text-[#fc2779] font-medium mb-1 truncate">{item.category}</p>
                    <h3 className="text-sm font-bold text-gray-900 mb-2 truncate">{item.name}</h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-gray-900">₹{item.price}</span>
                      {item.discountPrice && item.discountPrice < item.price && (
                        <span className="text-xs text-green-600 font-bold">
                          {Math.round(((item.price - item.discountPrice) / item.price) * 100)}% Off
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently Viewed</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {recentlyViewed.map((item) => (
                <div
                  key={item._id}
                  className="group relative bg-white border border-gray-100 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    navigate(`/product/${item._id}`)
                    window.scrollTo(0, 0)
                  }}
                >
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 h-48 sm:h-64 relative">
                    <img
                      src={item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/300'}
                      alt={item.name}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-bold text-gray-900 mb-1 truncate">{item.name}</h3>
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-gray-900">₹{item.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
