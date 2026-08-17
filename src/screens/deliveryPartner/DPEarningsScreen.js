import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../../api/client';

export default function DPEarningsScreen({ navigation }) {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        const res = await client.get('/dp/earnings/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEarnings(res.data);
      } catch (e) {
        // leave as null, show zero state
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1669ef" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={22} color="#1669ef" />
        <Text style={styles.backBtnText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Earnings</Text>

      <View style={styles.todayCard}>
        <Text style={styles.todayLabel}>Today's Earnings</Text>
        <Text style={styles.todayAmount}>₹{earnings?.today_earnings || '0'}</Text>
        <Text style={styles.todayDeliveries}>
          {earnings?.today_deliveries || 0} {earnings?.today_deliveries === 1 ? 'delivery' : 'deliveries'} today
        </Text>
      </View>

      <View style={styles.allTimeCard}>
        <View style={styles.allTimeRow}>
          <Ionicons name="wallet-outline" size={20} color="#6B7280" />
          <Text style={styles.allTimeLabel}>All-Time Earnings</Text>
        </View>
        <Text style={styles.allTimeAmount}>₹{earnings?.all_time_earnings || '0'}</Text>
        <Text style={styles.allTimeDeliveries}>
          {earnings?.all_time_deliveries || 0} total deliveries completed
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    marginBottom: 16, marginTop: 44, alignSelf: 'flex-start',
    paddingVertical: 8, paddingRight: 12,
  },
  backBtnText: { fontSize: 16, color: '#1669ef', fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 20 },
  todayCard: {
    backgroundColor: '#1669ef', borderRadius: 16, padding: 20, marginBottom: 16,
  },
  todayLabel: { fontSize: 13, color: '#DBEAFE', fontWeight: '600' },
  todayAmount: { fontSize: 32, color: '#fff', fontWeight: '800', marginTop: 6 },
  todayDeliveries: { fontSize: 12, color: '#DBEAFE', marginTop: 6 },
  allTimeCard: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 16, padding: 20,
  },
  allTimeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  allTimeLabel: { fontSize: 13, color: '#6B7280', fontWeight: '600' },
  allTimeAmount: { fontSize: 24, color: '#111827', fontWeight: '700' },
  allTimeDeliveries: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
});	