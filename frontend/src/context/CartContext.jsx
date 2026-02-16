import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cart, setCart] = useState([]);

  // Load cart when user changes
  useEffect(() => {
    if (user) {
      try {
        const localCart = localStorage.getItem(`cart_${user.id || user._id}`);
        setCart(localCart ? JSON.parse(localCart) : []);
      } catch {
        setCart([]);
      }
    } else {
      setCart([]);
    }
  }, [user]);

  // Save cart when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`cart_${user.id || user._id}`, JSON.stringify(cart));
    }
  }, [cart, user]);

  const addToCart = (product, quantity = 1) => {
    if (!user) return;
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
    if (!user) return;
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
