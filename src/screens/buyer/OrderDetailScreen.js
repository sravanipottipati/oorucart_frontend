import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator,
} from 'react-native';
import client from '../../api/client';

const STEPS = [
  { key: 'placed',     label: 'Order Placed',  icon: '📋' },
  { key: 'accepted',   label: 'Accepted',       icon: '✅' },
  { key: 'preparing',  label: 'Preparing',      icon: '👨‍🍳' },
  { key: 'dispatched', label: 'On the Way',     icon: '🚴' },
  { key: 'delivered',  label: 'Delivered',      icon: '🎉' },
];

const STATUS_ORDER = ['placed', 'accepted', 'preparing', 'dispatched', 'delivered'];

export default function OrderDetailScreen({ navigation, route }) {
  const { orderId } = route.params;
  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);

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

  const currentStepIndex = STATUS_ORDER.indexOf(order.status);
  const isCancelled = order.status === 'cancelled' || order.status === 'rejected';

  const date = new Date(order.created_at).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Order ID + Date */}
        <View style={styles.card}>
          <View style={styles.orderIdRow}>
            <Text style={styles.orderId}>#{order.id?.slice(0, 8).toUpperCase()}</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: isCancelled ? '#FEF2F2' : '#EFF6FF' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: isCancelled ? '#DC2626' : '#2563EB' }
              ]}>
                {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
              </Text>
            </View>
          </View>
          <Text style={styles.orderDate}>{date}</Text>
        </View>

        {/* Status Tracker */}
        {!isCancelled && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Status</Text>
            {STEPS.map((step, index) => {
              const isDone    = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              return (
                <View key={step.key} style={styles.stepRow}>
                  <View style={styles.stepLeft}>
                    <View style={[
                      styles.stepCircle,
                      isDone && styles.stepCircleDone,
                      isCurrent && styles.stepCircleCurrent,
                    ]}>
                      <Text style={styles.stepCircleText}>
                        {isDone ? '✓' : (index + 1).toString()}
                      </Text>
                    </View>
                    {index < STEPS.length - 1 && (
                      <View style={[
                        styles.stepLine,
                        isDone && index < currentStepIndex && styles.stepLineDone,
                      ]} />
                    )}
                  </View>
                  <View style={styles.stepRight}>
                    <Text style={[
                      styles.stepLabel,
                      isCurrent && styles.stepLabelCurrent,
                      isDone && !isCurrent && styles.stepLabelDone,
                    ]}>
                      {step.icon} {step.label}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Order Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Items</Text>
          {order.items?.map((item, i) => (
            <View key={i} style={styles.itemRow}>
              <Text style={styles.itemName}>{item.quantity}x {item.product_name || item.name}</Text>
              <Text style={styles.itemPrice}>₹{(item.quantity * parseFloat(item.price)).toFixed(0)}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.itemRow}>
            <Text style={styles.totalLabel}>Platform Fee</Text>
            <Text style={styles.totalValue}>₹{order.platform_fee || 5}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.grandTotal}>₹{order.total_amount}</Text>
          </View>
        </View>

        {/* Order Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order ID</Text>
            <Text style={styles.infoValue}>#{order.id?.slice(0, 8).toUpperCase()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{date}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment</Text>
            <Text style={styles.infoValue}>
              {order.payment_mode === 'cod' ? 'Cash on Delivery' : 'Online'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total</Text>
            <Text style={styles.infoValue}>₹{order.total_amount}</Text>
          </View>
        </View>

        {/* Seller Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Seller Details</Text>
          <View style={styles.sellerRow}>
            <View style={styles.sellerIconBox}>
              <Text style={styles.sellerIcon}>🏪</Text>
            </View>
            <View style={styles.sellerInfo}>
              <Text style={styles.sellerName}>{order.vendor_name || 'Shop'}</Text>
              <Text style={styles.sellerLocation}>Nellore</Text>
            </View>
            <TouchableOpacity style={styles.callBtn}>
              <Text style={styles.callBtnText}>📞 Call Shop</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Address</Text>
          <View style={styles.addressRow}>
            <Text style={styles.addressIcon}>📍</Text>
            <Text style={styles.addressText}>{order.delivery_address}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

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

  card: {
    backgroundColor: '#fff', borderRadius: 16,
    margin: 16, marginBottom: 0, padding: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 14 },

  orderIdRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  orderId: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },
  orderDate: { fontSize: 12, color: '#888' },

  stepRow: { flexDirection: 'row', marginBottom: 0 },
  stepLeft: { alignItems: 'center', width: 36 },
  stepCircle: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#E5E7EB',
  },
  stepCircleDone: { backgroundColor: '#DCFCE7', borderColor: '#16A34A' },
  stepCircleCurrent: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  stepCircleText: { fontSize: 11, fontWeight: 'bold', color: '#888' },
  stepLine: { width: 2, flex: 1, backgroundColor: '#E5E7EB', minHeight: 24, marginVertical: 2 },
  stepLineDone: { backgroundColor: '#16A34A' },
  stepRight: { flex: 1, paddingLeft: 12, paddingBottom: 20 },
  stepLabel: { fontSize: 14, color: '#9CA3AF', paddingTop: 4 },
  stepLabelCurrent: { color: '#2563EB', fontWeight: 'bold' },
  stepLabelDone: { color: '#16A34A' },

  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  itemName: { fontSize: 14, color: '#555' },
  itemPrice: { fontSize: 14, fontWeight: '600', color: '#111' },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 8 },
  totalLabel: { fontSize: 14, color: '#888' },
  totalValue: { fontSize: 14, color: '#111' },
  grandTotal: { fontSize: 15, fontWeight: 'bold', color: '#111' },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 10, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  infoLabel: { fontSize: 13, color: '#888' },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#111' },

  sellerRow: { flexDirection: 'row', alignItems: 'center' },
  sellerIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  sellerIcon: { fontSize: 22 },
  sellerInfo: { flex: 1 },
  sellerName: { fontSize: 14, fontWeight: 'bold', color: '#111' },
  sellerLocation: { fontSize: 12, color: '#888' },
  callBtn: {
    borderWidth: 1.5, borderColor: '#2563EB', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  callBtnText: { fontSize: 12, color: '#2563EB', fontWeight: '600' },

  addressRow: { flexDirection: 'row', gap: 8 },
  addressIcon: { fontSize: 16 },
  addressText: { fontSize: 14, color: '#555', flex: 1, lineHeight: 20 },
});