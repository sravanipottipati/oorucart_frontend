import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, ActivityIndicator, Alert,
} from 'react-native';
import client from '../../api/client';

export default function VendorAddProductScreen({ navigation, route }) {
  const { onGoBack } = route.params || {};

  const [name, setName]           = useState('');
  const [price, setPrice]         = useState('');
  const [description, setDesc]    = useState('');
  const [loading, setLoading]     = useState(false);

  const handleAdd = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Please enter product name'); return; }
    if (!price.trim()) { Alert.alert('Error', 'Please enter price'); return; }
    setLoading(true);
    try {
      await client.post('/vendors/products/add/', {
        name: name.trim(),
        price: parseFloat(price),
        description: description.trim(),
        is_available: true,
      });
      Alert.alert('✅ Success', 'Product added successfully!', [
        {
          text: 'OK', onPress: () => {
            if (onGoBack) onGoBack();
            navigation.goBack();
          },
        },
      ]);
    } catch (e) {
      const msg = e.response?.data?.error || 'Failed to add product';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Product</Text>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => navigation.navigate('VendorNotifications')}
        >
          <Text style={styles.bellIcon}>🔔</Text>
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

          <Text style={styles.fieldLabel}>Price (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter product price"
            placeholderTextColor="#9CA3AF"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

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

        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleAdd}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.addBtnText}>Add to Products</Text>
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
  bellBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  bellIcon: { fontSize: 22 },

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

  footer: {
    padding: 16, paddingBottom: 30, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  addBtn: {
    backgroundColor: '#2563EB', borderRadius: 14,
    padding: 16, alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});