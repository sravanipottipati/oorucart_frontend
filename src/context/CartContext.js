import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart]     = useState({});   // { productId: quantity }
  const [shop, setShop]     = useState(null); // current shop
  const [products, setProducts] = useState([]); // products of current shop

  const addToCart = (product, shopData) => {
    // If adding from different shop — clear cart first
    if (shop && shopData && shop.id !== shopData.id) {
      setCart({ [product.id]: 1 });
      setShop(shopData);
      setProducts([product]);
      return;
    }
    if (shopData && !shop) setShop(shopData);
    setProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      return exists ? prev : [...prev, product];
    });
    setCart(prev => ({
      ...prev,
      [product.id]: (prev[product.id] || 0) + 1,
    }));
  };

  const removeFromCart = (product) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[product.id] > 1) {
        newCart[product.id]--;
      } else {
        delete newCart[product.id];
      }
      // Clear shop if cart empty
      if (Object.keys(newCart).length === 0) {
        setShop(null);
        setProducts([]);
      }
      return newCart;
    });
  };

  const clearCart = () => {
    setCart({});
    setShop(null);
    setProducts([]);
  };

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = products.reduce((sum, p) => {
    return sum + (cart[p.id] || 0) * parseFloat(p.price);
  }, 0);

  return (
    <CartContext.Provider value={{
      cart, shop, products,
      addToCart, removeFromCart, clearCart,
      cartCount, cartTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
