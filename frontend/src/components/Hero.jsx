import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, MapPin, MessageCircle, Star, Award, ShieldCheck } from 'lucide-react';

const Hero = ({ heroConfig }) => {
  const navigate = useNavigate();

  const renderButton = (cta, variant = 'primary') => {
    if (!cta || !cta.text) return null;
    
    const primaryClasses = "group relative px-8 py-4 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 text-white rounded-full font-medium shadow-lg hover:shadow-pink-500/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden";
    const secondaryClasses = "group px-8 py-4 bg-white/90 backdrop-blur-md text-gray-800 border border-pink-100 hover:border-pink-300 rounded-full font-medium shadow-sm hover:bg-pink-50/20 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer";
    
    const baseClasses = variant === 'primary' ? primaryClasses : secondaryClasses;
    
    const content = (
      <span className="relative z-10 flex items-center gap-2">
        {cta.text}
        {variant === 'primary' && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />}
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
          {variant === 'primary' && (
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-rose-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          )}
        </Link>
      );
    }

    return (
      <a 
        href={href} 
        target={cta.type === 'custom_url' ? '_self' : '_blank'} 
        rel="noopener noreferrer" 
        className={baseClasses}
      >
        {content}
        {variant === 'primary' && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-rose-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        )}
      </a>
    );
  };

  return (
    <section className="relative min-h-[90vh] lg:min-h-[85vh] flex items-center overflow-x-hidden bg-gradient-to-br from-pink-50/40 via-white to-purple-50/40 py-12 md:py-16 lg:py-20 border-b border-pink-100/40">
      
      {/* Self-contained styling for floating badges and custom animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px) rotate(12deg); }
          50% { transform: translateY(-16px) rotate(8deg); }
        }
        @keyframes float-subtle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        @keyframes pulse-glow {
          0%, 100% { transform: scale(1); opacity: 0.4; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        .animate-float-slow {
          animation: float-slow 5s ease-in-out infinite;
        }
        .animate-float-slower {
          animation: float-slower 7s ease-in-out infinite;
        }
        .animate-float-subtle {
          animation: float-subtle 4s ease-in-out infinite;
        }
        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
      `}} />

      {/* Background Image & Luxury Gradient Overlay */}
      {heroConfig?.backgroundImage && (
        <div className="absolute inset-0 z-0">
          <img 
            src={heroConfig.backgroundImage} 
            alt="Hero Background" 
            className="w-full h-full object-cover" 
          />
          {/* Subtle light/rose-gradient to keep everything beautiful, high-contrast, and luxury */}
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 md:via-white/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent"></div>
        </div>
      )}

      {/* Decorative Blurry Blobs for abstract backdrop */}
      {!heroConfig?.backgroundImage && (
        <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-tr from-pink-200/30 to-rose-200/30 blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-gradient-to-bl from-purple-200/30 to-indigo-100/30 blur-3xl"></div>
          <div className="absolute top-[20%] right-[10%] w-[30vw] h-[30vw] rounded-full bg-gradient-to-br from-pink-100/20 to-orange-100/20 blur-3xl"></div>
        </div>
      )}

      <div className="container mx-auto px-4 lg:px-8 relative z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Brand Content & CTAs */}
          <div className="lg:col-span-7 flex flex-col items-start text-left max-w-2xl">
            {/* Offer / Tagline Badge */}
            {heroConfig?.offerBadge && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-50/80 backdrop-blur-md border border-pink-100/60 shadow-sm mb-6 hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-4.5 h-4.5 text-pink-500 animate-pulse" />
                <span className="text-xs font-bold text-pink-700 tracking-wider uppercase">{heroConfig.offerBadge}</span>
              </div>
            )}

            {/* Sub-Tagline / Micro tagline */}
            <span className="text-xs md:text-sm font-bold tracking-[0.2em] text-pink-600 uppercase mb-3">
              Premium Cosmetics & Skincare
            </span>

            {/* Redesigned Title - Beautiful E-commerce Style */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-extrabold text-slate-900 mb-5 leading-[1.15] tracking-tight">
              {heroConfig?.title || 'Redefine Your True Beauty'}
            </h1>
            
            {/* Subtitle description */}
            <p className="text-base md:text-lg text-slate-600 mb-8 leading-relaxed font-light">
              {heroConfig?.subtitle || 'Discover curated luxury makeup, skincare, and fragrance designed to highlight your natural glow.'}
            </p>
            
            {/* CTA Buttons */}
            <div className="hidden md:flex flex-row items-center gap-4 w-auto mb-10">
              {renderButton(heroConfig?.cta1, 'primary')}
              {renderButton(heroConfig?.cta2, 'secondary')}
            </div>
          </div>

          {/* Right Column: E-commerce Product Showcase with Floating Badges */}
          <div className="lg:col-span-5 relative w-full flex justify-center items-center">
            {/* Soft background glow */}
            <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-pink-300/30 to-purple-400/20 blur-3xl -z-10 animate-pulse-glow"></div>

            {/* Main Showcase Image Container */}
            <div className="relative w-[280px] sm:w-[320px] md:w-[350px] aspect-[4/5] rounded-[2.5rem] p-3 bg-white/40 backdrop-blur-md border border-white/50 shadow-2xl overflow-hidden hover:scale-[1.01] transition-transform duration-500 group">
              <div className="w-full h-full rounded-[2rem] overflow-hidden relative">
                {/* Visual Image - Dynamic or Fallback */}
                <img 
                  src={heroConfig?.productImage || "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=800"} 
                  alt="Featured Luxury Cosmetics" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                {/* Soft cosmetic purple/pink overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-pink-900/30 via-transparent to-transparent"></div>
                
                {/* Brand watermark on card bottom */}
                <div className="absolute bottom-4 left-0 right-0 text-center">
                  <span className="text-white/90 text-sm font-serif font-semibold tracking-widest uppercase bg-slate-900/40 backdrop-blur-md px-4 py-1.5 rounded-full inline-block">
                    DDCosmetics
                  </span>
                </div>
              </div>
            </div>

            {/* Floating Card 1: Best Seller Badge (Top-Left) */}
            <div className="absolute -top-6 -left-4 sm:-left-8 bg-white/90 backdrop-blur-md px-4 py-3 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-pink-100/50 flex items-center gap-3 animate-float-slow cursor-default hover:scale-105 transition-transform duration-300">
              <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div className="text-left">
                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Top Choice</p>
                <p className="text-xs font-extrabold text-slate-800">Best Seller</p>
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500">
                  <span>★ 4.9</span>
                  <span className="text-slate-400">(12K+)</span>
                </div>
              </div>
            </div>

            {/* Floating Card 2: Interactive Discount Badge (Bottom-Right) */}
            <div className="absolute bottom-10 -right-4 sm:-right-8 bg-gradient-to-tr from-pink-500 to-purple-600 text-white p-3 rounded-full shadow-[0_8px_30px_rgba(236,72,153,0.3)] flex flex-col items-center justify-center w-24 h-24 rotate-12 hover:rotate-0 transition-transform duration-300 cursor-pointer animate-float-slower"
                 onClick={() => navigate('/shop?discount=true')}>
              <span className="text-[10px] uppercase font-bold tracking-wider text-pink-100">Special</span>
              <span className="text-base font-extrabold">20% OFF</span>
              <span className="text-[8px] uppercase tracking-widest text-pink-200">Site-Wide</span>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>

            {/* Floating Card 3: Quality Pledge (Bottom-Left) */}
            <div className="absolute bottom-4 -left-6 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.05)] border border-slate-100 flex items-center gap-2.5 animate-float-subtle cursor-default">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-slate-700">100% Organic & Vegan</span>
            </div>

          </div>

        </div>

        {/* ================= FLOATING INFO BAR REDESIGN ================= */}
        {((heroConfig?.deliveryInfo?.text) || (heroConfig?.deliveryInfo?.whatsappNumber)) && (
          <div className="w-full flex justify-center mt-12 md:mt-16">
            <div className="bg-white/70 backdrop-blur-lg border border-white/60 shadow-[0_20px_50px_rgba(0,0,0,0.08)] rounded-[2rem] p-3 flex flex-col md:flex-row items-center gap-4 md:gap-6 w-full max-w-2xl sm:w-fit mx-auto justify-center">
              
              {/* Delivery Location section */}
              {heroConfig?.deliveryInfo?.text && (
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-9 h-9 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500 shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Free Delivery</p>
                    {heroConfig.deliveryInfo.mapLink ? (
                      <a 
                        href={heroConfig.deliveryInfo.mapLink}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-xs font-bold text-slate-700 hover:text-pink-600 transition-colors flex items-center gap-1 group"
                      >
                        {heroConfig.deliveryInfo.text}
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                    ) : (
                      <p className="text-xs font-bold text-slate-700">{heroConfig.deliveryInfo.text}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Divider between Location and WhatsApp */}
              {heroConfig?.deliveryInfo?.text && heroConfig?.deliveryInfo?.whatsappNumber && (
                <div className="hidden md:block w-px h-8 bg-slate-200/80"></div>
              )}

              {/* WhatsApp Support Button */}
              {heroConfig?.deliveryInfo?.whatsappNumber && (
                <a 
                  href={`https://wa.me/${heroConfig.deliveryInfo.whatsappNumber.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full md:w-auto px-5 py-3 bg-emerald-50 hover:bg-emerald-500 text-emerald-600 hover:text-white rounded-2xl flex items-center justify-center gap-2 text-sm font-bold transition-all duration-300 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4 fill-current" />
                  <span>Chat Support</span>
                </a>
              )}

            </div>
          </div>
        )}

      </div>
    </section>
  );
};

export default Hero;
