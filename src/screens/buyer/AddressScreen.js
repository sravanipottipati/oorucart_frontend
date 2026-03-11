import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, Alert,
} from 'react-native';

export default function AddressScreen({ navigation }) {
  const [addresses, setAddresses] = useState([
    {
      id: 1, type: 'Home', address: '12-3-456, Main Road, Nellore - 524001',
      isDefault: true,
    },
  ]);
  const [showForm, setShowForm]   = useState(false);
  const [newAddress, setNewAddress] = useState('');
  const [newType, setNewType]       = useState('Home');

  const ADDRESS_TYPES = ['Home', 'Work', 'Other'];

  const handleAdd = () => {
    if (!newAddress.trim()) {
      Alert.alert('Error', 'Please enter an address');
      return;
    }
    setAddresses(prev => [
      ...prev,
      {
        id: Date.now(),
        type: newType,
        address: newAddress,
        isDefault: prev.length === 0,
      },
    ]);
    setNewAddress('');
    setNewType('Home');
    setShowForm(false);
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Address', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => setAddresses(prev => prev.filter(a => a.id !== id)),
      },
    ]);
  };

  const handleSetDefault = (id) => {
    setAddresses(prev => prev.map(a => ({ ...a, isDefault: a.id === id })));
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)}>
          <Text style={styles.addBtn}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Add Address Form */}
        {showForm && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Add New Address</Text>

            {/* Type selector */}
            <View style={styles.typeRow}>
              {ADDRESS_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.typeBtn, newType === type && styles.typeBtnActive]}
                  onPress={() => setNewType(type)}
                >
                  <Text style={[styles.typeBtnText, newType === type && styles.typeBtnTextActive]}>
                    {type === 'Home' ? '🏠' : type === 'Work' ? '💼' : '📍'} {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.addressInput}
              placeholder="Enter full address"
              placeholderTextColor="#9CA3AF"
              value={newAddress}
              onChangeText={setNewAddress}
              multiline
              numberOfLines={3}
            />

            <View style={styles.formBtns}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowForm(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleAdd}>
                <Text style={styles.saveBtnText}>Save Address</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Address List */}
        {addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📍</Text>
            <Text style={styles.emptyTitle}>No addresses saved</Text>
            <Text style={styles.emptySubtitle}>Add a delivery address to get started</Text>
            <TouchableOpacity
              style={styles.addFirstBtn}
              onPress={() => setShowForm(true)}
            >
              <Text style={styles.addFirstBtnText}>+ Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map(item => (
            <View key={item.id} style={styles.addressCard}>
              <View style={styles.addressTop}>
                <View style={styles.addressTypeRow}>
                  <View style={styles.typeIconBox}>
                    <Text style={styles.typeIcon}>
                      {item.type === 'Home' ? '🏠' : item.type === 'Work' ? '💼' : '📍'}
                    </Text>
                  </View>
                  <Text style={styles.addressType}>{item.type}</Text>
                  {item.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Default</Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Text style={styles.deleteBtn}>🗑</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.addressText}>{item.address}</Text>

              {!item.isDefault && (
                <TouchableOpacity
                  style={styles.setDefaultBtn}
                  onPress={() => handleSetDefault(item.id)}
                >
                  <Text style={styles.setDefaultText}>Set as Default</Text>
                </TouchableOpacity>
              )}
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
  addBtn: { fontSize: 14, color: '#2563EB', fontWeight: '600' },

  formCard: {
    backgroundColor: '#fff', borderRadius: 16,
    margin: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  formTitle: { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 14 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  typeBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    borderWidth: 1.5, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB',
  },
  typeBtnActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  typeBtnText: { fontSize: 13, color: '#555' },
  typeBtnTextActive: { color: '#2563EB', fontWeight: '600' },
  addressInput: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 12, fontSize: 14, color: '#111',
    minHeight: 80, textAlignVertical: 'top',
    backgroundColor: '#F9FAFB', marginBottom: 14,
  },
  formBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 12, padding: 12, alignItems: 'center',
  },
  cancelBtnText: { fontSize: 14, color: '#555', fontWeight: '600' },
  saveBtn: {
    flex: 2, backgroundColor: '#2563EB',
    borderRadius: 12, padding: 12, alignItems: 'center',
  },
  saveBtnText: { fontSize: 14, color: '#fff', fontWeight: 'bold' },

  addressCard: {
    backgroundColor: '#fff', borderRadius: 16,
    marginHorizontal: 16, marginTop: 12, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  addressTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  addressTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typeIconBox: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center',
  },
  typeIcon: { fontSize: 16 },
  addressType: { fontSize: 14, fontWeight: 'bold', color: '#111' },
  defaultBadge: {
    backgroundColor: '#DCFCE7', borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  defaultText: { fontSize: 11, color: '#16A34A', fontWeight: '600' },
  deleteBtn: { fontSize: 18 },
  addressText: { fontSize: 13, color: '#555', lineHeight: 20, marginBottom: 10 },
  setDefaultBtn: {
    alignSelf: 'flex-start', borderWidth: 1.5, borderColor: '#2563EB',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
  },
  setDefaultText: { fontSize: 12, color: '#2563EB', fontWeight: '600' },

  emptyState: { alignItems: 'center', marginTop: 80, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 24 },
  addFirstBtn: {
    backgroundColor: '#2563EB', borderRadius: 14,
    paddingHorizontal: 32, paddingVertical: 14,
  },
  addFirstBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});