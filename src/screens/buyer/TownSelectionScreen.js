import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, Alert,
} from 'react-native';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const POPULAR_TOWNS = [
  { name: 'Nellore',      state: 'Andhra Pradesh' },
  { name: 'Ongole',       state: 'Andhra Pradesh' },
  { name: 'Kadapa',       state: 'Andhra Pradesh' },
  { name: 'Kurnool',      state: 'Andhra Pradesh' },
  { name: 'Tirupati',     state: 'Andhra Pradesh' },
  { name: 'Vizianagaram', state: 'Andhra Pradesh' },
  { name: 'Eluru',        state: 'Andhra Pradesh' },
  { name: 'Machilipatnam',state: 'Andhra Pradesh' },
  { name: 'Warangal',     state: 'Telangana' },
  { name: 'Karimnagar',   state: 'Telangana' },
  { name: 'Nizamabad',    state: 'Telangana' },
  { name: 'Khammam',      state: 'Telangana' },
  { name: 'Rajahmundry',  state: 'Andhra Pradesh' },
  { name: 'Kakinada',     state: 'Andhra Pradesh' },
  { name: 'Anantapur',    state: 'Andhra Pradesh' },
];

export default function TownSelectionScreen({ navigation }) {
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState('');
  const [loading, setLoading]     = useState(false);
  const { user, login }           = useAuth();

  const filtered = POPULAR_TOWNS.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleConfirm = async () => {
    const town = selected || search.trim();
    if (!town) {
      Alert.alert('Select Town', 'Please select or type your town');
      return;
    }
    setLoading(true);
    try {
      const res = await client.patch('/users/profile/', { town });
      // Update stored user with town
      const updatedUser = { ...user, town };
      await require('@react-native-async-storage/async-storage').default
        .setItem('user', JSON.stringify(updatedUser));
      navigation.replace('Home');
    } catch (e) {
      console.log('Town update error:', e.message);
      navigation.replace('Home');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerEmoji}>📍</Text>
        <Text style={styles.headerTitle}>Select Your Town</Text>
        <Text style={styles.headerSubtitle}>
          We'll show you shops and products available in your town
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search your town..."
          placeholderTextColor="#9CA3AF"
          value={search}
          onChangeText={t => { setSearch(t); setSelected(''); }}
          autoFocus
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => { setSearch(''); setSelected(''); }}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Selected Banner */}
      {selected ? (
        <View style={styles.selectedBanner}>
          <Text style={styles.selectedText}>📍 {selected} selected</Text>
        </View>
      ) : null}

      {/* Town List */}
      <ScrollView style={styles.townList} showsVerticalScrollIndicator={false}>
        <Text style={styles.listTitle}>Popular Towns</Text>
        {filtered.map(town => (
          <TouchableOpacity
            key={town.name}
            style={[styles.townItem, selected === town.name && styles.townItemActive]}
            onPress={() => { setSelected(town.name); setSearch(town.name); }}
          >
            <View style={styles.townLeft}>
              <Text style={styles.townIcon}>🏘</Text>
              <View>
                <Text style={[styles.townName, selected === town.name && styles.townNameActive]}>
                  {town.name}
                </Text>
                <Text style={styles.townState}>{town.state}</Text>
              </View>
            </View>
            {selected === town.name && (
              <Text style={styles.checkmark}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmBtn, !selected && !search.trim() && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={loading}
        >
          <Text style={styles.confirmBtnText}>
            {loading ? 'Saving...' : `Confirm — ${selected || search.trim() || 'Select a town'}`}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  header: {
    alignItems: 'center', paddingTop: 60,
    paddingBottom: 24, paddingHorizontal: 24,
    backgroundColor: '#EFF6FF',
  },
  headerEmoji:    { fontSize: 48, marginBottom: 12 },
  headerTitle:    { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 8 },
  headerSubtitle: { fontSize: 14, color: '#555', textAlign: 'center', lineHeight: 20 },

  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F3F4F6', borderRadius: 12,
    margin: 16, padding: 12,
  },
  searchIcon:  { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: '#111' },
  clearBtn:    { fontSize: 16, color: '#888', paddingHorizontal: 4 },

  selectedBanner: {
    backgroundColor: '#DCFCE7', marginHorizontal: 16,
    borderRadius: 10, padding: 10, marginBottom: 4,
  },
  selectedText: { fontSize: 14, color: '#16A34A', fontWeight: '600', textAlign: 'center' },

  townList:  { flex: 1, paddingHorizontal: 16 },
  listTitle: { fontSize: 13, color: '#888', fontWeight: '600', marginBottom: 8, marginTop: 4 },

  townItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14, paddingHorizontal: 16,
    borderRadius: 12, marginBottom: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5, borderColor: '#F3F4F6',
  },
  townItemActive: { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  townLeft:       { flexDirection: 'row', alignItems: 'center', gap: 12 },
  townIcon:       { fontSize: 20 },
  townName:       { fontSize: 15, fontWeight: '600', color: '#111' },
  townNameActive: { color: '#2563EB' },
  townState:      { fontSize: 12, color: '#888', marginTop: 2 },
  checkmark:      { fontSize: 18, color: '#2563EB', fontWeight: 'bold' },

  footer: {
    padding: 16, paddingBottom: 36,
    backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  confirmBtn: {
    backgroundColor: '#2563EB', borderRadius: 14,
    padding: 16, alignItems: 'center',
  },
  confirmBtnDisabled: { backgroundColor: '#93C5FD' },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
