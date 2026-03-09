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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.shopInfo}>
          <Text style={styles.shopName}>{shop.shop_name}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>📍 {shop.town}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.meta}>🕐 {shop.estimated_delivery_time} mins</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.meta}>⭐ {shop.rating}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: shop.is_open ? '#E8F5E9' : '#FFEBEE' }]}>
          <Text style={[styles.statusText, { color: shop.is_open ? '#2E7D32' : '#C62828' }]}>
            {shop.is_open ? 'Open' : 'Closed'}
          </Text>
        </View>
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
          ListHeaderComponent={
            <View style={styles.listHeader}>
              <Text style={styles.sectionTitle}>Menu</Text>
              <Text style={styles.itemCount}>{products.length} items</Text>
            </View>
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyIcon}>🛒</Text>
              <Text style={styles.emptyText}>No products available</Text>
            </View>
          }
        />
      )}

      {/* Cart Bar */}
      {totalItems() > 0 && (
        <TouchableOpacity
          style={styles.cartBar}
          onPress={() => navigation.navigate('Checkout', { cart, shop })}
        >
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{totalItems()}</Text>
          </View>
          <Text style={styles.cartBarText}>View Cart</Text>
          <Text style={styles.cartBarPrice}>₹{totalPrice().toFixed(2)}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: {
    backgroundColor: '#fff', padding: 20, paddingTop: 50,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  backBtn: { marginBottom: 12 },
  backText: { color: '#2E7D32', fontSize: 15, fontWeight: '600' },
  shopInfo: { marginBottom: 10 },
  shopName: { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: { fontSize: 13, color: '#666' },
  metaDot: { color: '#ccc' },
  statusBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 12,
    paddingVertical: 5, borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: 'bold' },
  list: { padding: 16, paddingBottom: 100 },
  listHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#111' },
  itemCount: { fontSize: 13, color: '#888' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#888' },
  cartBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#111', padding: 16,
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 20,
  },
  cartBadge: {
    backgroundColor: '#2E7D32', width: 26, height: 26,
    borderRadius: 13, justifyContent: 'center', alignItems: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  cartBarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  cartBarPrice: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});