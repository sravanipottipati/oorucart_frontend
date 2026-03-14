import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function RegisterScreen({ navigation }) {
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
          <Text style={styles.logoIcon}>🛒</Text>
          <Text style={styles.logoText}>Shop2me</Text>
          <Text style={styles.logoSub}>Your neighbourhood store, online</Text>
        </View>

        {/* Card */}
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

          <TouchableOpacity style={styles.sellerLink}>
            <Text style={styles.sellerLinkText}>Are you a Seller? Register here</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  inner: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  logoContainer: { alignItems: 'center', marginBottom: 32 },
  logoIcon: { fontSize: 52, marginBottom: 10 },
  logoText: { fontSize: 32, fontWeight: 'bold', color: '#111', letterSpacing: -0.5 },
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