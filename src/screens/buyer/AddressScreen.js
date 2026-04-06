import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, Modal, TextInput,
} from 'react-native';
import client from '../../api/client';

const LABELS = ['Home', 'Work', 'Other'];

export default function AddressScreen({ navigation }) {
  const [addresses, setAddresses]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [modalVisible, setModal]    = useState(false);
  const [editAddress, setEdit]      = useState(null);
  const [label, setLabel]           = useState('Home');
  const [fullAddress, setFullAddr]  = useState('');
  const [town, setTown]             = useState('');
  const [pincode, setPincode]       = useState('');
  const [saving, setSaving]         = useState(false);

  const fetchAddresses = async () => {
    try {
      const res = await client.get('/users/addresses/');
      setAddresses(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.log('Error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAddresses(); }, []);

  const openAdd = () => {
    setEdit(null);
    setLabel('Home');
    setFullAddr('');
    setTown('');
    setPincode('');
    setModal(true);
  };

  const openEdit = (addr) => {
    setEdit(addr);
    setLabel(addr.label);
    setFullAddr(addr.full_address);
    setTown(addr.town);
    setPincode(addr.pincode || '');
    setModal(true);
  };

  const handleSave = async () => {
    if (!fullAddress.trim()) { Alert.alert('Error', 'Please enter address'); return; }
    if (!town.trim())        { Alert.alert('Error', 'Please enter town'); return; }
    setSaving(true);
    try {
      if (editAddress) {
        await client.patch(`/users/addresses/${editAddress.id}/`, {
          label, full_address: fullAddress, town, pincode,
        });
      } else {
        await client.post('/users/addresses/', {
          label, full_address: fullAddress, town, pincode,
        });
      }
      setModal(false);
      fetchAddresses();
    } catch (e) {
      Alert.alert('Error', 'Could not save address');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (addr) => {
    Alert.alert('Delete Address', `Delete "${addr.label}" address?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          try {
            await client.delete(`/users/addresses/${addr.id}/`);
            fetchAddresses();
          } catch (e) {
            Alert.alert('Error', 'Could not delete address');
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (addr) => {
    try {
      await client.post(`/users/addresses/${addr.id}/default/`);
      fetchAddresses();
    } catch (e) {
      Alert.alert('Error', 'Could not set default');
    }
  };

  const labelIcon = (l) => l === 'Home' ? '🏠' : l === 'Work' ? '💼' : '📍';

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Addresses</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Text style={styles.addBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1669ef" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>

          {addresses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📍</Text>
              <Text style={styles.emptyTitle}>No addresses saved</Text>
              <Text style={styles.emptySubtitle}>Add your delivery address</Text>
              <TouchableOpacity style={styles.addFirstBtn} onPress={openAdd}>
                <Text style={styles.addFirstBtnText}>+ Add Address</Text>
              </TouchableOpacity>
            </View>
          ) : (
            addresses.map(addr => (
              <View key={addr.id} style={[styles.addressCard, addr.is_default && styles.addressCardDefault]}>
                <View style={styles.cardTop}>
                  <View style={styles.labelRow}>
                    <Text style={styles.labelIcon}>{labelIcon(addr.label)}</Text>
                    <Text style={styles.labelText}>{addr.label}</Text>
                    {addr.is_default && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultBadgeText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.cardActions}>
                    <TouchableOpacity onPress={() => openEdit(addr)} style={styles.editBtn}>
                      <Text style={styles.editBtnText}>✏️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(addr)} style={styles.deleteBtn}>
                      <Text style={styles.deleteBtnText}>🗑</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <Text style={styles.addressText}>{addr.full_address}</Text>
                <Text style={styles.townText}>{addr.town}{addr.pincode ? ` - ${addr.pincode}` : ''}</Text>
                {!addr.is_default && (
                  <TouchableOpacity
                    style={styles.setDefaultBtn}
                    onPress={() => handleSetDefault(addr)}
                  >
                    <Text style={styles.setDefaultText}>Set as Default</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editAddress ? 'Edit Address' : 'Add New Address'}
              </Text>
              <TouchableOpacity onPress={() => setModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Label Selector */}
            <Text style={styles.fieldLabel}>Label</Text>
            <View style={styles.labelSelector}>
              {LABELS.map(l => (
                <TouchableOpacity
                  key={l}
                  style={[styles.labelChip, label === l && styles.labelChipActive]}
                  onPress={() => setLabel(l)}
                >
                  <Text style={[styles.labelChipText, label === l && styles.labelChipTextActive]}>
                    {labelIcon(l)} {l}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Full Address</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="House no, Street, Area"
              placeholderTextColor="#9CA3AF"
              value={fullAddress}
              onChangeText={setFullAddr}
              multiline
              numberOfLines={3}
            />

            <View style={styles.rowFields}>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Town</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Town"
                  placeholderTextColor="#9CA3AF"
                  value={town}
                  onChangeText={setTown}
                />
              </View>
              <View style={styles.halfField}>
                <Text style={styles.fieldLabel}>Pincode</Text>
                <TextInput
                  style={styles.input}
                  placeholder="524001"
                  placeholderTextColor="#9CA3AF"
                  value={pincode}
                  onChangeText={setPincode}
                  keyboardType="numeric"
                  maxLength={6}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleSave}
              disabled={saving}
            >
              {saving
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.saveBtnText}>
                    {editAddress ? 'Save Changes' : 'Add Address'}
                  </Text>
              }
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  addBtn: {
    backgroundColor: '#1669ef', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  addBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#888', marginBottom: 24 },
  addFirstBtn: {
    backgroundColor: '#1669ef', borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  addFirstBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  addressCard: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  addressCardDefault: { borderWidth: 1.5, borderColor: '#1669ef' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  labelIcon: { fontSize: 18 },
  labelText: { fontSize: 14, fontWeight: 'bold', color: '#111' },
  defaultBadge: {
    backgroundColor: '#eff6ff', borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  defaultBadgeText: { fontSize: 11, color: '#1669ef', fontWeight: '600' },
  cardActions: { flexDirection: 'row', gap: 8 },
  editBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center',
  },
  editBtnText: { fontSize: 14 },
  deleteBtn: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center',
  },
  deleteBtnText: { fontSize: 14 },
  addressText: { fontSize: 14, color: '#111', lineHeight: 20, marginBottom: 4 },
  townText: { fontSize: 13, color: '#888', marginBottom: 10 },
  setDefaultBtn: {
    alignSelf: 'flex-start', borderWidth: 1, borderColor: '#1669ef',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 5,
  },
  setDefaultText: { fontSize: 12, color: '#1669ef', fontWeight: '600' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalBox: {
    backgroundColor: '#fff', borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 20, paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 16,
  },
  modalTitle: { fontSize: 17, fontWeight: 'bold', color: '#111' },
  modalClose: { fontSize: 20, color: '#9CA3AF' },

  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 12, fontSize: 14, color: '#111', backgroundColor: '#F9FAFB',
  },
  textArea: { minHeight: 70, textAlignVertical: 'top' },
  rowFields: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },

  labelSelector: { flexDirection: 'row', gap: 8 },
  labelChip: {
    flex: 1, borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 10, padding: 10, alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  labelChipActive: { borderColor: '#1669ef', backgroundColor: '#eff6ff' },
  labelChipText: { fontSize: 13, color: '#555', fontWeight: '500' },
  labelChipTextActive: { color: '#1669ef', fontWeight: 'bold' },

  saveBtn: {
    backgroundColor: '#1669ef', borderRadius: 14,
    padding: 16, alignItems: 'center', marginTop: 20,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});