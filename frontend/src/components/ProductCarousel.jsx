import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { trackAction } from '../utils/tracking';

const ProductCarousel = ({ title, products = [] }) => {
  const scrollRef = useRef(null);
  const navigate = useNavigate();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  if (!products || products.length === 0) return null;

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = direction === 'left' ? -current.offsetWidth : current.offsetWidth;
      current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleProductClick = (product) => {
    // trackAction('view', product); // We'll let ProductDetails handle the view tracking to be accurate
    navigate(`/product/${product._id}`);
    window.scrollTo(0, 0);
  };

  const toggleWishlist = (e, product) => {
    e.stopPropagation();
    if (isInWishlist(product._id)) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  return (
    <div className="my-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{title}</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => scroll('left')}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-4 sm:gap-6 pb-4 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((item) => (
          <div
            key={item._id}
            className="flex-none w-[200px] sm:w-[240px] snap-start group relative bg-white border border-gray-100 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col"
            onClick={() => handleProductClick(item)}
          >
            <div className="relative aspect-[4/5] bg-gray-50 overflow-hidden">
              <img
                src={item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/300'}
                alt={item.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <button 
                onClick={(e) => toggleWishlist(e, item)}
                className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-400 hover:text-[#fc2779] shadow-sm z-10"
              >
                <Heart className={`w-4 h-4 ${isInWishlist(item._id) ? 'fill-[#fc2779] text-[#fc2779]' : ''}`} />
              </button>
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              <span className="text-xs font-semibold text-[#fc2779] tracking-wider uppercase mb-1">
                {item.category}
              </span>
              <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-2 leading-tight flex-1">
                {item.name}
              </h3>
              
              <div className="flex items-end justify-between mt-auto">
                <div>
                  <span className="text-lg font-bold text-gray-900">₹{item.price}</span>
                  {item.discountPrice && item.discountPrice < item.price && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 line-through">₹{item.price + 500}</span>
                      <span className="text-xs font-bold text-green-600">Off</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel;
