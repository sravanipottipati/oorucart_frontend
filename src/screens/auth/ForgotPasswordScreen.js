import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import client from '../../api/client';

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep]             = useState(1); // 1 = enter phone, 2 = enter new password
  const [phone, setPhone]           = useState('');
  const [otp, setOtp]               = useState('');
  const [newPassword, setNewPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword]       = useState(false);
  const [showConfirm, setShowConfirm]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [resetToken, setResetToken] = useState('');

  // ── Step 1 — Request Reset ──
  const handleRequestReset = async () => {
    if (!phone.trim() || phone.length !== 10) {
      return Alert.alert('Error', 'Please enter a valid 10-digit phone number');
    }
    setLoading(true);
    try {
      const response = await client.post('/users/forgot-password/', {
        phone_number: phone,
      });
      setResetToken(response.data?.reset_token || '');
      Alert.alert(
        'Reset Link Sent',
        'A password reset OTP has been sent to your phone number.',
        [{ text: 'OK', onPress: () => setStep(2) }]
      );
    } catch (e) {
      const msg = e.response?.data?.error
        || e.response?.data?.detail
        || e.response?.data?.phone_number?.[0]
        || 'Phone number not found. Please check and try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2 — Reset Password ──
  const handleResetPassword = async () => {
    if (!otp.trim())              return Alert.alert('Error', 'Please enter the OTP');
    if (!newPassword.trim() || newPassword.length < 6)
      return Alert.alert('Error', 'Password must be at least 6 characters');
    if (newPassword !== confirmPassword)
      return Alert.alert('Error', 'Passwords do not match');

    setLoading(true);
    try {
      await client.post('/users/reset-password/', {
        phone_number: phone,
        otp:          otp,
        new_password: newPassword,
      });
      Alert.alert(
        'Password Reset Successful! ✅',
        'Your password has been updated. Please login with your new password.',
        [{ text: 'Login Now', onPress: () => navigation.replace('Login') }]
      );
    } catch (e) {
      const msg = e.response?.data?.error
        || e.response?.data?.detail
        || 'Reset failed. Please try again.';
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
      >

        {/* ── Header ── */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* ── Logo ── */}
        <View style={styles.logoCard}>
          <View style={styles.decCircle1} />
          <View style={styles.decCircle2} />
          <View style={styles.iconBox}>
            <Text style={styles.iconText}>U</Text>
          </View>
          <Text style={styles.logoText}>
            <Text style={styles.logoTeal}>Uni</Text>
            <Text style={styles.logoWhite}>verin</Text>
          </Text>
          <Text style={styles.logoTagline}>Reset your password</Text>
        </View>

        {/* ── Step Indicator ── */}
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]}>
            <Text style={[styles.stepNum, step >= 1 && styles.stepNumActive]}>1</Text>
          </View>
          <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />
          <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]}>
            <Text style={[styles.stepNum, step >= 2 && styles.stepNumActive]}>2</Text>
          </View>
        </View>
        <View style={styles.stepLabels}>
          <Text style={styles.stepLabel}>Enter Phone</Text>
          <Text style={styles.stepLabel}>New Password</Text>
        </View>

        {/* ── STEP 1 — Enter Phone ── */}
        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your registered phone number and we will send you a reset OTP.
            </Text>

            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.inputPrefix}>+91</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter registered phone number"
                placeholderTextColor="#9CA3AF"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                maxLength={10}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRequestReset}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>Send Reset OTP</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>
                Remember password? <Text style={styles.linkBold}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP 2 — Enter OTP + New Password ── */}
        {step === 2 && (
          <View style={styles.card}>
            <Text style={styles.title}>Set New Password</Text>
            <Text style={styles.subtitle}>
              Enter the OTP sent to +91 {phone} and set your new password.
            </Text>

            <Text style={styles.label}>OTP</Text>
            <TextInput
              style={styles.inputFull}
              placeholder="Enter OTP received on phone"
              placeholderTextColor="#9CA3AF"
              value={otp}
              onChangeText={setOtp}
              keyboardType="numeric"
              maxLength={6}
            />

            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Min 6 characters"
                placeholderTextColor="#9CA3AF"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Re-enter new password"
                placeholderTextColor="#9CA3AF"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirm(!showConfirm)}
              >
                <Text style={styles.eyeText}>{showConfirm ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>Reset Password</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setStep(1)}>
              <Text style={styles.link}>
                Wrong number? <Text style={styles.linkBold}>Go Back</Text>
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.footer}>Univerin — Your local shops, delivered 🛒</Text>
        <View style={{ height: 40 }} />

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdfa' },
  inner:     { flexGrow: 1, alignItems: 'center', padding: 24, paddingTop: 20 },

  // ── Header ──
  header: { width: '100%', marginBottom: 16 },
  backBtn:  { padding: 4 },
  backText: { color: '#0d9488', fontSize: 15, fontWeight: '600' },

  // ── Logo Card ──
  logoCard: {
    backgroundColor: '#0d9488', borderRadius: 28,
    padding: 24, alignItems: 'center', width: '100%',
    marginBottom: 24, overflow: 'hidden', position: 'relative',
  },
  decCircle1: {
    position: 'absolute', width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#0f766e', top: -25, right: -15, opacity: 0.5,
  },
  decCircle2: {
    position: 'absolute', width: 70, height: 70, borderRadius: 35,
    backgroundColor: '#115e59', bottom: -15, left: -10, opacity: 0.4,
  },
  iconBox: {
    width: 56, height: 56, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 10,
  },
  iconText:    { fontSize: 28, fontWeight: '900', color: '#0d9488' },
  logoText:    { fontSize: 28, fontWeight: '700', letterSpacing: -1, marginBottom: 4 },
  logoTeal:    { color: '#99f6e4' },
  logoWhite:   { color: 'white' },
  logoTagline: { fontSize: 12, color: '#99f6e4', letterSpacing: 0.3 },

  // ── Step Indicator ──
  stepRow: {
    flexDirection: 'row', alignItems: 'center',
    width: '60%', marginBottom: 6,
  },
  stepDot: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center',
  },
  stepDotActive: { backgroundColor: '#0d9488' },
  stepNum:       { fontSize: 14, fontWeight: '700', color: '#9CA3AF' },
  stepNumActive: { color: 'white' },
  stepLine:      { flex: 1, height: 3, backgroundColor: '#E5E7EB', marginHorizontal: 6 },
  stepLineActive: { backgroundColor: '#0d9488' },
  stepLabels: {
    flexDirection: 'row', justifyContent: 'space-between',
    width: '60%', marginBottom: 20,
  },
  stepLabel: { fontSize: 11, color: '#9CA3AF' },

  // ── Card ──
  card: {
    backgroundColor: '#fff', borderRadius: 24,
    padding: 24, width: '100%',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 12, elevation: 3,
  },
  title:    { fontSize: 22, fontWeight: '700', color: '#111', marginBottom: 6 },
  subtitle: { fontSize: 13, color: '#888', marginBottom: 22, lineHeight: 20 },

  // ── Labels ──
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 8 },

  // ── Phone Input ──
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
    backgroundColor: '#F9FAFB', marginBottom: 20, overflow: 'hidden',
  },
  inputPrefix: {
    paddingHorizontal: 12, fontSize: 14, color: '#555',
    borderRightWidth: 1, borderRightColor: '#E5E7EB', paddingVertical: 14,
  },
  input: { flex: 1, padding: 14, fontSize: 15, color: '#111' },

  // ── Full Input ──
  inputFull: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 14, fontSize: 15, marginBottom: 16,
    backgroundColor: '#F9FAFB', color: '#111',
  },

  // ── Password ──
  passwordWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
    backgroundColor: '#F9FAFB', marginBottom: 16, overflow: 'hidden',
  },
  passwordInput: { flex: 1, padding: 14, fontSize: 15, color: '#111' },
  eyeButton:     { paddingHorizontal: 14, paddingVertical: 14 },
  eyeText:       { fontSize: 13, color: '#0d9488', fontWeight: '600' },

  // ── Button ──
  button: {
    backgroundColor: '#0d9488', padding: 16,
    borderRadius: 14, alignItems: 'center', marginBottom: 16,
  },
  buttonDisabled: { backgroundColor: '#99f6e4' },
  buttonText:     { color: '#fff', fontSize: 16, fontWeight: '700' },

  // ── Links ──
  link:     { textAlign: 'center', color: '#555', fontSize: 14 },
  linkBold: { color: '#0d9488', fontWeight: '700' },

  // ── Footer ──
  footer: {
    fontSize: 11, color: '#9CA3AF',
    marginTop: 24, textAlign: 'center',
  },
});