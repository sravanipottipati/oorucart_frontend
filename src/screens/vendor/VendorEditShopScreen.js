import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../../api/client';

export default function VendorEditShopScreen({ navigation, route }) {
  const { shop } = route.params || {};
  const [shopName, setShopName] = useState(shop?.shop_name || '');
  const [address, setAddress] = useState(shop?.address || '');
  const [town, setTown] = useState(shop?.town || '');
  const [phone, setPhone] = useState(shop?.phone_number || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!shopName.trim()) { Alert.alert('Error', 'Shop name is required'); return; }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      await client.patch('/vendors/myshop/', {
        shop_name: shopName.trim(),
        address: address.trim(),
        town: town.trim(),
        phone_number: phone.trim(),
      }, { headers: { Authorization: `Bearer ${token}` } });
      Alert.alert('✅ Updated!', 'Shop details updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to update shop');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Shop Details</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.label}>Shop Name *</Text>
          <TextInput style={styles.input} value={shopName} onChangeText={setShopName} placeholder="Enter shop name" />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Enter phone number" keyboardType="phone-pad" />

          <Text style={styles.label}>Address</Text>
          <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Enter address" />

          <Text style={styles.label}>Town</Text>
          <TextInput style={styles.input} value={town} onChangeText={setTown} placeholder="Enter town" />
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#111' },
  card: { backgroundColor: '#fff', borderRadius: 16, margin: 16, padding: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 14, color: '#111', backgroundColor: '#F9FAFB' },
  footer: { padding: 16, paddingBottom: 30, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  saveBtn: { backgroundColor: '#1669ef', borderRadius: 14, padding: 16, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
