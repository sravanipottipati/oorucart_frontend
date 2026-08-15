import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';

export default function DPOrderOfferScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [acceptingId, setAcceptingId] = useState(null);

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await client.get('/dp/orders/available/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data);
    } catch (e) {
      // silent fail on background refresh, only alert on manual pull
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchOrders();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleAccept = async (orderId) => {
    setAcceptingId(orderId);
    try {
      const token = await AsyncStorage.getItem('access_token');
      await client.post(
        `/dp/orders/${orderId}/accept/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigation.replace('DPActiveOrder', { orderId });
    } catch (e) {
      const msg = e.response?.data?.error || 'Failed to accept order. It may have been taken already.';
      Alert.alert('Error', msg);
      fetchOrders(); // refresh list since this one is likely gone now
    } finally {
      setAcceptingId(null);
    }
  };

  const handleReject = async (orderId) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      await client.post(
        `/dp/orders/${orderId}/reject/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (e) {
      // ignore
    }
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1669ef" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="cube-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No orders available right now</Text>
            <Text style={styles.emptySubtext}>Pull down to refresh</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.shopName}>{item.shop_name}</Text>
              <Text style={styles.orderAmount}>₹{item.delivery_fee}</Text>
            </View>
            <Text style={styles.addressText} numberOfLines={1}>Pickup: {item.shop_address}</Text>
            <Text style={styles.addressText} numberOfLines={1}>Drop: {item.delivery_address}</Text>
            <View style={styles.orderFooter}>
              <Text style={styles.paymentBadge}>{item.payment_mode === 'cod' ? 'Cash on Delivery' : 'Prepaid'}</Text>
              <Text style={styles.totalText}>Order value: ₹{item.total_amount}</Text>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(item.id)}>
                <Text style={styles.rejectText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.acceptBtn}
                onPress={() => handleAccept(item.id)}
                disabled={acceptingId === item.id}
              >
                {acceptingId === item.id
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.acceptText}>Accept</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F7F5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', padding: 16, paddingBottom: 0 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 15, color: '#6B7280', fontWeight: '600' },
  emptySubtext: { fontSize: 13, color: '#9CA3AF' },
  orderCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  shopName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  orderAmount: { fontSize: 16, fontWeight: '700', color: '#16a34a' },
  addressText: { fontSize: 13, color: '#6B7280', marginBottom: 2 },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, marginBottom: 12 },
  paymentBadge: {
    fontSize: 11, fontWeight: '600', color: '#1669ef', backgroundColor: '#EFF6FF',
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20,
  },
  totalText: { fontSize: 12, color: '#6B7280' },
  actionRow: { flexDirection: 'row', gap: 10 },
  rejectBtn: {
    flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    paddingVertical: 11, alignItems: 'center',
  },
  rejectText: { color: '#6B7280', fontWeight: '600', fontSize: 14 },
  acceptBtn: {
    flex: 1, backgroundColor: '#1669ef', borderRadius: 10,
    paddingVertical: 11, alignItems: 'center',
  },
  acceptText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});