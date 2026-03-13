import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Linking, Share,
} from 'react-native';
import client from '../../api/client';

const STATUS_FLOW = {
  placed:     { next: 'accepted',   nextLabel: 'Accept Order',   },
  accepted:   { next: 'preparing',  nextLabel: 'Start Preparing',},
  preparing:  { next: 'dispatched', nextLabel: 'Mark Ready',     },
  dispatched: { next: 'delivered',  nextLabel: 'Mark Delivered', },
};

const STATUS_COLORS = {
  placed:     { bg: '#FFF7ED', text: '#EA580C' },
  accepted:   { bg: '#F0FDF4', text: '#16A34A' },
  preparing:  { bg: '#EFF6FF', text: '#2563EB' },
  dispatched: { bg: '#F0FDF4', text: '#16A34A' },
  delivered:  { bg: '#DCFCE7', text: '#16A34A' },
  cancelled:  { bg: '#FEF2F2', text: '#DC2626' },
  rejected:   { bg: '#FEF2F2', text: '#DC2626' },
};

export default function VendorOrderDetailScreen({ navigation, route }) {
  const { orderId }             = route.params;
  const [order, setOrder]       = useState(null);
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
        Alert.alert('✅ Delivered', 'Order marked as delivered!');
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
      { text: 'Reject', style: 'destructive', onPress: () => handleUpdateStatus('rejected') },
    ]);
  };

  const handleViewLocation = () => {
    const address = encodeURIComponent(order.delivery_address);
    const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'Could not open maps')
    );
  };

  const handleShare = async () => {
    const itemsList = order.items?.map(
      item =>
        `  • ${item.product_name || item.name} x${item.quantity} = ₹${(item.quantity * parseFloat(item.price)).toFixed(0)}`
    ).join('\n');

    const date = new Date(order.created_at).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const message =
`🛒 *OoruCart Order Details*

📦 Order ID: #${order.id?.slice(0, 8).toUpperCase()}
📅 Date: ${date}
💰 Total: ₹${order.total_amount}
📍 Deliver to: ${order.delivery_address}
👤 Customer: ${order.buyer_name || 'Customer'}

*Items:*
${itemsList}

🏪 Platform Fee: ₹${order.platform_fee || 5}
💵 Payment: Cash on Delivery`;

    try {
      await Share.share({ message });
    } catch (e) {
      console.log('Share error:', e.message);
    }
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

  const flow         = STATUS_FLOW[order.status];
  const statusColor  = STATUS_COLORS[order.status] || STATUS_COLORS.placed;
  const isClosed     = ['cancelled', 'rejected', 'delivered'].includes(order.status);
  const date         = new Date(order.created_at).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <TouchableOpacity
          style={styles.shareHeaderBtn}
          onPress={handleShare}
        >
          <Text style={styles.shareHeaderIcon}>📤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Order Info Card */}
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order ID</Text>
            <Text style={styles.infoValue}>#{order.id?.slice(0, 8).toUpperCase()}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date & Time</Text>
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
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment</Text>
            <Text style={[styles.infoValue, { color: '#16A34A', fontWeight: '600' }]}>
              💵 Cash on Delivery
            </Text>
          </View>
        </View>

        {/* Customer Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer Details</Text>
          <View style={styles.customerRow}>
            <View style={styles.customerAvatar}>
              <Text style={styles.customerAvatarText}>
                {(order.buyer_name || 'C')[0].toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.customerName}>{order.buyer_name || 'Customer'}</Text>
              <Text style={styles.customerPhone}>+91 {order.buyer_phone || '—'}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <Text style={styles.fieldLabel}>Delivery Address</Text>
          <Text style={styles.fieldValue}>{order.delivery_address}</Text>

          {/* View Location Button */}
          <TouchableOpacity style={styles.viewLocationBtn} onPress={handleViewLocation}>
            <Text style={styles.viewLocationText}>📍  View Location on Maps</Text>
          </TouchableOpacity>

          {/* Share Order Button */}
          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareBtnText}>📤  Share Order Details</Text>
          </TouchableOpacity>
        </View>

        {/* Order Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Order Items ({order.items?.length || 0})
          </Text>
          {order.items?.map((item, i) => (
            <View
              key={i}
              style={[styles.itemRow, i < order.items.length - 1 && styles.itemRowBorder]}
            >
              <View style={styles.itemQtyBox}>
                <Text style={styles.itemQtyText}>{item.quantity}</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product_name || item.name}</Text>
                <Text style={styles.itemUnit}>₹{parseFloat(item.price).toFixed(0)} each</Text>
              </View>
              <Text style={styles.itemPrice}>
                ₹{(item.quantity * parseFloat(item.price)).toFixed(0)}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>
              ₹{(parseFloat(order.total_amount) - parseFloat(order.platform_fee || 5)).toFixed(0)}
            </Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Platform Fee</Text>
            <Text style={styles.billValue}>₹{order.platform_fee || 5}</Text>
          </View>
          <View style={[styles.billRow, styles.billTotal]}>
            <Text style={styles.billTotalLabel}>Total</Text>
            <Text style={styles.billTotalValue}>₹{order.total_amount}</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Action Buttons */}
      {!isClosed && flow && (
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
  shareHeaderBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  shareHeaderIcon: { fontSize: 22 },

  card: {
    backgroundColor: '#fff', borderRadius: 16,
    margin: 16, marginBottom: 0, padding: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 14 },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 4 },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 8,
  },
  infoLabel: { fontSize: 13, color: '#888' },
  infoValue: { fontSize: 13, color: '#111', fontWeight: '500' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },

  customerRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12,
  },
  customerAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center',
  },
  customerAvatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  customerName: { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 2 },
  customerPhone: { fontSize: 13, color: '#888' },
  fieldLabel: { fontSize: 12, color: '#888', marginTop: 8, marginBottom: 4 },
  fieldValue: { fontSize: 14, color: '#111', fontWeight: '500', lineHeight: 20 },

  viewLocationBtn: {
    marginTop: 12, backgroundColor: '#EFF6FF',
    borderRadius: 10, padding: 12, alignItems: 'center',
  },
  viewLocationText: { fontSize: 14, color: '#2563EB', fontWeight: '600' },
  shareBtn: {
    marginTop: 8, backgroundColor: '#F0FDF4',
    borderRadius: 10, padding: 12, alignItems: 'center',
  },
  shareBtnText: { fontSize: 14, color: '#16A34A', fontWeight: '600' },

  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, gap: 12,
  },
  itemRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  itemQtyBox: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center',
  },
  itemQtyText: { fontSize: 13, fontWeight: 'bold', color: '#2563EB' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 2 },
  itemUnit: { fontSize: 12, color: '#888' },
  itemPrice: { fontSize: 14, fontWeight: 'bold', color: '#111' },

  billRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 6,
  },
  billLabel: { fontSize: 13, color: '#888' },
  billValue: { fontSize: 13, color: '#111' },
  billTotal: {
    borderTopWidth: 1, borderTopColor: '#F5F5F5',
    marginTop: 4, paddingTop: 10,
  },
  billTotalLabel: { fontSize: 14, fontWeight: 'bold', color: '#111' },
  billTotalValue: { fontSize: 15, fontWeight: 'bold', color: '#111' },

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