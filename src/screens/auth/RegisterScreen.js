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
        <Text style={styles.logo}>🛒 OoruCart</Text>
        <Text style={styles.tagline}>Your neighbourhood store, online</Text>
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
              Already have an account? <Text style={styles.linkBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5E9' },
  inner: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  logo: { fontSize: 36, textAlign: 'center', marginBottom: 6 },
  tagline: { fontSize: 14, textAlign: 'center', color: '#555', marginBottom: 30 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, elevation: 4 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#1B5E20', marginBottom: 20 },
  label: { fontSize: 14, color: '#555', marginBottom: 6, fontWeight: '600' },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    padding: 12, fontSize: 16, marginBottom: 16, backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#2E7D32', padding: 14, borderRadius: 10,
    alignItems: 'center', marginBottom: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  link: { textAlign: 'center', color: '#555', fontSize: 14 },
  linkBold: { color: '#2E7D32', fontWeight: 'bold' },
});