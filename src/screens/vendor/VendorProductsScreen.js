import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet, ActivityIndicator,
  Alert, TouchableOpacity, RefreshControl, TextInput, ScrollView,
} from 'react-native';
import client from '../../api/client';

export default function VendorProductsScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('vegetables');
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async () => {
    try {
      const res = await client.get('/vendors/myshop/');
      const shopId = res.data.vendor.id;
      const prod = await client.get(`/vendors/${shopId}/products/`);
      setProducts(prod.data.products);
    } catch (e) {
      Alert.alert('Error', 'Could not load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const addProduct = async () => {
    if (!name || !price) return Alert.alert('Error', 'Name and price are required');
    setSaving(true);
    try {
      await client.post('/vendors/products/add/', {
        name, price: parseFloat(price), description, category,
      });
      Alert.alert('Success', 'Product added!');
      setName(''); setPrice(''); setDescription(''); setCategory('vegetables');
      setShowAddForm(false);
      fetchProducts();
    } catch (e) {
      Alert.alert('Error', 'Could not add product');
    } finally {
      setSaving(false);
    }
  };

  const CATEGORIES = ['vegetables', 'bakery', 'restaurant', 'supermarket'];
  const categoryEmoji = { vegetables: '🥦', bakery: '🍞', restaurant: '🍽', supermarket: '🛒' };

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productLeft}>
        <View style={styles.productEmoji}>
          <Text style={styles.emojiText}>{categoryEmoji[item.category] || '🛒'}</Text>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>{item.name}</Text>
          {item.description ? <Text style={styles.productDesc}>{item.description}</Text> : null}
          <Text style={styles.productCategory}>{item.category}</Text>
        </View>
      </View>
      <View style={styles.productRight}>
        <Text style={styles.productPrice}>Rs.{item.price}</Text>
        <View style={[styles.availBadge, { backgroundColor: item.is_available ? '#E8F5E9' : '#FFEBEE' }]}>
          <Text style={[styles.availText, { color: item.is_available ? '#2E7D32' : '#C62828' }]}>
            {item.is_available ? 'Available' : 'Unavailable'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Products</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Text style={styles.addBtnText}>{showAddForm ? '✕ Cancel' : '+ Add'}</Text>
        </TouchableOpacity>
      </View>

      {/* Add Product Form */}
      {showAddForm && (
        <ScrollView style={styles.form}>
          <Text style={styles.formTitle}>Add New Product</Text>

          <Text style={styles.label}>Product Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Fresh Tomatoes"
            value={name}
            onChangeText={setName}
          />

          <Text style={styles.label}>Price (Rs.) *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 40"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Description (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Fresh from farm"
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryRow}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[styles.catBtn, category === cat && styles.catBtnActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.catBtnText, category === cat && styles.catBtnTextActive]}>
                  {categoryEmoji[cat]} {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={addProduct} disabled={saving}>
            <Text style={styles.saveBtnText}>
              {saving ? 'Saving...' : 'Save Product'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Products List */}
      {!showAddForm && (
        loading ? (
          <ActivityIndicator size="large" color="#2E7D32" style={{ marginTop: 60 }} />
        ) : products.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🛍</Text>
            <Text style={styles.emptyText}>No products yet</Text>
            <Text style={styles.emptySubText}>Tap + Add to add your first product!</Text>
          </View>
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            renderItem={renderProduct}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); fetchProducts(); }}
              />
            }
            ListHeaderComponent={
              <Text style={styles.countText}>{products.length} product(s)</Text>
            }
          />
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  header: {
    backgroundColor: '#fff', padding: 20, paddingTop: 50,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  backBtn: { padding: 4 },
  backText: { color: '#2E7D32', fontSize: 15, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  addBtn: { backgroundColor: '#111', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  form: {
    backgroundColor: '#fff', margin: 16, borderRadius: 16,
    padding: 16, borderWidth: 1, borderColor: '#f0f0f0',
  },
  formTitle: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 14 },
  label: { fontSize: 13, color: '#444', fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10,
    padding: 12, fontSize: 15, marginBottom: 14, backgroundColor: '#fafafa',
  },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  catBtn: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  catBtnActive: { backgroundColor: '#111', borderColor: '#111' },
  catBtnText: { fontSize: 12, color: '#555', textTransform: 'capitalize' },
  catBtnTextActive: { color: '#fff', fontWeight: 'bold' },
  saveBtn: {
    backgroundColor: '#111', padding: 14, borderRadius: 12,
    alignItems: 'center', marginBottom: 20,
  },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  list: { padding: 16 },
  countText: { fontSize: 13, color: '#888', marginBottom: 12 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 56, marginBottom: 14 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 6 },
  emptySubText: { fontSize: 14, color: '#888' },
  productCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderWidth: 1, borderColor: '#f0f0f0', elevation: 1,
  },
  productLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  productEmoji: {
    width: 48, height: 48, borderRadius: 12,
    backgroundColor: '#f0f7f0', justifyContent: 'center',
    alignItems: 'center', marginRight: 12,
  },
  emojiText: { fontSize: 24 },
  productInfo: { flex: 1 },
  productName: { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 2 },
  productDesc: { fontSize: 12, color: '#888', marginBottom: 2 },
  productCategory: { fontSize: 11, color: '#aaa', textTransform: 'capitalize' },
  productRight: { alignItems: 'flex-end', gap: 6 },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  availBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  availText: { fontSize: 11, fontWeight: 'bold' },
});