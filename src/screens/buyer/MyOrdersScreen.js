import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native';
import client from '../../api/client';

const STATUS_COLORS = {
  placed:     { bg: '#EFF6FF', text: '#2563EB' },
  accepted:   { bg: '#F0FDF4', text: '#16A34A' },
  preparing:  { bg: '#FFFBEB', text: '#D97706' },
  dispatched: { bg: '#F0FDF4', text: '#16A34A' },
  delivered:  { bg: '#F0FDF4', text: '#16A34A' },
  cancelled:  { bg: '#FEF2F2', text: '#DC2626' },
  rejected:   { bg: '#FEF2F2', text: '#DC2626' },
};

const STATUS_LABELS = {
  placed:     'Order Placed',
  accepted:   'Accepted',
  preparing:  'Preparing',
  dispatched: 'On the Way',
  delivered:  'Delivered',
  cancelled:  'Cancelled',
  rejected:   'Rejected',
};

export default function MyOrdersScreen({ navigation }) {
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab]           = useState('active');

  const fetchOrders = async () => {
    try {
      const res = await client.get('/orders/mine/');
      if (Array.isArray(res.data)) {
        setOrders(res.data);
      } else if (res.data.orders) {
        setOrders(res.data.orders);
      } else {
        setOrders([]);
      }
    } catch (e) {
      console.log('Error:', e.message);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchOrders(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchOrders(); };

  const activeStatuses  = ['placed', 'accepted', 'preparing', 'dispatched'];
  const pastStatuses    = ['delivered', 'cancelled', 'rejected'];

  const activeOrders = orders.filter(o => activeStatuses.includes(o.status));
  const pastOrders   = orders.filter(o => pastStatuses.includes(o.status));
  const displayOrders = tab === 'active' ? activeOrders : pastOrders;

  const OrderCard = ({ order }) => {
    const statusColor = STATUS_COLORS[order.status] || STATUS_COLORS.placed;
    const statusLabel = STATUS_LABELS[order.status] || order.status;
    const date = new Date(order.created_at).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });

    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => navigation.navigate('OrderDetail', { orderId: order.id })}
      >
        {/* Shop row */}
        <View style={styles.orderTop}>
          <View style={styles.shopIconBox}>
            <Text style={styles.shopIconText}>🏪</Text>
          </View>
          <View style={styles.orderInfo}>
            <Text style={styles.shopName}>{order.vendor_name || 'Shop'}</Text>
            <Text style={styles.orderDate}>{date}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
            <Text style={[styles.statusText, { color: statusColor.text }]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Items */}
        {order.items && order.items.map((item, i) => (
          <Text key={i} style={styles.itemText}>
            {item.quantity}x {item.product_name || item.name}
          </Text>
        ))}

        {/* Bottom row */}
        <View style={styles.orderBottom}>
          <Text style={styles.totalText}>Total: ₹{order.total_amount}</Text>
          <Text style={styles.viewDetails}>View Details ›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'active' && styles.tabActive]}
          onPress={() => setTab('active')}
        >
          <Text style={[styles.tabText, tab === 'active' && styles.tabTextActive]}>
            Active Orders
            {activeOrders.length > 0 && (
              <Text style={styles.tabBadge}> {activeOrders.length}</Text>
            )}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'past' && styles.tabActive]}
          onPress={() => setTab('past')}
        >
          <Text style={[styles.tabText, tab === 'past' && styles.tabTextActive]}>
            Past Orders
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 16 }}
        >
          {displayOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyTitle}>
                {tab === 'active' ? 'No active orders' : 'No past orders'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {tab === 'active' ? 'Your active orders will appear here' : 'Your past orders will appear here'}
              </Text>
              {tab === 'active' && (
                <TouchableOpacity
                  style={styles.shopNowBtn}
                  onPress={() => navigation.navigate('Home')}
                >
                  <Text style={styles.shopNowText}>Shop Now</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            displayOrders.map(order => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Bottom Tab */}
      <View style={styles.bottomTab}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={[styles.tabIcon, { color: '#2563EB' }]}>📋</Text>
          <Text style={styles.tabLabelActive}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
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
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 24, color: '#111' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#111' },

  tabs: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  tab: {
    flex: 1, paddingVertical: 14, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#2563EB' },
  tabText: { fontSize: 14, color: '#888', fontWeight: '500' },
  tabTextActive: { color: '#2563EB', fontWeight: 'bold' },
  tabBadge: { color: '#2563EB', fontWeight: 'bold' },

  orderCard: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  orderTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  shopIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#F3F4F6', justifyContent: 'center',
    alignItems: 'center', marginRight: 12,
  },
  shopIconText: { fontSize: 22 },
  orderInfo: { flex: 1 },
  shopName: { fontSize: 15, fontWeight: 'bold', color: '#111' },
  orderDate: { fontSize: 12, color: '#888', marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },

  divider: { height: 1, backgroundColor: '#F5F5F5', marginBottom: 10 },
  itemText: { fontSize: 13, color: '#555', marginBottom: 4 },

  orderBottom: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 10,
  },
  totalText: { fontSize: 14, fontWeight: 'bold', color: '#111' },
  viewDetails: { fontSize: 13, color: '#2563EB', fontWeight: '600' },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: '#888', marginBottom: 24, textAlign: 'center' },
  shopNowBtn: {
    backgroundColor: '#2563EB', borderRadius: 12,
    paddingHorizontal: 32, paddingVertical: 12,
  },
  shopNowText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

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