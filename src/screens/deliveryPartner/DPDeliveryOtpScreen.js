import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../../api/client';

export default function DPDeliveryOtpScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);

  const handleOtpChange = (val, index) => {
    const digitsOnly = val.replace(/[^0-9]/g, '');
    if (digitsOnly.length > 1) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) newOtp[i] = digitsOnly[i] || '';
      setOtp(newOtp);
      otpRefs.current[Math.min(digitsOnly.length - 1, 5)]?.focus();
      return;
    }
    const newOtp = [...otp];
    newOtp[index] = digitsOnly;
    setOtp(newOtp);
    if (digitsOnly && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return Alert.alert('Error', 'Please enter the complete 6-digit OTP');
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      await client.post(
        `/dp/orders/${orderId}/verify-delivery-otp/`,
        { otp: otpCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Alert.alert('Delivered!', 'Order marked as delivered successfully', [
        { text: 'OK', onPress: () => navigation.replace('DPHome') },
      ]);
    } catch (e) {
      const msg = e.response?.data?.error || 'Incorrect OTP. Please check with the customer.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.inner}>
        <Ionicons name="checkmark-circle-outline" size={48} color="#1669ef" style={{ marginBottom: 16 }} />
        <Text style={styles.title}>Confirm Delivery</Text>
        <Text style={styles.subtitle}>Ask the customer for their 6-digit delivery OTP</Text>

        <View style={styles.otpRow}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (otpRefs.current[index] = ref)}
              style={styles.otpBox}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(val) => handleOtpChange(val, index)}
              onKeyPress={(e) => handleOtpKeyPress(e, index)}
            />
          ))}
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, loading && styles.btnDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Confirm Delivery</Text>}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flex: 1, justifyContent: 'center', padding: 24, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 28, textAlign: 'center' },
  otpRow: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 28 },
  otpBox: {
    width: 44, height: 52, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    textAlign: 'center', fontSize: 20, fontWeight: '700', color: '#111827',
  },
  primaryBtn: {
    backgroundColor: '#1669ef', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', width: '100%',
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});