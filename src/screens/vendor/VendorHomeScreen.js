import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, RefreshControl,
  Switch, TextInput,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

const STATUS_COLORS = {
  placed:     { bg: '#FFF7ED', text: '#EA580C' },
  accepted:   { bg: '#F0FDF4', text: '#16A34A' },
  preparing:  { bg: '#EFF6FF', text: '#2563EB' },
  dispatched: { bg: '#F0FDF4', text: '#16A34A' },
  delivered:  { bg: '#DCFCE7', text: '#16A34A' },
  cancelled:  { bg: '#FEF2F2', text: '#DC2626' },
  rejected:   { bg: '#FEF2F2', text: '#DC2626' },
};

const STATUS_LABELS = {
  placed:     'New',
  accepted:   'Accepted',
  preparing:  'Preparing',
  dispatched: 'Ready',
  delivered:  'Delivered',
  cancelled:  'Cancelled',
  rejected:   'Rejected',
};

export default function VendorHomeScreen({ navigation }) {
  const { user, logout }        = useAuth();
  const [shop, setShop]         = useState(null);
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOpen, setIsOpen]     = useState(true);
  const [toggling, setToggling] = useState(false);
  const [search, setSearch]     = useState('');

  const fetchData = async () => {
    try {
      const [shopRes, ordersRes] = await Promise.all([
        client.get('/vendors/myshop/'),
        client.get('/orders/vendor/'),
      ]);
      setShop(shopRes.data);
      setIsOpen(shopRes.data.is_open);
      const ordersData = Array.isArray(ordersRes.data)
        ? ordersRes.data
        : ordersRes.data.orders || [];
      setOrders(ordersData);
    } catch (e) {
      console.log('Error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleToggleShop = async () => {
    setToggling(true);
    try {
      const res = await client.post('/vendors/toggle/');
      setIsOpen(res.data.is_open);
    } catch (e) {
      console.log('Toggle error:', e.message);
    } finally {
      setToggling(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  const pendingOrders    = orders.filter(o => o.status === 'placed');
  const processingOrders = orders.filter(o => ['accepted', 'preparing', 'dispatched'].includes(o.status));

  const filteredOrders = orders.filter(o => {
    if (!search) return true;
    return o.id?.slice(0, 8).toLowerCase().includes(search.toLowerCase()) ||
      o.buyer_name?.toLowerCase().includes(search.toLowerCase());
  });

  const getTimeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff} mins ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hrs ago`;
    return `${Math.floor(diff / 1440)} days ago`;
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
        <View>
          <Text style={styles.shopName}>{shop?.shop_name || user?.full_name}</Text>
          <Text style={styles.shopLocation}>📍 {shop?.town || 'Your Town'}</Text>
        </View>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => navigation.navigate('VendorNotifications')}
        >
          <Text style={styles.bellIcon}>🔔</Text>
          <View style={styles.bellBadge}>
            <Text style={styles.bellBadgeText}>2</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {/* Shop Toggle */}
        <View style={styles.toggleCard}>
          <View style={styles.toggleLeft}>
            <View style={[styles.statusDot, { backgroundColor: isOpen ? '#16A34A' : '#DC2626' }]} />
            <Text style={styles.toggleLabel}>
              {isOpen ? 'Shop is Open' : 'Shop is Closed'}
            </Text>
          </View>
          <View style={styles.toggleRight}>
            <Switch
              value={isOpen}
              onValueChange={handleToggleShop}
              disabled={toggling}
              trackColor={{ false: '#FCA5A5', true: '#93C5FD' }}
              thumbColor={isOpen ? '#2563EB' : '#EF4444'}
            />
            <Text style={[styles.openLabel, { color: isOpen ? '#2563EB' : '#EF4444' }]}>
              {isOpen ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search orders"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#FFF7ED' }]}>
            <Text style={styles.statCardIcon}>🕐</Text>
            <Text style={styles.statCardLabel}>Pending Orders</Text>
            <Text style={[styles.statCardValue, { color: '#EA580C' }]}>
              {pendingOrders.length}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
            <Text style={styles.statCardIcon}>⚡</Text>
            <Text style={styles.statCardLabel}>Processing Orders</Text>
            <Text style={[styles.statCardValue, { color: '#2563EB' }]}>
              {processingOrders.length}
            </Text>
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('VendorOrders')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>No orders yet</Text>
            <Text style={styles.emptySubtitle}>New orders will appear here</Text>
          </View>
        ) : (
          filteredOrders.slice(0, 10).map(order => {
            const statusColor = STATUS_COLORS[order.status] || STATUS_COLORS.placed;
            const statusLabel = STATUS_LABELS[order.status] || order.status;
            const itemCount   = order.items?.length || 0;
            return (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => navigation.navigate('VendorOrderDetail', { orderId: order.id })}
              >
                <View style={styles.orderLeft}>
                  <Text style={styles.orderId}>
                    Order #{order.id?.slice(0, 8).toUpperCase()}
                  </Text>
                  <Text style={styles.orderMeta}>
                    {itemCount} item{itemCount !== 1 ? 's' : ''} • {getTimeAgo(order.created_at)}
                  </Text>
                </View>
                <View style={styles.orderRight}>
                  <Text style={styles.orderAmount}>₹{order.total_amount}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                    <Text style={[styles.statusText, { color: statusColor.text }]}>
                      {statusLabel}
                    </Text>
                  </View>
                </View>
                <Text style={styles.orderArrow}>›</Text>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Tab */}
      <View style={styles.bottomTab}>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabIconActive}>⊞</Text>
          <Text style={styles.tabLabelActive}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('VendorOrders')}
        >
          <Text style={styles.tabIcon}>📋</Text>
          <Text style={styles.tabLabel}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('VendorProducts')}
        >
          <Text style={styles.tabIcon}>📦</Text>
          <Text style={styles.tabLabel}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('VendorProfile')}
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
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 52, paddingHorizontal: 16, paddingBottom: 16,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  shopName: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  shopLocation: { fontSize: 13, color: '#888', marginTop: 2 },
  bellBtn: { position: 'relative', width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  bellIcon: { fontSize: 24 },
  bellBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: '#EF4444', borderRadius: 8,
    minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center',
  },
  bellBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  toggleCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16,
    borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  toggleLabel: { fontSize: 15, fontWeight: '600', color: '#111' },
  toggleRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  openLabel: { fontSize: 13, fontWeight: '600' },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    marginHorizontal: 16, marginTop: 12, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#111' },

  statsRow: {
    flexDirection: 'row', paddingHorizontal: 16,
    gap: 12, marginTop: 12,
  },
  statCard: {
    flex: 1, borderRadius: 16, padding: 16,
  },
  statCardIcon: { fontSize: 24, marginBottom: 8 },
  statCardLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  statCardValue: { fontSize: 28, fontWeight: 'bold' },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16,
    marginTop: 20, marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#111' },
  viewAll: { fontSize: 13, color: '#2563EB', fontWeight: '600' },

  orderCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 16,
    marginBottom: 10, borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  orderLeft: { flex: 1 },
  orderId: { fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  orderMeta: { fontSize: 12, color: '#888' },
  orderRight: { alignItems: 'flex-end', marginRight: 8 },
  orderAmount: { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },
  orderArrow: { fontSize: 20, color: '#9CA3AF' },

  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyEmoji: { fontSize: 50, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: '#888' },

  bottomTab: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
    paddingBottom: 24, paddingTop: 10,
    position: 'absolute', bottom: 0, left: 0, right: 0,
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: 22, marginBottom: 2, color: '#9CA3AF' },
  tabIconActive: { fontSize: 22, marginBottom: 2, color: '#2563EB' },
  tabLabel: { fontSize: 11, color: '#9CA3AF' },
  tabLabelActive: { fontSize: 11, color: '#2563EB', fontWeight: 'bold' },
});