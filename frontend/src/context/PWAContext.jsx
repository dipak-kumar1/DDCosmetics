import React, { createContext, useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';

const PWAContext = createContext();

export const PWAProvider = ({ children }) => {
  const location = useLocation();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Monitor location changes to switch manifest and register admin SW
  useEffect(() => {
    const isAdminPath = location.pathname.startsWith('/admin');
    
    // Clear deferred prompts if switching between admin and customer panels
    if (isAdminPath !== isAdmin) {
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsAdmin(isAdminPath);
    }

    // Dynamic Manifest URL switching
    const manifestHref = isAdminPath ? '/admin-manifest.json' : '/manifest.webmanifest';
    let manifestLink = document.querySelector('link[rel="manifest"]');
    
    if (manifestLink) {
      manifestLink.href = manifestHref;
    } else {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = manifestHref;
      document.head.appendChild(manifestLink);
    }

    // Register scoped Service Worker for Admin Dashboard
    if (isAdminPath && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/admin-sw.js', { scope: '/admin/' })
        .then((registration) => {
          console.log('Admin Service Worker registered with scope:', registration.scope);
        })
        .catch((error) => {
          console.error('Admin Service Worker registration failed:', error);
        });
    }
  }, [location.pathname, isAdmin]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile Chrome
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      console.log('PWA was installed successfully!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if app is already running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      console.warn('PWA installation prompt is not available.');
      return false;
    }

    // Show the browser install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to PWA install prompt: ${outcome}`);

    // We've used the prompt, discard it
    setDeferredPrompt(null);
    setIsInstallable(false);

    return outcome === 'accepted';
  };

  return (
    <PWAContext.Provider value={{ isInstallable, isInstalled, installApp, isAdminPWA: isAdmin }}>
      {children}
    </PWAContext.Provider>
  );
};

export const usePWA = () => {
  return useContext(PWAContext);
};

