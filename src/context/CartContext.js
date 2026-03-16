import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart]         = useState({});   // { productId: quantity }
  const [shop, setShop]         = useState(null); // current shop
  const [products, setProducts] = useState([]);   // products of current shop
  const [cartDbItems, setCartDbItems] = useState([]); // DB synced items
  const [loading, setLoading]   = useState(false);

  // ── Load cart from DB on app start ──────────────────────────────────────────
  useEffect(() => {
    fetchCartFromDb();
  }, []);

  const getHeaders = async () => {
    const token = await AsyncStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchCartFromDb = async () => {
    try {
      setLoading(true);
      const headers = await getHeaders();
      if (!headers.Authorization) return; // not logged in yet
      const res = await client.get('/orders/cart/', { headers });
      const items = res.data.items || [];
      setCartDbItems(items);

      // ── Rebuild local cart state from DB items ─────────────────────────────
      if (items.length > 0) {
        const newCart     = {};
        const newProducts = [];
        let   newShop     = null;

        items.forEach(item => {
          newCart[item.product_id] = item.quantity;
          newProducts.push({
            id:    item.product_id,
            name:  item.product_name,
            price: item.product_price,
            image: item.product_image,
          });
          if (!newShop) {
            newShop = {
              id:   item.vendor_id,
              name: item.vendor_name,
            };
          }
        });

        setCart(newCart);
        setProducts(newProducts);
        setShop(newShop);
      }
    } catch (err) {
      console.log('fetchCartFromDb error:', err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Add to cart — local state + DB sync ─────────────────────────────────────
  const addToCart = async (product, shopData) => {
    // If adding from different shop — clear cart first
    if (shop && shopData && shop.id !== shopData.id) {
      setCart({ [product.id]: 1 });
      setShop(shopData);
      setProducts([product]);
      await syncClearCart();
      await syncAddToCart(product, shopData, 1);
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

    // Sync to DB
    await syncAddToCart(product, shopData || shop, 1);
  };

  // ── Remove from cart — local state + DB sync ────────────────────────────────
  const removeFromCart = async (product) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[product.id] > 1) {
        newCart[product.id]--;
      } else {
        delete newCart[product.id];
      }
      if (Object.keys(newCart).length === 0) {
        setShop(null);
        setProducts([]);
      }
      return newCart;
    });

    // Find DB item and update/remove
    const dbItem = cartDbItems.find(i => i.product_id === product.id);
    if (dbItem) {
      const newQty = (dbItem.quantity || 1) - 1;
      if (newQty <= 0) {
        await syncRemoveItem(dbItem.id);
      } else {
        await syncUpdateItem(dbItem.id, newQty);
      }
    }
  };

  // ── Clear cart — local state + DB sync ──────────────────────────────────────
  const clearCart = async () => {
    setCart({});
    setShop(null);
    setProducts([]);
    setCartDbItems([]);
    await syncClearCart();
  };

  // ── DB sync helpers ──────────────────────────────────────────────────────────
  const syncAddToCart = async (product, shopData, quantity) => {
    try {
      const headers = await getHeaders();
      if (!headers.Authorization) return;
      const res = await client.post('/orders/cart/add/', {
        product_id: product.id,
        vendor_id:  shopData?.id,
        quantity,
      }, { headers });
      // Refresh DB items
      await fetchCartFromDb();
    } catch (err) {
      console.log('syncAddToCart error:', err?.response?.data || err.message);
    }
  };

  const syncUpdateItem = async (itemId, quantity) => {
    try {
      const headers = await getHeaders();
      if (!headers.Authorization) return;
      await client.patch(`/orders/cart/update/${itemId}/`, { quantity }, { headers });
      await fetchCartFromDb();
    } catch (err) {
      console.log('syncUpdateItem error:', err?.response?.data || err.message);
    }
  };

  const syncRemoveItem = async (itemId) => {
    try {
      const headers = await getHeaders();
      if (!headers.Authorization) return;
      await client.delete(`/orders/cart/remove/${itemId}/`, { headers });
      await fetchCartFromDb();
    } catch (err) {
      console.log('syncRemoveItem error:', err?.response?.data || err.message);
    }
  };

  const syncClearCart = async () => {
    try {
      const headers = await getHeaders();
      if (!headers.Authorization) return;
      await client.delete('/orders/cart/clear/', { headers });
    } catch (err) {
      console.log('syncClearCart error:', err?.response?.data || err.message);
    }
  };

  // ── Computed values ──────────────────────────────────────────────────────────
  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = products.reduce((sum, p) => {
    return sum + (cart[p.id] || 0) * parseFloat(p.price);
  }, 0);

  return (
    <CartContext.Provider value={{
      cart,
      shop,
      products,
      cartDbItems,
      loading,
      addToCart,
      removeFromCart,
      clearCart,
      fetchCartFromDb,
      cartCount,
      cartTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);