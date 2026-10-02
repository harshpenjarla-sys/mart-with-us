import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('mwu_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('mwu_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to sync cart to localStorage', e);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const pid = String(product._id || product.id);
      const existingIndex = prev.findIndex(item => String(item.product._id || item.product.id) === pid);

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: next[existingIndex].quantity + quantity
        };
        return next;
      } else {
        return [...prev, { product, quantity }];
      }
    });
  };

  const updateQuantity = (productId, newQuantity) => {
    const pid = String(productId);
    if (newQuantity <= 0) {
      removeFromCart(pid);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        String(item.product._id || item.product.id) === pid
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    const pid = String(productId);
    setCartItems(prev => prev.filter(item => String(item.product._id || item.product.id) !== pid));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getItemQuantity = (productId) => {
    const pid = String(productId);
    const found = cartItems.find(item => String(item.product._id || item.product.id) === pid);
    return found ? found.quantity : 0;
  };

  // Calculations
  const itemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cartItems.reduce((acc, item) => {
    return acc + (item.product.price * item.quantity);
  }, 0);

  const mrpTotal = cartItems.reduce((acc, item) => {
    return acc + ((item.product.mrp || item.product.price) * item.quantity);
  }, 0);

  const totalSavings = Math.max(0, mrpTotal - subtotal);

  // Free delivery over ₹499
  const deliveryFee = subtotal === 0 ? 0 : subtotal >= 499 ? 0 : 29;
  const tax = subtotal === 0 ? 0 : Math.round(subtotal * 0.05); // 5% GST approximation
  const grandTotal = subtotal === 0 ? 0 : subtotal + deliveryFee + tax;

  const value = {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getItemQuantity,
    itemsCount,
    subtotal,
    mrpTotal,
    totalSavings,
    deliveryFee,
    tax,
    grandTotal
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
