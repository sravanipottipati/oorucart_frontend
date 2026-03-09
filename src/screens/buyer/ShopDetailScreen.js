import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, Alert, TouchableOpacity,
} from 'react-native';
import client from '../../api/client';
import ProductCard from '../../components/ProductCard';

export default function ShopDetailScreen({ route, navigation }) {
  const { shop } = route.params;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await client.get(`/vendors/${shop.id}/products/`);
      setProducts(res.data.products);
    } catch (e) {
      Alert.alert('Error', 'Could not load products');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    setCart(prev => ({
      ...prev,
      [product.id]: { ...product, quantity: (prev[product.id]?.quantity || 0) + 1 },
    }));
  };

  const removeFromCart = (product) => {
    setCart(prev => {
      const qty = prev[product.id]?.quantity || 0;
      if (qty <= 1) {
        const updated = { ...prev };
        delete updated[product.id];
        return updated;
      }
      return { ...prev, [product.id]: { ...product, quantity: qty - 1 } };
    });
  };

  const totalItems = () => Object.values(cart).reduce((s, i) => s + i.quantity, 0);
  const totalPrice = () => Object.values(cart).reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);

  return (
    <View style={styles.container}>
      {/* Shop Header */}
      <View style={styles.shopHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.shopName}>{shop.shop_name}</Text>
        <Text style={styles.shopMeta}>
          📍 {shop.town}  •  🕐 {shop.estimated_delivery_time} mins  •  ⭐ {shop.rating}
        </Text>
      </View>

      {/* Products */}
      {loading ? (
        <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 60 }} />
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              quantity={cart[item.id]?.quantity || 0}
              onAdd={() => addToCart(item)}
              onRemove={() => removeFromCart(item)}
            />
          )}
          contentContainerStyle={styles.list}
          ListHeaderComponent={<Text style={styles.sectionTitle}>Products</Text>}
          ListEmptyComponent={<Text style={styles.emptyText}>No products available</Text>}
        />
      )}

      {/* Cart Bar */}
      {totalItems() > 0 && (
        <TouchableOpacity
          style={styles.cartBar}
          onPress={() => navigation.navigate('Checkout', { cart, shop })}
        >
          <Text style={styles.cartBarText}>{totalItems()} item(s) in cart</Text>
          <Text style={styles.cartBarPrice}>₹{totalPrice().toFixed(2)} →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  shopHeader: { backgroundColor: '#2E7D32', padding: 20, paddingTop: 50 },
  backBtn: { marginBottom: 10 },
  backText: { color: '#A5D6A7', fontSize: 15 },
  shopName: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginBottom: 6 },
  shopMeta: { fontSize: 13, color: '#C8E6C9' },
  list: { padding: 16, paddingBottom: 100 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 40 },
  cartBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#2E7D32', padding: 16,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  cartBarText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  cartBarPrice: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});