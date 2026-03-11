import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';

export default function OrderSuccessScreen({ navigation, route }) {
  const { order } = route.params || {};

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
            <Text style={styles.detailValue}>#{order?.id?.slice(0,8).toUpperCase() || '12345'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Amount</Text>
            <Text style={styles.detailValue}>₹{order?.total_amount || '0'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Method</Text>
            <Text style={styles.detailValue}>Cash on Delivery</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Est. Delivery</Text>
            <Text style={styles.detailValue}>30 minutes</Text>
          </View>
        </View>

        {/* Shop Info */}
        <View style={styles.card}>
          <View style={styles.shopRow}>
            <View style={styles.shopInfo}>
              <Text style={styles.shopName}>{order?.vendor_name || 'Shop'}</Text>
              <Text style={styles.shopLocation}>Nellore</Text>
            </View>
            <View style={styles.preparingBadge}>
              <Text style={styles.preparingText}>Preparing</Text>
            </View>
          </View>
        </View>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.trackBtn}
          onPress={() => navigation.navigate('MyOrders')}
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

  successTop: { alignItems: 'center', paddingTop: 60, paddingBottom: 30, paddingHorizontal: 24 },
  successCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#DCFCE7', justifyContent: 'center', alignItems: 'center',
    marginBottom: 20,
  },
  successIcon: { fontSize: 36, color: '#16A34A' },
  successTitle: { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 10, textAlign: 'center' },
  successSubtitle: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20 },

  card: {
    backgroundColor: '#fff', borderRadius: 16,
    marginHorizontal: 16, marginBottom: 12, padding: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 14 },

  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginBottom: 12, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  detailLabel: { fontSize: 13, color: '#888' },
  detailValue: { fontSize: 13, fontWeight: '600', color: '#111' },

  shopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shopInfo: {},
  shopName: { fontSize: 15, fontWeight: 'bold', color: '#111' },
  shopLocation: { fontSize: 12, color: '#888', marginTop: 2 },
  preparingBadge: { backgroundColor: '#EFF6FF', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  preparingText: { fontSize: 12, color: '#2563EB', fontWeight: '600' },

  trackBtn: {
    backgroundColor: '#2563EB', borderRadius: 14,
    marginHorizontal: 16, marginBottom: 12, padding: 16, alignItems: 'center',
  },
  trackBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  homeBtn: {
    backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5, borderColor: '#E5E7EB',
    marginHorizontal: 16, marginBottom: 12, padding: 16, alignItems: 'center',
  },
  homeBtnText: { color: '#111', fontSize: 16, fontWeight: '600' },
});