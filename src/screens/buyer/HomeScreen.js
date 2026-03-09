import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, TextInput, RefreshControl, Alert, TouchableOpacity,
} from 'react-native';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import ShopCard from '../../components/ShopCard';

export default function HomeScreen({ navigation }) {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [town, setTown] = useState('Nellore');
  const [searchTown, setSearchTown] = useState('Nellore');
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
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi {user?.full_name?.split(' ')[0]}! 👋</Text>
          <Text style={styles.subGreeting}>What do you need today?</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <View style={styles.searchRow}>
          <Text style={styles.searchIcon}>📍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter your town..."
            value={searchTown}
            onChangeText={setSearchTown}
            onSubmitEditing={() => setTown(searchTown)}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={() => setTown(searchTown)}>
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Category Pills */}
      <View style={styles.categories}>
        {['All', '🥦 Veg', '🍞 Bakery', '🍽 Food', '🛒 Mart'].map((cat) => (
          <TouchableOpacity key={cat} style={styles.pill}>
            <Text style={styles.pillText}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Shops List */}
      {loading ? (
        <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 60 }} />
      ) : shops.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>😕</Text>
          <Text style={styles.emptyText}>No shops found in {town}</Text>
          <Text style={styles.emptySubText}>Try a different town name</Text>
        </View>
      ) : (
        <FlatList
          data={shops}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) =>
            <ShopCard
              shop={item}
              onPress={() => navigation.navigate('ShopDetail', { shop: item })}
            />
          }
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchShops(); }}
            />
          }
          ListHeaderComponent={
            <Text style={styles.resultsText}>{shops.length} shop(s) near {town}</Text>
          }
        />
      )}

      {/* My Orders FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('MyOrders')}
      >
        <Text style={styles.fabText}>📦 My Orders</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: {
    backgroundColor: '#fff', padding: 20, paddingTop: 50,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  greeting: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  subGreeting: { fontSize: 13, color: '#888', marginTop: 2 },
  logoutBtn: {
    borderWidth: 1, borderColor: '#ddd',
    padding: 8, paddingHorizontal: 14, borderRadius: 20,
  },
  logoutText: { color: '#555', fontSize: 13, fontWeight: '600' },
  searchContainer: {
    backgroundColor: '#fff', padding: 12,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f5f5f5', borderRadius: 12, paddingHorizontal: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, padding: 12, fontSize: 15, color: '#111' },
  searchBtn: {
    backgroundColor: '#2E7D32', padding: 8,
    paddingHorizontal: 14, borderRadius: 10,
  },
  searchBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  categories: {
    flexDirection: 'row', padding: 12, gap: 8,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  pill: {
    backgroundColor: '#f0f7f0', paddingHorizontal: 14,
    paddingVertical: 6, borderRadius: 20,
    borderWidth: 1, borderColor: '#c8e6c9',
  },
  pillText: { fontSize: 13, color: '#2E7D32', fontWeight: '600' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 18, color: '#555', marginBottom: 6, fontWeight: '600' },
  emptySubText: { fontSize: 14, color: '#999' },
  list: { padding: 16, paddingBottom: 100 },
  resultsText: { fontSize: 13, color: '#888', marginBottom: 12 },
  fab: {
    position: 'absolute', bottom: 24, right: 20,
    backgroundColor: '#111', paddingHorizontal: 20,
    paddingVertical: 12, borderRadius: 30, elevation: 4,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 6,
  },
  fabText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});