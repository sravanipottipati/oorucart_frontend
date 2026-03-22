import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import client from '../../api/client';

export default function WishlistScreen({ navigation }) {
  const [wishlist, setWishlist]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWishlist = async () => {
    try {
      const res = await client.get('/vendors/wishlist/');
      setWishlist(res.data.wishlist || []);
    } catch (e) {
      console.log('Error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchWishlist(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchWishlist(); };

  const handleRemove = async (productId, name) => {
    Alert.alert('Remove', `Remove "${name}" from wishlist?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            await client.post('/vendors/wishlist/', { product_id: productId });
            fetchWishlist();
          } catch (e) {
            Alert.alert('Error', 'Could not remove from wishlist');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{wishlist.length}</Text>
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
          {wishlist.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>❤️</Text>
              <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
              <Text style={styles.emptySubtitle}>
                Save products you love by tapping ♡ on any product
              </Text>
              <TouchableOpacity
                style={styles.shopBtn}
                onPress={() => navigation.navigate('Home')}
              >
                <Text style={styles.shopBtnText}>Browse Shops</Text>
              </TouchableOpacity>
            </View>
          ) : (
            wishlist.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.productCard}
                onPress={() => navigation.navigate('ShopDetail', { vendorId: item.shop_id })}
              >
                <View style={styles.productIconBox}>
                  <Text style={styles.productIcon}>🛍</Text>
                </View>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.name}</Text>
                  <Text style={styles.shopName}>🏪 {item.shop_name}</Text>
                  <Text style={styles.townName}>📍 {item.town}</Text>
                  <View style={[
                    styles.availBadge,
                    { backgroundColor: item.is_available ? '#DCFCE7' : '#F3F4F6' }
                  ]}>
                    <Text style={[
                      styles.availText,
                      { color: item.is_available ? '#16A34A' : '#9CA3AF' }
                    ]}>
                      {item.is_available ? '● In Stock' : '● Out of Stock'}
                    </Text>
                  </View>
                </View>
                <View style={styles.productRight}>
                  <Text style={styles.productPrice}>₹{item.price}</Text>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => handleRemove(item.product_id, item.name)}
                  >
                    <Text style={styles.removeIcon}>🗑</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
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
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 24, color: '#111' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#111' },
  countBadge: {
    backgroundColor: '#f0fdfa', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  countText: { fontSize: 13, color: '#0d9488', fontWeight: 'bold' },

  emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  shopBtn: {
    backgroundColor: '#0d9488', borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  shopBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  productCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14,
    padding: 14, marginBottom: 10, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  productIconBox: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#f0fdfa', justifyContent: 'center', alignItems: 'center',
  },
  productIcon: { fontSize: 26 },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 3 },
  shopName: { fontSize: 12, color: '#555', marginBottom: 2 },
  townName: { fontSize: 11, color: '#888', marginBottom: 6 },
  availBadge: {
    alignSelf: 'flex-start', paddingHorizontal: 8,
    paddingVertical: 3, borderRadius: 20,
  },
  availText: { fontSize: 11, fontWeight: '600' },
  productRight: { alignItems: 'flex-end', gap: 10 },
  productPrice: { fontSize: 16, fontWeight: 'bold', color: '#0d9488' },
  removeBtn: {
    width: 34, height: 34, borderRadius: 8,
    backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center',
  },
  removeIcon: { fontSize: 16 },
});