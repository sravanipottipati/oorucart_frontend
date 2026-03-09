import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState('buyer');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!fullName || !phone || !password || !confirmPassword)
      return Alert.alert('Error', 'Please fill all fields');
    if (phone.length !== 10)
      return Alert.alert('Error', 'Enter a valid 10-digit number');
    if (password.length < 6)
      return Alert.alert('Error', 'Password must be at least 6 characters');
    if (password !== confirmPassword)
      return Alert.alert('Error', 'Passwords do not match');
    setLoading(true);
    try {
      await register(fullName, phone, password, 'buyer');
      navigation.replace('Home');
    } catch (e) {
      const msg = e.response?.data?.phone_number?.[0] || 'Registration failed';
      Alert.alert('Error', msg);
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

        {/* Buyer / Seller Tabs */}
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
          <Text style={styles.title}>Create Account</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Your full name"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="10-digit number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Min 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Re-enter password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Create Account</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>
              Already have an account? <Text style={styles.linkBold}>Sign In</Text>
            </Text>
          </TouchableOpacity>
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
  activeTab: {
    backgroundColor: '#fff', elevation: 2,
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
  link: { textAlign: 'center', color: '#555', fontSize: 14 },
  linkBold: { color: '#2E7D32', fontWeight: 'bold' },
});