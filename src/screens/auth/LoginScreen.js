import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
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
      <View style={styles.inner}>
        <Text style={styles.logo}>🛒 OoruCart</Text>
        <Text style={styles.tagline}>Your neighbourhood store, online</Text>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome Back!</Text>

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
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Login</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>
              Don't have an account? <Text style={styles.linkBold}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5E9' },
  inner: { flex: 1, justifyContent: 'center', padding: 20 },
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