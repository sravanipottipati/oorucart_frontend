import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import client from '../../api/client';

export default function VendorEditProductScreen({ navigation, route }) {
  const { product, onGoBack } = route.params || {};

  const [name, setName]         = useState(product?.name || '');
  const [price, setPrice]       = useState(product?.price?.toString() || '');
  const [description, setDesc]  = useState(product?.description || '');
  const [isAvailable, setAvail] = useState(product?.is_available ?? true);
  const [loading, setLoading]   = useState(false);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Please enter product name'); return; }
    if (!price.trim()) { Alert.alert('Error', 'Please enter price'); return; }
    setLoading(true);
    try {
      await client.patch(`/vendors/products/${product.id}/`, {
        name: name.trim(),
        price: parseFloat(price),
        description: description.trim(),
        is_available: isAvailable,
      });
      Alert.alert('✅ Success', 'Product updated successfully!', [
        {
          text: 'OK', onPress: () => {
            if (onGoBack) onGoBack();
            navigation.goBack();
          },
        },
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to update product. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Product', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await client.delete(`/vendors/products/${product.id}/`);
            if (onGoBack) onGoBack();
            navigation.goBack();
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Product</Text>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Text style={styles.deleteIcon}>🗑</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>

          <Text style={styles.fieldLabel}>Product Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter product name"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
          />

          <View style={styles.rowFields}>
            <View style={styles.halfField}>
              <Text style={styles.fieldLabel}>Price (₹)</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.fieldLabel}>Description <Text style={styles.optional}>(Optional)</Text></Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter product description"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDesc}
            multiline
            numberOfLines={3}
          />

          {/* Available Toggle */}
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Available in Stock</Text>
              <Text style={styles.toggleSub}>
                {isAvailable ? 'Customers can order this' : 'Hidden from customers'}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.toggleBtn, isAvailable && styles.toggleBtnActive]}
              onPress={() => setAvail(!isAvailable)}
            >
              <View style={[styles.toggleThumb, isAvailable && styles.toggleThumbActive]} />
            </TouchableOpacity>
          </View>

        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.saveBtn}
          onPress={handleSave}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>Save Changes</Text>
          }
        </TouchableOpacity>
      </View>

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
  deleteBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  deleteIcon: { fontSize: 22 },

  formCard: {
    backgroundColor: '#fff', borderRadius: 16,
    margin: 16, padding: 16,
  },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 14 },
  optional: { fontSize: 12, color: '#9CA3AF', fontWeight: 'normal' },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 12, fontSize: 14, color: '#111', backgroundColor: '#F9FAFB',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  rowFields: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },

  toggleRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 20, paddingTop: 16,
    borderTopWidth: 1, borderTopColor: '#F5F5F5',
  },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 2 },
  toggleSub: { fontSize: 12, color: '#888' },
  toggleBtn: {
    width: 48, height: 28, borderRadius: 14,
    backgroundColor: '#E5E7EB', padding: 3,
    justifyContent: 'center',
  },
  toggleBtnActive: { backgroundColor: '#2563EB' },
  toggleThumb: {
    width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2, shadowRadius: 2, elevation: 2,
  },
  toggleThumbActive: { alignSelf: 'flex-end' },

  footer: {
    padding: 16, paddingBottom: 30, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  saveBtn: {
    backgroundColor: '#2563EB', borderRadius: 14,
    padding: 16, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});