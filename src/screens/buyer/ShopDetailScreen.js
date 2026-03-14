import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Dimensions,
} from 'react-native';
import client from '../../api/client';
import { useCart } from '../../context/CartContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORY_EMOJIS = {
  vegetables: '🥬', fruits: '🍎', dairy: '🥛',
  bakery: '🥐', snacks: '🍿', beverages: '🥤',
  food: '🍱', grocery: '🛒', other: '📦',
};

const SHOP_COLORS = ['#4CAF50', '#FF7043', '#FFA726', '#42A5F5', '#AB47BC', '#26A69A'];

const ProductCard = ({ product, qty, onAdd, onRemove, shopColor }) => {
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
        {/* Veg/Non-veg indicator */}
        <View style={styles.vegIndicator}>
          <View style={styles.vegDot} />
        </View>
        <Text style={styles.productName}>{product.name}</Text>
        {product.description ? (
          <Text style={styles.productDesc} numberOfLines={2}>
            {product.description}
          </Text>
        ) : null}
        <Text style={styles.productPrice}>₹{product.price}</Text>
        <TouchableOpacity onPress={toggleWishlist} style={styles.wishlistBtn}>
          <Text style={styles.wishlistIcon}>{wishlisted ? '❤️' : '🤍'}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.productRight}>
        <View style={[styles.productImageBox, { backgroundColor: shopColor + '20' }]}>
          <Text style={styles.productEmoji}>
            {CATEGORY_EMOJIS[product.category] || '🛍'}
          </Text>
        </View>
        {qty === 0 ? (
          <TouchableOpacity style={[styles.addBtn, { borderColor: shopColor }]} onPress={() => onAdd(product)}>
            <Text style={[styles.addBtnText, { color: shopColor }]}>ADD</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.qtyControl, { backgroundColor: shopColor }]}>
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
  const [shop, setShop]           = useState(null);
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  const { cart, shop: cartShop, addToCart, removeFromCart, cartCount, cartTotal } = useCart();

  const shopColor = SHOP_COLORS[Math.abs(vendorId?.charCodeAt(0) - 65) % SHOP_COLORS.length] || '#2563EB';

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
    if (cartShop && cartShop.id !== vendorId && cartCount > 0) {
      Alert.alert(
        'Start New Cart?',
        `Your cart has items from "${cartShop.shop_name}". Starting a new cart will clear it.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Start New Cart', style: 'destructive',
            onPress: () => addToCart(product, shop),
          },
        ]
      );
      return;
    }
    addToCart(product, shop);
  };

  // Get unique product categories
  const productCategories = ['all', ...new Set(products.map(p => p.category))];

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Shop Banner */}
      <View style={[styles.shopBanner, { backgroundColor: shopColor }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={styles.notifIcon}>🔔</Text>
        </TouchableOpacity>
        <Text style={styles.bannerEmoji}>
          {CATEGORY_EMOJIS[shop?.category] || '🏪'}
        </Text>
      </View>

      {/* Shop Info Card */}
      <View style={styles.shopInfoCard}>
        <View style={styles.shopInfoTop}>
          <View style={styles.shopInfoLeft}>
            <Text style={styles.shopInfoName}>{shop?.shop_name || shopName}</Text>
            <Text style={styles.shopInfoCategory}>
              {shop?.category?.charAt(0).toUpperCase() + shop?.category?.slice(1)} • {shop?.town}
            </Text>
          </View>
          <View style={[
            styles.shopOpenBadge,
            { backgroundColor: shop?.is_open ? '#DCFCE7' : '#F3F4F6' }
          ]}>
            <View style={[
              styles.shopOpenDot,
              { backgroundColor: shop?.is_open ? '#16A34A' : '#9CA3AF' }
            ]} />
            <Text style={[
              styles.shopOpenText,
              { color: shop?.is_open ? '#16A34A' : '#9CA3AF' }
            ]}>
              {shop?.is_open ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statValue}>
              {shop?.rating > 0 ? parseFloat(shop.rating).toFixed(1) : 'New'}
            </Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>⏱</Text>
            <Text style={styles.statValue}>{shop?.estimated_delivery_time || 30}</Text>
            <Text style={styles.statLabel}>Mins</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>🛵</Text>
            <Text style={styles.statValue}>Free</Text>
            <Text style={styles.statLabel}>Delivery</Text>
          </View>
          <View style={styles.statDivider} />
          <TouchableOpacity
            style={styles.statItem}
            onPress={() => navigation.navigate('Wishlist')}
          >
            <Text style={styles.statEmoji}>❤️</Text>
            <Text style={styles.statValue}>Save</Text>
            <Text style={styles.statLabel}>Wishlist</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Filter Tabs */}
      {productCategories.length > 1 && (
        <View style={styles.categoryTabsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryTabs}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {productCategories.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.categoryTab,
                  activeCategory === cat && { borderBottomColor: shopColor, borderBottomWidth: 2 },
                ]}
                onPress={() => setActiveCategory(cat)}
              >
                <Text style={[
                  styles.categoryTabText,
                  activeCategory === cat && { color: shopColor, fontWeight: 'bold' },
                ]}>
                  {cat === 'all' ? 'All Items' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Products List */}
      <ScrollView
        style={styles.productsList}
        showsVerticalScrollIndicator={false}
      >
        {/* Items count */}
        <Text style={styles.itemsCount}>
          {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''}
        </Text>

        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📦</Text>
            <Text style={styles.emptyTitle}>No products available</Text>
          </View>
        ) : (
          filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              qty={cart[product.id] || 0}
              onAdd={handleAddToCart}
              onRemove={removeFromCart}
              shopColor={shopColor}
            />
          ))
        )}
        <View style={{ height: 160 }} />
      </ScrollView>

      {/* Cart Footer */}
      {cartCount > 0 && cartShop?.id === vendorId && (
        <TouchableOpacity
          style={[styles.cartFooter, { backgroundColor: shopColor }]}
          onPress={() => navigation.navigate('Checkout', {
            cart, products, shop, cartTotal,
          })}
        >
          <View style={styles.cartFooterLeft}>
            <View style={styles.cartCountBadge}>
              <Text style={styles.cartCountText}>{cartCount}</Text>
            </View>
            <Text style={styles.cartFooterLabel}>
              {cartCount} item{cartCount > 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={styles.cartFooterShop}>View Cart</Text>
          <Text style={styles.cartFooterTotal}>₹{cartTotal.toFixed(0)} →</Text>
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
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // Shop Banner
  shopBanner: {
    height: 160, justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  backBtn: {
    position: 'absolute', top: 52, left: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  backText: { fontSize: 20, color: '#fff', fontWeight: 'bold' },
  notifBtn: {
    position: 'absolute', top: 52, right: 16,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center', alignItems: 'center',
  },
  notifIcon: { fontSize: 18 },
  bannerEmoji: { fontSize: 64 },

  // Shop Info Card
  shopInfoCard: {
    backgroundColor: '#fff', marginHorizontal: 16,
    marginTop: -20, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 4,
    marginBottom: 8,
  },
  shopInfoTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 12,
  },
  shopInfoLeft: { flex: 1 },
  shopInfoName: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  shopInfoCategory: { fontSize: 13, color: '#888' },
  shopOpenBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20,
  },
  shopOpenDot: { width: 7, height: 7, borderRadius: 4 },
  shopOpenText: { fontSize: 12, fontWeight: '600' },

  statsRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingTop: 12,
    borderTopWidth: 1, borderTopColor: '#F5F5F5',
  },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statEmoji: { fontSize: 18 },
  statValue: { fontSize: 13, fontWeight: 'bold', color: '#111' },
  statLabel: { fontSize: 10, color: '#888' },
  statDivider: { width: 1, height: 32, backgroundColor: '#F0F0F0' },

  // Category Tabs
  categoryTabsWrapper: {
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  categoryTabs: { paddingVertical: 4 },
  categoryTab: {
    paddingHorizontal: 16, paddingVertical: 10,
    marginRight: 4, borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  categoryTabText: { fontSize: 13, color: '#888', fontWeight: '500' },

  // Products
  productsList: { flex: 1 },
  itemsCount: {
    fontSize: 12, color: '#888', fontWeight: '500',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4,
  },

  productCard: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 16, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
    backgroundColor: '#fff',
  },
  productInfo: { flex: 1, paddingRight: 12 },
  vegIndicator: {
    width: 16, height: 16, borderRadius: 2,
    borderWidth: 1.5, borderColor: '#16A34A',
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 6,
  },
  vegDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#16A34A',
  },
  productName: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 4 },
  productDesc: { fontSize: 12, color: '#888', marginBottom: 6, lineHeight: 16 },
  productPrice: { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 8 },
  wishlistBtn: { alignSelf: 'flex-start' },
  wishlistIcon: { fontSize: 16 },

  productRight: { alignItems: 'center', gap: 10 },
  productImageBox: {
    width: 90, height: 90, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  productEmoji: { fontSize: 40 },

  addBtn: {
    borderWidth: 1.5, borderRadius: 8,
    paddingHorizontal: 24, paddingVertical: 7,
    backgroundColor: '#fff',
  },
  addBtnText: { fontWeight: 'bold', fontSize: 14 },

  qtyControl: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 8, minWidth: 100, justifyContent: 'space-between',
  },
  qtyBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  qtyBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  qtyText: { color: '#fff', fontSize: 16, fontWeight: 'bold', minWidth: 24, textAlign: 'center' },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 50, marginBottom: 12 },
  emptyTitle: { fontSize: 16, color: '#888' },

  cartFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginHorizontal: 16, borderRadius: 14,
    padding: 16, position: 'absolute', bottom: 74, left: 0, right: 0,
  },
  cartFooterLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cartCountBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 6,
    width: 26, height: 26, justifyContent: 'center', alignItems: 'center',
  },
  cartCountText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  cartFooterLabel: { color: '#fff', fontSize: 13, opacity: 0.9 },
  cartFooterShop: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  cartFooterTotal: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

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