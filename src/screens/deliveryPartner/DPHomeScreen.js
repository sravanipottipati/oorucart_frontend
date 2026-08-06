import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function DPHomeScreen() {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: async () => await logout() },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome, Delivery Partner</Text>
      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 18, fontWeight: '600', marginBottom: 24 },
  logoutBtn: {
    borderWidth: 1, borderColor: '#1669ef', borderRadius: 10,
    paddingHorizontal: 24, paddingVertical: 12,
  },
  logoutText: { color: '#1669ef', fontSize: 15, fontWeight: '700' },
});
