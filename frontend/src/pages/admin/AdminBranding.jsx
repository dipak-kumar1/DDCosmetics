import React, { useState, useEffect, useContext } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { Upload, Sliders, Palette, FileText, Image as ImageIcon, Loader } from 'lucide-react';
import { BrandingContext } from '../../context/BrandingContext';

const AdminBranding = () => {
  const { refreshBranding, getAbsoluteUrl } = useContext(BrandingContext);
  
  const [title, setTitle] = useState('');
  const [themeColor, setThemeColor] = useState('#ffffff');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [currentLogoUrl, setCurrentLogoUrl] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const getAuthHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('dd_admin_token')}`
    }
  });

  const fetchBrandingSettings = async () => {
    try {
      const res = await api.get('/branding');
      if (res.data) {
        setTitle(res.data.title || 'DDCosmetics');
        setThemeColor(res.data.themeColor || '#ffffff');
        setBackgroundColor(res.data.backgroundColor || '#ffffff');
        setCurrentLogoUrl(res.data.logoUrl || '');
        setLogoPreview(res.data.logoUrl ? getAbsoluteUrl(res.data.logoUrl) : '');
      }
    } catch (err) {
      console.error('Error fetching branding settings:', err);
      toast.error('Failed to load branding settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrandingSettings();
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size must be under 2MB');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    const formDataPayload = new FormData();
    formDataPayload.append('title', title);
    formDataPayload.append('themeColor', themeColor);
    formDataPayload.append('backgroundColor', backgroundColor);
    if (logoFile) {
      formDataPayload.append('logo', logoFile);
    }

    try {
      const res = await api.put('/branding', formDataPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('dd_admin_token')}`
        }
      });
      
      toast.success('Branding settings updated successfully');
      setCurrentLogoUrl(res.data.logoUrl);
      setLogoFile(null);
      
      // Refresh global branding context so changes reflect immediately across the app
      refreshBranding();
    } catch (err) {
      console.error('Error updating branding:', err);
      toast.error(err.response?.data?.message || 'Failed to update branding settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader className="w-10 h-10 animate-spin text-indigo-650" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 font-sans">Website Settings & Branding</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        {/* Settings Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-150">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
            <Sliders className="w-5 h-5 text-[#fc2779]" />
            Identity Configuration
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-gray-450" />
                Website Name / Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                placeholder="e.g. DDCosmetics - Beauty & Care"
                required
              />
              <p className="mt-1.5 text-xs text-gray-400">
                This updates the browser tab title and app name in the PWA manifest.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-gray-450" />
                  PWA Theme Color
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-12 h-11 border border-gray-200 rounded-xl cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all uppercase font-mono"
                    maxLength={7}
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-400">
                  Defines the browser toolbar and status bar colors for installed PWA devices.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-gray-450" />
                  PWA Splash Background
                </label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="w-12 h-11 border border-gray-200 rounded-xl cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all uppercase font-mono"
                    maxLength={7}
                  />
                </div>
                <p className="mt-1.5 text-xs text-gray-400">
                  Sets the splash screen background color when opening the PWA from a mobile device.
                </p>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#fc2779] text-white px-8 py-3 rounded-xl hover:bg-[#e01a6b] disabled:bg-[#fca5c5] font-bold transition-all shadow-sm flex items-center gap-2"
                style={{ backgroundColor: '#fc2779' }}
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Logo Upload Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-150 flex flex-col">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
            <ImageIcon className="w-5 h-5 text-[#fc2779]" />
            Logo Image
          </h2>

          <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors relative group">
            {logoPreview ? (
              <div className="flex flex-col items-center gap-4">
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  className="max-h-36 max-w-full object-contain rounded-xl shadow-sm bg-white p-3 border border-gray-100"
                />
                <span className="text-xs text-indigo-650 font-bold bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-150/45">
                  {logoFile ? 'New Logo Selected' : 'Active Header Logo'}
                </span>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-pink-50 text-[#fc2779] flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-gray-700">Upload Branding Logo</p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP, or SVG under 2MB</p>
              </div>
            )}

            <input
              type="file"
              id="branding-logo-file"
              accept="image/*"
              onChange={handleLogoChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <div className="mt-5 bg-yellow-50/50 border border-yellow-100/60 p-4 rounded-xl">
            <p className="text-xs text-yellow-800 leading-relaxed">
              <strong>💡 Pro Tip:</strong> Upload a square logo with a clean background. When saved, our server will automatically construct properly resized and padded high-definition icons for Android, Chrome, and iOS PWA installs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBranding;
