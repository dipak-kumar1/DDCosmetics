import React, { useState, useEffect } from 'react';
import api from '../services/api';
import HomeSections from '../components/HomeSections';
import ProductCarousel from '../components/ProductCarousel';
import Hero from '../components/Hero';

const Home = () => {
  const [heroConfig, setHeroConfig] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [basedOnInterests, setBasedOnInterests] = useState([]);

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

    fetchData();
    fetchRecommendations();
  }, []);



  return (
    <div className="flex flex-col min-h-screen bg-white font-sans selection:bg-pink-100 selection:text-pink-900">
      {/* ================= HERO SECTION ================= */}
      {heroConfig?.isActive && (
        <Hero heroConfig={heroConfig} />
      )}

      {/* ================= PERSONALIZED RECOMMENDATIONS ================= */}
      {(recommended.length > 0 || basedOnInterests.length > 0) && (
        <section className="py-16 bg-[#fafafa]">
          <div className="container mx-auto px-4">
            {recommended.length > 0 && (
              <ProductCarousel title="Recommended For You" products={recommended} />
            )}
            {basedOnInterests.length > 0 && (
              <ProductCarousel title="Based on Your Interests" products={basedOnInterests} />
            )}
          </div>
        </section>
      )}

      {/* ================= HOME SECTIONS (Trending, Best Sellers, Combos, New) ================= */}
      <HomeSections />

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
