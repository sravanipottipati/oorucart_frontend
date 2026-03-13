import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import client from '../../api/client';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product, qty, onAdd, onRemove }) => {
  const [wishlisted, setWishlisted] = useState(false);

  const toggleWishlist = async () => {
    try {
      await client.post('/vendors/wishlist/', { product_id: product.id });
      setWishlisted(prev => !prev);
    } catch (e) {
      console.log('Wishlist error:', e.message);
    }
  };

  return (
    <View style={styles.productCard}>
      <View style={styles.productInfo}>
        <View style={styles.productNameRow}>
          <Text style={styles.productName}>{product.name}</Text>
          <TouchableOpacity onPress={toggleWishlist} style={styles.wishlistBtn}>
            <Text style={styles.wishlistIcon}>{wishlisted ? '❤️' : '🤍'}</Text>
          </TouchableOpacity>
        </View>
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
          <TouchableOpacity style={styles.addBtn} onPress={() => onAdd(product)}>
            <Text style={styles.addBtnText}>ADD</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.qtyControl}>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => onRemove(product)}>
              <Text style={styles.qtyBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.qtyText}>{qty}</Text>
            <TouchableOpacity style={styles.qtyBtn} onPress={() => onAdd(product)}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default function ShopDetailScreen({ navigation, route }) {
  const { vendorId, shopName } = route.params;
  const [shop, setShop]         = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);

  const { cart, shop: cartShop, addToCart, removeFromCart, cartCount, cartTotal } = useCart();

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

  const handleAddToCart = (product) => {
    // Warn if adding from different shop
    if (cartShop && cartShop.id !== vendorId && cartCount > 0) {
      Alert.alert(
        'Start New Cart?',
        `Your cart has items from "${cartShop.shop_name}". Starting a new cart will clear it.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start New Cart',
            style: 'destructive',
            onPress: () => addToCart(product, shop),
          },
        ]
      );
      return;
    }
    addToCart(product, shop);
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
        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={styles.headerIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Shop Info Row */}
      <View style={styles.shopInfoRow}>
        <View style={[styles.openBadge, { backgroundColor: shop?.is_open ? '#E8F5E9' : '#F5F5F5' }]}>
          <Text style={[styles.openBadgeText, { color: shop?.is_open ? '#2E7D32' : '#999' }]}>
            {shop?.is_open ? '● Open' : '● Closed'}
          </Text>
        </View>
        {shop?.delivery_type && (
          <View style={styles.deliveryBadge}>
            <Text style={styles.deliveryBadgeText}>🛵 {shop.delivery_type}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.wishlistNavBtn}
          onPress={() => navigation.navigate('Wishlist')}
        >
          <Text style={styles.wishlistNavText}>❤️ Wishlist</Text>
        </TouchableOpacity>
      </View>

      {/* Products */}
      <ScrollView style={styles.productsList} showsVerticalScrollIndicator={false}>
        {products.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyTitle}>No products available</Text>
          </View>
        ) : (
          products.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              qty={cart[product.id] || 0}
              onAdd={handleAddToCart}
              onRemove={removeFromCart}
            />
          ))
        )}
        <View style={{ height: 140 }} />
      </ScrollView>

      {/* Cart Footer — shows from global cart */}
      {cartCount > 0 && cartShop?.id === vendorId && (
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
            <Text style={styles.cartFooterCount}>{cartCount} item{cartCount > 1 ? 's' : ''}</Text>
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
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('MyOrders')}>
          <Text style={styles.tabIcon}>📋</Text>
          <Text style={styles.tabLabel}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Wishlist')}>
          <Text style={styles.tabIcon}>❤️</Text>
          <Text style={styles.tabLabel}>Wishlist</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Profile')}>
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

  shopInfoRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 10,
    gap: 8, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  openBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  openBadgeText: { fontSize: 12, fontWeight: '600' },
  deliveryBadge: {
    backgroundColor: '#EFF6FF', paddingHorizontal: 12,
    paddingVertical: 5, borderRadius: 20,
  },
  deliveryBadgeText: { fontSize: 12, color: '#2563EB', fontWeight: '500' },
  wishlistNavBtn: {
    marginLeft: 'auto', backgroundColor: '#FFF0F0',
    paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20,
  },
  wishlistNavText: { fontSize: 12, color: '#EF4444', fontWeight: '600' },

  productsList: { flex: 1, paddingHorizontal: 16 },

  productCard: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  productInfo: { flex: 1, paddingRight: 12 },
  productNameRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  productName: { fontSize: 15, fontWeight: '600', color: '#111', flex: 1 },
  wishlistBtn: { padding: 4 },
  wishlistIcon: { fontSize: 18 },
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
    backgroundColor: '#2563EB', borderRadius: 8,
    minWidth: 100, justifyContent: 'space-between',
  },
  qtyBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  qtyBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  qtyText: { color: '#fff', fontSize: 16, fontWeight: 'bold', minWidth: 24, textAlign: 'center' },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 50, marginBottom: 12 },
  emptyTitle: { fontSize: 16, color: '#888' },

  cartFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#2563EB', marginHorizontal: 16, borderRadius: 14,
    padding: 16, position: 'absolute', bottom: 74, left: 0, right: 0,
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