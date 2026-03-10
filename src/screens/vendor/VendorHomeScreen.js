import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, Alert, TouchableOpacity, RefreshControl,
} from 'react-native';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const statusConfig = {
  placed:     { color: '#1565C0', bg: '#E3F2FD', emoji: '🕐', label: 'New Order' },
  accepted:   { color: '#2E7D32', bg: '#E8F5E9', emoji: '✅', label: 'Accepted' },
  rejected:   { color: '#C62828', bg: '#FFEBEE', emoji: '❌', label: 'Rejected' },
  preparing:  { color: '#E65100', bg: '#FFF3E0', emoji: '👨‍🍳', label: 'Preparing' },
  dispatched: { color: '#6A1B9A', bg: '#F3E5F5', emoji: '🚚', label: 'Dispatched' },
  delivered:  { color: '#2E7D32', bg: '#E8F5E9', emoji: '🎉', label: 'Delivered' },
  cancelled:  { color: '#555',    bg: '#F5F5F5', emoji: '🚫', label: 'Cancelled' },
};

export default function VendorHomeScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shop, setShop] = useState(null);
  const [activeTab, setActiveTab] = useState('new');
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchShop();
    fetchOrders();
  }, []);

  const fetchShop = async () => {
    try {
      const res = await client.get('/vendors/myshop/');
      setShop(res.data.vendor);
    } catch (e) {
      console.log('Shop fetch error', e);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await client.get('/orders/vendor/');
      setOrders(res.data.orders);
    } catch (e) {
      Alert.alert('Error', 'Could not load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await client.post(`/orders/${orderId}/status/`, { status });
      fetchOrders();
    } catch (e) {
      Alert.alert('Error', 'Could not update order status');
    }
  };

  const toggleShop = async () => {
    try {
      const res = await client.post('/vendors/toggle/');
      setShop(prev => ({ ...prev, is_open: res.data.is_open }));
      Alert.alert('Updated', res.data.is_open ? 'Shop is now Open!' : 'Shop is now Closed!');
    } catch (e) {
      Alert.alert('Error', 'Could not update shop status');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  const filteredOrders = orders.filter(o => {
    if (activeTab === 'new') return o.status === 'placed';
    if (activeTab === 'active') return ['accepted', 'preparing', 'dispatched'].includes(o.status);
    if (activeTab === 'done') return ['delivered', 'rejected', 'cancelled'].includes(o.status);
    return true;
  });

  const renderOrder = ({ item }) => {
    const status = statusConfig[item.status] || statusConfig.placed;
    return (
      <View style={styles.orderCard}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderId}>Order #{item.id.slice(-6).toUpperCase()}</Text>
            <Text style={styles.orderTime}>
              {new Date(item.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              {' • '}
              {new Date(item.created_at).toLocaleDateString('en-IN')}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.emoji} {status.label}
            </Text>
          </View>
        </View>

        {/* Items */}
        <View style={styles.itemsBox}>
          {item.items && item.items.map(i => (
            <Text key={i.id} style={styles.itemText}>
              • {i.product_name} x{i.quantity} — Rs.{(parseFloat(i.price) * i.quantity).toFixed(0)}
            </Text>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.orderFooter}>
          <View>
            <Text style={styles.addressText}>📍 {item.delivery_address}</Text>
            <Text style={styles.totalText}>Total: Rs.{item.total_amount}</Text>
          </View>
          <Text style={styles.feeText}>Fee: Rs.{item.platform_fee}</Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          {item.status === 'placed' && (
            <>
              <TouchableOpacity
                style={[styles.actionBtn, styles.acceptBtn]}
                onPress={() => updateStatus(item.id, 'accepted')}
              >
                <Text style={styles.acceptBtnText}>✅ Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionBtn, styles.rejectBtn]}
                onPress={() => Alert.alert('Reject Order', 'Are you sure?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Reject', style: 'destructive', onPress: () => updateStatus(item.id, 'rejected') }
                ])}
              >
                <Text style={styles.rejectBtnText}>❌ Reject</Text>
              </TouchableOpacity>
            </>
          )}
          {item.status === 'accepted' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.preparingBtn]}
              onPress={() => updateStatus(item.id, 'preparing')}
            >
              <Text style={styles.preparingBtnText}>👨‍🍳 Start Preparing</Text>
            </TouchableOpacity>
          )}
          {item.status === 'preparing' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.dispatchBtn]}
              onPress={() => updateStatus(item.id, 'dispatched')}
            >
              <Text style={styles.dispatchBtnText}>🚚 Dispatch</Text>
            </TouchableOpacity>
          )}
          {item.status === 'dispatched' && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.deliveredBtn]}
              onPress={() => updateStatus(item.id, 'delivered')}
            >
              <Text style={styles.deliveredBtnText}>🎉 Mark Delivered</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.shopName}>{shop?.shop_name || 'My Shop'}</Text>
          <Text style={styles.greeting}>Welcome, {user?.full_name?.split(' ')[0]}!</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.toggleBtn, { backgroundColor: shop?.is_open ? '#E8F5E9' : '#FFEBEE' }]}
            onPress={toggleShop}
          >
            <Text style={[styles.toggleText, { color: shop?.is_open ? '#2E7D32' : '#C62828' }]}>
              {shop?.is_open ? '🟢 Open' : '🔴 Closed'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{orders.filter(o => o.status === 'placed').length}</Text>
          <Text style={styles.statLabel}>New</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{orders.filter(o => ['accepted','preparing','dispatched'].includes(o.status)).length}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>{orders.filter(o => o.status === 'delivered').length}</Text>
          <Text style={styles.statLabel}>Delivered</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNum}>Rs.{orders.filter(o => o.status === 'delivered').reduce((s, o) => s + parseFloat(o.total_amount), 0).toFixed(0)}</Text>
          <Text style={styles.statLabel}>Revenue</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[['new','New Orders'],['active','Active'],['done','Completed']].map(([key, label]) => (
          <TouchableOpacity
            key={key}
            style={[styles.tab, activeTab === key && styles.activeTab]}
            onPress={() => setActiveTab(key)}
          >
            <Text style={[styles.tabText, activeTab === key && styles.activeTabText]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Orders List */}
      {loading ? (
        <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 60 }} />
      ) : filteredOrders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📭</Text>
          <Text style={styles.emptyText}>No orders here</Text>
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchOrders(); }}
            />
          }
        />
      )}

      {/* Bottom Nav */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabIconActive}>📦</Text>
          <Text style={styles.tabLabelActive}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('VendorProducts')}
        >
          <Text style={styles.tabIcon}>🛍</Text>
          <Text style={styles.tabLabel}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('VendorWallet')}
        >
          <Text style={styles.tabIcon}>💰</Text>
          <Text style={styles.tabLabel}>Wallet</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabIcon}>⚙️</Text>
          <Text style={styles.tabLabel}>Settings</Text>
        </TouchableOpacity>
      </View>
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
  shopName: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  greeting: { fontSize: 13, color: '#888', marginTop: 2 },
  headerRight: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  toggleText: { fontSize: 13, fontWeight: 'bold' },
  logoutBtn: { borderWidth: 1, borderColor: '#ddd', padding: 6, paddingHorizontal: 10, borderRadius: 16 },
  logoutText: { fontSize: 12, color: '#555' },
  statsRow: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  statBox: { flex: 1, padding: 14, alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  statLabel: { fontSize: 11, color: '#888', marginTop: 2 },
  tabs: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#2E7D32' },
  tabText: { fontSize: 13, color: '#888', fontWeight: '600' },
  activeTabText: { color: '#2E7D32', fontWeight: 'bold' },
  list: { padding: 16, paddingBottom: 100 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#888' },
  orderCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0', elevation: 1,
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  orderId: { fontSize: 15, fontWeight: 'bold', color: '#111' },
  orderTime: { fontSize: 12, color: '#888', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  itemsBox: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 10, marginBottom: 10 },
  itemText: { fontSize: 13, color: '#444', marginBottom: 3 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 },
  addressText: { fontSize: 12, color: '#888', marginBottom: 4 },
  totalText: { fontSize: 14, fontWeight: 'bold', color: '#111' },
  feeText: { fontSize: 12, color: '#888' },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, padding: 10, borderRadius: 10, alignItems: 'center' },
  acceptBtn: { backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#A5D6A7' },
  acceptBtnText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 13 },
  rejectBtn: { backgroundColor: '#FFEBEE', borderWidth: 1, borderColor: '#FFCDD2' },
  rejectBtnText: { color: '#C62828', fontWeight: 'bold', fontSize: 13 },
  preparingBtn: { backgroundColor: '#FFF3E0', borderWidth: 1, borderColor: '#FFE0B2' },
  preparingBtnText: { color: '#E65100', fontWeight: 'bold', fontSize: 13 },
  dispatchBtn: { backgroundColor: '#F3E5F5', borderWidth: 1, borderColor: '#E1BEE7' },
  dispatchBtnText: { color: '#6A1B9A', fontWeight: 'bold', fontSize: 13 },
  deliveredBtn: { backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#A5D6A7' },
  deliveredBtnText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 13 },
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