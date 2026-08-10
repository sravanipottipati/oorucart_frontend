import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

export default function DPHomeScreen() {
  const { logout } = useAuth();
  const [isOnline, setIsOnline] = useState(false);
  const [toggling, setToggling] = useState(false);

  const handleToggle = async (value) => {
    setToggling(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      await client.post(
        '/dp/duty/toggle/',
        { is_online: value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsOnline(value);
    } catch (e) {
      Alert.alert('Error', 'Failed to update status. Please try again.');
    } finally {
      setToggling(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => await logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.statusCard}>
        <View style={[styles.statusDot, isOnline ? styles.dotOnline : styles.dotOffline]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.statusLabel}>{isOnline ? 'You are Online' : 'You are Offline'}</Text>
          <Text style={styles.statusSubtext}>
            {isOnline ? 'Ready to receive orders' : 'Turn on to start receiving orders'}
          </Text>
        </View>
        <Switch
          value={isOnline}
          onValueChange={handleToggle}
          disabled={toggling}
          trackColor={{ false: '#D1D5DB', true: '#86efac' }}
          thumbColor={isOnline ? '#16a34a' : '#f4f3f4'}
        />
      </View>

      <View style={styles.placeholderArea}>
        <Ionicons name="bicycle-outline" size={48} color="#D1D5DB" />
        <Text style={styles.placeholderText}>
          {isOnline ? 'Waiting for orders...' : 'Go online to start receiving orders'}
        </Text>
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 60 },
  statusCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 14, padding: 16,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  dotOnline: { backgroundColor: '#16a34a' },
  dotOffline: { backgroundColor: '#9CA3AF' },
  statusLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  statusSubtext: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  placeholderArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  placeholderText: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', paddingHorizontal: 40 },
  logoutBtn: {
    borderWidth: 1, borderColor: '#1669ef', borderRadius: 10,
    paddingHorizontal: 24, paddingVertical: 12, alignItems: 'center', marginBottom: 20,
  },
  logoutText: { color: '#1669ef', fontSize: 15, fontWeight: '700' },
});