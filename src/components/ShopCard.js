import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const categoryEmoji = {
  vegetables: '🥦',
  bakery: '🍞',
  restaurant: '🍽',
  supermarket: '🛒',
};

export default function ShopCard({ shop, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{categoryEmoji[shop.category] || '🏪'}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{shop.shop_name}</Text>
          <Text style={styles.category}>{shop.category}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.rating}>⭐ {shop.rating || '0.0'}</Text>
          <View style={[styles.badge, { backgroundColor: shop.is_open ? '#E8F5E9' : '#FFEBEE' }]}>
            <Text style={[styles.badgeText, { color: shop.is_open ? '#2E7D32' : '#C62828' }]}>
              {shop.is_open ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.footer}>
        <Text style={styles.detail}>📍 {shop.town}</Text>
        <Text style={styles.detail}>🕐 {shop.estimated_delivery_time} mins</Text>
        <Text style={styles.detail}>🚚 {shop.delivery_type}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  emoji: { fontSize: 36, marginRight: 12 },
  info: { flex: 1 },
  name: { fontSize: 16, fontWeight: 'bold', color: '#1B5E20' },
  category: { fontSize: 13, color: '#888', marginTop: 2, textTransform: 'capitalize' },
  right: { alignItems: 'flex-end' },
  rating: { fontSize: 13, color: '#F57F17', marginBottom: 4 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  footer: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  detail: { fontSize: 12, color: '#666' },
});