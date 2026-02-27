import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Sparkles, ArrowRight, MapPin, MessageCircle } from 'lucide-react';
import HomeSections from '../components/HomeSections';

const Home = () => {
  const [heroConfig, setHeroConfig] = useState(null);

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
    fetchData();
  }, []);

  const renderButton = (cta, variant = 'primary') => {
    if (!cta || !cta.text) return null;
    
    const baseClasses = variant === 'primary' 
      ? "group relative px-8 py-4 bg-gray-900 text-white rounded-full overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      : "px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-full font-medium hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 cursor-pointer";
    
    const content = (
      <span className="relative z-10 flex items-center gap-2 font-medium">
        {cta.text} {variant === 'primary' && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
      </span>
    );

    let href = cta.link || '#';
    if (cta.type === 'whatsapp') href = `https://wa.me/${(cta.link || '').replace(/[^0-9]/g, '')}`;
    if (cta.type === 'call') href = `tel:${cta.link}`;
    if (cta.type === 'visit_store') href = cta.link; // Assuming map link
    
    if (cta.type === 'custom_url' && cta.link && cta.link.startsWith('/')) {
      return (
        <Link to={cta.link} className={baseClasses}>
          {content}
          {variant === 'primary' && <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>}
        </Link>
      );
    }

    return (
      <a href={href} target={cta.type === 'custom_url' ? '_self' : '_blank'} rel="noopener noreferrer" className={baseClasses}>
        {content}
        {variant === 'primary' && <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>}
      </a>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans selection:bg-pink-100 selection:text-pink-900">
      
      {/* ================= HERO SECTION ================= */}
      {heroConfig?.isActive && (
        <section className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-[#fafafa]">
          {/* Background Image (if provided) */}
          {heroConfig?.backgroundImage && (
            <div className="absolute inset-0 z-0">
              <img src={heroConfig.backgroundImage} alt="Hero Background" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/60 to-transparent"></div>
            </div>
          )}

          {/* Abstract Background Shapes (only visible if no image or underneath) */}
          {!heroConfig?.backgroundImage && (
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
              <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-r from-pink-200/40 to-purple-200/40 blur-3xl animate-blob"></div>
              <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-gradient-to-l from-rose-200/40 to-orange-100/40 blur-3xl animate-blob" style={{ animationDelay: '2s' }}></div>
              <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[50%] rounded-full bg-gradient-to-t from-indigo-200/40 to-blue-100/40 blur-3xl animate-blob" style={{ animationDelay: '4s' }}></div>
            </div>
          )}

          <div className="container mx-auto px-4 relative z-10 flex flex-col items-center justify-center text-center">
            {heroConfig?.offerBadge && (
              <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/80 backdrop-blur-md border border-pink-100 shadow-sm mb-8 animate-fade-in-up hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-4 h-4 text-pink-500" />
                <span className="text-sm font-bold text-gray-800 tracking-wide uppercase">{heroConfig.offerBadge}</span>
              </div>
            )}

            <h1 className="text-5xl md:text-7xl lg:text-9xl font-serif font-bold text-gray-900 mb-6 leading-[1.1] tracking-tighter animate-fade-in-up drop-shadow-sm" style={{ animationDelay: '0.1s' }}>
              {heroConfig?.title}
            </h1>
            
            <p className="text-lg md:text-2xl text-gray-700 mb-10 max-w-2xl mx-auto leading-relaxed font-light animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              {heroConfig?.subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up mb-12" style={{ animationDelay: '0.3s' }}>
              {renderButton(heroConfig?.cta1, 'primary')}
              {renderButton(heroConfig?.cta2, 'secondary')}
            </div>

            {/* Delivery Info Badge - Moved to flow to avoid overlap */}
            {heroConfig?.deliveryInfo && heroConfig.deliveryInfo.text && (
              <div className="hidden md:flex items-center gap-4 px-8 py-4 bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 animate-fade-in-up transform hover:-translate-y-1 transition-all duration-300" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-3 text-gray-800 font-semibold">
                  <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <span className="text-lg">{heroConfig.deliveryInfo.text}</span>
                </div>
                
                {(heroConfig.deliveryInfo.mapLink || heroConfig.deliveryInfo.whatsappNumber) && (
                  <div className="h-8 w-px bg-gray-200 mx-4"></div>
                )}

                <div className="flex items-center gap-3">
                  {heroConfig.deliveryInfo.mapLink && (
                    <a 
                      href={heroConfig.deliveryInfo.mapLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex items-center justify-center w-10 h-10 bg-green-50 text-green-600 rounded-full hover:bg-green-500 hover:text-white transition-all duration-300 shadow-sm"
                      title="View on Map"
                    >
                      <MapPin className="w-5 h-5" />
                    </a>
                  )}
                  {heroConfig.deliveryInfo.whatsappNumber && (
                    <a 
                      href={`https://wa.me/${heroConfig.deliveryInfo.whatsappNumber.replace(/[^0-9]/g, '')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group flex items-center justify-center w-10 h-10 bg-green-50 text-green-600 rounded-full hover:bg-green-500 hover:text-white transition-all duration-300 shadow-sm"
                      title="Chat on WhatsApp"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Delivery Info (Simple) */}
            {heroConfig?.deliveryInfo && heroConfig.deliveryInfo.text && (
              <div className="md:hidden mt-4 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 bg-white/80 backdrop-blur-sm px-5 py-3 rounded-full mx-auto w-fit shadow-lg border border-gray-100">
                 <MapPin className="w-4 h-4 text-pink-500" />
                 <span>{heroConfig.deliveryInfo.text}</span>
              </div>
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
