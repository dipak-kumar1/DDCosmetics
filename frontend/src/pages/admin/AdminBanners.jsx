import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Trash2, Plus, Image as ImageIcon, ExternalLink, ToggleLeft, ToggleRight } from 'lucide-react';

const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newBanner, setNewBanner] = useState({
    title: '',
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
      const res = await api.get('/banners/admin', getAuthHeaders());
      setBanners(res.data);
    } catch (err) {
      console.error('Error fetching banners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleFileChange = (e) => {
    setNewBanner({ ...newBanner, image: e.target.files[0] });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBanner({ ...newBanner, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newBanner.image) return alert('Please select an image');

    setUploading(true);
    const formData = new FormData();
    formData.append('title', newBanner.title);
    formData.append('link', newBanner.link);
    formData.append('isActive', newBanner.isActive);
    formData.append('order', newBanner.order);
    formData.append('image', newBanner.image);

    try {
      await api.post('/banners', formData, getHeaders());
      alert('Banner added successfully');
      setNewBanner({ title: '', link: '', image: null, isActive: true, order: 0 });
      // Reset file input
      document.getElementById('banner-upload').value = '';
      fetchBanners();
    } catch (err) {
      console.error('Error uploading banner:', err);
      alert('Failed to upload banner');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;
    try {
      await api.delete(`/banners/${id}`, getAuthHeaders());
      setBanners(banners.filter(b => b._id !== id));
    } catch (err) {
      console.error('Error deleting banner:', err);
    }
  };

  const toggleStatus = async (banner) => {
    try {
      const updatedBanner = { ...banner, isActive: !banner.isActive };
      await api.put(`/banners/${banner._id}`, { isActive: updatedBanner.isActive }, getAuthHeaders());
      setBanners(banners.map(b => b._id === banner._id ? updatedBanner : b));
    } catch (err) {
      console.error('Error updating banner:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Banner Management</h1>
      </div>

      {/* Upload Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add New Banner
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                name="title"
                value={newBanner.title}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Link (Optional)</label>
              <input
                type="text"
                name="link"
                value={newBanner.link}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="/shop?category=skincare"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Order (Sort Priority)</label>
              <input
                type="number"
                name="order"
                value={newBanner.order}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
              <input
                type="file"
                id="banner-upload"
                onChange={handleFileChange}
                accept="image/*"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={uploading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
          >
            {uploading ? 'Uploading...' : 'Upload Banner'}
          </button>
        </form>
      </div>

      {/* Banners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p>Loading banners...</p>
        ) : banners.length === 0 ? (
          <p className="text-gray-500">No banners found.</p>
        ) : (
          banners.map((banner) => (
            <div key={banner._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
              <div className="relative h-48 bg-gray-100">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleDelete(banner._id)}
                    className="p-2 bg-white text-red-600 rounded-full hover:bg-red-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{banner.title}</h3>
                  <button onClick={() => toggleStatus(banner)} className="text-indigo-600">
                    {banner.isActive ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-gray-400" />}
                  </button>
                </div>
                {banner.link && (
                  <div className="flex items-center text-xs text-gray-500 mb-2">
                    <ExternalLink className="w-3 h-3 mr-1" />
                    {banner.link}
                  </div>
                )}
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Order: {banner.order}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${banner.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {banner.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminBanners;
