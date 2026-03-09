import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ProductCard({ product, quantity, onAdd, onRemove }) {
  return (
    <View style={styles.card}>
      {/* Left — Info */}
      <View style={styles.info}>
        <Text style={styles.name}>{product.name}</Text>
        {product.description ? (
          <Text style={styles.desc}>{product.description}</Text>
        ) : null}
        <Text style={styles.price}>₹{product.price}</Text>
      </View>

      {/* Right — Image placeholder + Add button */}
      <View style={styles.right}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>🛒</Text>
        </View>
        <View style={styles.qtyControl}>
          {quantity === 0 ? (
            <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
              <Text style={styles.addBtnText}>ADD</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.qtyRow}>
              <TouchableOpacity style={styles.qtyBtn} onPress={onRemove}>
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={onAdd}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 16,
    marginBottom: 12, flexDirection: 'row',
    alignItems: 'center', elevation: 1,
    borderWidth: 1, borderColor: '#f0f0f0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 4,
  },
  info: { flex: 1, paddingRight: 12 },
  name: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 4 },
  desc: { fontSize: 12, color: '#888', marginBottom: 6, lineHeight: 18 },
  price: { fontSize: 16, fontWeight: 'bold', color: '#111' },
  right: { alignItems: 'center', gap: 10 },
  imagePlaceholder: {
    width: 70, height: 70, borderRadius: 12,
    backgroundColor: '#f5f5f5', justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  imagePlaceholderText: { fontSize: 30 },
  qtyControl: { alignItems: 'center' },
  addBtn: {
    borderWidth: 1.5, borderColor: '#111',
    borderRadius: 8, paddingHorizontal: 18, paddingVertical: 6,
  },
  addBtnText: { color: '#111', fontWeight: 'bold', fontSize: 13 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  qtyBtn: {
    backgroundColor: '#111', width: 28, height: 28,
    borderRadius: 8, justifyContent: 'center', alignItems: 'center',
  },
  qtyBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  qtyText: { fontSize: 16, fontWeight: 'bold', minWidth: 20, textAlign: 'center', color: '#111' },
});