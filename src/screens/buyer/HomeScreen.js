import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, RefreshControl,
  Dimensions, FlatList,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'all',         label: 'All',        emoji: '🛍' },
  { id: 'grocery',     label: 'Grocery',    emoji: '🛒' },
  { id: 'vegetables',  label: 'Vegetables', emoji: '🥦' },
  { id: 'fruits',      label: 'Fruits',     emoji: '🍎' },
  { id: 'bakery',      label: 'Bakery',     emoji: '🥐' },
  { id: 'dairy',       label: 'Dairy',      emoji: '🥛' },
  { id: 'restaurant',  label: 'Restaurant', emoji: '🍽' },
  { id: 'supermarket', label: 'Super',      emoji: '🏪' },
];

const SHOP_COLORS = ['#4CAF50', '#FF7043', '#FFA726', '#42A5F5', '#AB47BC', '#26A69A'];

const OFFERS = [
  {
    id: '1',
    title: '50% OFF',
    subtitle: 'On your first order',
    emoji: '🎉',
    bg: '#2563EB',
    tag: 'NEW USER',
  },
  {
    id: '2',
    title: 'Free Delivery',
    subtitle: 'On all vegetable orders',
    emoji: '🥦',
    bg: '#16A34A',
    tag: 'TODAY ONLY',
  },
  {
    id: '3',
    title: 'Order Fresh',
    subtitle: 'From local shops near you',
    emoji: '🏪',
    bg: '#EA580C',
    tag: 'LOCAL FIRST',
  },
  {
    id: '4',
    title: 'Cash on Delivery',
    subtitle: 'Pay when you receive',
    emoji: '💵',
    bg: '#7C3AED',
    tag: 'SAFE & EASY',
  },
];

