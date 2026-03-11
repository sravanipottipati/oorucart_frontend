import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';

export default function WishlistScreen({ navigation }) {
  const [wishlist, setWishlist] = useState([]);

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {wishlist.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>❤️</Text>
            <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
            <Text style={styles.emptySubtitle}>
              Save your favourite products here to order them later!
            </Text>
            <TouchableOpacity
              style={styles.shopBtn}
              onPress={() => navigation.navigate('Home')}
            >
              <Text style={styles.shopBtnText}>Explore Shops</Text>
            </TouchableOpacity>
          </View>
        ) : (
          wishlist.map((item, index) => (
            <View key={index} style={styles.wishCard}>
              <View style={styles.wishIconBox}>
                <Text style={styles.wishIcon}>📦</Text>
              </View>
              <View style={styles.wishInfo}>
                <Text style={styles.wishName}>{item.name}</Text>
                <Text style={styles.wishShop}>{item.shopName}</Text>
                <Text style={styles.wishPrice}>₹{item.price}</Text>
              </View>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => navigation.navigate('ShopDetail', {
                  vendorId: item.shopId,
                  shopName: item.shopName,
                })}
              >
                <Text style={styles.addBtnText}>ADD</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
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

  emptyState: {
    alignItems: 'center', marginTop: 80, paddingHorizontal: 32,
  },
  emptyEmoji: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: '#111', marginBottom: 10 },
  emptySubtitle: {
    fontSize: 14, color: '#888', textAlign: 'center',
    lineHeight: 20, marginBottom: 28,
  },
  shopBtn: {
    backgroundColor: '#2563EB', borderRadius: 14,
    paddingHorizontal: 32, paddingVertical: 14,
  },
  shopBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },

  wishCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 16,
    marginTop: 12, borderRadius: 14, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  wishIconBox: {
    width: 52, height: 52, borderRadius: 12,
    backgroundColor: '#F3F4F6', justifyContent: 'center',
    alignItems: 'center', marginRight: 12,
  },
  wishIcon: { fontSize: 26 },
  wishInfo: { flex: 1 },
  wishName: { fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 2 },
  wishShop: { fontSize: 12, color: '#888', marginBottom: 4 },
  wishPrice: { fontSize: 14, fontWeight: '600', color: '#2563EB' },
  addBtn: {
    borderWidth: 1.5, borderColor: '#2563EB',
    borderRadius: 8, paddingHorizontal: 16, paddingVertical: 6,
  },
  addBtnText: { color: '#2563EB', fontWeight: 'bold', fontSize: 13 },
});