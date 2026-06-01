import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import client from '../../api/client';
import { useCart } from '../../context/CartContext';
import { globalStore } from '../../utils/globalStore';
import * as Location from 'expo-location';
import { useAuth } from '../../context/AuthContext';

// ── Delivery Fee Logic ─────────────────────────────────────────────────────────
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) * Math.sin(dLon/2)**2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)) * 10) / 10;
};

const getDeliveryInfo = (distanceKm, subtotal, mov) => {
  const dist = parseFloat(distanceKm) || 0;
  const minOrderValue = parseFloat(mov) || 0;
  let fee = 0, slab = '', outOfRange = false;
  if (dist <= 2)      { fee = 25; slab = '0–2 km'; }
  else if (dist <= 4) { fee = 35; slab = '2–4 km'; }
  else if (dist <= 6) { fee = 45; slab = '4–6 km'; }
  else                { fee = 0; slab = '>6 km'; outOfRange = true; }
  // Free delivery if subtotal >= MOV
  const isFree = !outOfRange && minOrderValue > 0 && subtotal >= minOrderValue;
  if (isFree) fee = 0;
  const amountLeft = minOrderValue > 0 ? Math.max(0, minOrderValue - subtotal) : 0;
  return { fee, slab, outOfRange, deliveryFee: fee, isFree, amountLeft, mov: minOrderValue };
};

