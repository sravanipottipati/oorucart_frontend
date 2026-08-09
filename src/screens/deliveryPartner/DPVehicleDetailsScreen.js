import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';

const VEHICLE_TYPES = [
  { id: 'bike',    label: 'Bike',    icon: 'bicycle' },
  { id: 'scooter', label: 'Scooter', icon: 'speedometer-outline' },
  { id: 'bicycle', label: 'Bicycle', icon: 'bicycle-outline' },
];

export default function DPVehicleDetailsScreen({ navigation }) {
  const [vehicleType, setVehicleType] = useState('bike');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!vehicleNumber.trim()) {
      return Alert.alert('Error', 'Please enter your vehicle registration number');
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      await client.post(
        '/dp/onboarding/vehicle/',
        { vehicle_type: vehicleType, vehicle_number: vehicleNumber.trim().toUpperCase() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      navigation.navigate('DPDocumentUpload');
    } catch (e) {
      const msg = e.response?.data?.error || 'Failed to save vehicle details. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.inner} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Vehicle Details</Text>
        <Text style={styles.subtitle}>Tell us what you'll be delivering on</Text>

        <Text style={styles.label}>Vehicle Type</Text>
        <View style={styles.typeRow}>
          {VEHICLE_TYPES.map((v) => (
            <TouchableOpacity
              key={v.id}
              style={[styles.typeCard, vehicleType === v.id && styles.typeCardActive]}
              onPress={() => setVehicleType(v.id)}
            >
              <Ionicons name={v.icon} size={26} color={vehicleType === v.id ? '#1669ef' : '#6B7280'} />
              <Text style={[styles.typeLabel, vehicleType === v.id && styles.typeLabelActive]}>{v.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Vehicle Registration Number</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. TS09AB1234"
          value={vehicleNumber}
          onChangeText={setVehicleNumber}
          autoCapitalize="characters"
        />

        <TouchableOpacity
          style={[styles.primaryBtn, loading && styles.btnDisabled]}
          onPress={handleContinue}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Continue</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { flexGrow: 1, padding: 24 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4, marginTop: 20 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 10, marginTop: 8 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  typeCard: {
    flex: 1, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    paddingVertical: 16, alignItems: 'center', gap: 6,
  },
  typeCardActive: { borderColor: '#1669ef', backgroundColor: '#EFF6FF' },
  typeLabel: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  typeLabelActive: { color: '#1669ef' },
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: '#111827',
  },
  primaryBtn: {
    backgroundColor: '#1669ef', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 28,
  },
  btnDisabled: { opacity: 0.6 },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});