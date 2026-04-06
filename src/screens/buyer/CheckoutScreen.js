import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useCart } from '../../context/CartContext';

// ── Delivery Fee Logic — Distance + Minimum Order ─────────────────────────────
const getDeliveryInfo = (distanceKm, subtotal) => {
  const dist = parseFloat(distanceKm) || 0;

  let fee        = 0;
  let minOrder   = 0;
  let slab       = '';

  if (dist <= 2) {
    fee      = 10;
    minOrder = 99;
    slab     = '0–2 km';
  } else if (dist <= 5) {
    fee      = 20;
    minOrder = 149;
    slab     = '2–5 km';
  } else {
    fee      = 30;
    minOrder = 199;
    slab     = '5–10 km';
  }

  const isFree      = subtotal >= minOrder;
  const deliveryFee = isFree ? 0 : fee;
  const amountLeft  = isFree ? 0 : minOrder - subtotal;

  return { fee, minOrder, slab, isFree, deliveryFee, amountLeft };
};

export default function CheckoutScreen({ navigation, route }) {
  const { cart, products, shop, cartTotal, distance } = route.params;
  const { clearCart, clearShopCart } = useCart();

  const [address, setAddress]           = useState('');
  const [note, setNote]                 = useState('');
  const [loading, setLoading]           = useState(false);
  const [payment, setPayment]           = useState('cod');
  const [addresses, setAddresses]       = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);

  const cartItems = products.filter(p => cart[p.id] > 0).map(p => ({
    ...p,
    qty:   cart[p.id],
    total: cart[p.id] * parseFloat(p.price),
  }));

  const subtotal     = cartItems.reduce((sum, item) => sum + item.total, 0);
  const gstTotal = cartItems.reduce((sum, item) => {
    const gstPct = parseFloat(item.gst_percentage || 0);
    return sum + (item.total * gstPct / 100);
  }, 0);
  const deliveryInfo = getDeliveryInfo(distance, subtotal);
  const total        = subtotal + deliveryInfo.deliveryFee;

  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const res  = await client.get('/users/addresses/');
        const data = Array.isArray(res.data) ? res.data : [];
        setAddresses(data);
        const defaultAddr = data.find(a => a.is_default);
        if (defaultAddr) {
          setSelectedAddr(defaultAddr);
          setAddress(defaultAddr.full_address);
        }
      } catch (e) {
        console.log('Address fetch error:', e.message);
      }
    };
    fetchAddresses();
  }, []);

  // ── Place Order ────────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter delivery address');
      return;
    }
    setLoading(true);
    try {
      const orderItems = cartItems.map(item => ({
        product_id: item.id,
        quantity:   item.qty,
        price:      item.price,
      }));
      const res = await client.post('/orders/place/', {
        vendor_id:        shop.id,
        items:            orderItems,
        delivery_address: address,
        payment_mode:     payment,
        notes:            note,
        delivery_fee:     deliveryInfo.deliveryFee,
      });
      clearShopCart(shop.id);
      navigation.replace('OrderSuccess', { order: res.data.order });
    } catch (e) {
      const msg = e.response?.data?.error || 'Failed to place order. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Free Delivery Progress Banner ── */}
        {!deliveryInfo.isFree && (
          <View style={styles.freeDeliveryBanner}>
            <Ionicons name="bicycle-outline" size={18} color="#1669ef" />
            <Text style={styles.freeDeliveryText}>
              Add <Text style={styles.freeDeliveryAmount}>₹{deliveryInfo.amountLeft.toFixed(0)}</Text> more for FREE delivery!
            </Text>
          </View>
        )}
        {deliveryInfo.isFree && (
          <View style={styles.freeDeliveryBannerGreen}>
            <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
            <Text style={styles.freeDeliveryTextGreen}>
              You have FREE delivery on this order! 🎉
            </Text>
          </View>
        )}

        {/* Deliver To */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Deliver To</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Address')}>
              <Text style={styles.changeBtn}>+ Add Address</Text>
            </TouchableOpacity>
          </View>
          {addresses.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.addrRow}>
              {addresses.map(addr => (
                <TouchableOpacity
                  key={addr.id}
                  style={[styles.addrChip, selectedAddr?.id === addr.id && styles.addrChipActive]}
                  onPress={() => { setSelectedAddr(addr); setAddress(addr.full_address); }}
                >
                  <Text style={styles.addrChipIcon}>
                    {addr.label === 'Home' ? '🏠' : addr.label === 'Work' ? '💼' : '📍'}
                  </Text>
                  <Text style={[styles.addrChipText, selectedAddr?.id === addr.id && styles.addrChipTextActive]}>
                    {addr.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <TextInput
            style={styles.addressInput}
            placeholder="Enter your full delivery address"
            placeholderTextColor="#9CA3AF"
            value={address}
            onChangeText={setAddress}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <Text style={styles.shopName}>🏪 {shop?.shop_name}</Text>
          <View style={styles.divider} />
          {cartItems.map(item => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.orderItemLeft}>
                <View style={styles.qtyBadge}>
                  <Text style={styles.qtyBadgeText}>{item.qty}</Text>
                </View>
                <Text style={styles.orderItemName}>{item.name}</Text>
              </View>
              <Text style={styles.orderItemPrice}>₹{item.total.toFixed(0)}</Text>
            </View>
          ))}
        </View>

        {/* Bill Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bill Details</Text>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Items Total (incl. GST)</Text>
            <Text style={styles.billValue}>₹{subtotal.toFixed(0)}</Text>
          </View>

          <View style={styles.billRow}>
            <View>
              <Text style={styles.billLabel}>Delivery Fee</Text>
              <Text style={styles.billLabelSub}>
                {distance ? `📍 ${distance} km away` : ''} • Free above ₹{deliveryInfo.minOrder}
              </Text>
            </View>
            {deliveryInfo.isFree ? (
              <Text style={styles.billValueFree}>FREE ✅</Text>
            ) : (
              <Text style={styles.billValue}>₹{deliveryInfo.deliveryFee}</Text>
            )}
          </View>

          <View style={styles.divider} />

          <View style={styles.billRow}>
            <Text style={styles.billTotalLabel}>Total Amount</Text>
            <Text style={styles.billTotalValue}>₹{total.toFixed(0)}</Text>
          </View>

          {/* Delivery slab info */}
          <View style={styles.slabInfo}>
            <Ionicons name="information-circle-outline" size={14} color="#888" />
            <Text style={styles.slabInfoText}>
              Delivery fee based on distance ({deliveryInfo.slab})
            </Text>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Method</Text>
          <TouchableOpacity
            style={[styles.paymentOption, payment === 'cod' && styles.paymentOptionActive]}
            onPress={() => setPayment('cod')}
          >
            <View style={styles.paymentLeft}>
              <Text style={styles.paymentEmoji}>💵</Text>
              <View>
                <Text style={styles.paymentName}>Cash on Delivery</Text>
                <Text style={styles.paymentDesc}>Pay when you receive</Text>
              </View>
            </View>
            <View style={[styles.radio, payment === 'cod' && styles.radioActive]}>
              {payment === 'cod' && <View style={styles.radioDot} />}
            </View>
          </TouchableOpacity>
        </View>

        {/* Special Instructions */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Special Instructions <Text style={styles.optional}>(optional)</Text>
          </Text>
          <TextInput
            style={styles.noteInput}
            placeholder="e.g. Please pack carefully"
            placeholderTextColor="#9CA3AF"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={2}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <View style={styles.footerTop}>
          <Text style={styles.footerTotal}>₹{total.toFixed(0)}</Text>
          <Text style={styles.footerTotalLabel}>Total</Text>
          {deliveryInfo.isFree && (
            <View style={styles.footerFreeTag}>
              <Text style={styles.footerFreeTagText}>Free Delivery</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.placeOrderBtn}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.placeOrderText}>Place Order • ₹{total.toFixed(0)}</Text>
          }
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn:     { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#111' },

  freeDeliveryBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#eff6ff', marginHorizontal: 16, marginTop: 16,
    padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#dbeafe',
  },
  freeDeliveryText:   { fontSize: 13, color: '#1254c4', flex: 1 },
  freeDeliveryAmount: { fontWeight: '800', color: '#1669ef' },

  freeDeliveryBannerGreen: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#f0fdf4', marginHorizontal: 16, marginTop: 16,
    padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#bbf7d0',
  },
  freeDeliveryTextGreen: { fontSize: 13, color: '#166534', flex: 1, fontWeight: '600' },

  card: {
    backgroundColor: '#fff', borderRadius: 16,
    margin: 16, marginBottom: 0, padding: 16,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  cardTitle:  { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 12 },
  changeBtn:  { fontSize: 13, color: '#1669ef', fontWeight: '600' },

  addrRow: { marginBottom: 12 },
  addrChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8, marginRight: 8,
    backgroundColor: '#F9FAFB',
  },
  addrChipActive:     { borderColor: '#1669ef', backgroundColor: '#eff6ff' },
  addrChipIcon:       { fontSize: 14 },
  addrChipText:       { fontSize: 13, color: '#555', fontWeight: '500' },
  addrChipTextActive: { color: '#1669ef', fontWeight: 'bold' },

  addressInput: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 12, fontSize: 14, color: '#111', minHeight: 80,
    textAlignVertical: 'top', backgroundColor: '#F9FAFB',
  },

  shopName: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 12 },
  divider:  { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },

  orderItem:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderItemLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBadge:       { width: 24, height: 24, borderRadius: 6, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  qtyBadgeText:   { fontSize: 12, fontWeight: 'bold', color: '#1669ef' },
  orderItemName:  { fontSize: 14, color: '#555', flex: 1 },
  orderItemPrice: { fontSize: 14, fontWeight: '600', color: '#111' },

  billRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  billLabel:       { fontSize: 14, color: '#888' },
  billLabelSub:    { fontSize: 11, color: '#aaa', marginTop: 2 },
  billValue:       { fontSize: 14, color: '#111' },
  billValueFree:   { fontSize: 14, color: '#16A34A', fontWeight: '700' },
  billTotalLabel:  { fontSize: 15, fontWeight: 'bold', color: '#111' },
  billTotalValue:  { fontSize: 15, fontWeight: 'bold', color: '#1669ef' },

  slabInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    marginTop: 4, backgroundColor: '#F9FAFB',
    padding: 8, borderRadius: 8,
  },
  slabInfoText: { fontSize: 11, color: '#888' },

  paymentOption: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 14,
  },
  paymentOptionActive: { borderColor: '#1669ef', backgroundColor: '#eff6ff' },
  paymentLeft:         { flexDirection: 'row', alignItems: 'center', gap: 12 },
  paymentEmoji:        { fontSize: 24 },
  paymentName:         { fontSize: 14, fontWeight: '600', color: '#111' },
  paymentDesc:         { fontSize: 12, color: '#888' },

  radio: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: '#D1D5DB',
    justifyContent: 'center', alignItems: 'center',
  },
  radioActive: { borderColor: '#1669ef' },
  radioDot:    { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1669ef' },

  optional:  { fontSize: 12, color: '#9CA3AF', fontWeight: 'normal' },
  noteInput: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 12, fontSize: 14, color: '#111', minHeight: 60,
    textAlignVertical: 'top', backgroundColor: '#F9FAFB',
  },

  footer: {
    padding: 16, paddingBottom: 30, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  footerTop: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginBottom: 10,
  },
  footerTotal:      { fontSize: 20, fontWeight: 'bold', color: '#111' },
  footerTotalLabel: { fontSize: 12, color: '#888' },
  footerFreeTag: {
    backgroundColor: '#f0fdf4', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
    borderWidth: 1, borderColor: '#bbf7d0',
  },
  footerFreeTagText: { fontSize: 11, color: '#16A34A', fontWeight: '700' },

  placeOrderBtn: {
    backgroundColor: '#1669ef', borderRadius: 14,
    padding: 16, alignItems: 'center',
  },
  placeOrderText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});