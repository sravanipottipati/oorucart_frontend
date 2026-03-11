import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

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

export default function HomeScreen({ navigation }) {
  const { logout } = useAuth();
  const [shops, setShops]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory]     = useState('all');
  const [town, setTown]             = useState('Nellore');

  const fetchShops = async () => {
    try {
      const res = await client.get('/vendors/nearby/?town=Nellore');
      console.log('API response:', JSON.stringify(res.data));
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

  useEffect(() => { fetchShops(); }, []);

  const onRefresh = () => { setRefreshing(true); fetchShops(); };

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  const filteredShops = shops.filter(shop =>
    category === 'all' || shop.category === category
  );

  const getShopColor = (index) => SHOP_COLORS[index % SHOP_COLORS.length];

  const ShopCard = ({ shop, index }) => (
    <TouchableOpacity
      style={styles.shopCard}
      onPress={() => navigation.navigate('ShopDetail', {
        vendorId: shop.id,
        shopName: shop.shop_name,
      })}
    >
      <View style={[styles.shopIcon, { backgroundColor: getShopColor(index) }]}>
        <Text style={styles.shopIconText}>
          {CATEGORIES.find(c => c.id === shop.category)?.emoji || '🏪'}
        </Text>
      </View>
      <View style={styles.shopInfo}>
        <Text style={styles.shopName}>{shop.shop_name}</Text>
        <Text style={styles.shopCategory}>
          {CATEGORIES.find(c => c.id === shop.category)?.label || shop.category}
        </Text>
        <View style={styles.shopMeta}>
          <Text style={styles.shopMetaText}>📍 {shop.town}</Text>
          <Text style={styles.shopMetaText}>  ⏱ {shop.estimated_delivery_time || 30} mins</Text>
        </View>
      </View>
      <View style={[styles.statusBadge, {
        backgroundColor: shop.is_open ? '#E8F5E9' : '#F5F5F5',
      }]}>
        <Text style={[styles.statusText, {
          color: shop.is_open ? '#2E7D32' : '#999',
        }]}>
          {shop.is_open ? '● Open' : 'Closed'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.deliverTo}>Deliver to</Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationText}>📍 {town}</Text>
            <Text style={styles.locationArrow}> ▾</Text>
          </View>
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
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
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
        <Text style={styles.searchPlaceholder}>Search shops or products</Text>
      </TouchableOpacity>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
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
          <Text style={styles.sectionTitle}>Nearby Shops</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>See All ›</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
        ) : filteredShops.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🏪</Text>
            <Text style={styles.emptyTitle}>No shops found</Text>
            <Text style={styles.emptySubtitle}>Try a different category</Text>
          </View>
        ) : (
          filteredShops.map((shop, index) => (
            <ShopCard key={shop.id} shop={shop} index={index} />
          ))
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

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
          onPress={() => navigation.navigate('Cart')}
        >
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
        <TouchableOpacity
          style={styles.tabItem}
          onPress={handleLogout}
        >
          <Text style={styles.tabIcon}>🚪</Text>
          <Text style={[styles.tabLabel, { color: '#EF4444' }]}>Logout</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

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
    position: 'relative', width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
  },
  iconBtnText: { fontSize: 18 },
  badge: {
    position: 'absolute', top: 0, right: 0, backgroundColor: '#EF4444',
    borderRadius: 8, minWidth: 16, height: 16,
    justifyContent: 'center', alignItems: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F3F4F6', borderRadius: 12,
    marginHorizontal: 16, marginBottom: 16, padding: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchPlaceholder: { fontSize: 14, color: '#9CA3AF' },

  categoriesRow: { paddingLeft: 16, marginBottom: 8 },
  categoryItem: { alignItems: 'center', marginRight: 16, marginBottom: 8 },
  categoryCircle: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 6,
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

  shopCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 16,
    marginBottom: 12, borderRadius: 16, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  shopIcon: {
    width: 60, height: 60, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  shopIconText: { fontSize: 28 },
  shopInfo: { flex: 1 },
  shopName: { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 2 },
  shopCategory: { fontSize: 12, color: '#888', marginBottom: 4 },
  shopMeta: { flexDirection: 'row' },
  shopMetaText: { fontSize: 11, color: '#888' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 50, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: '#888' },

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