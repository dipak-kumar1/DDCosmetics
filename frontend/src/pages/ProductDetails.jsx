import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { Heart, ShoppingBag, ArrowLeft, Star, Truck, ShieldCheck, ChevronRight, Share2, MapPin, Package, X, Check, Camera, Image as ImageIcon } from 'lucide-react'
import api from '../services/api'
import { trackAction } from '../utils/tracking'
import ProductCarousel from '../components/ProductCarousel'

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
  const [similarProducts, setSimilarProducts] = useState([])
  const [alsoBought, setAlsoBought] = useState([])
  const [becauseYouViewed, setBecauseYouViewed] = useState([])
  
  // Reviews State
  const [reviews, setReviews] = useState([])
  const [reviewsSummary, setReviewsSummary] = useState({
    averageRating: 0,
    totalReviews: 0,
    distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  })
  const [eligibility, setEligibility] = useState({
    canReview: false,
    hasReviewed: false,
    isVerified: false
  })
  const [filterImagesOnly, setFilterImagesOnly] = useState(false)
  const [sortBy, setSortBy] = useState('latest')
  const [loadingReviews, setLoadingReviews] = useState(false)

  // Review Form State
  const [ratingInput, setRatingInput] = useState(5)
  const [ratingHover, setRatingHover] = useState(0)
  const [commentInput, setCommentInput] = useState('')
  const [selectedFiles, setSelectedFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  // Lightbox State
  const [activeLightboxImage, setActiveLightboxImage] = useState(null)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`)
        setProduct(res.data)
        if (res.data.images && res.data.images.length > 0) {
          setActiveImage(res.data.images[0])
        }
        
        // Track the view action immediately
        trackAction('view', res.data);

        // Fetch product recommendations from the backend
        try {
          const recRes = await api.get(`/recommendations/product/${id}`);
          if (recRes.data) {
            setSimilarProducts(recRes.data.similarProducts || []);
            setAlsoBought(recRes.data.customersAlsoBought || []);
            setBecauseYouViewed(recRes.data.becauseYouViewedThis || []);
          }
        } catch (recErr) {
          console.error('Failed to fetch product recommendations:', recErr);
        }
        
      } catch (err) {
        console.error('Failed to fetch product', err)
        navigate('/shop')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id, navigate])

  const fetchReviews = async () => {
    setLoadingReviews(true)
    try {
      const res = await api.get(`/reviews/product/${id}`, {
        params: { sort: sortBy, imagesOnly: filterImagesOnly }
      })
      setReviews(res.data.reviews || [])
      if (res.data.summary) {
        setReviewsSummary(res.data.summary)
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
    } finally {
      setLoadingReviews(false)
    }
  }

  const checkReviewEligibility = async () => {
    if (!user) return
    try {
      const res = await api.get(`/reviews/product/${id}/can-review`)
      setEligibility(res.data)
    } catch (err) {
      console.error('Failed to check review eligibility:', err)
    }
  }

  useEffect(() => {
    fetchReviews()
  }, [id, sortBy, filterImagesOnly])

  useEffect(() => {
    checkReviewEligibility()
  }, [id, user])

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const newFiles = [...selectedFiles, ...files].slice(0, 5)
    setSelectedFiles(newFiles)

    // revoke old preview URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url))
    const urls = newFiles.map(file => URL.createObjectURL(file))
    setPreviewUrls(urls)
  }

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, idx) => idx !== index)
    setSelectedFiles(newFiles)

    previewUrls.forEach(url => URL.revokeObjectURL(url))
    const urls = newFiles.map(file => URL.createObjectURL(file))
    setPreviewUrls(urls)
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!commentInput.trim()) {
      setFormError('Please enter a comment.')
      return
    }
    setSubmitting(true)
    setFormError('')
    setFormSuccess('')

    const formData = new FormData()
    formData.append('rating', ratingInput)
    formData.append('comment', commentInput)
    selectedFiles.forEach(file => {
      formData.append('images', file)
    })

    try {
      await api.post(`/reviews/product/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setFormSuccess('Review submitted successfully!')
      setCommentInput('')
      setSelectedFiles([])
      previewUrls.forEach(url => URL.revokeObjectURL(url))
      setPreviewUrls([])
      setRatingInput(5)
      
      // Refresh reviews & eligibility
      fetchReviews()
      checkReviewEligibility()

      // Dynamically update product info to reflect new average rating
      const updatedProdRes = await api.get(`/products/${id}`)
      setProduct(updatedProdRes.data)
    } catch (err) {
      console.error(err)
      setFormError(err.response?.data?.message || 'Failed to submit review.')
    } finally {
      setSubmitting(false)
    }
  }

  // Track time spent on product page
  useEffect(() => {
    if (!product) return;
    const startTime = Date.now();

    return () => {
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      if (timeSpent >= 1) {
        trackAction('view', product, timeSpent);
      }
    };
  }, [product, id]);

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
                  {product.ratings > 0 ? product.ratings.toFixed(1) : '0.0'} <Star className="w-3 h-3 ml-1 fill-current" />
                </div>
                <a href="#reviews-section" className="text-[#fc2779] text-sm font-medium hover:underline">
                  {product.numReviews || 0} reviews
                </a>
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

        {/* ================= REVIEW SECTION ================= */}
        <div id="reviews-section" className="mt-16 border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-bold font-serif text-gray-900 mb-8">Customer Reviews</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
            {/* Rating Summary Card */}
            <div className="lg:col-span-4 bg-gray-50/70 border border-gray-100 p-6 rounded-2xl text-center">
              <div className="flex flex-col items-center">
                <span className="text-6xl font-black text-slate-800">
                  {reviewsSummary.averageRating > 0 ? reviewsSummary.averageRating.toFixed(1) : '0.0'}
                </span>
                <div className="flex items-center gap-1 my-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-5 h-5 ${
                        star <= Math.round(reviewsSummary.averageRating)
                          ? 'fill-amber-400 text-amber-400' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-gray-500 text-sm font-medium">
                  {reviewsSummary.totalReviews} ratings & reviews
                </span>
              </div>

              {/* Breakdown Bars */}
              <div className="mt-6 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviewsSummary.distribution[star] || 0;
                  const total = reviewsSummary.totalReviews || 1; // avoid divide by zero
                  const percentage = Math.round((count / total) * 100);
                  return (
                    <div key={star} className="flex items-center gap-3 text-sm text-gray-600">
                      <span className="w-12 text-right font-semibold">{star} Star</span>
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-[#fc2779] rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-8 text-left text-gray-400 text-xs">({count})</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Card: Write Review Form or Eligibility Message */}
            <div className="lg:col-span-8">
              {eligibility.canReview ? (
                <form onSubmit={handleReviewSubmit} className="bg-pink-50/20 border border-pink-100/50 p-6 rounded-2xl shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 text-lg">Write a Customer Review</h3>
                  
                  {/* Star Rating Select */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Overall Rating</label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setRatingHover(star)}
                          onMouseLeave={() => setRatingHover(0)}
                          onClick={() => setRatingInput(star)}
                          className="focus:outline-none transition-transform duration-100 active:scale-95"
                        >
                          <Star 
                            className={`w-8 h-8 cursor-pointer ${
                              (ratingHover || ratingInput) >= star 
                                ? 'fill-amber-400 text-amber-400' 
                                : 'text-gray-300 hover:text-amber-300'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Comment input */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Write your review</label>
                    <textarea
                      rows="4"
                      required
                      minLength={5}
                      placeholder="What did you like or dislike? How was the product?"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 bg-white placeholder-gray-400 text-slate-800 text-sm transition-all"
                    />
                  </div>

                  {/* Image Selector & Previews */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Upload product images (Max 5)</label>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 hover:border-pink-500 cursor-pointer flex flex-col items-center justify-center text-gray-400 hover:text-pink-500 transition-colors">
                        <Camera className="w-6 h-6" />
                        <span className="text-[10px] font-bold mt-1">Add Image</span>
                        <input
                          id="review-image-input"
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          disabled={selectedFiles.length >= 5}
                        />
                      </label>

                      {previewUrls.map((url, idx) => (
                        <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 group">
                          <img src={url} alt="preview" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeFile(idx)}
                            className="absolute -top-1 -right-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 shadow-md transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {formError && (
                    <div className="mb-4 text-sm text-red-600 font-medium bg-red-50 px-4 py-2.5 rounded-lg border border-red-100">
                      {formError}
                    </div>
                  )}

                  {formSuccess && (
                    <div className="mb-4 text-sm text-green-600 font-medium bg-green-50 px-4 py-2.5 rounded-lg border border-green-100">
                      {formSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-pink-100 hover:shadow-pink-200/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer text-sm"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : eligibility.hasReviewed ? (
                <div className="bg-gray-50 border border-gray-150 p-6 rounded-2xl text-center">
                  <p className="text-gray-600 text-sm font-medium">You have already submitted a review for this product.</p>
                </div>
              ) : user ? (
                <div className="bg-gray-50 border border-gray-150 p-6 rounded-2xl text-center">
                  <p className="text-gray-600 text-sm font-medium">Only verified purchasers of this product can submit a review.</p>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-150 p-6 rounded-2xl text-center">
                  <p className="text-gray-600 text-sm font-medium">Please <Link to="/login" className="text-[#fc2779] font-bold hover:underline">log in</Link> to write a review.</p>
                </div>
              )}
            </div>
          </div>

          {/* Filters & Sorting Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-4 mb-6 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-sm text-gray-700 font-semibold focus:outline-none focus:ring-1 focus:ring-pink-400"
              >
                <option value="latest">Latest</option>
                <option value="highest">Highest Rating</option>
                <option value="lowest">Lowest Rating</option>
              </select>
            </div>

            <button
              onClick={() => setFilterImagesOnly(!filterImagesOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all cursor-pointer ${
                filterImagesOnly 
                  ? 'bg-pink-50 border-pink-200 text-[#fc2779]' 
                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
            >
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                filterImagesOnly ? 'bg-[#fc2779] border-[#fc2779]' : 'border-gray-300'
              }`}>
                {filterImagesOnly && <Check className="w-3 h-3 text-white" />}
              </div>
              <span>Reviews with images only</span>
            </button>
          </div>

          {/* Reviews List */}
          {loadingReviews ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#fc2779]"></div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">No reviews match your filters.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev._id} className="border border-gray-100 p-6 rounded-2xl bg-white shadow-sm hover:shadow-md hover:border-gray-200 transition-all duration-300">
                  <div className="flex justify-between items-start mb-3 gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-800 text-sm">{rev.user?.name || 'Anonymous User'}</span>
                        {rev.isVerifiedPurchase && (
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-emerald-100/60 inline-flex items-center gap-1">
                            <Check className="w-2.5 h-2.5" /> Verified Purchase
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`w-3.5 h-3.5 ${
                              star <= rev.rating 
                                ? 'fill-amber-400 text-amber-400' 
                                : 'text-gray-200'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 font-medium">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mt-3 leading-relaxed whitespace-pre-line font-normal">
                    {rev.comment}
                  </p>

                  {rev.images && rev.images.length > 0 && (
                    <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1 scrollbar-hide">
                      {rev.images.map((imgUrl, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setActiveLightboxImage(imgUrl)}
                          className="w-18 h-18 rounded-xl overflow-hidden border border-gray-200 cursor-zoom-in hover:opacity-90 active:scale-95 transition-all duration-200 flex-shrink-0"
                        >
                          <img src={imgUrl} alt="review attachment" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lightbox Zoom Modal */}
        {activeLightboxImage && (
          <div 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in"
            onClick={() => setActiveLightboxImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              <img 
                src={activeLightboxImage} 
                alt="Review Zoom" 
                className="w-auto h-auto max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl" 
              />
              <button 
                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 text-white rounded-full p-2.5 transition-colors cursor-pointer"
                onClick={() => setActiveLightboxImage(null)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-12">
            <ProductCarousel title="Similar Products" products={similarProducts} />
          </div>
        )}

        {/* Customers Also Bought */}
        {alsoBought.length > 0 && (
          <div className="mt-12 border-t border-gray-200 pt-8">
            <ProductCarousel title="Customers Also Bought" products={alsoBought} />
          </div>
        )}

        {/* Because You Viewed This */}
        {becauseYouViewed.length > 0 && (
          <div className="mt-12 border-t border-gray-200 pt-8">
            <ProductCarousel title="Because You Viewed This" products={becauseYouViewed} />
          </div>
        )}

      </div>
    </div>
  )
}
