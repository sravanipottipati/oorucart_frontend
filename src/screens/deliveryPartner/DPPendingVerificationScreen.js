import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function DPPendingVerificationScreen() {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => await logout() },
    ]);
  };

  return (
    <View style={styles.container}>
      <Ionicons name="time-outline" size={56} color="#f59e0b" />
      <Text style={styles.title}>Verification in Progress</Text>
      <Text style={styles.subtitle}>
        Thanks for submitting your documents. Our team is reviewing them — this usually
        takes 24-48 hours. We'll notify you once your account is approved.
      </Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginTop: 16, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 32 },
  logoutBtn: {
    borderWidth: 1, borderColor: '#1669ef', borderRadius: 10,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  logoutText: { color: '#1669ef', fontSize: 15, fontWeight: '700' },
});