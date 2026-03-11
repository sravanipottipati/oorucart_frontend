import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native';
import client from '../../api/client';

export default function ShopDetailScreen({ navigation, route }) {
  const { vendorId, shopName } = route.params;
  const [shop, setShop]           = useState(null);
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [cart, setCart]           = useState({});
  const [search, setSearch]       = useState('');

  const fetchShopData = async () => {
    try {
      const [shopRes, productsRes] = await Promise.all([
        client.get(`/vendors/${vendorId}/`),
        client.get(`/vendors/${vendorId}/products/`),
      ]);
      setShop(shopRes.data);
      if (Array.isArray(productsRes.data)) {
        setProducts(productsRes.data);
      } else if (productsRes.data.products) {
        setProducts(productsRes.data.products);
      } else {
        setProducts([]);
      }
    } catch (e) {
      console.log('Error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShopData(); }, []);

  const addToCart = (product) => {
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
      return newCart;
    });
  };

  const cartTotal = products.reduce((sum, p) => {
    return sum + (cart[p.id] || 0) * parseFloat(p.price);
  }, 0);

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const ProductCard = ({ product }) => {
    const qty = cart[product.id] || 0;
    return (
      <View style={styles.productCard}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          {product.description ? (
            <Text style={styles.productDesc}>{product.description}</Text>
          ) : null}
          <Text style={styles.productPrice}>₹{product.price}</Text>
        </View>
        <View style={styles.productRight}>
          <View style={styles.productImageBox}>
            <Text style={styles.productEmoji}>🥬</Text>
          </View>
          {qty === 0 ? (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => addToCart(product)}
            >
              <Text style={styles.addBtnText}>ADD</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.qtyControl}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => removeFromCart(product)}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{qty}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => addToCart(product)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{shop?.shop_name || shopName}</Text>
          <Text style={styles.headerSubtitle}>
            {shop?.category} • {shop?.town} • {shop?.estimated_delivery_time || 30} mins
          </Text>
        </View>
        <TouchableOpacity style={styles.headerIconBtn}>
          <Text style={styles.headerIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Open Badge */}
      <View style={styles.openBadgeRow}>
        <View style={[styles.openBadge, { backgroundColor: shop?.is_open ? '#E8F5E9' : '#F5F5F5' }]}>
          <Text style={[styles.openBadgeText, { color: shop?.is_open ? '#2E7D32' : '#999' }]}>
            {shop?.is_open ? '● Open' : '● Closed'}
          </Text>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>Search products</Text>
      </View>

      {/* Products */}
      <ScrollView
        style={styles.productsList}
        showsVerticalScrollIndicator={false}
      >
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyTitle}>No products found</Text>
          </View>
        ) : (
          filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Cart Footer */}
      {cartCount > 0 && (
        <TouchableOpacity
          style={styles.cartFooter}
          onPress={() => navigation.navigate('Checkout', {
            cart,
            products,
            shop,
            cartTotal,
          })}
        >
          <View style={styles.cartFooterLeft}>
            <Text style={styles.cartFooterCount}>{cartCount} items</Text>
            <Text style={styles.cartFooterShop}>{shop?.shop_name}</Text>
          </View>
          <View style={styles.cartFooterRight}>
            <Text style={styles.cartFooterTotal}>₹{cartTotal.toFixed(0)}</Text>
            <Text style={styles.cartFooterBtn}>View Cart →</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Bottom Tab */}
      <View style={styles.bottomTab}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('MyOrders')}
        >
          <Text style={styles.tabIcon}>📋</Text>
          <Text style={styles.tabLabel}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabIcon}>🛒</Text>
          <Text style={styles.tabLabel}>Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 24, color: '#111' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  headerSubtitle: { fontSize: 11, color: '#888', marginTop: 2 },
  headerIconBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerIcon: { fontSize: 20 },

  openBadgeRow: { paddingHorizontal: 16, paddingTop: 12 },
  openBadge: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  openBadgeText: { fontSize: 13, fontWeight: '600' },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F3F4F6', borderRadius: 12,
    margin: 16, padding: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchPlaceholder: { fontSize: 14, color: '#9CA3AF' },

  productsList: { flex: 1, paddingHorizontal: 16 },

  productCard: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  productInfo: { flex: 1, paddingRight: 12 },
  productName: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 4 },
  productDesc: { fontSize: 12, color: '#888', marginBottom: 6, lineHeight: 16 },
  productPrice: { fontSize: 15, fontWeight: 'bold', color: '#111' },
  productRight: { alignItems: 'center', gap: 8 },
  productImageBox: {
    width: 80, height: 80, borderRadius: 12,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
  },
  productEmoji: { fontSize: 36 },

  addBtn: {
    borderWidth: 1.5, borderColor: '#2563EB',
    borderRadius: 8, paddingHorizontal: 20, paddingVertical: 6,
  },
  addBtnText: { color: '#2563EB', fontWeight: 'bold', fontSize: 13 },

  qtyControl: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#2563EB', borderRadius: 8, overflow: 'hidden',
  },
  qtyBtn: { paddingHorizontal: 10, paddingVertical: 6 },
  qtyBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  qtyText: { color: '#fff', fontSize: 14, fontWeight: 'bold', paddingHorizontal: 8 },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 50, marginBottom: 12 },
  emptyTitle: { fontSize: 16, color: '#888' },

  cartFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#2563EB', margin: 16, borderRadius: 14,
    padding: 16, position: 'absolute', bottom: 70, left: 0, right: 0,
  },
  cartFooterLeft: {},
  cartFooterCount: { color: '#fff', fontSize: 13, opacity: 0.85 },
  cartFooterShop: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  cartFooterRight: { alignItems: 'flex-end' },
  cartFooterTotal: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  cartFooterBtn: { color: '#fff', fontSize: 12, opacity: 0.85 },

  bottomTab: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
    paddingBottom: 24, paddingTop: 10,
    position: 'absolute', bottom: 0, left: 0, right: 0,
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: 22, marginBottom: 2, color: '#9CA3AF' },
  tabLabel: { fontSize: 11, color: '#9CA3AF' },
});