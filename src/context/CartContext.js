import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../api/client';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // carts = { vendorId: { shop: { id, shop_name }, items: { productId: qty }, products: [] } }
  const [carts, setCarts]   = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchCartFromDb(); }, []);

  const getHeaders = async () => {
    const token = await AsyncStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ── Fetch all cart items from DB and group by vendor ──────────────────────
  const fetchCartFromDb = async () => {
    try {
      setLoading(true);
      const headers = await getHeaders();
      if (!headers.Authorization) return;
      const res   = await client.get('/orders/cart/', { headers });
      const items = res.data.items || [];

      // Group by vendor
      const grouped = {};
      items.forEach(item => {
        const vid = item.vendor_id;
        if (!grouped[vid]) {
          grouped[vid] = {
            shop:     { id: vid, shop_name: item.vendor_name },
            items:    {},
            products: [],
            dbItems:  [],
          };
        }
        grouped[vid].items[item.product_id] = item.quantity;
        grouped[vid].dbItems.push(item);
        if (!grouped[vid].products.find(p => p.id === item.product_id)) {
          grouped[vid].products.push({
            id:            item.product_id,
            name:          item.product_name,
            price:         item.product_price,
            image:         item.product_image,
            gst_percentage: item.product_gst || 0,
          });
        }
      });
      console.log('fetchCartFromDb grouped keys:', Object.keys(grouped));
      setCarts(grouped);
    } catch (err) {
      console.log('fetchCartFromDb error:', err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Add to cart ───────────────────────────────────────────────────────────
  const addToCart = async (product, shopData) => {
    const vid = shopData.id;

    setCarts(prev => {
      const existing = prev[vid] || { shop: shopData, items: {}, products: [], dbItems: [] };
      const newQty   = (existing.items[product.id] || 0) + 1;
      const products = existing.products.find(p => p.id === product.id)
        ? existing.products
        : [...existing.products, product];
      return {
        ...prev,
        [vid]: {
          ...existing,
          shop:     shopData,
          items:    { ...existing.items, [product.id]: newQty },
          products,
        },
      };
    });

    try {
      const headers = await getHeaders();
      if (!headers.Authorization) return;
      await client.post('/orders/cart/add/', {
        product_id: product.id,
        vendor_id:  vid,
        quantity:   1,
      }, { headers });
      await fetchCartFromDb();
    } catch (err) {
      console.log('addToCart error:', err?.response?.data || err.message);
    }
  };

  // ── Remove from cart ──────────────────────────────────────────────────────
  const removeFromCart = async (product, vendorId) => {
    const vid = vendorId || Object.keys(carts).find(k => carts[k].items[product.id]);
    if (!vid) return;

    setCarts(prev => {
      const existing = prev[vid];
      if (!existing) return prev;
      const newQty = (existing.items[product.id] || 1) - 1;
      const newItems = { ...existing.items };
      if (newQty <= 0) delete newItems[product.id];
      else newItems[product.id] = newQty;

      const newProducts = newQty <= 0
        ? existing.products.filter(p => p.id !== product.id)
        : existing.products;

      if (Object.keys(newItems).length === 0) {
        const updated = { ...prev };
        delete updated[vid];
        return updated;
      }

      return { ...prev, [vid]: { ...existing, items: newItems, products: newProducts } };
    });

    try {
      const headers = await getHeaders();
      if (!headers.Authorization) return;
      const dbItem = carts[vid]?.dbItems?.find(i => i.product_id === product.id);
      if (dbItem) {
        const newQty = (dbItem.quantity || 1) - 1;
        if (newQty <= 0) {
          await client.delete(`/orders/cart/remove/${dbItem.id}/`, { headers });
        } else {
          await client.patch(`/orders/cart/update/${dbItem.id}/`, { quantity: newQty }, { headers });
        }
        await fetchCartFromDb();
      }
    } catch (err) {
      console.log('removeFromCart error:', err?.response?.data || err.message);
    }
  };

  // ── Clear a single shop cart ──────────────────────────────────────────────
  const clearShopCart = async (vendorId) => {
    setCarts(prev => {
      const updated = { ...prev };
      delete updated[vendorId];
      return updated;
    });
    try {
      const headers = await getHeaders();
      if (!headers.Authorization) return;
      await client.delete(`/orders/cart/clear/?vendor_id=${vendorId}`, { headers });
    } catch (err) {
      console.log('clearShopCart error:', err?.response?.data || err.message);
    }
  };

  // ── Clear all carts ───────────────────────────────────────────────────────
  const clearCart = async () => {
    setCarts({});
    try {
      const headers = await getHeaders();
      if (!headers.Authorization) return;
      await client.delete('/orders/cart/clear/', { headers });
    } catch (err) {
      console.log('clearCart error:', err?.response?.data || err.message);
    }
  };

  // ── Computed values ───────────────────────────────────────────────────────
  const cartCount = Object.values(carts).reduce((total, shopCart) => {
    return total + Object.values(shopCart.items).reduce((a, b) => a + b, 0);
  }, 0);

  const shopCount = Object.keys(carts).length;

  const cartTotal = Object.values(carts).reduce((total, shopCart) => {
    return total + shopCart.products.reduce((sum, p) => {
      return sum + (shopCart.items[p.id] || 0) * parseFloat(p.price);
    }, 0);
  }, 0);

  // Legacy support — single shop
  const shop     = Object.values(carts)[0]?.shop || null;
  const cart     = Object.values(carts)[0]?.items || {};
  const products = Object.values(carts)[0]?.products || [];

  return (
    <CartContext.Provider value={{
      carts,
      cart,
      shop,
      products,
      loading,
      addToCart,
      removeFromCart,
      clearShopCart,
      clearCart,
      fetchCartFromDb,
      cartCount,
      cartTotal,
      shopCount,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);