import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import { Plus, Image as ImageIcon, DollarSign, Layers, Package, AlignLeft, Save, ArrowLeft, X } from 'lucide-react';

const cleanDescription = (desc) => {
  if (!desc) return '';
  return desc
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const AdminAddWholesaleProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    stock: '',
    images: [],
    isWholesale: true, // Always true
    moq: 1,
    bulkPricing: [],
    sellerType: 'own',
    shopName: '',
    contactNumber: '',
    location: ''
  });
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  
  // Bulk Pricing State
  const [bulkTier, setBulkTier] = useState({ minQty: '', price: '' });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await adminApi.get('/categories');
        setCategories(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    if (name === 'description') {
      setFormData(prev => ({
        ...prev,
        description: cleanDescription(value)
      }));
    }
  };

  const addBulkTier = () => {
    if (bulkTier.minQty && bulkTier.price) {
      setFormData({
        ...formData,
        bulkPricing: [...formData.bulkPricing, { ...bulkTier }]
      });
      setBulkTier({ minQty: '', price: '' });
    }
  };

  const removeBulkTier = (index) => {
    const updated = formData.bulkPricing.filter((_, i) => i !== index);
    setFormData({ ...formData, bulkPricing: updated });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData({ ...formData, images: e.target.files });
    
    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewImages(newPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('description', cleanDescription(formData.description));
    data.append('stock', formData.stock);
    
    // Wholesale Fields (Always include)
    data.append('isWholesale', 'true');
    data.append('moq', formData.moq);
    data.append('sellerType', formData.sellerType);
    data.append('shopName', formData.shopName);
    data.append('contactNumber', formData.contactNumber);
    data.append('location', formData.location);
    data.append('bulkPricing', JSON.stringify(formData.bulkPricing));
    
    for (let i = 0; i < formData.images.length; i++) {
      data.append('images', formData.images[i]);
    }

    try {
      await adminApi.post('/products', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/admin/products');
    } catch (err) {
      console.error(err);
      alert('Error adding wholesale product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Add Wholesale Product</h2>
          <p className="text-gray-500 mt-1">Create a new wholesale-only product</p>
        </div>
        <button 
          onClick={() => navigate('/admin/products')}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Basic Info Section */}
            <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Package className="w-4 h-4 text-indigo-500" />
                    Product Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                    placeholder="e.g. Bulk Face Cream Pack"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <DollarSign className="w-4 h-4 text-indigo-500" />
                    Base Price (₹)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                    placeholder="0.00"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Layers className="w-4 h-4 text-indigo-500" />
                    Category
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none appearance-none bg-white"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat.slug}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Package className="w-4 h-4 text-indigo-500" />
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                    placeholder="0"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Wholesale Specific Section */}
            <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100 space-y-6">
              <h3 className="text-lg font-semibold text-indigo-900 border-b border-indigo-200 pb-2 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Wholesale Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Minimum Order Quantity (MOQ)</label>
                  <input
                    type="number"
                    name="moq"
                    value={formData.moq}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Seller Type</label>
                  <select
                    name="sellerType"
                    value={formData.sellerType}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                  >
                    <option value="own">Own Inventory</option>
                    <option value="partner">Partner Seller</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Shop Name</label>
                  <input
                    type="text"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                    placeholder="e.g. DD Cosmetics Wholesale"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Contact Number</label>
                  <input
                    type="text"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                    placeholder="+91..."
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                    placeholder="e.g. New Delhi, India"
                  />
                </div>

                {/* Bulk Pricing Tiers */}
                <div className="md:col-span-2 space-y-4">
                  <label className="text-sm font-bold text-gray-800">Bulk Pricing Tiers</label>
                  <div className="flex gap-4 items-end">
                    <div className="flex-1 space-y-1">
                      <span className="text-xs text-gray-500">Min Qty</span>
                      <input
                        type="number"
                        value={bulkTier.minQty}
                        onChange={(e) => setBulkTier({ ...bulkTier, minQty: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                        placeholder="e.g. 10"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <span className="text-xs text-gray-500">Price per Unit (₹)</span>
                      <input
                        type="number"
                        value={bulkTier.price}
                        onChange={(e) => setBulkTier({ ...bulkTier, price: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm"
                        placeholder="e.g. 90"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addBulkTier}
                      className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" /> Add Tier
                    </button>
                  </div>

                  <div className="space-y-2">
                    {formData.bulkPricing.map((tier, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border border-indigo-100">
                        <div className="flex gap-6 text-sm">
                          <span className="font-medium text-gray-700">Min Qty: {tier.minQty}</span>
                          <span className="font-medium text-gray-700">Price: ₹{tier.price}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeBulkTier(index)}
                          className="text-red-500 hover:text-red-700 transition-colors p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {formData.bulkPricing.length === 0 && (
                      <p className="text-sm text-gray-500 italic">No bulk pricing tiers added.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <AlignLeft className="w-4 h-4 text-indigo-500" />
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                onBlur={handleBlur}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none resize-y leading-relaxed"
                rows="6"
                placeholder="Enter detailed product description..."
                required
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <ImageIcon className="w-4 h-4 text-indigo-500" />
                Product Images (Max 5)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors cursor-pointer relative">
                <div className="space-y-1 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                      <span>Upload files</span>
                      <input 
                        type="file" 
                        multiple 
                        onChange={handleFileChange} 
                        className="sr-only" 
                        accept="image/*"
                        required
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
              
              {/* Image Previews */}
              {previewImages.length > 0 && (
                <div className="grid grid-cols-5 gap-4 mt-4">
                  {previewImages.map((src, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {loading ? 'Adding Product...' : 'Save Wholesale Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminAddWholesaleProduct;
