import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import client from '../../api/client';

const statusConfig = {
  placed:     { color: '#1565C0', bg: '#E3F2FD', emoji: '🕐', label: 'Order Placed' },
  accepted:   { color: '#2E7D32', bg: '#E8F5E9', emoji: '✅', label: 'Accepted' },
  rejected:   { color: '#C62828', bg: '#FFEBEE', emoji: '❌', label: 'Rejected' },
  preparing:  { color: '#E65100', bg: '#FFF3E0', emoji: '👨‍🍳', label: 'Preparing' },
  dispatched: { color: '#6A1B9A', bg: '#F3E5F5', emoji: '🚚', label: 'On the way' },
  delivered:  { color: '#2E7D32', bg: '#E8F5E9', emoji: '🎉', label: 'Delivered' },
  cancelled:  { color: '#555',    bg: '#F5F5F5', emoji: '🚫', label: 'Cancelled' },
};

export default function MyOrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      const res = await client.get('/orders/mine/');
      setOrders(res.data.orders);
    } catch (e) {
      Alert.alert('Error', 'Could not load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const cancelOrder = async (orderId) => {
    Alert.alert(
      'Cancel Order',
      'Are you sure you want to cancel this order?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel', style: 'destructive',
          onPress: async () => {
            try {
              await client.post(`/orders/${orderId}/status/`, { status: 'cancelled' });
              fetchOrders();
            } catch (e) {
              Alert.alert('Error', 'Could not cancel order');
            }
          }
        }
      ]
    );
  };

  const renderOrder = ({ item }) => {
    const status = statusConfig[item.status] || statusConfig.placed;
    return (
      <View style={styles.orderCard}>
        {/* Order Header */}
        <View style={styles.orderHeader}>
          <View style={styles.orderHeaderLeft}>
            <Text style={styles.shopName}>{item.vendor_name || 'Shop'}</Text>
            <Text style={styles.orderDate}>
              {new Date(item.created_at).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.color }]}>
              {status.emoji} {status.label}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Order Items */}
        <View style={styles.orderItems}>
          {item.items && item.items.map(i => (
            <View key={i.id} style={styles.itemRow}>
              <Text style={styles.itemQty}>{i.quantity}x</Text>
              <Text style={styles.itemName}>{i.product_name}</Text>
              <Text style={styles.itemPrice}>
                ₹{(parseFloat(i.price) * i.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.divider} />

        {/* Order Footer */}
        <View style={styles.orderFooter}>
          <View>
            <Text style={styles.addressText}>📍 {item.delivery_address}</Text>
            <Text style={styles.paymentText}>💵 Cash on Delivery</Text>
          </View>
          <Text style={styles.totalText}>₹{item.total_amount}</Text>
        </View>

        {/* Cancel Button */}
        {item.status === 'placed' && (
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => cancelOrder(item.id)}
          >
            <Text style={styles.cancelText}>Cancel Order</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Orders</Text>
        <Text style={styles.subtitle}>Track your orders here</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 60 }} />
      ) : orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyText}>No orders yet</Text>
          <Text style={styles.emptySubText}>Place your first order!</Text>
          <TouchableOpacity
            style={styles.shopNowBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.shopNowText}>Shop Now →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={renderOrder}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchOrders(); }}
            />
          }
          ListHeaderComponent={
            <Text style={styles.orderCount}>{orders.length} order(s)</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: {
    backgroundColor: '#fff', padding: 20, paddingTop: 50,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  backBtn: { marginBottom: 10 },
  backText: { color: '#2E7D32', fontSize: 15, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#888' },
  list: { padding: 16, paddingBottom: 40 },
  orderCount: { fontSize: 13, color: '#888', marginBottom: 12 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: '#111', marginBottom: 8 },
  emptySubText: { fontSize: 14, color: '#888', marginBottom: 24 },
  shopNowBtn: {
    backgroundColor: '#111', paddingHorizontal: 24,
    paddingVertical: 12, borderRadius: 12,
  },
  shopNowText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  orderCard: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0',
    elevation: 1,
  },
  orderHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 12,
  },
  orderHeaderLeft: { flex: 1, marginRight: 10 },
  shopName: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  orderDate: { fontSize: 12, color: '#888' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#f5f5f5', marginVertical: 10 },
  orderItems: { gap: 6 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemQty: { fontSize: 13, color: '#888', width: 24 },
  itemName: { fontSize: 14, color: '#333', flex: 1 },
  itemPrice: { fontSize: 14, color: '#111', fontWeight: '600' },
  orderFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end',
  },
  addressText: { fontSize: 12, color: '#888', marginBottom: 4 },
  paymentText: { fontSize: 12, color: '#888' },
  totalText: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  cancelBtn: {
    marginTop: 12, borderWidth: 1, borderColor: '#ffcdd2',
    backgroundColor: '#fff5f5', padding: 10,
    borderRadius: 10, alignItems: 'center',
  },
  cancelText: { color: '#C62828', fontWeight: '600', fontSize: 13 },
});