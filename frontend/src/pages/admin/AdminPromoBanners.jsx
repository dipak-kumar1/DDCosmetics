import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Trash2, Plus, Image as ImageIcon, ExternalLink, ToggleLeft, ToggleRight, Edit, X, Save } from 'lucide-react';

const AdminPromoBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    buttonText: 'Shop Now',
    link: '',
    image: null,
    isActive: true,
    order: 0
  });

  const getHeaders = () => ({
    headers: { 
      Authorization: `Bearer ${localStorage.getItem('dd_admin_token')}`,
      'Content-Type': 'multipart/form-data'
    }
  });

  const getAuthHeaders = () => ({
    headers: { 
      Authorization: `Bearer ${localStorage.getItem('dd_admin_token')}`
    }
  });

  const fetchBanners = async () => {
    try {
      const res = await api.get('/promo-banners/admin', getAuthHeaders());
      setBanners(res.data);
    } catch (err) {
      console.error('Error fetching promo banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleFileChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (isEdit) {
      setEditingBanner({ ...editingBanner, newImage: file });
    } else {
      setNewBanner({ ...newBanner, image: file });
    }
  };

  const handleInputChange = (e, isEdit = false) => {
    const { name, value } = e.target;
    if (isEdit) {
      setEditingBanner({ ...editingBanner, [name]: value });
    } else {
      setNewBanner({ ...newBanner, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newBanner.image) return alert('Please select an image');

    setUploading(true);
    const formData = new FormData();
    formData.append('title', newBanner.title);
    formData.append('subtitle', newBanner.subtitle);
    formData.append('buttonText', newBanner.buttonText);
    formData.append('link', newBanner.link);
    formData.append('isActive', newBanner.isActive);
    formData.append('order', newBanner.order);
    formData.append('image', newBanner.image);

    try {
      await api.post('/promo-banners', formData, getHeaders());
      alert('Promotional poster added successfully');
      setNewBanner({ title: '', subtitle: '', buttonText: 'Shop Now', link: '', image: null, isActive: true, order: 0 });
      // Reset file input
      const fileInput = document.getElementById('promo-upload');
      if (fileInput) fileInput.value = '';
      fetchBanners();
    } catch (err) {
      console.error('Error uploading promo banner:', err);
      alert('Failed to upload promotional poster');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingBanner) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('title', editingBanner.title);
    formData.append('subtitle', editingBanner.subtitle || '');
    formData.append('buttonText', editingBanner.buttonText || 'Shop Now');
    formData.append('link', editingBanner.link || '');
    formData.append('isActive', editingBanner.isActive);
    formData.append('order', editingBanner.order);
    if (editingBanner.newImage) {
      formData.append('image', editingBanner.newImage);
    }

    try {
      await api.put(`/promo-banners/${editingBanner._id}`, formData, getHeaders());
      alert('Promotional poster updated successfully');
      setEditingBanner(null);
      fetchBanners();
    } catch (err) {
      console.error('Error updating promo banner:', err);
      alert('Failed to update promotional poster');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this promotional poster?')) return;
    try {
      await api.delete(`/promo-banners/${id}`, getAuthHeaders());
      setBanners(banners.filter(b => b._id !== id));
    } catch (err) {
      console.error('Error deleting promo banner:', err);
      alert('Failed to delete promotional poster');
    }
  };

  const toggleStatus = async (banner) => {
    try {
      const updatedBanner = { ...banner, isActive: !banner.isActive };
      await api.put(`/promo-banners/${banner._id}`, { isActive: updatedBanner.isActive }, getAuthHeaders());
      setBanners(banners.map(b => b._id === banner._id ? updatedBanner : b));
    } catch (err) {
      console.error('Error toggling banner status:', err);
      alert('Failed to toggle status');
    }
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Promotional Posters (Homepage)</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the row of 3 small promotional poster cards appearing below Recommended For You.</p>
        </div>
      </div>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Plus className="w-5 h-5 text-pink-500" /> Add New Promotional Poster
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Title / Primary Text</label>
              <input
                type="text"
                name="title"
                value={newBanner.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-55 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                placeholder="E.g., Summer Glow Sale"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subtitle / Small Heading</label>
              <input
                type="text"
                name="subtitle"
                value={newBanner.subtitle}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-55 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                placeholder="E.g., Get Up To 50% Off"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">CTA Button Text</label>
              <input
                type="text"
                name="buttonText"
                value={newBanner.buttonText}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-55 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                placeholder="E.g., Shop Now"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Redirect Link / Action</label>
              <input
                type="text"
                name="link"
                value={newBanner.link}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-55 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
                placeholder="E.g., /shop?category=skincare or /product/ID"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order (Sort Priority)</label>
              <input
                type="number"
                name="order"
                value={newBanner.order}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 bg-gray-55 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Poster Background Image</label>
              <input
                type="file"
                id="promo-upload"
                onChange={(e) => handleFileChange(e, false)}
                accept="image/*"
                className="w-full px-4 py-2 bg-gray-55 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 transition-all file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="bg-pink-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-pink-700 disabled:bg-pink-400 shadow-lg shadow-pink-600/20 transition-all cursor-pointer"
          >
            {uploading ? 'Adding...' : 'Add Poster'}
          </button>
        </form>
      </div>

      {/* Posters List */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-6">Active/Inactive Posters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <p className="text-gray-400">Loading promotional posters...</p>
          ) : banners.length === 0 ? (
            <p className="text-gray-400 italic">No posters found. Add some above to display on the homepage.</p>
          ) : (
            banners.map((banner) => (
              <div key={banner._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden group flex flex-col h-full relative">
                
                {/* Background image preview card */}
                <div className="relative h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Hover action overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => setEditingBanner(banner)}
                      className="p-2 bg-white text-gray-700 rounded-full hover:bg-gray-100 transition-all cursor-pointer"
                      title="Edit Poster"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(banner._id)}
                      className="p-2 bg-white text-red-650 rounded-full hover:bg-red-50 transition-all cursor-pointer"
                      title="Delete Poster"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        {banner.subtitle && <span className="text-[10px] font-bold text-pink-500 uppercase tracking-wide">{banner.subtitle}</span>}
                        <h3 className="font-bold text-gray-800 text-base leading-tight mt-0.5">{banner.title}</h3>
                      </div>
                      <button onClick={() => toggleStatus(banner)} className="text-pink-600 cursor-pointer">
                        {banner.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1 text-xs text-gray-500">
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md font-semibold text-slate-700">Order: {banner.order}</span>
                      <span className={`px-2 py-0.5 rounded-md font-semibold ${banner.isActive ? 'bg-green-50 text-green-700' : 'bg-rose-50 text-rose-700'}`}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {banner.link && (
                      <div className="flex items-center text-xs text-indigo-650 font-medium pt-2">
                        <ExternalLink className="w-3.5 h-3.5 mr-1" />
                        <span className="truncate">{banner.link}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                    <span className="text-xs text-gray-400">Button: "{banner.buttonText}"</span>
                    <button 
                      onClick={() => setEditingBanner(banner)}
                      className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 cursor-pointer"
                    >
                      Edit Details
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingBanner && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-[150] p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full p-6 relative border border-gray-100 animate-in slide-in-from-bottom-8 duration-300">
            <button 
              onClick={() => setEditingBanner(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Edit className="w-5 h-5 text-pink-500" /> Edit Promotional Poster
            </h2>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Title / Primary Text</label>
                  <input
                    type="text"
                    name="title"
                    value={editingBanner.title}
                    onChange={(e) => handleInputChange(e, true)}
                    className="w-full px-4 py-2 bg-gray-55 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Subtitle / Small Heading</label>
                  <input
                    type="text"
                    name="subtitle"
                    value={editingBanner.subtitle}
                    onChange={(e) => handleInputChange(e, true)}
                    className="w-full px-4 py-2 bg-gray-55 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">CTA Button Text</label>
                  <input
                    type="text"
                    name="buttonText"
                    value={editingBanner.buttonText}
                    onChange={(e) => handleInputChange(e, true)}
                    className="w-full px-4 py-2 bg-gray-55 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Redirect Link</label>
                  <input
                    type="text"
                    name="link"
                    value={editingBanner.link}
                    onChange={(e) => handleInputChange(e, true)}
                    className="w-full px-4 py-2 bg-gray-55 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Order</label>
                  <input
                    type="number"
                    name="order"
                    value={editingBanner.order}
                    onChange={(e) => handleInputChange(e, true)}
                    className="w-full px-4 py-2 bg-gray-55 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Replace Image (Optional)</label>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(e, true)}
                    accept="image/*"
                    className="w-full px-3 py-1.5 bg-gray-55 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 file:mr-2 file:py-0.5 file:px-2 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-pink-50 file:text-pink-700"
                  />
                </div>
              </div>

              {/* Current Image Display */}
              <div className="pt-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Current Poster Image Preview</p>
                <div className="w-full h-32 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
                  <img
                    src={editingBanner.newImage ? URL.createObjectURL(editingBanner.newImage) : editingBanner.image}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-2.5 bg-pink-600 text-white font-semibold rounded-xl hover:bg-pink-700 disabled:bg-pink-400 shadow-lg shadow-pink-600/20 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Save className="w-4 h-4" /> {uploading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromoBanners;
