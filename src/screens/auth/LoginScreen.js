import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]           = useState(false);
  const { login }                       = useAuth();

  const handleLogin = async () => {
    if (!phone || !password) return Alert.alert('Error', 'Please fill all fields');
    if (phone.length !== 10) return Alert.alert('Error', 'Enter a valid 10-digit number');
    setLoading(true);
    try {
      const user = await login(phone, password);
      if (user.user_type === 'vendor') {
        navigation.replace('VendorHome');
      } else if (user.user_type === 'buyer') {
        if (!user.town) {
          navigation.replace('TownSelection');
        } else {
          navigation.replace('Home');
        }
      } else {
        Alert.alert('Error', 'Unknown account type');
      }
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
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>

        {/* ── LOGO SECTION — white background so name shows clearly ── */}
        <View style={styles.logoSection}>
          <Image
            source={require('../../../assets/app-logo-full.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        {/* ── LOGIN CARD ── */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back 👋</Text>
          <Text style={styles.subtitle}>Login to continue shopping</Text>

          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputWrapper}>
            <Text style={styles.inputPrefix}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
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
              placeholder="Enter password"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
              <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.forgotWrapper} onPress={() => navigation.navigate('ForgotPassword')}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Login</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>
              New to Univerin?{' '}
              <Text style={styles.linkBold}>Create Account</Text>
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
  inner: { flexGrow: 1, alignItems: 'center', padding: 24, paddingTop: 60 },

  // ── Logo on WHITE background — so Univerin name is visible ──────────────
  logoSection: {
    backgroundColor: '#ffffff',
    borderRadius: 28, padding: 28,
    alignItems: 'center', justifyContent: 'center',
    width: '100%', marginBottom: 28,
    borderWidth: 1.5, borderColor: '#dbeafe',
    shadowColor: '#1669ef', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 4,
  },
  logoImage: { width: 280, height: 90 },

  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  title:    { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 22 },
  label:    { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8 },

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

  passwordWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
    backgroundColor: '#F9FAFB', marginBottom: 8, overflow: 'hidden',
  },
  passwordInput: { flex: 1, padding: 14, fontSize: 15, color: '#111' },
  eyeButton:     { paddingHorizontal: 14, paddingVertical: 14 },
  eyeText:       { fontSize: 13, color: '#1669ef', fontWeight: '600' },

  forgotWrapper: { alignItems: 'flex-end', marginBottom: 20 },
  forgotText:    { fontSize: 13, color: '#1669ef', fontWeight: '600' },

  button: {
    backgroundColor: '#1669ef', padding: 16,
    borderRadius: 14, alignItems: 'center', marginBottom: 16,
  },
  buttonDisabled: { backgroundColor: '#93c5fd' },
  buttonText:     { color: '#fff', fontSize: 16, fontWeight: '700' },

  link:     { textAlign: 'center', color: '#555', fontSize: 14 },
  linkBold: { color: '#1669ef', fontWeight: '700' },
});