import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import { trackAction } from '../utils/tracking';

export const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState(() => {
    if (user) {
      const savedWishlist = localStorage.getItem(`wishlist_${user.id || user._id}`);
      return savedWishlist ? JSON.parse(savedWishlist) : [];
    }
    return [];
  });

  // Load wishlist when user changes
  useEffect(() => {
    if (user) {
      const savedWishlist = localStorage.getItem(`wishlist_${user.id || user._id}`);
      setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []);
    } else {
      setWishlist([]);
    }
  }, [user]);

  // Save wishlist when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`wishlist_${user.id || user._id}`, JSON.stringify(wishlist));
    }
  }, [wishlist, user]);

  const addToWishlist = (product) => {
    if (!user) return; // Should be handled by UI redirect, but safeguard here
    trackAction('wishlist', product);
    setWishlist((prev) => {
      if (prev.find((item) => item._id === product._id)) {
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeFromWishlist = (productId) => {
    if (!user) return;
    setWishlist((prev) => prev.filter((item) => item._id !== productId));
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item._id === productId);
  };
  
  const getWishlistCount = () => {
    return wishlist.length;
  };

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, getWishlistCount }}>
      {children}
    </WishlistContext.Provider>
  );
};
