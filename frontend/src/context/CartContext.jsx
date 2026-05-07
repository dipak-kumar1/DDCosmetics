import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState(() => {
    try {
      const storageKey = user ? `cart_${user.id || user._id}` : 'cart_guest';
      const localCart = localStorage.getItem(storageKey);
      return localCart ? JSON.parse(localCart) : [];
    } catch {
      return [];
    }
  });

  // Load cart when user changes (e.g. login/logout)
  useEffect(() => {
    try {
      const storageKey = user ? `cart_${user.id || user._id}` : 'cart_guest';
      const localCart = localStorage.getItem(storageKey);
      setCart(localCart ? JSON.parse(localCart) : []);
    } catch {
      setCart([]);
    }
  }, [user]);

  // Save cart when it changes
  useEffect(() => {
    const storageKey = user ? `cart_${user.id || user._id}` : 'cart_guest';
    localStorage.setItem(storageKey, JSON.stringify(cart));
  }, [cart, user]);

  const addToCart = (product, quantity = 1) => {
    // if (!user) return; // Allow adding to cart even if not logged in (handled by local state)
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);
      if (existingItem) {
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  };

  const removeFromCart = (productId) => {
    // if (!user) return;
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    const storageKey = user ? `cart_${user.id || user._id}` : 'cart_guest';
    localStorage.removeItem(storageKey);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.discountPrice || item.price;
      return total + price * item.quantity;
    }, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const totalPrice = () => getCartTotal();

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
        totalPrice, // Keep it as a function
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
