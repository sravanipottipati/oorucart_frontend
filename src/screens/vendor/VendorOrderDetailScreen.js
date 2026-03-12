import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import client from '../../api/client';

const STATUS_FLOW = {
  placed:     { next: 'accepted',   nextLabel: 'Accept Order',     color: '#EA580C', bg: '#FFF7ED' },
  accepted:   { next: 'preparing',  nextLabel: 'Start Preparing',  color: '#16A34A', bg: '#F0FDF4' },
  preparing:  { next: 'dispatched', nextLabel: 'Mark Ready',       color: '#2563EB', bg: '#EFF6FF' },
  dispatched: { next: 'delivered',  nextLabel: 'Mark Delivered',   color: '#16A34A', bg: '#F0FDF4' },
};

export default function VendorOrderDetailScreen({ navigation, route }) {
  const { orderId }       = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [updating, setUpdating] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await client.get(`/orders/${orderId}/`);
      setOrder(res.data);
    } catch (e) {
      console.log('Error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, []);

  const handleUpdateStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await client.post(`/orders/${orderId}/status/`, { status: newStatus });
      await fetchOrder();
      if (newStatus === 'delivered') {
        Alert.alert('✅ Order Delivered', 'Order marked as delivered!');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = () => {
    Alert.alert('Reject Order', 'Are you sure you want to reject this order?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject', style: 'destructive',
        onPress: () => handleUpdateStatus('rejected'),
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  const flow       = STATUS_FLOW[order.status];
  const date       = new Date(order.created_at).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
  const isCancelled = ['cancelled', 'rejected', 'delivered'].includes(order.status);

  const statusColors = {
    placed:     { bg: '#FFF7ED', text: '#EA580C' },
    accepted:   { bg: '#F0FDF4', text: '#16A34A' },
    preparing:  { bg: '#EFF6FF', text: '#2563EB' },
    dispatched: { bg: '#F0FDF4', text: '#16A34A' },
    delivered:  { bg: '#DCFCE7', text: '#16A34A' },
    cancelled:  { bg: '#FEF2F2', text: '#DC2626' },
    rejected:   { bg: '#FEF2F2', text: '#DC2626' },
  };
  const statusColor = statusColors[order.status] || statusColors.placed;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => navigation.navigate('VendorNotifications')}
        >
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Order Info Card */}
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order ID</Text>
            <Text style={styles.infoValue}>Order #{order.id?.slice(0, 8).toUpperCase()}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order Date & Time</Text>
            <Text style={styles.infoValue}>{date}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Amount</Text>
            <Text style={[styles.infoValue, { fontWeight: 'bold', fontSize: 16 }]}>
              ₹{order.total_amount}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor.bg }]}>
              <Text style={[styles.statusText, { color: statusColor.text }]}>
                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Customer Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer Details</Text>
          <Text style={styles.fieldLabel}>Name</Text>
          <Text style={styles.fieldValue}>{order.buyer_name || 'Customer'}</Text>
          <Text style={styles.fieldLabel}>Phone</Text>
          <Text style={styles.fieldValue}>+91 {order.buyer_phone || '—'}</Text>
          <Text style={styles.fieldLabel}>Delivery Address</Text>
          <Text style={styles.fieldValue}>{order.delivery_address}</Text>
          <TouchableOpacity style={styles.viewLocationBtn}>
            <Text style={styles.viewLocationText}>View Location</Text>
          </TouchableOpacity>
        </View>

        {/* Order Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Items</Text>
          {order.items?.map((item, i) => (
            <View key={i} style={[styles.itemRow, i < order.items.length - 1 && styles.itemRowBorder]}>
              <View>
                <Text style={styles.itemName}>{item.product_name || item.name}</Text>
                <Text style={styles.itemDesc}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                ₹{(item.quantity * parseFloat(item.price)).toFixed(0)}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Platform Fee</Text>
            <Text style={styles.infoValue}>₹{order.platform_fee || 5}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { fontWeight: 'bold', color: '#111' }]}>Total</Text>
            <Text style={[styles.infoValue, { fontWeight: 'bold' }]}>₹{order.total_amount}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Action Buttons */}
      {!isCancelled && flow && (
        <View style={styles.footer}>
          {order.status === 'placed' && (
            <TouchableOpacity
              style={styles.rejectBtn}
              onPress={handleReject}
              disabled={updating}
            >
              <Text style={styles.rejectBtnText}>Reject</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.acceptBtn, { flex: order.status === 'placed' ? 2 : 1 }]}
            onPress={() => handleUpdateStatus(flow.next)}
            disabled={updating}
          >
            <Text style={styles.acceptBtnText}>
              {updating ? 'Updating...' : flow.nextLabel}
            </Text>
          </TouchableOpacity>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 16, color: '#888' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 24, color: '#111' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#111' },
  bellBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  bellIcon: { fontSize: 22 },

  card: {
    backgroundColor: '#fff', borderRadius: 16,
    margin: 16, marginBottom: 0, padding: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 14 },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 8,
  },
  infoLabel: { fontSize: 13, color: '#888' },
  infoValue: { fontSize: 13, color: '#111', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F5F5F5' },

  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },

  fieldLabel: { fontSize: 12, color: '#888', marginTop: 12, marginBottom: 4 },
  fieldValue: { fontSize: 14, color: '#111', fontWeight: '500', lineHeight: 20 },

  viewLocationBtn: {
    marginTop: 12, backgroundColor: '#EFF6FF',
    borderRadius: 10, padding: 12, alignItems: 'center',
  },
  viewLocationText: { fontSize: 14, color: '#2563EB', fontWeight: '600' },

  itemRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 12,
  },
  itemRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  itemName: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 2 },
  itemDesc: { fontSize: 12, color: '#888' },
  itemPrice: { fontSize: 14, fontWeight: 'bold', color: '#111' },

  footer: {
    flexDirection: 'row', gap: 10,
    padding: 16, paddingBottom: 30,
    backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  rejectBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#EF4444',
    borderRadius: 12, padding: 14, alignItems: 'center',
  },
  rejectBtnText: { color: '#EF4444', fontWeight: 'bold', fontSize: 14 },
  acceptBtn: {
    backgroundColor: '#2563EB', borderRadius: 12,
    padding: 14, alignItems: 'center',
  },
  acceptBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});