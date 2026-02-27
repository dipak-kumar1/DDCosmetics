import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  Save, LayoutTemplate, Image as ImageIcon, Link as LinkIcon, 
  MapPin, MessageCircle, ToggleLeft, ToggleRight, Loader, Type
} from 'lucide-react';

const AdminHero = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [config, setConfig] = useState({
    title: '',
    subtitle: '',
    backgroundImage: '',
    isActive: true,
    offerBadge: '',
    cta1: { text: '', type: 'custom_url', link: '' },
    cta2: { text: '', type: 'custom_url', link: '' },
    deliveryInfo: { text: '', mapLink: '', whatsappNumber: '' }
  });
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const res = await api.get('/hero-config');
      if (res.data) {
        setConfig(res.data);
        setPreviewUrl(res.data.backgroundImage);
      }
    } catch (err) {
      console.error('Error fetching hero config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, section = null) => {
    const { name, value, type, checked } = e.target;
    
    if (section) {
      setConfig(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [name]: value
        }
      }));
    } else {
      setConfig(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formData = new FormData();
    formData.append('title', config.title);
    formData.append('subtitle', config.subtitle);
    formData.append('isActive', config.isActive);
    formData.append('offerBadge', config.offerBadge);
    
    // CTA 1
    formData.append('cta1Text', config.cta1.text);
    formData.append('cta1Type', config.cta1.type);
    formData.append('cta1Link', config.cta1.link);
    
    // CTA 2
    formData.append('cta2Text', config.cta2.text);
    formData.append('cta2Type', config.cta2.type);
    formData.append('cta2Link', config.cta2.link);
    
    // Delivery Info
    formData.append('deliveryText', config.deliveryInfo.text);
    formData.append('deliveryMapLink', config.deliveryInfo.mapLink);
    formData.append('deliveryWhatsapp', config.deliveryInfo.whatsappNumber);

    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      const token = localStorage.getItem('dd_admin_token');
      const res = await api.put('/hero-config', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setConfig(res.data);
      setImageFile(null);
      alert('Hero section updated successfully!');
    } catch (err) {
      console.error('Error updating hero config:', err);
      alert('Failed to update hero section.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Loader className="w-8 h-8 animate-spin text-pink-600" />
    </div>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Section Management</h1>
          <p className="text-gray-500 text-sm mt-1">Customize the main banner of your home page</p>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:opacity-50 font-medium shadow-sm"
        >
          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Settings */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Main Content */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div className="p-2 bg-pink-50 rounded-lg">
                <Type className="w-5 h-5 text-pink-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Main Content</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hero Title</label>
                <input
                  type="text"
                  name="title"
                  value={config.title}
                  onChange={(e) => handleInputChange(e)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                  placeholder="e.g. Redefine Your True Beauty"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <textarea
                  name="subtitle"
                  value={config.subtitle}
                  onChange={(e) => handleInputChange(e)}
                  rows="2"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all resize-none"
                  placeholder="e.g. Experience the fusion of nature and science..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Offer Badge (Optional)</label>
                  <input
                    type="text"
                    name="offerBadge"
                    value={config.offerBadge}
                    onChange={(e) => handleInputChange(e)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                    placeholder="e.g. Flat 20% Off"
                  />
                </div>
                
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">Hero Section Status</span>
                    <span className="text-xs text-gray-500">Enable or disable on homepage</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      name="isActive"
                      checked={config.isActive} 
                      onChange={(e) => handleInputChange(e)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-pink-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Call to Actions */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
              <div className="p-2 bg-purple-50 rounded-lg">
                <LinkIcon className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Call to Action Buttons</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Button 1 */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-700 border-b border-gray-200 pb-2">Primary Button</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Button Text</label>
                  <input
                    type="text"
                    name="text"
                    value={config.cta1.text}
                    onChange={(e) => handleInputChange(e, 'cta1')}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-1 focus:ring-purple-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Action Type</label>
                  <select
                    name="type"
                    value={config.cta1.type}
                    onChange={(e) => handleInputChange(e, 'cta1')}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-1 focus:ring-purple-500 outline-none text-sm bg-white"
                  >
                    <option value="custom_url">Custom URL</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="call">Phone Call</option>
                    <option value="visit_store">Visit Store (Map)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Link / Number</label>
                  <input
                    type="text"
                    name="link"
                    value={config.cta1.link}
                    onChange={(e) => handleInputChange(e, 'cta1')}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-1 focus:ring-purple-500 outline-none text-sm"
                    placeholder={config.cta1.type === 'custom_url' ? '/shop' : '+919876543210'}
                  />
                </div>
              </div>

              {/* Button 2 */}
              <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                <h3 className="font-semibold text-gray-700 border-b border-gray-200 pb-2">Secondary Button</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Button Text</label>
                  <input
                    type="text"
                    name="text"
                    value={config.cta2.text}
                    onChange={(e) => handleInputChange(e, 'cta2')}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-1 focus:ring-purple-500 outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Action Type</label>
                  <select
                    name="type"
                    value={config.cta2.type}
                    onChange={(e) => handleInputChange(e, 'cta2')}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-1 focus:ring-purple-500 outline-none text-sm bg-white"
                  >
                    <option value="custom_url">Custom URL</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="call">Phone Call</option>
                    <option value="visit_store">Visit Store (Map)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Link / Number</label>
                  <input
                    type="text"
                    name="link"
                    value={config.cta2.link}
                    onChange={(e) => handleInputChange(e, 'cta2')}
                    className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-1 focus:ring-purple-500 outline-none text-sm"
                    placeholder={config.cta2.type === 'custom_url' ? '/shop?category=new' : '+919876543210'}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Image & Delivery */}
        <div className="space-y-6">
          
          {/* 3. Background Image */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ImageIcon className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Hero Image</h2>
            </div>
            
            <div className="space-y-4">
              <div className="relative w-full aspect-[4/3] bg-gray-100 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center group">
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Hero Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white text-sm font-medium">Click to Change</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No image selected</p>
                  </div>
                )}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                Recommended size: 1920x800 px <br/>
                Max file size: 5MB
              </p>
            </div>
          </div>

          {/* 4. Delivery Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4 border-b border-gray-100 pb-4">
              <div className="p-2 bg-green-50 rounded-lg">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-800">Local Delivery</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Text</label>
                <input
                  type="text"
                  name="text"
                  value={config.deliveryInfo.text}
                  onChange={(e) => handleInputChange(e, 'deliveryInfo')}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-1 focus:ring-green-500 outline-none text-sm"
                  placeholder="e.g. Free Delivery within 3km"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Google Map Link</label>
                <input
                  type="text"
                  name="mapLink"
                  value={config.deliveryInfo.mapLink}
                  onChange={(e) => handleInputChange(e, 'deliveryInfo')}
                  className="w-full px-3 py-2 rounded border border-gray-300 focus:ring-1 focus:ring-green-500 outline-none text-sm"
                  placeholder="https://goo.gl/maps/..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                <div className="relative">
                  <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="whatsappNumber"
                    value={config.deliveryInfo.whatsappNumber}
                    onChange={(e) => handleInputChange(e, 'deliveryInfo')}
                    className="w-full pl-9 pr-3 py-2 rounded border border-gray-300 focus:ring-1 focus:ring-green-500 outline-none text-sm"
                    placeholder="+91..."
                  />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminHero;
