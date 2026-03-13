import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';

export default function OrderSuccessScreen({ navigation, route }) {
  const { order } = route.params || {};

  const date = order?.created_at
    ? new Date(order.created_at).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
      })
    : '';

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Success Icon */}
        <View style={styles.successTop}>
          <View style={styles.successCircle}>
            <Text style={styles.successIcon}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Order Placed Successfully!</Text>
          <Text style={styles.successSubtitle}>
            Your order has been placed and is being processed by the seller.
          </Text>
        </View>

        {/* Order Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order ID</Text>
            <Text style={styles.detailValue}>
              #{order?.id?.slice(0, 8).toUpperCase() || '—'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Amount</Text>
            <Text style={[styles.detailValue, { color: '#2563EB', fontWeight: 'bold' }]}>
              ₹{order?.total_amount || '0'}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>💵 Cash on Delivery</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Time</Text>
            <Text style={styles.detailValue}>{date}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Est. Delivery</Text>
            <Text style={styles.detailValue}>30 minutes</Text>
          </View>
        </View>

        {/* Shop Info */}
        <View style={styles.card}>
          <View style={styles.shopRow}>
            <View style={styles.shopAvatar}>
              <Text style={styles.shopAvatarText}>
                {order?.vendor?.shop_name?.[0]?.toUpperCase() || 'S'}
              </Text>
            </View>
            <View style={styles.shopInfo}>
              <Text style={styles.shopName}>
                {order?.vendor?.shop_name || 'Your Shop'}
              </Text>
              <Text style={styles.shopLocation}>
                📍 {order?.vendor?.town || 'Your Town'}
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>
                {order?.status?.charAt(0).toUpperCase() + order?.status?.slice(1) || 'Placed'}
              </Text>
            </View>
          </View>
        </View>

        {/* Delivery Address */}
        {order?.delivery_address && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Delivering To</Text>
            <Text style={styles.addressText}>📍 {order.delivery_address}</Text>
          </View>
        )}

        {/* Buttons */}
        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => navigation.navigate('OrderDetail', { orderId: order?.id })}
        >
          <Text style={styles.trackBtnText}>Track Order</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.homeBtn}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.homeBtnText}>Back to Home</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  successTop: {
    alignItems: 'center', paddingTop: 60,
    paddingBottom: 30, paddingHorizontal: 24,
  },
  successCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: '#DCFCE7', justifyContent: 'center',
    alignItems: 'center', marginBottom: 20,
  },
  successIcon: { fontSize: 40, color: '#16A34A' },
  successTitle: {
    fontSize: 22, fontWeight: 'bold', color: '#111',
    marginBottom: 10, textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 14, color: '#888',
    textAlign: 'center', lineHeight: 20,
  },

  card: {
    backgroundColor: '#fff', borderRadius: 16,
    marginHorizontal: 16, marginBottom: 12, padding: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 14 },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginVertical: 4 },

  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 8,
  },
  detailLabel: { fontSize: 13, color: '#888' },
  detailValue: { fontSize: 13, fontWeight: '600', color: '#111' },

  shopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  shopAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center',
  },
  shopAvatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  shopInfo: { flex: 1 },
  shopName: { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 2 },
  shopLocation: { fontSize: 12, color: '#888' },
  statusBadge: {
    backgroundColor: '#EFF6FF', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  statusText: { fontSize: 12, color: '#2563EB', fontWeight: '600' },

  addressText: { fontSize: 14, color: '#555', lineHeight: 20 },

  trackBtn: {
    backgroundColor: '#2563EB', borderRadius: 14,
    marginHorizontal: 16, marginBottom: 12,
    padding: 16, alignItems: 'center',
  },
  trackBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  homeBtn: {
    backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    marginHorizontal: 16, marginBottom: 12,
    padding: 16, alignItems: 'center',
  },
  homeBtnText: { color: '#111', fontSize: 16, fontWeight: '600' },
});