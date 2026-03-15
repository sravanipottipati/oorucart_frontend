import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();

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

        {/* ── LOGO ── */}
        <View style={styles.logoCard}>
          <View style={styles.decCircle1} />
          <View style={styles.decCircle2} />
          <View style={styles.iconBox}>
            <Text style={styles.iconText}>S</Text>
          </View>
          <Text style={styles.logoText}>Shop2me</Text>
          <Text style={styles.logoTagline}>Your local shops, delivered</Text>
          <View style={styles.pillsRow}>
            <View style={styles.pill}><Text style={styles.pillText}>Order</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>Track</Text></View>
            <View style={styles.pill}><Text style={styles.pillText}>Receive</Text></View>
          </View>
        </View>

        {/* ── LOGIN CARD ── */}
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back 👋</Text>
          <Text style={styles.subtitle}>Login to continue</Text>

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
          <TextInput
            style={styles.inputFull}
            placeholder="Enter password"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Login</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.link}>
              New to Shop2me? <Text style={styles.linkBold}>Create Account</Text>
            </Text>
          </TouchableOpacity>

        </View>

        <Text style={styles.footer}>Shop2me — Your local shops, delivered 🛒</Text>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  inner: { flexGrow: 1, alignItems: 'center', padding: 24, paddingTop: 60 },

  logoCard: {
    backgroundColor: '#2563EB', borderRadius: 28,
    padding: 28, alignItems: 'center', width: '100%',
    marginBottom: 28, overflow: 'hidden', position: 'relative',
  },
  decCircle1: {
    position: 'absolute', width: 120, height: 120,
    borderRadius: 60, backgroundColor: '#1D4ED8',
    top: -30, right: -20, opacity: 0.5,
  },
  decCircle2: {
    position: 'absolute', width: 80, height: 80,
    borderRadius: 40, backgroundColor: '#1E40AF',
    bottom: -20, left: -10, opacity: 0.4,
  },
  iconBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 14,
  },
  iconText:    { fontSize: 36, fontWeight: '900', color: '#2563EB' },
  logoText:    { fontSize: 36, fontWeight: '700', color: 'white', letterSpacing: -1, marginBottom: 6 },
  logoTagline: { fontSize: 13, color: '#BFDBFE', marginBottom: 16, letterSpacing: 0.3 },
  pillsRow:    { flexDirection: 'row', gap: 8 },
  pill: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20,
  },
  pillText: { color: 'white', fontSize: 11, fontWeight: '500' },

  card: {
    backgroundColor: '#fff', borderRadius: 24,
    padding: 24, width: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  title:    { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#888', marginBottom: 22 },

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
    padding: 14, fontSize: 15, marginBottom: 20,
    backgroundColor: '#F9FAFB', color: '#111',
  },

  button: {
    backgroundColor: '#2563EB', padding: 16, borderRadius: 14,
    alignItems: 'center', marginBottom: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  link:     { textAlign: 'center', color: '#555', fontSize: 14 },
  linkBold: { color: '#2563EB', fontWeight: '700' },

  footer: {
    fontSize: 11, color: '#9CA3AF',
    marginTop: 24, textAlign: 'center',
  },
});