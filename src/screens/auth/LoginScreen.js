import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen({ navigation }) {
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
      if (user.user_type === 'vendor') {
        navigation.replace('VendorHome');
      } else if (user.user_type === 'buyer') {
        navigation.replace('Home');
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
      <ScrollView contentContainerStyle={styles.inner}>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Text style={styles.logoIcon}>🛒</Text>
          <Text style={styles.logoText}>Shop2me</Text>
          <Text style={styles.logoSub}>Your neighbourhood store, online</Text>
        </View>

        {/* Card */}
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

          <TouchableOpacity
            style={styles.button}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Sign In</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>
              Don't have an account? <Text style={styles.linkBold}>Sign Up</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sellerLink}
            onPress={() => navigation.navigate('VendorRegister')}
          >
            <Text style={styles.sellerLinkText}>Are you a Seller? Register here</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  inner: {
    flexGrow: 1, justifyContent: 'center',
    alignItems: 'center', padding: 24,
  },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoIcon: { fontSize: 52, marginBottom: 10 },
  logoText: {
    fontSize: 32, fontWeight: 'bold', color: '#111', letterSpacing: -0.5,
  },
  logoSub: { fontSize: 13, color: '#888', marginTop: 6 },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 28,
    width: '100%', elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 12,
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#111', marginBottom: 24 },
  label: { fontSize: 14, color: '#444', marginBottom: 8, fontWeight: '600' },
  input: {
    borderWidth: 1.5, borderColor: '#ececec', borderRadius: 12,
    padding: 14, fontSize: 15, marginBottom: 18,
    backgroundColor: '#fafafa', color: '#111',
  },
  button: {
    backgroundColor: '#111', padding: 16, borderRadius: 12,
    alignItems: 'center', marginBottom: 18, marginTop: 4,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.3 },
  link: { textAlign: 'center', color: '#555', fontSize: 14, marginBottom: 14 },
  linkBold: { color: '#111', fontWeight: 'bold' },
  sellerLink: { alignItems: 'center' },
  sellerLinkText: { color: '#2E7D32', fontWeight: '600', fontSize: 14 },
});