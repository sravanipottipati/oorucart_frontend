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
      <View style={styles.searchRow}>
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

      {/* Shops List */}
      {loading ? (
        <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 60 }} />
      ) : shops.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>😕 No shops found in {town}</Text>
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
            <Text style={styles.resultsText}>{shops.length} shop(s) in {town}</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: {
    backgroundColor: '#2E7D32', padding: 20, paddingTop: 50,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  greeting: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  subGreeting: { fontSize: 13, color: '#A5D6A7', marginTop: 2 },
  logoutBtn: { backgroundColor: '#1B5E20', padding: 8, borderRadius: 8 },
  logoutText: { color: '#fff', fontSize: 13 },
  searchRow: {
    flexDirection: 'row', padding: 16, gap: 10,
    backgroundColor: '#fff', elevation: 2,
  },
  searchInput: {
    flex: 1, borderWidth: 1, borderColor: '#ddd',
    borderRadius: 10, padding: 10, fontSize: 15,
  },
  searchBtn: {
    backgroundColor: '#2E7D32', padding: 10,
    borderRadius: 10, justifyContent: 'center',
  },
  searchBtnText: { color: '#fff', fontWeight: 'bold' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#555', marginBottom: 8 },
  emptySubText: { fontSize: 14, color: '#999' },
  list: { padding: 16 },
  resultsText: { fontSize: 13, color: '#888', marginBottom: 12 },
});