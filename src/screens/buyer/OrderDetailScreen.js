import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Linking, Share, Alert,
} from 'react-native';
import client from '../../api/client';

const STATUS_STEPS = ['placed', 'accepted', 'preparing', 'dispatched', 'delivered'];

const STATUS_INFO = {
  placed:     { label: 'Order Placed',      icon: '📋', desc: 'Your order has been placed' },
  accepted:   { label: 'Order Accepted',    icon: '✅', desc: 'Vendor accepted your order' },
  preparing:  { label: 'Being Prepared',    icon: '👨‍🍳', desc: 'Vendor is preparing your order' },
  dispatched: { label: 'Out for Delivery',  icon: '🛵', desc: 'Your order is on the way' },
  delivered:  { label: 'Delivered',         icon: '🎉', desc: 'Order delivered successfully!' },
  cancelled:  { label: 'Cancelled',         icon: '❌', desc: 'Order was cancelled' },
  rejected:   { label: 'Rejected',          icon: '❌', desc: 'Order was rejected by vendor' },
};

export default function OrderDetailScreen({ navigation, route }) {
  const { orderId }           = route.params;
  const [order, setOrder]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    fetchOrder();
  }, [orderId]);

  const handleTrackLocation = () => {
    const address = encodeURIComponent(order.delivery_address);
    const url = `https://www.google.com/maps/search/?api=1&query=${address}`;
    Linking.openURL(url).catch(() =>
      Alert.alert('Error', 'Could not open maps')
    );
  };

  const handleCallVendor = () => {
    const phone = order.vendor_phone || order.shop_phone;
    if (!phone) { Alert.alert('Info', 'Vendor phone not available'); return; }
    Linking.openURL(`tel:${phone}`);
  };

  const handleShare = async () => {
    const itemsList = order.items?.map(
      item => `  • ${item.product_name || item.name} x${item.quantity} = ₹${(item.quantity * parseFloat(item.price)).toFixed(0)}`
    ).join('\n');

    const date = new Date(order.created_at).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

    const statusInfo = STATUS_INFO[order.status];

    const message =
`🛒 *OoruCart Order Receipt*

📦 Order ID: #${order.id?.slice(0, 8).toUpperCase()}
📅 Date: ${date}
${statusInfo?.icon} Status: ${statusInfo?.label}

🏪 Shop: ${order.shop_name || order.vendor_name || 'Shop'}
📍 Deliver to: ${order.delivery_address}

*Items Ordered:*
${itemsList}

💰 Total: ₹${order.total_amount}
💵 Payment: Cash on Delivery

Powered by OoruCart 🛍`;

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

  const currentStep   = STATUS_STEPS.indexOf(order.status);
  const isCancelled   = ['cancelled', 'rejected'].includes(order.status);
  const statusInfo    = STATUS_INFO[order.status] || STATUS_INFO.placed;
  const date          = new Date(order.created_at).toLocaleString('en-IN', {
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
        <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
          <Text style={styles.shareBtnIcon}>📤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Status Banner */}
        <View style={[styles.statusBanner, isCancelled && styles.statusBannerRed]}>
          <Text style={styles.statusBannerIcon}>{statusInfo.icon}</Text>
          <View>
            <Text style={styles.statusBannerTitle}>{statusInfo.label}</Text>
            <Text style={styles.statusBannerDesc}>{statusInfo.desc}</Text>
          </View>
        </View>

        {/* Progress Tracker */}
        {!isCancelled && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Progress</Text>
            {STATUS_STEPS.map((step, index) => {
              const info    = STATUS_INFO[step];
              const isDone  = currentStep >= index;
              const isLast  = index === STATUS_STEPS.length - 1;
              return (
                <View key={step} style={styles.stepRow}>
                  <View style={styles.stepLeft}>
                    <View style={[styles.stepDot, isDone && styles.stepDotDone]}>
                      <Text style={styles.stepDotText}>{isDone ? '✓' : ''}</Text>
                    </View>
                    {!isLast && (
                      <View style={[styles.stepLine, isDone && index < currentStep && styles.stepLineDone]} />
                    )}
                  </View>
                  <View style={styles.stepInfo}>
                    <Text style={[styles.stepLabel, isDone && styles.stepLabelDone]}>
                      {info.label}
                    </Text>
                    {isDone && (
                      <Text style={styles.stepDesc}>{info.desc}</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Order Info */}
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
            <Text style={styles.infoLabel}>Payment</Text>
            <Text style={[styles.infoValue, { color: '#16A34A' }]}>💵 Cash on Delivery</Text>
          </View>
        </View>

        {/* Delivery Address + Actions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Details</Text>
          <Text style={styles.fieldLabel}>Deliver to</Text>
          <Text style={styles.fieldValue}>{order.delivery_address}</Text>

          <View style={styles.actionBtns}>
            <TouchableOpacity style={styles.mapsBtn} onPress={handleTrackLocation}>
              <Text style={styles.mapsBtnText}>📍 View on Maps</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.callBtn} onPress={handleCallVendor}>
              <Text style={styles.callBtnText}>📞 Call Shop</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Items Ordered ({order.items?.length || 0})
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
            <Text style={styles.billTotalLabel}>Total Paid</Text>
            <Text style={styles.billTotalValue}>₹{order.total_amount}</Text>
          </View>
        </View>

        {/* Share Receipt */}
        <TouchableOpacity style={styles.shareReceiptBtn} onPress={handleShare}>
          <Text style={styles.shareReceiptText}>📤  Share Order Receipt</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
  shareBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  shareBtnIcon: { fontSize: 22 },

  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#2563EB', margin: 16, borderRadius: 16, padding: 16,
  },
  statusBannerRed: { backgroundColor: '#EF4444' },
  statusBannerIcon: { fontSize: 32 },
  statusBannerTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  statusBannerDesc: { fontSize: 12, color: 'rgba(255,255,255,0.85)' },

  card: {
    backgroundColor: '#fff', borderRadius: 16,
    margin: 16, marginBottom: 0, padding: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 14 },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 4 },

  stepRow: { flexDirection: 'row', marginBottom: 0 },
  stepLeft: { alignItems: 'center', width: 28, marginRight: 12 },
  stepDot: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center',
  },
  stepDotDone: { backgroundColor: '#2563EB' },
  stepDotText: { fontSize: 11, color: '#fff', fontWeight: 'bold' },
  stepLine: { width: 2, flex: 1, minHeight: 24, backgroundColor: '#E5E7EB', marginVertical: 2 },
  stepLineDone: { backgroundColor: '#2563EB' },
  stepInfo: { flex: 1, paddingBottom: 16 },
  stepLabel: { fontSize: 13, color: '#9CA3AF', fontWeight: '500', marginTop: 2 },
  stepLabelDone: { color: '#111', fontWeight: '600' },
  stepDesc: { fontSize: 11, color: '#888', marginTop: 2 },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 8,
  },
  infoLabel: { fontSize: 13, color: '#888' },
  infoValue: { fontSize: 13, color: '#111', fontWeight: '500' },

  fieldLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  fieldValue: { fontSize: 14, color: '#111', fontWeight: '500', lineHeight: 20, marginBottom: 12 },
  actionBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  mapsBtn: {
    flex: 1, backgroundColor: '#EFF6FF',
    borderRadius: 10, padding: 12, alignItems: 'center',
  },
  mapsBtnText: { fontSize: 13, color: '#2563EB', fontWeight: '600' },
  callBtn: {
    flex: 1, backgroundColor: '#F0FDF4',
    borderRadius: 10, padding: 12, alignItems: 'center',
  },
  callBtnText: { fontSize: 13, color: '#16A34A', fontWeight: '600' },

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
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6,
  },
  billLabel: { fontSize: 13, color: '#888' },
  billValue: { fontSize: 13, color: '#111' },
  billTotal: { borderTopWidth: 1, borderTopColor: '#F5F5F5', marginTop: 4, paddingTop: 10 },
  billTotalLabel: { fontSize: 14, fontWeight: 'bold', color: '#111' },
  billTotalValue: { fontSize: 15, fontWeight: 'bold', color: '#2563EB' },

  shareReceiptBtn: {
    backgroundColor: '#fff', marginHorizontal: 16, marginTop: 16,
    borderRadius: 14, padding: 16, alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E5E7EB',
  },
  shareReceiptText: { fontSize: 15, color: '#111', fontWeight: '600' },
});