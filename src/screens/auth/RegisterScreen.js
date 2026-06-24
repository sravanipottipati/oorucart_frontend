import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName]               = useState('');
  const [phone, setPhone]                     = useState('');
  const [password, setPassword]               = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [userType, setUserType]               = useState('buyer');
  const [loading, setLoading]                 = useState(false);
  const [agreedToTerms, setAgreedToTerms]     = useState(false); // ← NEW
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
    if (!agreedToTerms)
      return Alert.alert('Error', 'Please agree to Terms & Conditions and Privacy Policy');
    setLoading(true);
    let registrationSucceeded = false;
    try {
      await register(fullName, phone, password, userType === 'seller' ? 'vendor' : 'buyer');
      registrationSucceeded = true;
      if (userType === 'seller') {
        navigation.replace('VendorRegister');
      } else {
        navigation.replace('TownSelection');
      }
    } catch (e) {
      if (registrationSucceeded) {
        // Account was created successfully - this error happened only during navigation,
        // so don't confuse the user with a "registration failed" message
        console.log('Post-registration navigation error:', e.message);
      } else {
        const data = e.response?.data;
        const msg = data?.phone_number?.[0]
          || data?.error
          || (typeof data === 'object' && data ? Object.values(data).flat().join(' ') : null)
          || 'Registration failed. Please try again.';
        Alert.alert('Error', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.inner}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoSection}>
          <Image
            source={require('../../../assets/app-logo-full.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* Buyer / Seller Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, userType === 'buyer' && styles.toggleBtnActiveBuyer]}
            onPress={() => setUserType('buyer')}
          >
            <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
              <Ionicons name="cart-outline" size={16} color={userType === 'buyer' ? '#1669ef' : '#6B7280'} />
              <Text style={[styles.toggleText, userType === 'buyer' && styles.toggleTextActiveBuyer]}>Buyer</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, userType === 'seller' && styles.toggleBtnActiveSeller]}
            onPress={() => navigation.navigate('VendorRegister')}
          >
            <View style={{flexDirection:'row',alignItems:'center',gap:6}}>
              <Ionicons name="storefront-outline" size={16} color={userType === 'seller' ? '#16A34A' : '#6B7280'} />
              <Text style={[styles.toggleText, userType === 'seller' && styles.toggleTextActiveSeller]}>Seller</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Register Form */}
        <View style={styles.card}>
          <Text style={styles.title}>Create Buyer Account 🛒</Text>
          <Text style={styles.subtitle}>Order from local shops near you</Text>

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
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Min 6 characters"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Re-enter password"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirm(!showConfirm)}>
              <Text style={styles.eyeText}>{showConfirm ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          {/* ── T&C Checkbox ── */}
          <TouchableOpacity
            style={styles.checkboxRow}
            onPress={() => setAgreedToTerms(!agreedToTerms)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, agreedToTerms && styles.checkboxChecked]}>
              {agreedToTerms && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxText}>
              I agree to Univerin's{' '}
              <Text
                style={styles.checkboxLink}
                onPress={() => navigation.navigate('TermsAndConditions')}
              >
                Terms & Conditions
              </Text>
              {' '}and{' '}
              <Text
                style={styles.checkboxLink}
                onPress={() => navigation.navigate('PrivacyPolicy')}
              >
                Privacy Policy
              </Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, (loading || !agreedToTerms) && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading || !agreedToTerms}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Create Buyer Account</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>
              Already have an account?{' '}
              <Text style={styles.linkBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eff6ff' },
  inner:     { flexGrow: 1, alignItems: 'center', padding: 24, paddingTop: 60 },

  logoSection: {
    backgroundColor: '#ffffff', borderRadius: 24, padding: 24,
    alignItems: 'center', justifyContent: 'center',
    width: '100%', marginBottom: 24,
    borderWidth: 1.5, borderColor: '#dbeafe',
    shadowColor: '#1669ef', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  logoImage: { width: 220, height: 70 },

  toggleContainer: {
    flexDirection: 'row', backgroundColor: '#E5E7EB',
    borderRadius: 14, padding: 4,
    width: '100%', marginBottom: 20,
  },
  toggleBtn:              { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  toggleBtnActiveBuyer:   { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4 },
  toggleBtnActiveSeller:  { backgroundColor: '#fff', elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4 },
  toggleText:             { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  toggleTextActiveBuyer:  { color: '#1669ef', fontWeight: '700' },
  toggleTextActiveSeller: { color: '#16A34A', fontWeight: '700' },

  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 20,
    width: '100%', shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3, marginBottom: 16,
  },
  title:    { fontSize: 20, fontWeight: '700', color: '#111', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#888', marginBottom: 20 },
  label:    { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8 },

  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 12, backgroundColor: '#F9FAFB',
    marginBottom: 14, overflow: 'hidden',
  },
  inputPrefix: {
    paddingHorizontal: 12, fontSize: 14, color: '#555',
    borderRightWidth: 1, borderRightColor: '#E5E7EB', paddingVertical: 14,
  },
  input:     { flex: 1, padding: 14, fontSize: 15, color: '#111' },
  inputFull: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 14, fontSize: 15, marginBottom: 14,
    backgroundColor: '#F9FAFB', color: '#111',
  },
  passwordWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 12, backgroundColor: '#F9FAFB',
    marginBottom: 14, overflow: 'hidden',
  },
  passwordInput: { flex: 1, padding: 14, fontSize: 15, color: '#111' },
  eyeButton:     { paddingHorizontal: 14, paddingVertical: 14 },
  eyeText:       { fontSize: 13, color: '#1669ef', fontWeight: '600' },

  // Checkbox
  checkboxRow: {
    flexDirection: 'row', alignItems: 'flex-start',
    marginBottom: 16, gap: 10,
  },
  checkbox: {
    width: 22, height: 22, borderRadius: 6,
    borderWidth: 2, borderColor: '#D1D5DB',
    justifyContent: 'center', alignItems: 'center',
    marginTop: 1, flexShrink: 0,
  },
  checkboxChecked: { backgroundColor: '#1669ef', borderColor: '#1669ef' },
  checkmark:       { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  checkboxText:    { flex: 1, fontSize: 13, color: '#555', lineHeight: 20 },
  checkboxLink:    { color: '#1669ef', fontWeight: '600' },

  button: {
    backgroundColor: '#1669ef', padding: 16,
    borderRadius: 14, alignItems: 'center', marginBottom: 16, marginTop: 4,
  },
  buttonDisabled: { backgroundColor: '#bfdbfe' },
  buttonText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
  link:           { textAlign: 'center', color: '#555', fontSize: 14 },
  linkBold:       { color: '#1669ef', fontWeight: '700' },
});