import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function ProductCard({ product, quantity, onAdd, onRemove }) {
  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.name}>{product.name}</Text>
        {product.description ? (
          <Text style={styles.desc}>{product.description}</Text>
        ) : null}
        <Text style={styles.price}>₹{product.price}</Text>
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
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '600', color: '#222' },
  desc: { fontSize: 12, color: '#888', marginTop: 2 },
  price: { fontSize: 15, fontWeight: 'bold', color: '#2E7D32', marginTop: 4 },
  qtyControl: { marginLeft: 12 },
  addBtn: {
    borderWidth: 1.5,
    borderColor: '#2E7D32',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  addBtnText: { color: '#2E7D32', fontWeight: 'bold', fontSize: 13 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  qtyBtn: {
    backgroundColor: '#2E7D32',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  qtyText: { fontSize: 16, fontWeight: 'bold', minWidth: 20, textAlign: 'center' },
});