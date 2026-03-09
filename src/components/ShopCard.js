import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const categoryEmoji = {
  vegetables: '🥦',
  bakery: '🍞',
  restaurant: '🍽',
  supermarket: '🛒',
};

const categoryColor = {
  vegetables: '#E8F5E9',
  bakery: '#FFF8E1',
  restaurant: '#FCE4EC',
  supermarket: '#E3F2FD',
};

export default function ShopCard({ shop, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Top Row */}
      <View style={styles.topRow}>
        <View style={[styles.emojiBox, { backgroundColor: categoryColor[shop.category] || '#f5f5f5' }]}>
          <Text style={styles.emoji}>{categoryEmoji[shop.category] || '🏪'}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{shop.shop_name}</Text>
          <Text style={styles.category}>{shop.category}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>🕐 {shop.estimated_delivery_time} mins</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.meta}>🚚 {shop.delivery_type}</Text>
          </View>
        </View>
        <View style={styles.rightCol}>
          <Text style={styles.rating}>⭐ {shop.rating || '0.0'}</Text>
          <View style={[styles.badge, { backgroundColor: shop.is_open ? '#E8F5E9' : '#FFEBEE' }]}>
            <Text style={[styles.badgeText, { color: shop.is_open ? '#2E7D32' : '#C62828' }]}>
              {shop.is_open ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Row */}
      <View style={styles.bottomRow}>
        <Text style={styles.town}>📍 {shop.town}</Text>
        <TouchableOpacity style={styles.orderBtn} onPress={onPress}>
          <Text style={styles.orderBtnText}>Order Now →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 12, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 6,
    borderWidth: 1, borderColor: '#f0f0f0',
  },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  emojiBox: {
    width: 56, height: 56, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  emoji: { fontSize: 28 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 3 },
  category: { fontSize: 12, color: '#888', textTransform: 'capitalize', marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meta: { fontSize: 12, color: '#666' },
  metaDot: { color: '#ccc', fontSize: 12 },
  rightCol: { alignItems: 'flex-end', gap: 6 },
  rating: { fontSize: 13, color: '#F57F17', fontWeight: '600' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  bottomRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderTopWidth: 1,
    borderTopColor: '#f5f5f5', paddingTop: 12,
  },
  town: { fontSize: 13, color: '#888' },
  orderBtn: {
    backgroundColor: '#111', paddingHorizontal: 14,
    paddingVertical: 7, borderRadius: 20,
  },
  orderBtnText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});