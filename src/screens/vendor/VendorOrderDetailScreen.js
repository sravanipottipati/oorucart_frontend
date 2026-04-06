  import React, { useState, useEffect } from 'react';
  import {
    View, Text, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator, Alert, Linking, Share,
  } from 'react-native';
  import { Ionicons } from '@expo/vector-icons';
  import client from '../../api/client';

const STATUS_LABELS = {
  placed:     'New Order',
  accepted:   'Accepted',
  preparing:  'Being Prepared',
  dispatched: 'Out for Delivery',
  delivered:  'Delivered',
  cancelled:  'Cancelled',
  rejected:   'Rejected',
};

  const STATUS_FLOW = {
    placed:     { next: 'accepted',   nextLabel: 'Accept Order',    icon: 'checkmark-circle-outline', color: '#16A34A' },
    accepted:   { next: 'preparing',  nextLabel: 'Start Preparing', icon: 'restaurant-outline',       color: '#1669ef' },
    preparing:  { next: 'dispatched', nextLabel: 'Out for Delivery',      icon: 'bicycle-outline',          color: '#8B5CF6' },
    dispatched: { next: 'delivered',  nextLabel: 'Mark Delivered',  icon: 'home-outline',             color: '#16A34A' },
  };

  const STATUS_COLORS = {
    placed:     { bg: '#FFF7ED', text: '#EA580C', border: '#FED7AA' },
    accepted:   { bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
    preparing:  { bg: '#eff6ff', text: '#1669ef', border: '#bfdbfe' },
    dispatched: { bg: '#F5F3FF', text: '#8B5CF6', border: '#DDD6FE' },
    delivered:  { bg: '#DCFCE7', text: '#16A34A', border: '#BBF7D0' },
    cancelled:  { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
    rejected:   { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  };

  const STATUS_ICONS = {
    placed:     'receipt-outline',
    accepted:   'checkmark-circle-outline',
    preparing:  'restaurant-outline',
    dispatched: 'bicycle-outline',
    delivered:  'home-outline',
    cancelled:  'close-circle-outline',
    rejected:   'close-circle-outline',
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
        if (newStatus === 'delivered') Alert.alert('🎉 Delivered!', 'Order marked as delivered!');
        if (newStatus === 'accepted')  Alert.alert('✅ Accepted!', 'Order accepted. Start preparing!');
      } catch (e) {
        Alert.alert('Error', 'Failed to update. Please try again.');
      } finally {
        setUpdating(false);
      }
    };

    const handleReject = () => {
      Alert.alert(
        'Reject Order',
        'Are you sure? The buyer will be notified.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Reject', style: 'destructive', onPress: () => handleUpdateStatus('rejected') },
        ]
      );
    };

    const getMapsLink    = () => `https://maps.google.com/?q=${encodeURIComponent(order?.delivery_address || '')}`;
    const handleOpenMaps = () => Linking.openURL(getMapsLink()).catch(() => Alert.alert('Error', 'Could not open Maps'));

    const buildMessage = (order, subtotal, deliveryFee) => {
      const itemsList = order.items?.map(
        item => `  ${item.quantity}x ${item.product_name || item.name} — Rs.${(item.quantity * parseFloat(item.price)).toFixed(0)}`
      ).join('\n');
      const date = new Date(order.created_at).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
      return (
        `Univerin Order Details\n` +
        `──────────────────────\n` +
        `Order ID : #${order?.order_number || order?.id?.slice(0, 8).toUpperCase()}\n` +
        `Date     : ${date}\n` +
        `Status   : ${STATUS_LABELS[order.status] || order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}\n\n` +
        `Customer : ${order.buyer_name || 'Customer'}\n` +
        `Phone    : ${order.buyer_phone ? '+91 ' + order.buyer_phone : 'Not available'}\n\n` +
        `Delivery Address:\n${order.delivery_address}\n` +
        `Maps: ${getMapsLink()}\n\n` +
        `Items Ordered:\n${itemsList}\n\n` +
        `Item Total   : Rs.${subtotal.toFixed(0)}\n` +
        `Delivery Fee : ${deliveryFee > 0 ? 'Rs.' + deliveryFee.toFixed(0) : 'FREE'}\n` +
        `Total Amount : Rs.${order.total_amount}\n` +
        `Payment      : Cash on Delivery\n\n` +
        `Powered by Univerin`
      );
    };

    const handleShareWhatsApp = async () => {
      const subtotal    = order.items?.reduce((sum, item) => sum + item.quantity * parseFloat(item.price), 0) || 0;
      const deliveryFee = parseFloat(order.delivery_fee || 0);
      const message     = buildMessage(order, subtotal, deliveryFee);
      try {
        const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
        if (await Linking.canOpenURL(url)) await Linking.openURL(url);
        else await Share.share({ message });
      } catch (e) {
        await Share.share({ message });
      }
    };

    const handleShare = async () => {
      const subtotal    = order.items?.reduce((sum, item) => sum + item.quantity * parseFloat(item.price), 0) || 0;
      const deliveryFee = parseFloat(order.delivery_fee || 0);
      try {
        await Share.share({ message: buildMessage(order, subtotal, deliveryFee) });
      } catch (e) {
        console.log('Share error:', e.message);
      }
    };

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1669ef" />
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

    const flow        = STATUS_FLOW[order.status];
    const statusColor = STATUS_COLORS[order.status] || STATUS_COLORS.placed;
    const statusIcon  = STATUS_ICONS[order.status]  || 'receipt-outline';
    const isClosed    = ['cancelled', 'rejected', 'delivered'].includes(order.status);
    const date        = new Date(order.created_at).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
    const subtotal    = order.items?.reduce((sum, item) => sum + item.quantity * parseFloat(item.price), 0) || 0;
    const deliveryFee = parseFloat(order.delivery_fee || 0);

    return (
      <View style={styles.container}>

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order Details</Text>
          <View style={{ width: 36 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>

          {/* ─────────────────────────────────────────────
              SECTION 1 — ORDER DETAILS
          ───────────────────────────────────────────── */}
          <View style={styles.sectionLabel}>
            <Ionicons name="receipt-outline" size={14} color="#888" />
            <Text style={styles.sectionLabelText}>ORDER DETAILS</Text>
          </View>

          <View style={styles.card}>
            {/* Status row */}
            <View style={[styles.statusRow, { backgroundColor: statusColor.bg, borderColor: statusColor.border }]}>
              <View style={[styles.statusIconBox, { backgroundColor: statusColor.text + '20' }]}>
                <Ionicons name={statusIcon} size={22} color={statusColor.text} />
              </View>
              <View style={styles.statusInfo}>
                <Text style={[styles.statusLabel, { color: statusColor.text }]}>
                  {STATUS_LABELS[order.status] || order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                </Text>
                <Text style={styles.statusTime}>{date}</Text>
              </View>
              <Text style={[styles.statusAmount, { color: statusColor.text }]}>
                ₹{order.total_amount}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Order ID</Text>
              <Text style={styles.infoValue}>
                #{order?.order_number || order?.id?.slice(0, 8).toUpperCase()}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Payment</Text>
              <View style={styles.paymentBadge}>
                <Ionicons name="cash-outline" size={13} color="#16A34A" />
                <Text style={styles.paymentText}>Cash on Delivery</Text>
              </View>
            </View>
            {order.instructions ? (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Instructions</Text>
                  <Text style={[styles.infoValue, { flex: 1, textAlign: 'right', color: '#EA580C' }]}>
                    {order.instructions}
                  </Text>
                </View>
              </>
            ) : null}
          </View>

          {/* ─────────────────────────────────────────────
              SECTION 2 — ORDER ITEMS
          ───────────────────────────────────────────── */}
          <View style={styles.sectionLabel}>
            <Ionicons name="bag-handle-outline" size={14} color="#888" />
            <Text style={styles.sectionLabelText}>ITEMS TO PREPARE</Text>
            <View style={styles.itemCountBadge}>
              <Text style={styles.itemCountText}>{order.items?.length || 0}</Text>
            </View>
          </View>

          <View style={styles.itemsCard}>
            {order.items?.map((item, i) => {
              const itemTotal = (item.quantity * parseFloat(item.price)).toFixed(0);
              const isLast    = i === (order.items.length - 1);
              return (
                <View key={i} style={[styles.itemRow, !isLast && styles.itemRowBorder]}>
                  {/* Qty */}
                  <View style={styles.itemQtyBox}>
                    <Text style={styles.itemQtyText}>{item.quantity}×</Text>
                  </View>
                  {/* Name */}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.product_name || item.name}</Text>
                    <Text style={styles.itemPrice}>₹{parseFloat(item.price).toFixed(0)} each</Text>
                  </View>
                  {/* Total */}
                  <Text style={styles.itemTotal}>₹{itemTotal}</Text>
                </View>
              );
            })}

            {/* Bill Summary */}
            <View style={styles.billBox}>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Item Total</Text>
                <Text style={styles.billValue}>₹{subtotal.toFixed(0)}</Text>
              </View>
              <View style={styles.billRow}>
                <Text style={styles.billLabel}>Delivery Fee</Text>
                {deliveryFee === 0
                  ? <Text style={[styles.billValue, { color: '#16A34A', fontWeight: '700' }]}>FREE</Text>
                  : <Text style={styles.billValue}>₹{deliveryFee.toFixed(0)}</Text>
                }
              </View>
              <View style={[styles.billRow, styles.billTotalRow]}>
                <Text style={styles.billTotalLabel}>Total Paid</Text>
                <Text style={styles.billTotalValue}>₹{order.total_amount}</Text>
              </View>
            </View>
          </View>

          {/* ─────────────────────────────────────────────
              SECTION 3 — DELIVERY ADDRESS
          ───────────────────────────────────────────── */}
          <View style={styles.sectionLabel}>
            <Ionicons name="location-outline" size={14} color="#888" />
            <Text style={styles.sectionLabelText}>DELIVER TO</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.customerRow}>
              <View style={styles.customerAvatar}>
                <Text style={styles.customerAvatarText}>
                  {(order.buyer_name || 'C')[0].toUpperCase()}
                </Text>
              </View>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>{order.buyer_name || 'Customer'}</Text>
                {order.buyer_phone && (
                  <Text style={styles.customerPhone}>+91 {order.buyer_phone}</Text>
                )}
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.addressRow}>
              <Ionicons name="location-outline" size={16} color="#1669ef" />
              <Text style={styles.addressText}>{order.delivery_address}</Text>
            </View>
            <TouchableOpacity style={styles.mapsBtn} onPress={handleOpenMaps}>
              <Ionicons name="map-outline" size={16} color="#1669ef" />
              <Text style={styles.mapsBtnText}>Open in Google Maps</Text>
              <Ionicons name="chevron-forward" size={14} color="#1669ef" />
            </TouchableOpacity>
          </View>

          {/* ─────────────────────────────────────────────
              SECTION 4 — SHARE ORDER DETAILS
          ───────────────────────────────────────────── */}
          <View style={styles.sectionLabel}>
            <Ionicons name="share-outline" size={14} color="#888" />
            <Text style={styles.sectionLabelText}>SHARE ORDER DETAILS</Text>
          </View>

          <View style={styles.shareCard}>
            <Text style={styles.shareDesc}>
              Share complete order details including items, address and maps link
            </Text>
            <TouchableOpacity style={styles.whatsappBtn} onPress={handleShareWhatsApp}>
              <Ionicons name="logo-whatsapp" size={22} color="#fff" />
              <Text style={styles.whatsappBtnText}>Share on WhatsApp</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* ── Footer Action Buttons ── */}
        {!isClosed && flow && (
          <View style={styles.footer}>
            {order.status === 'placed' && (
              <TouchableOpacity style={styles.rejectBtn} onPress={handleReject} disabled={updating}>
                <Ionicons name="close-circle-outline" size={18} color="#EF4444" />
                <Text style={styles.rejectBtnText}>Reject</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.acceptBtn, { flex: order.status === 'placed' ? 2 : 1, backgroundColor: flow.color }]}
              onPress={() => handleUpdateStatus(flow.next)}
              disabled={updating}
            >
              {updating
                ? <ActivityIndicator color="#fff" size="small" />
                : <>
                    <Ionicons name={flow.icon} size={18} color="#fff" />
                    <Text style={styles.acceptBtnText}>{flow.nextLabel}</Text>
                  </>
              }
            </TouchableOpacity>
          </View>
        )}

        {isClosed && (
          <View style={styles.closedFooter}>
            <View style={[styles.closedBadge, { backgroundColor: statusColor.bg, borderColor: statusColor.border }]}>
              <Ionicons name={statusIcon} size={16} color={statusColor.text} />
              <Text style={[styles.closedBadgeText, { color: statusColor.text }]}>
                Order {STATUS_LABELS[order.status] || order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
              </Text>
            </View>
          </View>
        )}

      </View>
    );
  }

  const styles = StyleSheet.create({
    container:        { flex: 1, backgroundColor: '#F0F2F5' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText:        { fontSize: 16, color: '#888' },

    header: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12,
      backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    },
    backBtn:     { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
    headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#111' },

    // Section labels
    sectionLabel: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8,
    },
    sectionLabelText: { fontSize: 11, fontWeight: '700', color: '#888', letterSpacing: 0.8 },
    itemCountBadge: {
      backgroundColor: '#1669ef', borderRadius: 10,
      paddingHorizontal: 7, paddingVertical: 2, marginLeft: 4,
    },
    itemCountText: { color: '#fff', fontSize: 10, fontWeight: '700' },

    // Card
    card: {
      backgroundColor: '#fff', borderRadius: 16,
      marginHorizontal: 16, marginBottom: 4,
      padding: 16,
    },
    divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 4 },

    // Status row
    statusRow: {
      flexDirection: 'row', alignItems: 'center', gap: 12,
      borderRadius: 12, padding: 12, marginBottom: 12,
      borderWidth: 1,
    },
    statusIconBox: {
      width: 44, height: 44, borderRadius: 22,
      justifyContent: 'center', alignItems: 'center',
    },
    statusInfo:   { flex: 1 },
    statusLabel:  { fontSize: 15, fontWeight: '800', marginBottom: 2 },
    statusTime:   { fontSize: 12, color: '#888' },
    statusAmount: { fontSize: 18, fontWeight: '900' },

    infoRow: {
      flexDirection: 'row', justifyContent: 'space-between',
      alignItems: 'center', paddingVertical: 8,
    },
    infoLabel: { fontSize: 13, color: '#888' },
    infoValue: { fontSize: 13, color: '#111', fontWeight: '500' },
    paymentBadge: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    paymentText: { fontSize: 13, color: '#16A34A', fontWeight: '600' },

    // Items card
    itemsCard: {
      backgroundColor: '#fff', borderRadius: 16,
      marginHorizontal: 16, marginBottom: 4,
      overflow: 'hidden',
    },
    itemRow: {
      flexDirection: 'row', alignItems: 'center',
      paddingHorizontal: 16, paddingVertical: 14, gap: 12,
    },
    itemRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
    itemQtyBox: {
      backgroundColor: '#eff6ff', borderRadius: 8,
      paddingHorizontal: 10, paddingVertical: 6,
      minWidth: 44, alignItems: 'center',
      borderWidth: 1, borderColor: '#bfdbfe',
    },
    itemQtyText:  { fontSize: 13, fontWeight: '800', color: '#1669ef' },
    itemInfo:     { flex: 1 },
    itemName:     { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 3 },
    itemPrice:    { fontSize: 12, color: '#888' },
    itemTotal:    { fontSize: 15, fontWeight: '800', color: '#111' },

    billBox: {
      backgroundColor: '#F8F9FA', marginHorizontal: 12,
      marginBottom: 12, borderRadius: 12, padding: 14,
      borderWidth: 1, borderColor: '#E5E7EB',
    },
    billRow:       { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5 },
    billLabel:     { fontSize: 13, color: '#888' },
    billValue:     { fontSize: 13, color: '#111' },
    billTotalRow:  { borderTopWidth: 1, borderTopColor: '#E5E7EB', marginTop: 6, paddingTop: 10 },
    billTotalLabel:{ fontSize: 15, fontWeight: '800', color: '#111' },
    billTotalValue:{ fontSize: 16, fontWeight: '900', color: '#1669ef' },

    // Customer & address
    customerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    customerAvatar: {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: '#1669ef', justifyContent: 'center', alignItems: 'center',
    },
    customerAvatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    customerInfo:       { flex: 1 },
    customerName:       { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 2 },
    customerPhone:      { fontSize: 13, color: '#888' },
    addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 14 },
    addressText: { fontSize: 14, color: '#111', flex: 1, lineHeight: 20 },
    mapsBtn: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
      backgroundColor: '#eff6ff', borderRadius: 10, paddingVertical: 12,
      borderWidth: 1, borderColor: '#bfdbfe',
    },
    mapsBtnText: { fontSize: 13, color: '#1669ef', fontWeight: '600', flex: 1, textAlign: 'center' },

    // Share card
    shareCard: {
      backgroundColor: '#fff', borderRadius: 16,
      marginHorizontal: 16, marginBottom: 4, padding: 16,
    },
    shareDesc: { fontSize: 13, color: '#888', marginBottom: 14, lineHeight: 18 },
    shareBtns: { flexDirection: 'row', gap: 10 },
    whatsappBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center',
      justifyContent: 'center', gap: 8,
      backgroundColor: '#16A34A', borderRadius: 12, paddingVertical: 12,
      shadowColor: '#16A34A', shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
    },
    whatsappBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
    shareBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center',
      justifyContent: 'center', gap: 8,
      backgroundColor: '#eff6ff', borderRadius: 12, paddingVertical: 12,
      borderWidth: 1.5, borderColor: '#bfdbfe',
    },
    shareBtnText: { color: '#1669ef', fontSize: 13, fontWeight: '700' },

    // Footer
    footer: {
      flexDirection: 'row', gap: 10,
      padding: 16, paddingBottom: 30,
      backgroundColor: '#fff',
      borderTopWidth: 1, borderTopColor: '#F0F0F0',
      shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.05, shadowRadius: 8, elevation: 8,
    },
    rejectBtn: {
      flex: 1, flexDirection: 'row', alignItems: 'center',
      justifyContent: 'center', gap: 6,
      borderWidth: 1.5, borderColor: '#EF4444',
      borderRadius: 12, padding: 14,
    },
    rejectBtnText: { color: '#EF4444', fontWeight: 'bold', fontSize: 14 },
    acceptBtn: {
      flexDirection: 'row', alignItems: 'center',
      justifyContent: 'center', gap: 8,
      borderRadius: 12, padding: 14,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
    },
    acceptBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

    closedFooter: {
      padding: 16, paddingBottom: 30,
      backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0F0F0',
      alignItems: 'center',
    },
    closedBadge: {
      flexDirection: 'row', alignItems: 'center', gap: 8,
      paddingHorizontal: 24, paddingVertical: 12,
      borderRadius: 20, borderWidth: 1,
    },
    closedBadgeText: { fontSize: 14, fontWeight: '700' },
  });