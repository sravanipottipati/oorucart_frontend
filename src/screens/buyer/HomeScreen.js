import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  TextInput, RefreshControl, Alert, TouchableOpacity, ScrollView,
} from 'react-native';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import ShopCard from '../../components/ShopCard';

const CATEGORIES = [
  { id: '1', label: 'Grocery',  emoji: '🛒' },
  { id: '2', label: 'Veggies',  emoji: '🥦' },
  { id: '3', label: 'Fruits',   emoji: '🍎' },
  { id: '4', label: 'Bakery',   emoji: '🥐' },
  { id: '5', label: 'Dairy',    emoji: '🥛' },
  { id: '6', label: 'Meat',     emoji: '🍗' },
];

export default function HomeScreen({ navigation }) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [town, setTown] = useState('Nellore');
  const [searchText, setSearchText] = useState('');
  const { user, logout } = useAuth();

  useEffect(() => { fetchShops(); }, [town]);

  const fetchShops = async () => {
    try {
      const res = await client.get(`/vendors/nearby/?town=${town}`);
      setShops(res.data.shops);
    } catch (e) {
      Alert.alert('Error', 'Could not load shops');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.locationRow}>
          <View style={styles.locationLeft}>
            <View style={styles.locationIconBox}>
              <Text style={styles.locationIcon}>📍</Text>
            </View>
            <View>
              <Text style={styles.deliverTo}>Deliver to</Text>
              <TouchableOpacity
                style={styles.townRow}
                onPress={() => Alert.prompt(
                  'Change Town',
                  'Enter your town name',
                  (text) => { if (text) setTown(text); }
                )}
              >
                <Text style={styles.townName}>{town} ▾</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.headerIcons}>
            <TouchableOpacity style={styles.iconBtn}>
              <Text style={styles.iconBtnText}>🔔</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={handleLogout}>
              <Text style={styles.iconBtnText}>👤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search shops or products"
            placeholderTextColor="#aaa"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchShops(); }}
          />
        }
      >
        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categories</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.categoryItem}>
                <View style={styles.categoryBox}>
                  <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
                </View>
                <Text style={styles.categoryLabel}>{cat.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Nearby Shops */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Shops</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 40 }} />
          ) : shops.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>😕</Text>
              <Text style={styles.emptyText}>No shops found in {town}</Text>
            </View>
          ) : (
            shops.map((item) => (
              <ShopCard
                key={item.id}
                shop={item}
                onPress={() => navigation.navigate('ShopDetail', { shop: item })}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Bottom Tab Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabIconActive}>🏠</Text>
          <Text style={styles.tabLabelActive}>Home</Text>
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
        <TouchableOpacity style={styles.tabItem} onPress={handleLogout}>
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },

  // Header
  header: {
    backgroundColor: '#fff', paddingTop: 50, paddingHorizontal: 16,
    paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  locationRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  locationLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  locationIconBox: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#E8F5E9', justifyContent: 'center', alignItems: 'center',
  },
  locationIcon: { fontSize: 18 },
  deliverTo: { fontSize: 12, color: '#888' },
  townRow: { flexDirection: 'row', alignItems: 'center' },
  townName: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  headerIcons: { flexDirection: 'row', gap: 10 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center',
  },
  iconBtnText: { fontSize: 18 },

  // Search
  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f5f5f5', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 12, gap: 10,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 15, color: '#111' },

  // Sections
  section: { padding: 16, paddingBottom: 0 },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 14 },
  seeAll: { fontSize: 14, color: '#2E7D32', fontWeight: '600' },

  // Categories
  categoryGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 8,
  },
  categoryItem: { alignItems: 'center', width: '14%' },
  categoryBox: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: '#f0f7f0', justifyContent: 'center',
    alignItems: 'center', marginBottom: 6,
    borderWidth: 1, borderColor: '#e0f0e0',
  },
  categoryEmoji: { fontSize: 26 },
  categoryLabel: { fontSize: 11, color: '#444', fontWeight: '500', textAlign: 'center' },

  // Empty
  empty: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#888' },

  // Bottom Tab Bar
  bottomBar: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#f0f0f0',
    paddingVertical: 10, paddingBottom: 20,
  },
  tabItem: { flex: 1, alignItems: 'center', gap: 4 },
  tabIcon: { fontSize: 22 },
  tabIconActive: { fontSize: 22 },
  tabLabel: { fontSize: 11, color: '#888', fontWeight: '500' },
  tabLabelActive: { fontSize: 11, color: '#2E7D32', fontWeight: 'bold' },
});