export default function HomeScreen({ navigation }) {
  const [shops, setShops]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory]     = useState('all');
  const [bannerIndex, setBannerIndex] = useState(0);
  const bannerRef = useRef(null);

  const { user }                                       = useAuth();
  const { cart, shop: cartShop, cartCount, cartTotal } = useCart();
  const [town, setTown]                                = useState(user?.town || 'Nellore');

  // Auto-scroll banner
  useEffect(() => {
    const timer = setInterval(() => {
      setBannerIndex(prev => {
        const next = (prev + 1) % OFFERS.length;
        bannerRef.current?.scrollToIndex({ index: next, animated: true });
        return next;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Update town when user changes
  useEffect(() => {
    if (user?.town) setTown(user.town);
  }, [user?.town]);

  const fetchShops = async (currentTown) => {
    const t = currentTown || town;
    try {
      const res = await client.get(`/vendors/nearby/?town=${t}`);
      if (Array.isArray(res.data)) {
        setShops(res.data);
      } else if (res.data.shops) {
        setShops(res.data.shops);
      } else if (res.data.results) {
        setShops(res.data.results);
      } else {
        setShops([]);
      }
    } catch (e) {
      console.log('Error fetching shops:', e.message);
      setShops([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchShops(town); }, [town]);

  useFocusEffect(
    useCallback(() => {
      const currentTown = user?.town || 'Nellore';
      setTown(currentTown);
      fetchShops(currentTown);
    }, [user?.town])
  );

  const onRefresh = () => { setRefreshing(true); fetchShops(town); };

  const filteredShops = shops.filter(shop =>
    category === 'all' || shop.category === category
  );

  const getShopColor = (index) => SHOP_COLORS[index % SHOP_COLORS.length];

  const renderStars = (rating) => {
    const r = parseFloat(rating) || 0;
    const full  = Math.floor(r);
    const half  = r % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(empty);
  };

  const ShopCard = ({ shop, index }) => (
    <TouchableOpacity
      style={styles.shopCard}
      onPress={() => navigation.navigate('ShopDetail', {
        vendorId: shop.id,
        shopName: shop.shop_name,
      })}
    >
      {/* Shop Banner */}
      <View style={[styles.shopBanner, { backgroundColor: getShopColor(index) }]}>
        <Text style={styles.shopBannerEmoji}>
          {CATEGORIES.find(c => c.id === shop.category)?.emoji || '🏪'}
        </Text>
        <View style={[
          styles.shopStatusDot,
          { backgroundColor: shop.is_open ? '#16A34A' : '#9CA3AF' }
        ]} />
      </View>

      {/* Shop Info */}
      <View style={styles.shopCardBody}>
        <View style={styles.shopCardTop}>
          <Text style={styles.shopName} numberOfLines={1}>{shop.shop_name}</Text>
          <View style={[
            styles.openBadge,
            { backgroundColor: shop.is_open ? '#DCFCE7' : '#F3F4F6' }
          ]}>
            <Text style={[
              styles.openBadgeText,
              { color: shop.is_open ? '#16A34A' : '#9CA3AF' }
            ]}>
              {shop.is_open ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>

        <Text style={styles.shopCategory}>
          {CATEGORIES.find(c => c.id === shop.category)?.label || shop.category}
        </Text>

        <View style={styles.shopMeta}>
          {shop.rating > 0 ? (
            <View style={styles.ratingBox}>
              <Text style={styles.ratingStars}>★</Text>
              <Text style={styles.ratingText}>{parseFloat(shop.rating).toFixed(1)}</Text>
              {shop.total_reviews > 0 && (
                <Text style={styles.reviewCount}>({shop.total_reviews})</Text>
              )}
            </View>
          ) : (
            <View style={styles.ratingBox}>
              <Text style={styles.ratingStars}>★</Text>
              <Text style={styles.ratingNew}>New</Text>
            </View>
          )}
          <Text style={styles.dot}>•</Text>
          <Text style={styles.shopMetaText}>⏱ {shop.estimated_delivery_time || 30} mins</Text>
          <Text style={styles.dot}>•</Text>
          <Text style={styles.deliveryFree}>Free Delivery</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.deliverTo}>Deliver to</Text>
          <TouchableOpacity
            style={styles.locationRow}
            onPress={() => navigation.navigate('TownSelection')}
          >
            <Text style={styles.locationText}>📍 {town}</Text>
            <Text style={styles.locationArrow}> ▾</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Wishlist')}
          >
            <Text style={styles.iconBtnText}>♡</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Text style={styles.iconBtnText}>🔔</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => navigation.navigate('Search')}
        activeOpacity={0.8}
      >
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>Search shops or products in {town}</Text>
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {/* Offers Banner */}
        <FlatList
          ref={bannerRef}
          data={OFFERS}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={item => item.id}
          onMomentumScrollEnd={e => {
            const index = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_WIDTH - 32));
            setBannerIndex(index);
          }}
          renderItem={({ item }) => (
            <View style={[styles.bannerCard, { backgroundColor: item.bg }]}>
              <View style={styles.bannerLeft}>
                <View style={styles.bannerTag}>
                  <Text style={styles.bannerTagText}>{item.tag}</Text>
                </View>
                <Text style={styles.bannerTitle}>{item.title}</Text>
                <Text style={styles.bannerSubtitle}>{item.subtitle}</Text>
              </View>
              <Text style={styles.bannerEmoji}>{item.emoji}</Text>
            </View>
          )}
          style={styles.bannerList}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          snapToInterval={SCREEN_WIDTH - 32 + 12}
          decelerationRate="fast"
        />

        {/* Banner Dots */}
        <View style={styles.dotsRow}>
          {OFFERS.map((_, i) => (
            <View
              key={i}
              style={[styles.dot2, i === bannerIndex && styles.dotActive]}
            />
          ))}
        </View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Categories</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesRow}
        >
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={styles.categoryItem}
              onPress={() => setCategory(cat.id)}
            >
              <View style={[
                styles.categoryCircle,
                category === cat.id && styles.categoryCircleActive,
              ]}>
                <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              </View>
              <Text style={[
                styles.categoryLabel,
                category === cat.id && styles.categoryLabelActive,
              ]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Nearby Shops */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shops in {town}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('TownSelection')}>
            <Text style={styles.seeAll}>Change Town ›</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
        ) : filteredShops.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏪</Text>
            <Text style={styles.emptyTitle}>No shops in {town}</Text>
            <Text style={styles.emptySubtitle}>Try a different category or change town</Text>
            <TouchableOpacity
              style={styles.changeTownBtn}
              onPress={() => navigation.navigate('TownSelection')}
            >
              <Text style={styles.changeTownBtnText}>Change Town</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredShops.map((shop, index) => (
            <ShopCard key={shop.id} shop={shop} index={index} />
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Global Cart Bar */}
      {cartCount > 0 && (
        <TouchableOpacity
          style={styles.cartBar}
          onPress={() => navigation.navigate('ShopDetail', {
            vendorId: cartShop?.id,
            shopName: cartShop?.shop_name,
          })}
        >
          <View style={styles.cartBarLeft}>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
            <Text style={styles.cartBarItems}>
              {cartCount} item{cartCount > 1 ? 's' : ''} added
            </Text>
          </View>
          <View style={styles.cartBarRight}>
            <Text style={styles.cartBarShop}>{cartShop?.shop_name}</Text>
            <Text style={styles.cartBarTotal}>₹{cartTotal.toFixed(0)} →</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Bottom Tab Bar */}
      <View style={styles.bottomTab}>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={[styles.tabIcon, { color: '#2563EB' }]}>🏠</Text>
          <Text style={styles.tabLabelActive}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('MyOrders')}
        >
          <Text style={styles.tabIcon}>📋</Text>
          <Text style={styles.tabLabel}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => {
            if (cartCount > 0 && cartShop) {
              navigation.navigate('ShopDetail', {
                vendorId: cartShop.id,
                shopName: cartShop.shop_name,
              });
            } else {
              navigation.navigate('MyOrders');
            }
          }}
        >
          <View style={styles.cartTabContainer}>
            <Text style={styles.tabIcon}>🛒</Text>
            {cartCount > 0 && (
              <View style={styles.cartTabBadge}>
                <Text style={styles.cartTabBadgeText}>{cartCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.tabLabel, cartCount > 0 && { color: '#2563EB' }]}>Cart</Text>
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
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff',
  },
  headerLeft: {},
  deliverTo: { fontSize: 12, color: '#888' },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  locationText: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  locationArrow: { fontSize: 14, color: '#111' },
  headerRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
  },
  iconBtnText: { fontSize: 18 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F3F4F6', borderRadius: 12,
    marginHorizontal: 16, marginVertical: 12, padding: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchPlaceholder: { fontSize: 14, color: '#9CA3AF' },

  // Banner
  bannerList: { marginBottom: 8 },
  bannerCard: {
    width: SCREEN_WIDTH - 44,
    borderRadius: 16, padding: 20,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    marginRight: 12, height: 110,
  },
  bannerLeft: { flex: 1 },
  bannerTag: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignSelf: 'flex-start', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 3, marginBottom: 8,
  },
  bannerTagText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  bannerTitle:   { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  bannerSubtitle:{ color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  bannerEmoji:   { fontSize: 52 },

  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginBottom: 16 },
  dot2:    { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D1D5DB' },
  dotActive: { backgroundColor: '#2563EB', width: 18 },

  categoriesRow: { paddingLeft: 16, marginBottom: 8 },
  categoryItem: { alignItems: 'center', marginRight: 16, marginBottom: 8 },
  categoryCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    marginBottom: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  categoryCircleActive: { backgroundColor: '#DBEAFE' },
  categoryEmoji: { fontSize: 26 },
  categoryLabel: { fontSize: 11, color: '#555', textAlign: 'center' },
  categoryLabelActive: { color: '#2563EB', fontWeight: 'bold' },

  sectionTitle: {
    fontSize: 17, fontWeight: 'bold', color: '#111',
    marginLeft: 16, marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginRight: 16,
  },
  seeAll: { fontSize: 13, color: '#2563EB', fontWeight: '600' },

  // New Shop Card style
  shopCard: {
    backgroundColor: '#fff', marginHorizontal: 16,
    marginBottom: 16, borderRadius: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
    overflow: 'hidden',
  },
  shopBanner: {
    height: 100, justifyContent: 'center', alignItems: 'center',
    position: 'relative',
  },
  shopBannerEmoji: { fontSize: 48 },
  shopStatusDot: {
    position: 'absolute', top: 10, right: 10,
    width: 10, height: 10, borderRadius: 5,
    borderWidth: 2, borderColor: '#fff',
  },
  shopCardBody: { padding: 14 },
  shopCardTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 4,
  },
  shopName: { fontSize: 15, fontWeight: 'bold', color: '#111', flex: 1 },
  openBadge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 20, marginLeft: 8,
  },
  openBadgeText: { fontSize: 11, fontWeight: '600' },
  shopCategory: { fontSize: 12, color: '#888', marginBottom: 8 },
  shopMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingBox: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingStars: { fontSize: 13, color: '#F59E0B' },
  ratingText: { fontSize: 12, fontWeight: 'bold', color: '#111' },
  ratingNew: { fontSize: 12, color: '#888' },
  reviewCount: { fontSize: 11, color: '#888' },
  dot: { fontSize: 10, color: '#D1D5DB' },
  shopMetaText: { fontSize: 12, color: '#555' },
  deliveryFree: { fontSize: 12, color: '#16A34A', fontWeight: '600' },

  emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 50, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: '#888', marginBottom: 20, textAlign: 'center' },
  changeTownBtn: {
    backgroundColor: '#2563EB', borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  changeTownBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  cartBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#2563EB', marginHorizontal: 16, borderRadius: 14,
    padding: 14, position: 'absolute', bottom: 74, left: 0, right: 0,
  },
  cartBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cartBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 8,
    width: 28, height: 28, justifyContent: 'center', alignItems: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  cartBarItems: { color: '#fff', fontSize: 13, fontWeight: '600' },
  cartBarRight: { alignItems: 'flex-end' },
  cartBarShop: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginBottom: 2 },
  cartBarTotal: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

  cartTabContainer: { position: 'relative' },
  cartTabBadge: {
    position: 'absolute', top: -4, right: -8,
    backgroundColor: '#EF4444', borderRadius: 8,
    minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartTabBadgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },

  bottomTab: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
    paddingBottom: 24, paddingTop: 10,
    position: 'absolute', bottom: 0, left: 0, right: 0,
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: 22, marginBottom: 2, color: '#9CA3AF' },
  tabLabel: { fontSize: 11, color: '#9CA3AF' },
  tabLabelActive: { fontSize: 11, color: '#2563EB', fontWeight: 'bold' },
});