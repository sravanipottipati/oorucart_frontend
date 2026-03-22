import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native';
import client from '../../api/client';

const TABS = [
  { key: 'placed',     label: 'New' },
  { key: 'accepted',   label: 'Accepted' },
  { key: 'preparing',  label: 'Preparing' },
  { key: 'dispatched', label: 'Out for D...' },
];

const STATUS_COLORS = {
  placed:     { bg: '#FFF7ED', text: '#EA580C' },
  accepted:   { bg: '#F0FDF4', text: '#16A34A' },
  preparing:  { bg: '#f0fdfa', text: '#0d9488' },
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

export default function VendorOrdersScreen({ navigation }) {
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('placed');

  const fetchOrders = async () => {
    try {
      const res = await client.get('/orders/vendor/');
      const data = Array.isArray(res.data) ? res.data : res.data.orders || [];
      setOrders(data);
    } catch (e) {
      console.log('Error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchOrders(); };

  const todayCount = orders.filter(o => {
    const today = new Date().toDateString();
    return new Date(o.created_at).toDateString() === today;
  }).length;

  const filteredOrders = orders.filter(o => o.status === activeTab);

  const getTimeAgo = (dateStr) => {
    const diff = Math.floor((new Date() - new Date(dateStr)) / 60000);
    if (diff < 1) return 'just now';
    if (diff < 60) return `${diff} mins ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)} hrs ago`;
    return `${Math.floor(diff / 1440)} days ago`;
  };

  const getTabCount = (key) => orders.filter(o => o.status === key).length;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Orders</Text>
          <Text style={styles.headerSub}>Today Orders: {todayCount}</Text>
        </View>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => navigation.navigate('VendorNotifications')}
        >
          <Text style={styles.bellIcon}>🔔</Text>

        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.tabsRow}
        contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}
      >
        {TABS.map(tab => {
          const count = getTabCount(tab.key);
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}{count > 0 ? ` (${count})` : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color="#0d9488" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 16 }}
        >
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📋</Text>
              <Text style={styles.emptyTitle}>No {TABS.find(t => t.key === activeTab)?.label} orders</Text>
              <Text style={styles.emptySubtitle}>Orders will appear here</Text>
            </View>
          ) : (
            filteredOrders.map(order => {
              const statusColor = STATUS_COLORS[order.status] || STATUS_COLORS.placed;
              const statusLabel = STATUS_LABELS[order.status] || order.status;
              const itemCount   = order.items?.length || 0;
              const isNew       = order.status === 'placed';
              return (
                <TouchableOpacity
                  key={order.id}
                  style={[styles.orderCard, isNew && styles.orderCardNew]}
                  onPress={() => navigation.navigate('VendorOrderDetail', { orderId: order.id })}
                >
                  <View style={styles.orderTop}>
                    <View>
                      <Text style={styles.orderId}>
                        Order #{order.id?.slice(0, 8).toUpperCase()}
                      </Text>
                      <Text style={styles.orderMeta}>
                        {itemCount} item{itemCount !== 1 ? 's' : ''} • {getTimeAgo(order.created_at)}
                      </Text>
                    </View>
                    <View style={styles.orderTopRight}>
                      <Text style={styles.orderAmount}>₹{order.total_amount}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
                        <Text style={[styles.statusText, { color: statusColor.text }]}>
                          {statusLabel}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.orderArrowRow}>
                    <Text style={styles.orderArrow}>›</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Bottom Tab */}
      <View style={styles.bottomTab}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('VendorHome')}
        >
          <Text style={styles.tabIcon}>⊞</Text>
          <Text style={styles.tabLabel}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={[styles.tabIcon, { color: '#0d9488' }]}>📋</Text>
          <Text style={styles.tabLabelActive}>Orders</Text>
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

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  headerSub: { fontSize: 13, color: '#888', marginTop: 2 },
  bellBtn: { position: 'relative', width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  bellIcon: { fontSize: 24 },
  bellBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: '#EF4444', borderRadius: 8,
    minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center',
  },
  bellBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },

  tabsRow: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  tab: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, backgroundColor: '#F3F4F6',
  },
  tabActive: { backgroundColor: '#0d9488' },
  tabText: { fontSize: 13, color: '#555', fontWeight: '500' },
  tabTextActive: { color: '#fff', fontWeight: 'bold' },

  orderCard: {
    backgroundColor: '#fff', borderRadius: 14,
    marginBottom: 10, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  orderCardNew: { backgroundColor: '#FFFBF5', borderLeftWidth: 3, borderLeftColor: '#EA580C' },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  orderMeta: { fontSize: 12, color: '#888' },
  orderTopRight: { alignItems: 'flex-end', gap: 6 },
  orderAmount: { fontSize: 15, fontWeight: 'bold', color: '#111' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },
  orderArrowRow: { alignItems: 'flex-end', marginTop: 4 },
  orderArrow: { fontSize: 20, color: '#9CA3AF' },

  emptyState: { alignItems: 'center', marginTop: 60 },
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
  tabLabel: { fontSize: 11, color: '#9CA3AF' },
  tabLabelActive: { fontSize: 11, color: '#0d9488', fontWeight: 'bold' },
});