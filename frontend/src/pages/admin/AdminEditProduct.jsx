import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import adminApi from '../../services/adminApi';
import { Save, Image as ImageIcon, DollarSign, Layers, Package, AlignLeft, ArrowLeft, Plus, X } from 'lucide-react';

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    description: '',
    stock: '',
    isWholesale: false,
    moq: 1,
    bulkPricing: [],
    sellerType: 'own',
    shopName: '',
    contactNumber: '',
    location: ''
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]); // Array of File objects
  const [newImagePreviews, setNewImagePreviews] = useState([]); // Array of preview URLs
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Bulk Pricing State
  const [bulkTier, setBulkTier] = useState({ minQty: '', price: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          adminApi.get('/categories'),
          adminApi.get(`/products/${id}`)
        ]);
        setCategories(catRes.data);
        
        const product = prodRes.data;
        setFormData({
          name: product.name,
          price: product.price,
          category: product.category,
          description: product.description,
          stock: product.stock,
          isWholesale: product.isWholesale || false,
          moq: product.moq || 1,
          bulkPricing: product.bulkPricing || [],
          sellerType: product.sellerType || 'own',
          shopName: product.shopName || '',
          contactNumber: product.contactNumber || '',
          location: product.location || ''
        });
        setExistingImages(product.images || []);
      } catch (err) {
        console.error(err);
        alert('Error fetching data');
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
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
    
    // Append new files
    setNewImages(prev => [...prev, ...files]);
    
    // Append new previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setNewImagePreviews(prev => [...prev, ...newPreviews]);
  };

  const removeExistingImage = (index) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('price', formData.price);
    data.append('category', formData.category);
    data.append('description', formData.description);
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
    
    // Append existing images (as JSON string to be parsed on backend)
    data.append('existingImages', JSON.stringify(existingImages));

    // Append new images
    newImages.forEach(file => {
      data.append('images', file);
    });

    try {
      await adminApi.put(`/products/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/admin/products');
    } catch (err) {
      console.error(err);
      alert('Error updating product');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Edit Product</h2>
          <p className="text-gray-500 mt-1">Update product details</p>
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
                  <Plus className="w-4 h-4 text-indigo-500" />
                  Stock Quantity
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                  required
                />
              </div>

              {/* Wholesale Toggle */}
              <div className="md:col-span-2 border-t border-gray-100 pt-6 mt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      name="isWholesale"
                      checked={formData.isWholesale}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </div>
                  <span className="text-sm font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">Mark as Wholesale Product</span>
                </label>
              </div>

              {/* Wholesale Fields */}
              {formData.isWholesale && (
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 bg-indigo-50/50 p-6 rounded-xl border border-indigo-100">
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
              )}
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
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                rows="4"
                required
              ></textarea>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <ImageIcon className="w-4 h-4 text-indigo-500" />
                Product Images
              </label>
              
              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs text-gray-500 mb-2">Current Images:</p>
                  <div className="grid grid-cols-5 gap-4">
                    {existingImages.map((src, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                        <img src={src} alt={`Existing ${index}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:bg-gray-50 transition-colors cursor-pointer relative">
                <div className="space-y-1 text-center">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                      <span>Upload new images</span>
                      <input 
                        type="file" 
                        multiple 
                        onChange={handleFileChange} 
                        className="sr-only" 
                        accept="image/*"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">Add more images (PNG, JPG, GIF up to 10MB)</p>
                </div>
              </div>
              
              {/* New Image Previews */}
              {newImagePreviews.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">New Images to Upload:</p>
                  <div className="grid grid-cols-5 gap-4">
                    {newImagePreviews.map((src, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                        <img src={src} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold py-2.5 px-6 rounded-lg hover:from-indigo-700 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {submitting ? 'Updating...' : 'Update Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminEditProduct;
