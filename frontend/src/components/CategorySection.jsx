import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

const CategorySection = ({ categories }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentCategory = searchParams.get('category');

  const handleCategoryClick = (slug) => {
    // If clicking the active category, clear it (toggle off)
    if (currentCategory === slug) {
      navigate('/shop');
    } else {
      navigate(`/shop?category=${slug}`);
    }
  };

  // Placeholder images mapping based on index or random
  const getPlaceholderImage = (index) => {
    const placeholders = [
      'https://images.unsplash.com/photo-1596462502278-27bfdd403348?w=150&h=150&fit=crop', // Makeup
      'https://images.unsplash.com/photo-1571781535009-5363219b1772?w=150&h=150&fit=crop', // Skincare
      'https://images.unsplash.com/photo-1522335789203-abd6538d8ad3?w=150&h=150&fit=crop', // Lipstick
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=150&h=150&fit=crop', // Perfume
      'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=150&h=150&fit=crop', // Eye
      'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=150&h=150&fit=crop', // Palette
    ];
    return placeholders[index % placeholders.length];
  };

  if (!categories || categories.length === 0) return null;

  return (
    <div className="w-full bg-white mb-2 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto gap-4 sm:gap-8 pb-2 no-scrollbar scroll-smooth">
          {/* 'All' Option */}
          <div 
            onClick={() => navigate('/shop')}
            className="flex flex-col items-center min-w-[70px] cursor-pointer group"
          >
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 border-2 transition-all duration-200 ${
              !currentCategory ? 'border-[#fc2779]' : 'border-gray-100 group-hover:border-pink-200'
            }`}>
              <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                <span className={`text-xs font-bold ${!currentCategory ? 'text-[#fc2779]' : 'text-gray-500'}`}>ALL</span>
              </div>
            </div>
            <span className={`mt-2 text-xs sm:text-sm font-medium text-center truncate w-full ${
              !currentCategory ? 'text-[#fc2779]' : 'text-gray-700'
            }`}>
              All
            </span>
          </div>

          {/* Dynamic Categories */}
          {categories.map((cat, index) => {
            const isActive = currentCategory === cat.slug;
            return (
              <div 
                key={cat._id}
                onClick={() => handleCategoryClick(cat.slug)}
                className="flex flex-col items-center min-w-[70px] cursor-pointer group"
              >
                <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 border-2 transition-all duration-200 ${
                  isActive ? 'border-[#fc2779]' : 'border-gray-100 group-hover:border-pink-200'
                }`}>
                  <img 
                    src={cat.image || getPlaceholderImage(index)} 
                    alt={cat.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <span className={`mt-2 text-xs sm:text-sm font-medium text-center truncate w-full px-1 ${
                  isActive ? 'text-[#fc2779]' : 'text-gray-700'
                }`}>
                  {cat.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CategorySection;
