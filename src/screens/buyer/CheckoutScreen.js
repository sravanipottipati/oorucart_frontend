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
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {cartItems.map(item => (
          <View key={item.id} style={styles.orderItem}>
            <Text style={styles.itemName}>{item.name} x{item.quantity}</Text>
            <Text style={styles.itemPrice}>
              ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}
        <View style={styles.divider} />
        <View style={styles.orderItem}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>₹{totalPrice.toFixed(2)}</Text>
        </View>
        <View style={styles.orderItem}>
          <Text style={styles.feeLabel}>Platform Fee</Text>
          <Text style={styles.feeLabel}>₹{shop.platform_fee || 5}</Text>
        </View>
        <View style={styles.codBadge}>
          <Text style={styles.codText}>💵 Cash on Delivery</Text>
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
        <Text style={styles.sectionTitle}>Special Instructions (optional)</Text>
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
          : <Text style={styles.buttonText}>Place Order — ₹{totalPrice.toFixed(2)}</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#2E7D32', padding: 20, paddingTop: 50 },
  backBtn: { marginBottom: 10 },
  backText: { color: '#A5D6A7', fontSize: 15 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  section: {
    backgroundColor: '#fff', margin: 16, marginBottom: 0,
    borderRadius: 14, padding: 16, elevation: 1,
  },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#1B5E20', marginBottom: 12 },
  orderItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  itemName: { fontSize: 14, color: '#333' },
  itemPrice: { fontSize: 14, color: '#333' },
  divider: { height: 1, backgroundColor: '#eee', marginVertical: 8 },
  totalLabel: { fontSize: 15, fontWeight: 'bold', color: '#222' },
  totalPrice: { fontSize: 15, fontWeight: 'bold', color: '#2E7D32' },
  feeLabel: { fontSize: 13, color: '#888' },
  codBadge: {
    backgroundColor: '#E8F5E9', padding: 8,
    borderRadius: 8, marginTop: 8, alignItems: 'center',
  },
  codText: { color: '#2E7D32', fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    padding: 12, fontSize: 15, backgroundColor: '#fafafa', textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#2E7D32', margin: 16, padding: 16,
    borderRadius: 14, alignItems: 'center', marginBottom: 40,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});