export default function CheckoutScreen({ navigation, route }) {
  const { cart, products, shop, cartTotal, distance } = route.params;
  const { clearCart, clearShopCart } = useCart();
  const { user } = useAuth();

  const [address, setAddress]           = useState('');
  const [calcDistance, setCalcDistance]  = useState(null);
  const [note, setNote]                 = useState('');
  const [loading, setLoading]           = useState(false);
  const [payment, setPayment]           = useState('cod');
  const [addresses, setAddresses]       = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(null);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [razorpayData, setRazorpayData] = useState(null);
  const [placedOrder, setPlacedOrder]   = useState(null);

  const cartItems = products.filter(p => cart[p.id] > 0).map(p => ({
    ...p, qty: cart[p.id], total: cart[p.id] * parseFloat(p.price) * (1 + (parseFloat(p.gst_percentage) || 0) / 100),
  }));

  const subtotal     = cartItems.reduce((sum, item) => sum + item.total, 0);
  const totalMrp     = cartItems.reduce((sum, item) => {
    const mrp = parseFloat(item.mrp) || 0;
    const price = parseFloat(item.price) || 0;
    return sum + (mrp > price ? mrp * item.qty : price * item.qty);
  }, 0);
  const totalSavings = Math.round(totalMrp - subtotal);
  const deliveryInfo = getDeliveryInfo(calcDistance || distance, subtotal, shop?.min_order_value);
  const platformFee       = 10;
  const platformFeeGST    = Math.round(platformFee * 1.18);
  const deliveryFeeGST    = deliveryInfo.deliveryFee;
  const total             = subtotal + deliveryFeeGST + platformFeeGST;

  useFocusEffect(useCallback(() => {
    // Check if address was selected from map
    if (globalStore.checkoutAddress) {
      setAddress(globalStore.checkoutAddress);
      globalStore.checkoutAddress = null;
      return;
    }
    const fetchAddresses = async () => {
      try {
        const res  = await client.get('/users/addresses/');
        const data = Array.isArray(res.data) ? res.data : [];
        setAddresses(data);
        const defaultAddr = data.find(a => a.is_default);
        if (defaultAddr) { setSelectedAddr(defaultAddr); setAddress(defaultAddr.full_address); }
      } catch (e) { console.log('Address fetch error:', e.message); }
    };
    fetchAddresses();
  }, []));

  // ── Place Order ────────────────────────────────────────────────────────────

  // Calculate distance from shop on load
  useEffect(() => {
    const getDistance = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
        const { latitude, longitude } = loc.coords;
        if (shop?.latitude && shop?.longitude) {
          const dist = calculateDistance(latitude, longitude, parseFloat(shop.latitude), parseFloat(shop.longitude));
          setCalcDistance(dist);
        }
      } catch (e) {}
    };
    getDistance();
  }, []);

  const useCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      const { latitude, longitude } = loc.coords;
      const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCS_YRu6O61LCZn_QlypzjcjSdeRqbQaDI`);
      const data = await res.json();
      if (data.results?.[0]) setAddress(data.results[0].formatted_address);
    } catch (e) { Alert.alert('Error', 'Could not get location'); }
  };

  // ── Geocode address and recalculate distance ──────────────────────────────
  const geocodeAndSetDistance = async (addressText) => {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(addressText)}&key=AIzaSyCS_YRu6O61LCZn_QlypzjcjSdeRqbQaDI`
      );
      const data = await res.json();
      if (data.results?.[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        if (shop?.latitude && shop?.longitude) {
          const dist = calculateDistance(lat, lng, parseFloat(shop.latitude), parseFloat(shop.longitude));
          setCalcDistance(dist);
        }
      }
    } catch (e) {
      console.log('Geocode error:', e.message);
    }
  };
  const handlePlaceOrder = async () => {
    if (deliveryInfo.outOfRange) {
      Alert.alert('Outside Delivery Area', 'Sorry, this shop does not deliver to your location. Maximum delivery range is 6 km.');
      return;
    }
    if (!address.trim()) {
      Alert.alert('Error', 'Please enter delivery address');
      return;
    }
    setLoading(true);
    try {
      const orderItems = cartItems.map(item => ({
        product_id: item.base_product_id || item.id,
        variant_id: item.variant_id || null,
        quantity:   item.qty,
        price:      parseFloat(item.price).toFixed(2),
      }));
      const res = await client.post('/orders/place/', {
        vendor_id:        shop.id,
        items:            orderItems,
        delivery_address: address,
        payment_mode:     payment,
        notes:            note,
        delivery_fee:     deliveryFeeGST,
        total:            Math.round(total),
      });

      const order = res.data.order;

      if (payment === 'online') {
        // Create Razorpay order
        const payRes = await client.post('/orders/payment/create/', {
          order_id: order.id,
        });
        setPlacedOrder(order);
        setRazorpayData(payRes.data);
        setShowRazorpay(true);
        clearShopCart(shop.id);
      } else {
        clearShopCart(shop.id);
        navigation.replace('OrderSuccess', { order });
      }
    } catch (e) {
      const msg = e.response?.data?.error || 'Failed to place order. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Handle Razorpay Payment Response ──────────────────────────────────────
  const handleRazorpayResponse = async (data) => {
    try {
      if (data.razorpay_payment_id) {
        // Payment success — verify
        await client.post('/orders/payment/verify/', {
          razorpay_order_id:   data.razorpay_order_id,
          razorpay_payment_id: data.razorpay_payment_id,
          razorpay_signature:  data.razorpay_signature,
          order_id:            placedOrder.id,
        });
        setShowRazorpay(false);
        navigation.replace('OrderSuccess', { order: placedOrder });
      } else {
        // Payment failed
        await client.post('/orders/payment/failed/', { order_id: placedOrder.id });
        setShowRazorpay(false);
        Alert.alert('Payment Failed', 'Your payment failed. Order placed as Cash on Delivery.', [
          { text: 'OK', onPress: () => navigation.replace('OrderSuccess', { order: placedOrder }) }
        ]);
      }
    } catch (e) {
      setShowRazorpay(false);
      navigation.replace('OrderSuccess', { order: placedOrder });
    }
  };

  // ── Razorpay WebView HTML ──────────────────────────────────────────────────
  const getRazorpayHTML = () => {
    if (!razorpayData) return '';
    return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
</head>
<body style="margin:0;background:#fff;display:flex;align-items:center;justify-content:center;height:100vh;">
  <div style="text-align:center;font-family:sans-serif;">
    <p style="color:#666;font-size:16px;">Opening payment...</p>
  </div>
  <script>
    var options = {
      key:         '${razorpayData.key_id}',
      amount:      ${razorpayData.amount},
      currency:    '${razorpayData.currency}',
      name:        'Univerin',
      description: 'Order from ${razorpayData.shop_name}',
      order_id:    '${razorpayData.razorpay_order_id}',
      prefill: { contact: user?.phone_number || '' },
      theme: { color: '#1669ef' },
      handler: function(response) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id:   response.razorpay_order_id,
          razorpay_signature:  response.razorpay_signature,
        }));
      },
      modal: {
        ondismiss: function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ cancelled: true }));
        }
      }
    };
    var rzp = new Razorpay(options);
    rzp.on('payment.failed', function(response) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ failed: true, error: response.error.description }));
    });
    rzp.open();
  </script>
