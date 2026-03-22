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
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
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
      <ScrollView
        contentContainerStyle={styles.inner}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── LOGO CARD ── */}
        <View style={styles.logoCard}>
          <View style={styles.decCircle1} />
          <View style={styles.decCircle2} />

          {/* U Icon Box */}
          <View style={styles.iconBox}>
            <Text style={styles.iconText}>U</Text>
          </View>

          {/* App Name */}
          <Text style={styles.logoText}>
            <Text style={styles.logoTextTeal}>Uni</Text>
            <Text style={styles.logoTextWhite}>verin</Text>
          </Text>

          <Text style={styles.logoTagline}>Your local shops, delivered</Text>
        </View>

        {/* ── BUYER / SELLER TOGGLE ── */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleBtn, userType === 'buyer' && styles.toggleBtnActiveBuyer]}
            onPress={() => setUserType('buyer')}
          >
            <Text style={[styles.toggleText, userType === 'buyer' && styles.toggleTextActiveBuyer]}>
              🛒  Buyer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, userType === 'seller' && styles.toggleBtnActiveSeller]}
            onPress={() => navigation.navigate('VendorRegister')}
          >
            <Text style={[styles.toggleText, userType === 'seller' && styles.toggleTextActiveSeller]}>
              🏪  Seller
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── REGISTER FORM ── */}
        <View style={styles.card}>
          <Text style={styles.title}>Create Buyer Account 🛒</Text>
          <Text style={styles.subtitle}>Order from local shops near you</Text>

          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.inputFull}
            placeholder="Enter your full name"
            placeholderTextColor="#9CA3AF"
            value={fullName}
            onChangeText={setFullName}
          />

          {/* Phone Number */}
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

          {/* Password */}
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
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.eyeText}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Confirm Password */}
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
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirm(!showConfirm)}
            >
              <Text style={styles.eyeText}>
                {showConfirm ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Create Buyer Account</Text>
            }
          </TouchableOpacity>

          {/* Login Link */}
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>
              Already have an account?{' '}
              <Text style={styles.linkBold}>Login</Text>
            </Text>
          </TouchableOpacity>

        </View>

        <Text style={styles.footer}>
          By signing up, you agree to Univerin's Terms of Service
        </Text>
        <View style={{ height: 40 }} />

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({

  // ── Layout ──
  container: {
    flex: 1,
    backgroundColor: '#f0fdfa',
  },
  inner: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
  },

  // ── Logo Card ──
  logoCard: {
    backgroundColor: '#0d9488',
    borderRadius: 28,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  decCircle1: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0f766e',
    top: -25,
    right: -15,
    opacity: 0.5,
  },
  decCircle2: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#115e59',
    bottom: -15,
    left: -10,
    opacity: 0.4,
  },

  // ── Icon Box ──
  iconBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconText: {
    fontSize: 30,
    fontWeight: '900',
    color: '#0d9488',
  },

  // ── Logo Text ──
  logoText: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -1,
    marginBottom: 4,
  },
  logoTextTeal: {
    color: '#99f6e4',
  },
  logoTextWhite: {
    color: 'white',
  },
  logoTagline: {
    fontSize: 12,
    color: '#99f6e4',
    letterSpacing: 0.3,
  },

  // ── Toggle ──
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 14,
    padding: 4,
    width: '100%',
    marginBottom: 20,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtnActiveBuyer: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  toggleBtnActiveSeller: {
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  toggleTextActiveBuyer: {
    color: '#0d9488',
    fontWeight: '700',
  },
  toggleTextActiveSeller: {
    color: '#16A34A',
    fontWeight: '700',
  },

  // ── Card ──
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#888',
    marginBottom: 20,
  },

  // ── Form ──
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#444',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 14,
    overflow: 'hidden',
  },
  inputPrefix: {
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#555',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
    paddingVertical: 14,
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: '#111',
  },
  inputFull: {
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    marginBottom: 14,
    backgroundColor: '#F9FAFB',
    color: '#111',
  },

  // ── Password ──
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 14,
    overflow: 'hidden',
  },
  passwordInput: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: '#111',
  },
  eyeButton: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  eyeText: {
    fontSize: 13,
    color: '#0d9488',
    fontWeight: '600',
  },

  // ── Button ──
  button: {
    backgroundColor: '#0d9488',
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  buttonDisabled: {
    backgroundColor: '#99f6e4',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // ── Links ──
  link: {
    textAlign: 'center',
    color: '#555',
    fontSize: 14,
  },
  linkBold: {
    color: '#0d9488',
    fontWeight: '700',
  },

  // ── Footer ──
  footer: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});