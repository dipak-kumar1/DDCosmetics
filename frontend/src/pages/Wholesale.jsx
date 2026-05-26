import React, { useState, useEffect } from 'react';
import { Package, Mail, Phone, ArrowLeft, Store, MapPin, Tag, ShieldCheck, Loader, ShoppingBag, Plus, Minus, FileText, TrendingUp, Info, X, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const WholesaleProductExpanded = ({ product, onClose, qty, onQtyChange, addToCart, getDynamicPrice }) => {
  const [activeImage, setActiveImage] = useState(product.images?.[0] || 'https://via.placeholder.com/300');
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (Array.isArray(product.images) && product.images.length > 0) {
      setActiveImage(product.images[0]);
    }
  }, [product]);

  const handleScroll = (e) => {
    const scrollPosition = e.target.scrollLeft;
    const width = e.target.offsetWidth;
    const index = Math.round(scrollPosition / width);
    setCurrentSlide(index);
  };

  const currentPrice = getDynamicPrice(product, qty) || 0;
  const totalPrice = currentPrice * qty;
  
  // Simulate Retail Price (e.g. 40% markup)
  const simulatedRetail = Math.round((product.price || 0) * 1.4); 
  const marginPercent = simulatedRetail ? Math.round(((simulatedRetail - currentPrice) / simulatedRetail) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
       {/* Mobile Header (Sticky at top) */}
       <div className="sticky top-0 lg:hidden flex-none flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-white z-50">
          <div className="flex items-center gap-2">
             <Package className="w-5 h-5 text-[#fc2779]" />
             <h3 className="font-bold text-gray-900">Product Details</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
          >
             <X className="w-5 h-5" />
          </button>
       </div>

       {/* Main Content Wrapper */}
       <div className="flex flex-col lg:flex-row w-full min-h-screen">
          
           {/* LEFT COLUMN: IMAGES */}
           <div className="w-full lg:w-1/2 lg:sticky lg:top-0 lg:h-screen bg-gray-50 flex items-center justify-center relative">
              
              {/* Mobile Slider (< lg) */}
             <div className="lg:hidden w-full bg-white">
                 <div 
                   className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full h-[350px] bg-gray-50"
                   onScroll={handleScroll}
                 >
                     {Array.isArray(product.images) && product.images.length > 0 ? (
                         product.images.map((img, i) => (
                             <div key={i} className="w-full flex-shrink-0 snap-center flex items-center justify-center p-4">
                                 <img src={img} className="w-full h-full object-contain mix-blend-multiply" alt={`View ${i+1}`} />
                             </div>
                         ))
                     ) : (
                         <div className="w-full flex-shrink-0 snap-center flex items-center justify-center p-4">
                            <img src="https://via.placeholder.com/300" className="w-full h-full object-contain mix-blend-multiply" alt="No image" />
                         </div>
                     )}
                 </div>
                 {/* Dots Indicator */}
                 {Array.isArray(product.images) && product.images.length > 1 && (
                     <div className="flex justify-center gap-2 py-4">
                         {product.images.map((_, i) => (
                             <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${currentSlide === i ? 'bg-[#fc2779] w-4' : 'bg-gray-300 w-1.5'}`} />
                         ))}
                     </div>
                 )}
             </div>

              {/* Desktop Gallery (>= lg) */}
              <div className="hidden lg:flex w-full h-full relative">
                  {/* Close Button for Desktop */}
                  <button 
                    onClick={onClose}
                    className="absolute top-6 left-6 z-20 p-2 bg-white/80 backdrop-blur-sm hover:bg-white rounded-full text-gray-500 shadow-sm transition-all border border-gray-200"
                  >
                     <ArrowLeft className="w-5 h-5" />
                  </button>

                  {/* Thumbnails (Left Strip Overlay) */}
                  {Array.isArray(product.images) && product.images.length > 1 && (
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
                          {product.images.map((img, i) => (
                              <button 
                                key={i} 
                                onClick={() => setActiveImage(img)}
                                onMouseEnter={() => setActiveImage(img)}
                                className={`w-14 h-14 border-2 rounded-lg overflow-hidden flex-shrink-0 transition-all bg-white ${activeImage === img ? 'border-[#fc2779] shadow-md scale-105' : 'border-white hover:border-gray-300 shadow-sm'}`}
                              >
                                  <img src={img} className="w-full h-full object-cover" alt={`Thumbnail ${i+1}`} />
                              </button>
                          ))}
                      </div>
                  )}

                  {/* Main Image */}
                  <div className="w-full h-full flex items-center justify-center p-12 bg-gray-50">
                      <img 
                        src={activeImage} 
                        className="w-full h-full object-contain mix-blend-multiply max-w-[80%]" 
                        alt={product.name} 
                      />
                  </div>
              </div>
           </div>

           {/* RIGHT COLUMN: DETAILS */}
           <div className="w-full lg:w-1/2 bg-white">
              <div className="p-5 sm:p-8 lg:p-12 max-w-2xl mx-auto pb-32">
                  {/* Desktop Close Button (Right side alternative) */}
                  <div className="hidden lg:flex justify-end mb-4">
                     <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex items-center gap-1 text-sm font-medium transition-colors">
                        Close <X className="w-4 h-4" />
                     </button>
                  </div>

                  {/* Product Header */}
              <div>
                  <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-md border border-blue-100">
                        {product.category || 'Wholesale'}
                      </span>
                      {product.inStock && (
                          <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider rounded-md border border-green-100">
                             In Stock
                          </span>
                      )}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-3">{product.name}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg inline-flex">
                      <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> SKU: {product._id.slice(-6).toUpperCase()}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="font-medium text-gray-900">MOQ: {product.moq} Units</span>
                  </div>
              </div>

              {/* Supplier Info Box */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-100 shadow-sm">
                  <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Store className="w-4 h-4" /> Supplier Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div>
                          <p className="text-xs text-gray-500 mb-0.5">Shop Name</p>
                          <p className="font-bold text-gray-900 text-sm">{product.shopName || 'DD Wholesale'}</p>
                      </div>
                      <div>
                          <p className="text-xs text-gray-500 mb-0.5">Location</p>
                          <p className="font-medium text-gray-900 text-sm flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" /> {product.location || 'New Delhi, India'}
                          </p>
                      </div>
                  </div>
                  <div className="flex gap-3">
                      <a href={`tel:${product.contactNumber || '+919876543210'}`} className="flex-1 bg-white border border-indigo-200 text-indigo-700 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-indigo-50 transition-colors shadow-sm">
                          <Phone className="w-4 h-4" /> Call Supplier
                      </a>
                      <button className="flex-1 bg-[#fc2779] text-white py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-[#d61f66] transition-colors shadow-sm">
                          <MessageCircle className="w-4 h-4" /> Chat Now
                      </button>
                  </div>
              </div>

              {/* Description */}
              <div className="prose prose-sm max-w-none text-gray-600 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <p className="whitespace-pre-line">{product.description || 'No detailed description available.'}</p>
              </div>

              {/* Bulk Pricing Table */}
              {Array.isArray(product.bulkPricing) && product.bulkPricing.length > 0 && (
                  <div>
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-[#fc2779]" /> Bulk Pricing Tiers
                      </h4>
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                          <table className="w-full text-sm text-left">
                              <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                                  <tr>
                                      <th className="px-4 py-3">Qty Range</th>
                                      <th className="px-4 py-3">Price/Unit</th>
                                      <th className="px-4 py-3">Savings</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                  {product.bulkPricing.map((tier, i) => (
                                      <tr key={i} className={`hover:bg-gray-50 transition-colors ${qty >= tier.minQty ? 'bg-green-50/50' : ''}`}>
                                          <td className="px-4 py-3 font-medium">{tier.minQty}+ Units</td>
                                          <td className="px-4 py-3 text-[#fc2779] font-bold">₹{tier.price}</td>
                                          <td className="px-4 py-3 text-green-600 font-medium">
                                              {Math.round(((product.price - tier.price) / product.price) * 100)}% Off
                                          </td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}

              {/* Order Calculator */}
              <div className="bg-gray-900 text-white rounded-xl p-5 shadow-lg mt-auto">
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
                      <div>
                          <p className="text-gray-400 text-xs mb-1">Total Estimated Cost</p>
                          <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold">₹{totalPrice.toLocaleString()}</span>
                              <span className="text-sm text-gray-400">(@ ₹{currentPrice}/unit)</span>
                          </div>
                          {marginPercent > 0 && (
                            <p className="text-xs text-green-400 mt-1">
                                Potential Retail Value: ₹{(simulatedRetail * qty).toLocaleString()} (~{marginPercent}% Margin)
                            </p>
                          )}
                      </div>
                      <div className="flex items-center bg-gray-800 rounded-lg p-1 border border-gray-700">
                          <button 
                              onClick={(e) => { e.stopPropagation(); onQtyChange(product._id, -1, product.moq); }}
                              className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                          >
                              <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-12 text-center font-bold text-lg">{qty}</span>
                          <button 
                              onClick={(e) => { e.stopPropagation(); onQtyChange(product._id, 1, product.moq); }}
                              className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                          >
                              <Plus className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
                  <button 
                      onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                      className="w-full bg-[#fc2779] hover:bg-[#d61f66] text-white py-3 rounded-lg font-bold text-sm uppercase tracking-wider transition-all transform active:scale-95 shadow-lg shadow-pink-900/20 flex items-center justify-center gap-2"
                  >
                      <FileText className="w-4 h-4" /> Add to Inquiry List
                  </button>
              </div>
            </div>
           </div>
       </div>
    </div>
  );
};

const Wholesale = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({}); // { productId: quantity }
  const [expandedProductId, setExpandedProductId] = useState(null); // Accordion state
  const [selectedProduct, setSelectedProduct] = useState(null); // Full screen modal state

  useEffect(() => {
    const fetchWholesaleProducts = async () => {
      try {
        const res = await api.get('/products?isWholesale=true');
        const wholesaleItems = res.data;
        setProducts(wholesaleItems);
        
        // Initialize quantities with MOQ
        const initialQtys = {};
        wholesaleItems.forEach(p => {
          initialQtys[p._id] = p.moq || 1;
        });
        setQuantities(initialQtys);
      } catch (err) {
        console.error('Failed to fetch wholesale products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWholesaleProducts();
  }, []);

  const handleQtyChange = (productId, change, moq) => {
    setQuantities(prev => {
      const current = prev[productId] || moq;
      const newQty = Math.max(moq, current + change);
      return { ...prev, [productId]: newQty };
    });
  };

  const getDynamicPrice = (product, qty) => {
    let price = product.price; // Base wholesale price
    
    if (Array.isArray(product.bulkPricing) && product.bulkPricing.length > 0) {
      const sortedTiers = [...product.bulkPricing].sort((a, b) => b.minQty - a.minQty);
      const tier = sortedTiers.find(t => qty >= t.minQty);
      if (tier) {
        price = tier.price;
      }
    }
    return price;
  };

  const addToCart = (product) => {
    const qty = quantities[product._id];
    const price = getDynamicPrice(product, qty);
    alert(`Added ${qty} units of ${product.name} at ₹${price}/unit to inquiry list. (Cart integration pending)`);
  };

  const toggleProductDetails = (product) => {
    // setExpandedProductId(prev => prev === product._id ? null : product._id);
    setSelectedProduct(product);
    // Ensure we have a quantity initialized for this product
    if (!quantities[product._id]) {
      setQuantities(prev => ({ ...prev, [product._id]: product.moq || 1 }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-gray-500 font-medium">Loading wholesale catalog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Professional B2B Header */}
      <div className="bg-white sticky top-0 z-30 shadow-sm border-b border-gray-200">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-18 py-3">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <Store className="w-6 h-6 text-blue-700" />
                  <h1 className="text-xl lg:text-2xl font-bold text-gray-900 tracking-tight">Wholesale Hub</h1>
                </div>
                <p className="text-xs text-gray-500 hidden sm:block">Direct from Manufacturers & Verified Suppliers</p>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-gray-600">
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                <ShieldCheck className="w-4 h-4" /> 
                <span>Verified Suppliers</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" /> 
                <span>GST Invoice</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> 
                <span>High Margin</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Full Screen Product Detail Modal */}
      {selectedProduct && (
        <WholesaleProductExpanded 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          qty={quantities[selectedProduct._id] || selectedProduct.moq || 1} 
          onQtyChange={handleQtyChange} 
          addToCart={addToCart} 
          getDynamicPrice={getDynamicPrice} 
        />
      )}

      <div className="container mx-auto px-4 lg:px-8 py-6">
        {/* B2B Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-xl p-6 mb-8 text-white shadow-lg border border-blue-700 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
            <div>
              <div className="inline-block px-3 py-1 bg-yellow-500/20 text-yellow-300 text-xs font-bold uppercase tracking-wider rounded-sm mb-2 border border-yellow-500/30">
                Premium Business Access
              </div>
              <h2 className="text-2xl lg:text-3xl font-bold mb-2">Bulk Buying Made Simple</h2>
              <p className="text-blue-200 max-w-xl text-sm lg:text-base">
                Get the best competitive rates with our tiered pricing model. 
                Save up to 40% on bulk orders directly from factory outlets.
              </p>
            </div>
            <div className="flex gap-3">
               <a href="mailto:wholesale@ddcosmetics.com" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors text-sm font-semibold flex items-center gap-2 border border-white/20">
                 <Mail className="w-4 h-4" /> Request Catalog
               </a>
               <a href="tel:+919876543210" className="px-5 py-2.5 bg-white text-blue-900 rounded-lg font-bold hover:bg-gray-50 transition-colors text-sm flex items-center gap-2 shadow-lg">
                 <Phone className="w-4 h-4" /> Contact Sales
               </a>
            </div>
          </div>
        </div>

        {/* Products List View - More Industrial/Table-like */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product) => {
            const qty = quantities[product._id] || product.moq || 1;
            const currentPrice = getDynamicPrice(product, qty);
            
            // Simulate Retail Price (e.g. 40% markup)
            const simulatedRetail = Math.round(product.price * 1.4); 
            const marginPercent = Math.round(((simulatedRetail - currentPrice) / simulatedRetail) * 100);
            
            return (
              <div 
                key={product._id} 
                className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 cursor-pointer"
                onClick={() => toggleProductDetails(product)}
              >
                  {/* COLLAPSED: SHOP CARD STYLE */}
                  <>
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden bg-gray-200 h-64 relative">
                       <img 
                         src={product.images && product.images.length > 0 ? product.images[0] : 'https://via.placeholder.com/300'} 
                         alt={product.name} 
                         className="h-full w-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                       />
                       
                       {/* MOQ Badge */}
                       <div className="absolute top-3 left-3">
                         <span className="px-2 py-1 bg-black/70 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-sm">
                           MOQ: {product.moq}
                         </span>
                       </div>

                       {/* Bulk Savings Badge */}
                       {product.bulkPricing?.length > 0 && (
                         <div className="absolute top-3 right-3">
                           <span className="px-2 py-1 bg-[#fc2779]/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-wider rounded-sm shadow-sm">
                             Bulk Savings
                           </span>
                         </div>
                       )}
                    </div>

                    <div className="p-3 sm:p-5">
                      <p className="text-xs sm:text-sm font-medium text-[#fc2779] mb-1 truncate">
                        {product.category || 'Wholesale'}
                      </p>
                      <h3 className="text-sm sm:text-lg font-bold text-gray-900 mb-2 truncate leading-tight">
                        {product.name}
                      </h3>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3">
                        <div className="flex flex-col">
                          <span className="text-base sm:text-xl font-bold text-[#fc2779]">₹{product.price}</span>
                          <span className="text-xs text-gray-400">Base Wholesale Price</span>
                        </div>
                        <button className="flex items-center justify-center gap-2 bg-[#fc2779] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-[#d61f66] transition-colors transform active:scale-95 w-full sm:w-auto">
                          <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </>
              </div>
            );
          })}
        </div>
      ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Package className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Wholesale Catalog Empty</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">
              We are currently updating our bulk inventory. Please check back later or contact us for a custom quote.
            </p>
            <a href="tel:+919876543210" className="px-6 py-3 bg-blue-700 text-white rounded-lg font-bold shadow-md hover:bg-blue-800 transition-colors">
              Contact Sales Team
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wholesale;
