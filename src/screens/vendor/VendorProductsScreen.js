import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import client from '../../api/client';

export default function VendorProductsScreen({ navigation }) {
  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProducts = async () => {
    try {
      const shopRes = await client.get('/vendors/myshop/');
      const shop    = shopRes.data;
      const res     = await client.get(`/vendors/${shop.id}/products/`);
      const data    = Array.isArray(res.data) ? res.data : res.data.products || [];
      setProducts(data);
    } catch (e) {
      console.log('Error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchProducts(); };

  const handleDelete = (productId, productName) => {
    Alert.alert('Delete Product', `Delete "${productName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await client.delete(`/vendors/products/${productId}/`);
            fetchProducts();
          } catch (e) {
            Alert.alert('Error', 'Could not delete product');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Products</Text>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => navigation.navigate('VendorNotifications')}
        >
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Add Button + Count */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('VendorAddProduct', { onGoBack: fetchProducts })}
        >
          <Text style={styles.addBtnText}>+ Add New Product</Text>
        </TouchableOpacity>
        <View style={styles.countBox}>
          <Text style={styles.countLabel}>Total Products</Text>
          <Text style={styles.countValue}>{products.length}</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0d9488" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 16 }}
        >
          {products.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📦</Text>
              <Text style={styles.emptyTitle}>No products yet</Text>
              <Text style={styles.emptySubtitle}>Add your first product!</Text>
              <TouchableOpacity
                style={styles.addFirstBtn}
                onPress={() => navigation.navigate('VendorAddProduct', { onGoBack: fetchProducts })}
              >
                <Text style={styles.addFirstBtnText}>+ Add Product</Text>
              </TouchableOpacity>
            </View>
          ) : (
            products.map(product => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.name}</Text>
                  {product.description ? (
                    <Text style={styles.productDesc} numberOfLines={1}>
                      {product.description}
                    </Text>
                  ) : null}
                  <View style={[
                    styles.availableBadge,
                    { backgroundColor: product.is_available ? '#DCFCE7' : '#F3F4F6' }
                  ]}>
                    <Text style={[
                      styles.availableText,
                      { color: product.is_available ? '#16A34A' : '#9CA3AF' }
                    ]}>
                      {product.is_available ? '● In Stock' : '● Out of Stock'}
                    </Text>
                  </View>
                </View>
                <View style={styles.productRight}>
                  <Text style={styles.productPrice}>₹{product.price}</Text>
                  <View style={styles.actionBtns}>
                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => navigation.navigate('VendorEditProduct', {
                        product,
                        onGoBack: fetchProducts,
                      })}
                    >
                      <Text style={styles.editBtnText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(product.id, product.name)}
                    >
                      <Text style={styles.deleteBtnText}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Bottom Tab */}
      <View style={styles.bottomTab}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('VendorHome')}
        >
          <Text style={styles.tabIcon}>⊞</Text>
          <Text style={styles.tabLabel}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('VendorOrders')}
        >
          <Text style={styles.tabIcon}>📋</Text>
          <Text style={styles.tabLabel}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={[styles.tabIcon, { color: '#0d9488' }]}>📦</Text>
          <Text style={styles.tabLabelActive}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('VendorProfile')}
        >
          <Text style={styles.tabIcon}>👤</Text>
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  bellBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  bellIcon: { fontSize: 22 },

  topRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  addBtn: {
    backgroundColor: '#0d9488', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 10,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  countBox: { alignItems: 'flex-end' },
  countLabel: { fontSize: 11, color: '#888' },
  countValue: { fontSize: 24, fontWeight: 'bold', color: '#111' },

  productCard: {
    flexDirection: 'row', justifyContent: 'space-between',
    backgroundColor: '#fff', borderRadius: 14,
    marginBottom: 10, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  productInfo: { flex: 1, paddingRight: 12 },
  productName: { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  productDesc: { fontSize: 12, color: '#888', marginBottom: 6 },
  availableBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  availableText: { fontSize: 11, fontWeight: '600' },
  productRight: { alignItems: 'flex-end', justifyContent: 'space-between' },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  actionBtns: { flexDirection: 'row', gap: 8, marginTop: 8 },
  editBtn: {
    width: 34, height: 34, borderRadius: 8,
    backgroundColor: '#f0fdfa', justifyContent: 'center', alignItems: 'center',
  },
  editBtnText: { fontSize: 16 },
  deleteBtn: {
    width: 34, height: 34, borderRadius: 8,
    backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center',
  },
  deleteBtnText: { fontSize: 16 },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 50, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: '#888', marginBottom: 20 },
  addFirstBtn: {
    backgroundColor: '#0d9488', borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  addFirstBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  bottomTab: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
    paddingBottom: 24, paddingTop: 10,
    position: 'absolute', bottom: 0, left: 0, right: 0,
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: 22, marginBottom: 2, color: '#9CA3AF' },
  tabLabel: { fontSize: 11, color: '#9CA3AF' },
  tabLabelActive: { fontSize: 11, color: '#0d9488', fontWeight: 'bold' },
});