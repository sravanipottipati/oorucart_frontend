import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName]               = useState('');
  const [phone, setPhone]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType]               = useState('buyer');
  const [loading, setLoading]                 = useState(false);
  const { register }                          = useAuth();

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
      navigation.replace('TownSelection');
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
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>

        {/* ── LOGO ── */}
        <View style={styles.logoCard}>
          <View style={styles.decCircle1} />
          <View style={styles.decCircle2} />
          <View style={styles.iconBox}>
            <Text style={styles.iconText}>S</Text>
          </View>
          <Text style={styles.logoText}>Shop2me</Text>
          <Text style={styles.logoTagline}>Your local shops, delivered</Text>
        </View>

        {/* ── REGISTER CARD ── */}
        <View style={styles.card}>
          <Text style={styles.title}>Create Account 🎉</Text>
          <Text style={styles.subtitle}>Join Shop2me today</Text>

          {/* ── USER TYPE SELECTOR ── */}
          <View style={styles.userTypeRow}>
            <TouchableOpacity
              style={[styles.userTypeBtn, userType === 'buyer' && styles.userTypeBtnActive]}
              onPress={() => setUserType('buyer')}
            >
              <Text style={styles.userTypeEmoji}>🛒</Text>
              <Text style={[styles.userTypeText, userType === 'buyer' && styles.userTypeTextActive]}>
                Buyer
              </Text>
              <Text style={[styles.userTypeDesc, userType === 'buyer' && { color: '#2563EB' }]}>
                Order from shops
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.userTypeBtn, styles.userTypeBtnVendor]}
              onPress={() => navigation.navigate('VendorRegister')}
            >
              <Text style={styles.userTypeEmoji}>🏪</Text>
              <Text style={styles.userTypeTextVendor}>Seller</Text>
              <Text style={styles.userTypeDescVendor}>Sell your products</Text>
              <View style={styles.vendorArrow}>
                <Text style={styles.vendorArrowText}>5-step setup →</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* ── BUYER FORM ── */}
          <Text style={styles.formNote}>
            Fill details below to create your Buyer account
          </Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.inputFull}
            placeholder="Enter your full name"
            placeholderTextColor="#9CA3AF"
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputPrefix}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="10-digit number"
              placeholderTextColor="#9CA3AF"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.inputFull}
            placeholder="Min 6 characters"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.inputFull}
            placeholder="Re-enter password"
            placeholderTextColor="#9CA3AF"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          {/* ── SUBMIT ── */}
          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Create Buyer Account →</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>
              Already have an account? <Text style={styles.linkBold}>Login</Text>
            </Text>
          </TouchableOpacity>

        </View>

        <Text style={styles.footer}>
          By signing up, you agree to Shop2me's Terms of Service
        </Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  inner: { flexGrow: 1, alignItems: 'center', padding: 24, paddingTop: 60 },

  // Logo
  logoCard: {
    backgroundColor: '#2563EB', borderRadius: 28,
    padding: 24, alignItems: 'center', width: '100%',
    marginBottom: 24, overflow: 'hidden', position: 'relative',
  },
  decCircle1: {
    position: 'absolute', width: 100, height: 100,
    borderRadius: 50, backgroundColor: '#1D4ED8',
    top: -25, right: -15, opacity: 0.5,
  },
  decCircle2: {
    position: 'absolute', width: 70, height: 70,
    borderRadius: 35, backgroundColor: '#1E40AF',
    bottom: -15, left: -10, opacity: 0.4,
  },
  iconBox: {
    width: 60, height: 60, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  iconText:    { fontSize: 30, fontWeight: '900', color: '#2563EB' },
  logoText:    { fontSize: 30, fontWeight: '700', color: 'white', letterSpacing: -1, marginBottom: 4 },
  logoTagline: { fontSize: 12, color: '#BFDBFE', letterSpacing: 0.3 },

  // Card
  card: {
    backgroundColor: '#fff', borderRadius: 24,
    padding: 24, width: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  title:    { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 20 },

  // User Type Selector
  userTypeRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  userTypeBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 14, padding: 14, alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  userTypeBtnActive:   { borderColor: '#2563EB', backgroundColor: '#EFF6FF' },
  userTypeBtnVendor:   { borderColor: '#16A34A', backgroundColor: '#F0FDF4' },
  userTypeEmoji:       { fontSize: 26, marginBottom: 6 },
  userTypeText:        { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 2 },
  userTypeTextActive:  { color: '#2563EB' },
  userTypeTextVendor:  { fontSize: 15, fontWeight: '700', color: '#16A34A', marginBottom: 2 },
  userTypeDesc:        { fontSize: 11, color: '#888', textAlign: 'center' },
  userTypeDescVendor:  { fontSize: 11, color: '#16A34A', textAlign: 'center', marginBottom: 6 },
  vendorArrow: {
    backgroundColor: '#16A34A', borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 3, marginTop: 4,
  },
  vendorArrowText: { fontSize: 10, color: 'white', fontWeight: '600' },

  // Form note
  formNote: {
    fontSize: 12, color: '#2563EB', backgroundColor: '#EFF6FF',
    padding: 10, borderRadius: 10, marginBottom: 16,
    textAlign: 'center', fontWeight: '500',
  },

  // Form
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8 },

  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
    backgroundColor: '#F9FAFB', marginBottom: 16, overflow: 'hidden',
  },
  inputPrefix: {
    paddingHorizontal: 12, fontSize: 14, color: '#555',
    borderRightWidth: 1, borderRightColor: '#E5E7EB', paddingVertical: 14,
  },
  input: { flex: 1, padding: 14, fontSize: 15, color: '#111' },

  inputFull: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 14, fontSize: 15, marginBottom: 16,
    backgroundColor: '#F9FAFB', color: '#111',
  },

  button: {
    backgroundColor: '#2563EB', padding: 16, borderRadius: 14,
    alignItems: 'center', marginBottom: 16, marginTop: 4,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  link:     { textAlign: 'center', color: '#555', fontSize: 14 },
  linkBold: { color: '#2563EB', fontWeight: '700' },

  footer: {
    fontSize: 11, color: '#9CA3AF',
    marginTop: 20, textAlign: 'center', paddingHorizontal: 32,
  },
});