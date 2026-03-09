import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import client from '../../api/client';

export default function CheckoutScreen({ route, navigation }) {
  const { cart, shop } = route.params;
  const [address, setAddress] = useState('');
  const [instructions, setInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const cartItems = Object.values(cart);
  const totalPrice = cartItems.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);

  const placeOrder = async () => {
    if (!address.trim()) return Alert.alert('Error', 'Please enter delivery address');
    setLoading(true);
    try {
      await client.post('/orders/place/', {
        vendor_id: shop.id,
        delivery_address: address,
        instructions,
        payment_mode: 'cod',
        items: cartItems.map(i => ({ product_id: i.id, quantity: i.quantity })),
      });
      Alert.alert('Order Placed! 🎉', 'Your order has been placed successfully!', [
        { text: 'Track Order', onPress: () => navigation.replace('MyOrders') },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Could not place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <Text style={styles.shopName}>from {shop.shop_name}</Text>
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {cartItems.map(item => (
          <View key={item.id} style={styles.orderItem}>
            <View style={styles.orderItemLeft}>
              <View style={styles.qtyBadge}>
                <Text style={styles.qtyBadgeText}>{item.quantity}</Text>
              </View>
              <Text style={styles.itemName}>{item.name}</Text>
            </View>
            <Text style={styles.itemPrice}>
              ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.orderItem}>
          <Text style={styles.subtotalLabel}>Subtotal</Text>
          <Text style={styles.subtotalPrice}>₹{totalPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.orderItem}>
          <Text style={styles.feeLabel}>Platform Fee</Text>
          <Text style={styles.feeValue}>₹{shop.platform_fee || 5}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.orderItem}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>₹{(totalPrice + (shop.platform_fee || 5)).toFixed(2)}</Text>
        </View>
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <View style={styles.paymentOption}>
          <View style={styles.paymentLeft}>
            <Text style={styles.paymentIcon}>💵</Text>
            <View>
              <Text style={styles.paymentName}>Cash on Delivery</Text>
              <Text style={styles.paymentSub}>Pay when you receive</Text>
            </View>
          </View>
          <View style={styles.selectedDot} />
        </View>
      </View>

      {/* Delivery Address */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Delivery Address</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your full address"
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Instructions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Special Instructions
          <Text style={styles.optional}> (optional)</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Please pack carefully"
          value={instructions}
          onChangeText={setInstructions}
          multiline
          numberOfLines={2}
        />
      </View>

      {/* Place Order Button */}
      <TouchableOpacity style={styles.button} onPress={placeOrder} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : (
            <View style={styles.buttonInner}>
              <Text style={styles.buttonText}>Place Order</Text>
              <Text style={styles.buttonPrice}>
                ₹{(totalPrice + (shop.platform_fee || 5)).toFixed(2)}
              </Text>
            </View>
          )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: {
    backgroundColor: '#fff', padding: 20, paddingTop: 50,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  backBtn: { marginBottom: 10 },
  backText: { color: '#2E7D32', fontSize: 15, fontWeight: '600' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  shopName: { fontSize: 13, color: '#888' },
  section: {
    backgroundColor: '#fff', margin: 16, marginBottom: 0,
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: '#f0f0f0',
  },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 14 },
  optional: { fontSize: 13, color: '#aaa', fontWeight: 'normal' },
  orderItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  orderItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  qtyBadge: {
    backgroundColor: '#111', width: 22, height: 22,
    borderRadius: 6, justifyContent: 'center', alignItems: 'center',
  },
  qtyBadgeText: { color: '#fff', fontSize: 11, fontWeight: 'bold' },
  itemName: { fontSize: 14, color: '#333', flex: 1 },
  itemPrice: { fontSize: 14, color: '#111', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 10 },
  subtotalLabel: { fontSize: 14, color: '#555' },
  subtotalPrice: { fontSize: 14, color: '#111', fontWeight: '600' },
  feeLabel: { fontSize: 13, color: '#888' },
  feeValue: { fontSize: 13, color: '#888' },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  totalPrice: { fontSize: 16, fontWeight: 'bold', color: '#2E7D32' },
  paymentOption: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#f9f9f9',
    padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#111',
  },
  paymentLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  paymentIcon: { fontSize: 24 },
  paymentName: { fontSize: 14, fontWeight: '600', color: '#111' },
  paymentSub: { fontSize: 12, color: '#888', marginTop: 2 },
  selectedDot: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#111', borderWidth: 3, borderColor: '#ddd',
  },
  input: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12,
    padding: 14, fontSize: 15, backgroundColor: '#fafafa',
    textAlignVertical: 'top', color: '#111',
  },
  button: {
    backgroundColor: '#111', margin: 16, padding: 18,
    borderRadius: 16, alignItems: 'center', marginBottom: 40,
  },
  buttonInner: {
    flexDirection: 'row', justifyContent: 'space-between',
    width: '100%', alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  buttonPrice: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});