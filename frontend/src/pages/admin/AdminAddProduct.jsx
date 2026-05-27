import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import { Plus, Image as ImageIcon, DollarSign, Layers, Package, AlignLeft, Save, ArrowLeft } from 'lucide-react';

const SKIN_TYPES = ['Oily', 'Dry', 'Combination', 'Sensitive', 'Normal'];
const SKIN_CONCERNS = ['Acne', 'Dryness', 'Glow', 'Anti-Aging', 'Dark Spots'];
const FINISHES = ['Matte', 'Dewy', 'Satin', 'Glossy'];
const PREFERENCES = ['Vegan', 'Organic', 'Cruelty-Free', 'Paraben-Free'];

const cleanDescription = (desc) => {
  if (!desc) return '';
  return desc
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const AdminAddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    stock: '',
    images: [],
    isWholesale: false,
    moq: 1,
    bulkPricing: [],
    sellerType: 'own',
    shopName: '',
    contactNumber: '',
    location: '',
    skinType: [],
    skinConcern: [],
    finish: '',
    preferences: []
  });
  const [loading, setLoading] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  const handleCheckboxListChange = (field, val, isChecked) => {
    const list = formData[field] || [];
    let updated;
    if (isChecked) {
      updated = [...list, val];
    } else {
      updated = list.filter(item => item !== val);
    }
    setFormData({
      ...formData,
      [field]: updated
    });
  };
  
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
    
    // Wholesale Fields
    data.append('isWholesale', formData.isWholesale);
    if (formData.isWholesale) {
      data.append('moq', formData.moq);
      data.append('sellerType', formData.sellerType);
      data.append('shopName', formData.shopName);
      data.append('contactNumber', formData.contactNumber);
      data.append('location', formData.location);
      data.append('bulkPricing', JSON.stringify(formData.bulkPricing));
    }

    data.append('finish', formData.finish);
    data.append('skinType', JSON.stringify(formData.skinType));
    data.append('skinConcern', JSON.stringify(formData.skinConcern));
    data.append('preferences', JSON.stringify(formData.preferences));
    
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
      alert('Error adding product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Add New Product</h2>
          <p className="text-gray-500 mt-1">Create a new product for your store</p>
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
                  placeholder="e.g. Luxury Face Cream"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <DollarSign className="w-4 h-4 text-indigo-500" />
                  Price (₹)
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
                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
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

            {/* Cosmetics Properties */}
            <div className="bg-slate-50/50 p-6 rounded-xl border border-slate-200/80 space-y-6">
              <h3 className="text-base font-bold text-gray-800 border-b border-gray-200 pb-2">Cosmetic Specifications</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Finish (Dropdown) */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Finish</label>
                  <select
                    name="finish"
                    value={formData.finish}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none bg-white"
                  >
                    <option value="">Select Finish (Optional)</option>
                    {FINISHES.map(f => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Skin Type checkboxes */}
                <div className="space-y-2">
                  <span className="block text-sm font-semibold text-gray-700">Skin Type</span>
                  <div className="space-y-2">
                    {SKIN_TYPES.map(type => (
                      <label key={type} className="flex items-center gap-2 text-sm text-gray-650 cursor-pointer hover:text-gray-900 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.skinType.includes(type)}
                          onChange={(e) => handleCheckboxListChange('skinType', type, e.target.checked)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        {type}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Skin Concern checkboxes */}
                <div className="space-y-2">
                  <span className="block text-sm font-semibold text-gray-700">Skin Concern</span>
                  <div className="space-y-2">
                    {SKIN_CONCERNS.map(concern => (
                      <label key={concern} className="flex items-center gap-2 text-sm text-gray-650 cursor-pointer hover:text-gray-900 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.skinConcern.includes(concern)}
                          onChange={(e) => handleCheckboxListChange('skinConcern', concern, e.target.checked)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        {concern}
                      </label>
                    ))}
                  </div>
                </div>

                {/* Preference checkboxes */}
                <div className="space-y-2">
                  <span className="block text-sm font-semibold text-gray-700">Preferences</span>
                  <div className="space-y-2">
                    {PREFERENCES.map(pref => (
                      <label key={pref} className="flex items-center gap-2 text-sm text-gray-650 cursor-pointer hover:text-gray-900 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.preferences.includes(pref)}
                          onChange={(e) => handleCheckboxListChange('preferences', pref, e.target.checked)}
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                        />
                        {pref}
                      </label>
                    ))}
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
                {loading ? 'Adding Product...' : 'Save Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminAddProduct;
