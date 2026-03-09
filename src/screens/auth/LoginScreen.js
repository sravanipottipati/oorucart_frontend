import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('buyer');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!phone || !password) return Alert.alert('Error', 'Please fill all fields');
    if (phone.length !== 10) return Alert.alert('Error', 'Enter a valid 10-digit number');
    setLoading(true);
    try {
      const user = await login(phone, password);
      if (user.user_type === 'buyer') navigation.replace('Home');
      else Alert.alert('Error', 'This app is for buyers only');
    } catch (e) {
      Alert.alert('Login Failed', 'Invalid phone number or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🏪</Text>
          <Text style={styles.logoText}>OoruCart</Text>
          <Text style={styles.logoSub}>Your neighbourhood store, online</Text>
        </View>

        {/* Buyer / Vendor Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'buyer' && styles.activeTab]}
            onPress={() => setActiveTab('buyer')}
          >
            <Text style={[styles.tabText, activeTab === 'buyer' && styles.activeTabText]}>
              Buyer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'vendor' && styles.activeTab]}
            onPress={() => setActiveTab('vendor')}
          >
            <Text style={[styles.tabText, activeTab === 'vendor' && styles.activeTabText]}>
              Seller
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Sign In</Text>

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Sign In</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>
              Don't have an account? <Text style={styles.linkBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>

          {activeTab === 'buyer' && (
            <TouchableOpacity style={styles.sellerLink}>
              <Text style={styles.sellerLinkText}>Are you a Seller? Login here</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  inner: { flexGrow: 1, alignItems: 'center', padding: 20, paddingTop: 60 },
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  logoIcon: { fontSize: 56, marginBottom: 8 },
  logoText: { fontSize: 28, fontWeight: 'bold', color: '#111', letterSpacing: 0.5 },
  logoSub: { fontSize: 13, color: '#888', marginTop: 4 },
  tabContainer: {
    flexDirection: 'row', backgroundColor: '#eee',
    borderRadius: 12, padding: 4, marginBottom: 24, width: '100%',
  },
  tab: {
    flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center',
  },
  activeTab: { backgroundColor: '#fff', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 3,
  },
  tabText: { fontSize: 15, color: '#888', fontWeight: '600' },
  activeTabText: { color: '#2E7D32', fontWeight: 'bold' },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    width: '100%', elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8,
  },
  title: { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 20 },
  label: { fontSize: 14, color: '#444', marginBottom: 6, fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 12,
    padding: 14, fontSize: 15, marginBottom: 16,
    backgroundColor: '#fafafa', color: '#111',
  },
  button: {
    backgroundColor: '#111', padding: 16, borderRadius: 12,
    alignItems: 'center', marginBottom: 16, marginTop: 4,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { textAlign: 'center', color: '#555', fontSize: 14, marginBottom: 12 },
  linkBold: { color: '#2E7D32', fontWeight: 'bold' },
  sellerLink: { alignItems: 'center', marginTop: 4 },
  sellerLinkText: { color: '#2E7D32', fontWeight: '600', fontSize: 14 },
});