</body>
</html>`;
  };

  // ── Razorpay WebView ───────────────────────────────────────────────────────
  if (showRazorpay && razorpayData) {
    return (
      <View style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowRazorpay(false)} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#111" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pay ₹{total.toFixed(0)}</Text>
          <View style={{ width: 36 }} />
        </View>
        <WebView
          source={{ html: getRazorpayHTML() }}
          onMessage={(event) => {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.cancelled) {
              setShowRazorpay(false);
              Alert.alert('Payment Cancelled', 'Your payment was cancelled.');
            } else {
              handleRazorpayResponse(data);
            }
          }}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
          renderLoading={() => (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <ActivityIndicator size="large" color="#1669ef" />
              <Text style={{ marginTop: 12, color: '#888' }}>Loading payment...</Text>
            </View>
          )}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1}}>
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

        {/* Free Delivery Banner */}



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
                  onPress={() => { setSelectedAddr(addr); setAddress(addr.full_address); geocodeAndSetDistance(addr.full_address); }}
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
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 10 }}>
            <TouchableOpacity style={styles.locationQuickBtn} onPress={useCurrentLocation}>
              <Ionicons name="locate-outline" size={16} color="#1669ef" />
              <Text style={styles.locationQuickText}>Current Location</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.locationQuickBtn} onPress={() => navigation.navigate('MapPicker', {
              isCheckout: true,
              onLocationSelected: null,
            })}>
              <Ionicons name="map-outline" size={16} color="#1669ef" />
              <Text style={styles.locationQuickText}>Pick on Map</Text>
            </TouchableOpacity>
          </View>
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

        {/* Out of Range Warning */}
        {deliveryInfo.outOfRange && (
          <View style={styles.outOfRangeBanner}>
            <Ionicons name="alert-circle" size={18} color="#dc2626" />
            <Text style={styles.outOfRangeText}>
              🚫 Outside delivery area — {calcDistance ? `${calcDistance} km` : 'too far'}. This shop delivers only within 6 km.
            </Text>
          </View>
        )}
        {/* Order Summary */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <View style={{flexDirection:'row', alignItems:'center', gap:6, marginBottom:12}}>
            <Ionicons name="storefront-outline" size={16} color="#111" />
            <Text style={styles.shopName}>{shop?.shop_name}</Text>
          </View>
          <View style={styles.divider} />
          {cartItems.map(item => (
            <View key={item.id} style={styles.orderItem}>
              <View style={styles.orderItemLeft}>
                <View style={styles.qtyBadge}>
                  <Text style={styles.qtyBadgeText}>{item.qty}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.orderItemName}>{item.name}</Text>
                  {item.mrp && parseFloat(item.mrp) > parseFloat(item.price) && (
                    <Text style={styles.orderItemMrp}>MRP: <Text style={{textDecorationLine:'line-through'}}>₹{parseFloat(item.mrp).toFixed(0)}</Text> • <Text style={{color:'#16A34A'}}>{Math.round((1 - parseFloat(item.price)/parseFloat(item.mrp))*100)}% OFF</Text></Text>
                  )}
                </View>
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
                {calcDistance ? `📍 ${calcDistance} km away` : (distance ? `📍 ${distance} km away` : '')}
              </Text>
            </View>
            {deliveryInfo.isFree
              ? <Text style={styles.billValueFree}>FREE ✅</Text>
              : <Text style={styles.billValue}>₹{deliveryFeeGST}</Text>
            }
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Platform Fee (incl. GST)</Text>
            <Text style={styles.billValue}>₹{platformFeeGST}</Text>
          </View>
          <View style={styles.divider} />
          {totalSavings > 0 && (
            <View style={styles.savingsBanner}>
              <Text style={styles.savingsText}>🎉 You saved ₹{totalSavings} on this order!</Text>
            </View>
          )}
          <View style={styles.billRow}>
            <Text style={styles.billTotalLabel}>Total Amount</Text>
            <Text style={styles.billTotalValue}>₹{total.toFixed(0)}</Text>
          </View>

        </View>

        {/* Payment Method */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Method</Text>

          {/* COD */}
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

          <View style={{ height: 10 }} />

          {/* Online Payment */}
          <TouchableOpacity
            style={[styles.paymentOption, payment === 'online' && styles.paymentOptionOnline]}
            onPress={() => setPayment('online')}
          >
            <View style={styles.paymentLeft}>
              <Text style={styles.paymentEmoji}>💳</Text>
              <View>
                <Text style={styles.paymentName}>Online Payment</Text>
                <Text style={styles.paymentDesc}>UPI, Cards, Net Banking</Text>
              </View>
            </View>
            <View style={[styles.radio, payment === 'online' && styles.radioActiveOnline]}>
              {payment === 'online' && <View style={styles.radioDotOnline} />}
            </View>
          </TouchableOpacity>

          {payment === 'online' && (
            <View style={styles.onlineBadge}>
              <Text style={styles.onlineBadgeText}>⚡ Powered by Razorpay — Safe & Secure</Text>
            </View>
          )}
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

        </View>
        <TouchableOpacity
          style={[styles.placeOrderBtn, payment === 'online' && styles.placeOrderBtnOnline, deliveryInfo.outOfRange && styles.placeOrderBtnDisabled]}
          onPress={handlePlaceOrder}
          disabled={loading || deliveryInfo.outOfRange}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.placeOrderText}>
                {payment === 'online' ? '💳 Pay ₹' : 'Place Order • ₹'}{total.toFixed(0)}
              </Text>
          }
        </TouchableOpacity>
      </View>
    </View>
    </KeyboardAvoidingView>
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111', flex: 1, textAlign: 'center' },

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

  card: { backgroundColor: '#fff', borderRadius: 16, margin: 16, marginBottom: 0, padding: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  cardTitle:  { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 12 },
  changeBtn:  { fontSize: 13, color: '#1669ef', fontWeight: '600' },

  addrRow:            { marginBottom: 12 },
  addrChip:           { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, backgroundColor: '#F9FAFB' },
  addrChipActive:     { borderColor: '#1669ef', backgroundColor: '#eff6ff' },
  addrChipIcon:       { fontSize: 14 },
  addrChipText:       { fontSize: 13, color: '#555', fontWeight: '500' },
  addrChipTextActive: { color: '#1669ef', fontWeight: 'bold' },

  locationQuickBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, padding: 10, borderRadius: 10, borderWidth: 1, borderColor: '#1669ef', backgroundColor: '#EFF6FF' },
  locationQuickText: { fontSize: 12, fontWeight: '600', color: '#1669ef' },
  addressInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 14, color: '#111', minHeight: 80, textAlignVertical: 'top', backgroundColor: '#F9FAFB' },

  shopName:       { fontSize: 14, fontWeight: '600', color: '#555' },
  divider:        { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
  orderItem:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, paddingHorizontal: 4 },
  orderItemLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 },
  qtyBadge:       { width: 24, height: 24, borderRadius: 6, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  qtyBadgeText:   { fontSize: 12, fontWeight: 'bold', color: '#1669ef' },
  orderItemMrp:  { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  orderItemName:  { fontSize: 14, color: '#555', flex: 1 },
  orderItemPrice: { fontSize: 14, fontWeight: '600', color: '#111' },

  billRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  billLabel:      { fontSize: 14, color: '#888' },
  billLabelSub:   { fontSize: 11, color: '#aaa', marginTop: 2 },
  billValue:      { fontSize: 14, color: '#111' },
  billValueFree:  { fontSize: 14, color: '#16A34A', fontWeight: '700' },
  billTotalLabel: { fontSize: 15, fontWeight: 'bold', color: '#111' },
  billTotalValue: { fontSize: 15, fontWeight: 'bold', color: '#1669ef' },
  slabInfo:       { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4, backgroundColor: '#F9FAFB', padding: 8, borderRadius: 8 },
  slabInfoText:   { fontSize: 11, color: '#888' },

  paymentOption:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 14 },
  paymentOptionActive: { borderColor: '#1669ef', backgroundColor: '#eff6ff' },
  paymentOptionOnline: { borderColor: '#1669ef', backgroundColor: '#eff6ff' },
  paymentLeft:         { flexDirection: 'row', alignItems: 'center', gap: 12 },
  paymentEmoji:        { fontSize: 24 },
  paymentName:         { fontSize: 14, fontWeight: '600', color: '#111' },
  paymentDesc:         { fontSize: 12, color: '#888' },

  radio:            { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center' },
  radioActive:      { borderColor: '#1669ef' },
  radioDot:         { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1669ef' },
  radioActiveOnline:{ borderColor: '#1669ef' },
  radioDotOnline:   { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1669ef' },

  onlineBadge:     { backgroundColor: '#f5f3ff', borderRadius: 8, padding: 10, marginTop: 10, alignItems: 'center' },
  onlineBadgeText: { fontSize: 12, color: '#1669ef', fontWeight: '600' },

  optional:  { fontSize: 12, color: '#9CA3AF', fontWeight: 'normal' },
  noteInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 14, color: '#111', minHeight: 60, textAlignVertical: 'top', backgroundColor: '#F9FAFB' },

  footer:          { padding: 16, paddingBottom: 30, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  footerTop:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  footerTotal:     { fontSize: 20, fontWeight: 'bold', color: '#111' },
  footerTotalLabel:{ fontSize: 12, color: '#888' },
  footerFreeTag:   { backgroundColor: '#f0fdf4', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1, borderColor: '#bbf7d0' },
  footerFreeTagText:{ fontSize: 11, color: '#16A34A', fontWeight: '700' },

  placeOrderBtn:       { backgroundColor: '#1669ef', borderRadius: 14, padding: 16, alignItems: 'center' },
  placeOrderBtnOnline:    { backgroundColor: '#1669ef' },
  placeOrderBtnDisabled:  { backgroundColor: '#9CA3AF' },
  outOfRangeBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fef2f2', marginHorizontal: 16, marginTop: 16,
    padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#fecaca',
  },
  outOfRangeText: { fontSize: 13, color: '#dc2626', fontWeight: '600', flex: 1 },
  placeOrderText:      { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});