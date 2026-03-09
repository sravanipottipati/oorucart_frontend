import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import client from '../../api/client';

const statusColor = {
  placed: '#1565C0',
  accepted: '#2E7D32',
  rejected: '#C62828',
  preparing: '#E65100',
  dispatched: '#6A1B9A',
  delivered: '#2E7D32',
  cancelled: '#555',
};

const statusEmoji = {
  placed: '🕐',
  accepted: '✅',
  rejected: '❌',
  preparing: '👨‍🍳',
  dispatched: '🚚',
  delivered: '🎉',
  cancelled: '🚫',
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
    try {
      await client.post(`/orders/${orderId}/status/`, { status: 'cancelled' });
      fetchOrders();
      Alert.alert('Order Cancelled');
    } catch (e) {
      Alert.alert('Error', 'Could not cancel order');
    }
  };

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.shopName}>{item.vendor_name || 'Shop'}</Text>
        <View style={[styles.statusBadge, { backgroundColor: statusColor[item.status] + '22' }]}>
          <Text style={[styles.statusText, { color: statusColor[item.status] }]}>
            {statusEmoji[item.status]} {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        {item.items && item.items.map(i => (
          <Text key={i.id} style={styles.itemText}>
            • {i.product_name} x{i.quantity} — ₹{(parseFloat(i.price) * i.quantity).toFixed(2)}
          </Text>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalText}>Total: ₹{item.total_amount}</Text>
        <Text style={styles.dateText}>
          {new Date(item.created_at).toLocaleDateString('en-IN')}
        </Text>
      </View>

      <Text style={styles.addressText}>📍 {item.delivery_address}</Text>

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

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Orders</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 60 }} />
      ) : orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No orders yet 😊</Text>
          <Text style={styles.emptySubText}>Place your first order!</Text>
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
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#2E7D32', padding: 20, paddingTop: 50 },
  backBtn: { marginBottom: 10 },
  backText: { color: '#A5D6A7', fontSize: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  list: { padding: 16 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 18, color: '#555', marginBottom: 8 },
  emptySubText: { fontSize: 14, color: '#999' },
  orderCard: {
    backgroundColor: '#fff', borderRadius: 14,
    padding: 16, marginBottom: 14, elevation: 2,
  },
  orderHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  shopName: { fontSize: 16, fontWeight: 'bold', color: '#1B5E20', flex: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  orderItems: { marginBottom: 10 },
  itemText: { fontSize: 13, color: '#444', marginBottom: 3 },
  orderFooter: {
    flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6,
  },
  totalText: { fontSize: 14, fontWeight: 'bold', color: '#222' },
  dateText: { fontSize: 13, color: '#888' },
  addressText: { fontSize: 12, color: '#666', marginBottom: 8 },
  cancelBtn: {
    backgroundColor: '#FFEBEE', padding: 8,
    borderRadius: 8, alignItems: 'center',
  },
  cancelText: { color: '#C62828', fontWeight: '600', fontSize: 13 },
});