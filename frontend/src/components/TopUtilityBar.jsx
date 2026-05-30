import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'lucide-react';
import api from '../services/api';
import { usePWA } from '../context/PWAContext';

const DynamicIcon = ({ name, className }) => {
  const IconComponent = Icons[name];
  if (!IconComponent) return null;
  return <IconComponent className={className} />;
};

const TopUtilityBar = () => {
  const [items, setItems] = useState([]);
  const { isInstallable, installApp } = usePWA();

  const apiBaseURL = api.defaults.baseURL || 'https://ddcosmetics.onrender.com/api';
  const backendOrigin = apiBaseURL.endsWith('/api') ? apiBaseURL.slice(0, -4) : apiBaseURL;

  useEffect(() => {
    const fetchUtilityBarItems = async () => {
      try {
        const res = await api.get('/utility-bar');
        if (res.data) {
          setItems(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch top utility bar items:', err);
      }
    };
    fetchUtilityBarItems();
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-[#fff3f6] via-[#fff8fa] to-[#fff3f6] border-b border-pink-100/60 text-slate-650 py-2.5 text-xs font-sans relative z-[110]">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-10 flex items-center justify-between w-full">
        {/* Mobile View: Horizontal Scrollable Strip */}
        <div className="md:hidden flex items-center gap-6 overflow-x-auto w-full no-scrollbar pb-1 snap-x scroll-smooth">
          {items.map((item) => {
            const isInstallLink = item.link === '#install-pwa' || item.link === 'install-pwa' || (item.link && item.link.endsWith('/install-pwa'));
            
            const isApkDownload = item.link && item.link.startsWith('/uploads/');
            const isExternal = (item.link && (item.link.startsWith('http://') || item.link.startsWith('https://'))) || isApkDownload;
            const hrefUrl = isApkDownload ? `${backendOrigin}${item.link}` : item.link;
            const LinkComponent = isExternal ? 'a' : Link;
            const linkProps = isExternal
              ? { href: hrefUrl, download: isApkDownload ? 'ddcosmetics.apk' : undefined, target: '_blank', rel: 'noopener noreferrer' }
              : isInstallLink
                ? { to: '#', onClick: (e) => { 
                    e.preventDefault(); 
                    if (isInstallable) {
                      installApp();
                    } else {
                      alert('App is already installed or your browser does not support installation right now. (Use Chrome on Android)');
                    }
                  } }
                : { to: item.link };

            return (
              <LinkComponent
                key={item._id}
                {...linkProps}
                className="flex items-center gap-1.5 flex-shrink-0 snap-start font-bold uppercase tracking-wider text-slate-600 hover:text-[#fc2779] active:text-[#fc2779] transition-colors"
              >
                {item.icon && <DynamicIcon name={item.icon} className="w-3.5 h-3.5 text-[#fc2779]/90" />}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[8px] leading-none font-black bg-gradient-to-r from-pink-500 to-[#fc2779] text-white rounded-full uppercase tracking-widest shadow-xs">
                    {item.badge}
                  </span>
                )}
              </LinkComponent>
            );
          })}
        </div>

        {/* Desktop View: Left side (blank or secondary info) & Right side (Utility menu) */}
        <div className="hidden md:flex items-center justify-between w-full">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Welcome to DDCosmetics - Your Luxury Beauty Destination
          </div>

          <div className="flex items-center gap-8">
            {items.map((item) => {
              const isInstallLink = item.link === '#install-pwa' || item.link === 'install-pwa' || (item.link && item.link.endsWith('/install-pwa'));
              
              const isApkDownload = item.link && item.link.startsWith('/uploads/');
              const isExternal = (item.link && (item.link.startsWith('http://') || item.link.startsWith('https://'))) || isApkDownload;
              const hrefUrl = isApkDownload ? `${backendOrigin}${item.link}` : item.link;
              const LinkComponent = isExternal ? 'a' : Link;
              const linkProps = isExternal
                ? { href: hrefUrl, download: isApkDownload ? 'ddcosmetics.apk' : undefined, target: '_blank', rel: 'noopener noreferrer' }
                : isInstallLink
                  ? { to: '#', onClick: (e) => { 
                      e.preventDefault(); 
                      if (isInstallable) {
                        installApp();
                      } else {
                        alert('App is already installed or your browser does not support installation right now. (Use Chrome on Android)');
                      }
                    } }
                  : { to: item.link };

              return (
                <LinkComponent
                  key={item._id}
                  {...linkProps}
                  className="flex items-center gap-2 font-bold uppercase tracking-wider text-[11px] text-slate-650 hover:text-[#fc2779] transition-all duration-200 cursor-pointer group"
                >
                  {item.icon && (
                    <DynamicIcon 
                      name={item.icon} 
                      className="w-3.5 h-3.5 text-[#fc2779]/80 group-hover:text-[#fc2779] group-hover:scale-110 transition-all duration-200" 
                    />
                  )}
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="px-2 py-0.5 text-[8px] leading-none font-black bg-gradient-to-r from-pink-500 to-[#fc2779] text-white rounded-full uppercase tracking-widest group-hover:scale-105 transition-transform duration-200 shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </LinkComponent>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopUtilityBar;
