import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const BrandingContext = createContext();

export const BrandingProvider = ({ children }) => {
  const [branding, setBranding] = useState({
    logoUrl: '',
    title: 'DDCosmetics',
    themeColor: '#ffffff',
    backgroundColor: '#ffffff'
  });
  const [loading, setLoading] = useState(true);

  // Extract backend origin from axios baseURL (e.g. "https://ddcosmetics.onrender.com/api" -> "https://ddcosmetics.onrender.com")
  const apiBaseURL = api.defaults.baseURL || 'https://ddcosmetics.onrender.com/api';
  const backendOrigin = apiBaseURL.endsWith('/api') ? apiBaseURL.slice(0, -4) : apiBaseURL;

  const fetchBranding = async () => {
    try {
      const res = await api.get('/branding');
      if (res.data) {
        setBranding(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch branding settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranding();
  }, []);

  // Helper to format any URL (relative or absolute) to absolute URL
  const getAbsoluteUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${backendOrigin}${path}`;
  };

  // Helper to get resized Cloudinary image URL for favicon (32x32)
  const getFaviconUrl = (url) => {
    const absoluteUrl = getAbsoluteUrl(url);
    if (absoluteUrl.includes('res.cloudinary.com')) {
      const parts = absoluteUrl.split('/upload/');
      if (parts.length === 2) {
        return `${parts[0]}/upload/c_fill,w_32,h_32,f_png/${parts[1]}`;
      }
    }
    return absoluteUrl;
  };

  useEffect(() => {
    if (!branding) return;

    // 1. Update Document Title
    document.title = branding.title || 'DDCosmetics';

    // 2. Update Favicon
    if (branding.logoUrl) {
      const faviconUrl = getFaviconUrl(branding.logoUrl);
      let faviconLink = document.querySelector("link[rel*='icon']");
      if (faviconLink) {
        faviconLink.href = faviconUrl;
      } else {
        const link = document.createElement('link');
        link.rel = 'icon';
        link.href = faviconUrl;
        document.head.appendChild(link);
      }
    }

    // 3. Update PWA theme-color meta tag
    if (branding.themeColor) {
      let themeColorMeta = document.querySelector("meta[name='theme-color']");
      if (themeColorMeta) {
        themeColorMeta.setAttribute('content', branding.themeColor);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'theme-color';
        meta.content = branding.themeColor;
        document.head.appendChild(meta);
      }
    }

    // 4. Update dynamic manifest.json link pointing to Render backend
    const manifestUrl = `${backendOrigin}/api/branding/manifest.json`;
    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = manifestUrl;
    manifestLink.setAttribute('crossorigin', 'use-credentials');

  }, [branding]);

  return (
    <BrandingContext.Provider value={{ branding, loading, refreshBranding: fetchBranding, getAbsoluteUrl }}>
      {children}
    </BrandingContext.Provider>
  );
};
