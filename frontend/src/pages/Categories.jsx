import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Loader, ArrowLeft } from 'lucide-react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories');
        if (res.data) {
          setCategories(res.data.filter(cat => cat.isActive));
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="bg-white sticky top-0 z-10 shadow-sm border-b border-gray-100">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={() => navigate(-1)} className="p-1 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">All Categories</h1>
        </div>
      </div>

      {/* Grid */}
      <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div 
            key={cat._id}
            onClick={() => navigate(`/shop?category=${cat.slug}`)}
            className="flex flex-col items-center gap-3 p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer bg-white"
          >
            <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-100">
              <img 
                src={cat.image || 'https://via.placeholder.com/150'} 
                alt={cat.name}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
              />
            </div>
            <span className="text-sm font-bold text-gray-800 text-center line-clamp-2">
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;