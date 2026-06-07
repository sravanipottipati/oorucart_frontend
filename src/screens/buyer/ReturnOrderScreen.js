import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';

const REASONS = [
  'Wrong item delivered',
  'Damaged / Spoiled product',
  'Missing items in order',
  'Quality not as expected',
  'Expired product',
  'Other',
];

export default function ReturnOrderScreen({ navigation, route }) {
  const { order } = route.params || {};
  const [selectedReason, setSelectedReason] = useState('');
  const [comment, setComment]               = useState('');
  const [loading, setLoading]               = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) { Alert.alert('Error', 'Please select a reason'); return; }
    setLoading(true);
    try {
      await client.post(`/orders/${order.id}/refund/`, {
        reason: selectedReason,
        comment: comment,
      });
      Alert.alert('✅ Request Submitted!', 'Your return request has been submitted. Refund will be processed in 5-7 business days.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Could not submit return request');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Return & Refund</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.shopName}>{order?.shop_name}</Text>
          <Text style={styles.orderNum}>Order #{order?.order_number}</Text>

          {/* Refund info */}
          <View style={styles.refundBanner}>
            <Ionicons name="information-circle-outline" size={18} color="#1669ef" />
            <Text style={styles.refundText}>Refund will be processed in 5-7 business days</Text>
          </View>

          {/* Reason Selection */}
          <Text style={styles.sectionLabel}>Select reason for return</Text>
          {REASONS.map(reason => (
            <TouchableOpacity
              key={reason}
              style={[styles.reasonItem, selectedReason === reason && styles.reasonItemActive]}
              onPress={() => setSelectedReason(reason)}
            >
              <View style={[styles.radio, selectedReason === reason && styles.radioActive]}>
                {selectedReason === reason && <View style={styles.radioDot} />}
              </View>
              <Text style={[styles.reasonText, selectedReason === reason && styles.reasonTextActive]}>{reason}</Text>
            </TouchableOpacity>
          ))}

          {/* Comment */}
          <Text style={[styles.sectionLabel, { marginTop: 16 }]}>Additional details (optional)</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Describe your issue..."
            placeholderTextColor="#9CA3AF"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
          />
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Return Request</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F8F9FA' },
  header:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn:          { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111', flex: 1, textAlign: 'center' },
  card:             { backgroundColor: '#fff', borderRadius: 16, margin: 16, padding: 20 },
  shopName:         { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 4 },
  orderNum:         { fontSize: 13, color: '#888', marginBottom: 16 },
  refundBanner:     { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EFF6FF', borderRadius: 10, padding: 12, marginBottom: 20 },
  refundText:       { fontSize: 13, color: '#1669ef', flex: 1 },
  sectionLabel:     { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 10 },
  reasonItem:       { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 8, backgroundColor: '#F9FAFB' },
  reasonItemActive: { borderColor: '#1669ef', backgroundColor: '#EFF6FF' },
  radio:            { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#D1D5DB', justifyContent: 'center', alignItems: 'center' },
  radioActive:      { borderColor: '#1669ef' },
  radioDot:         { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1669ef' },
  reasonText:       { fontSize: 14, color: '#555', flex: 1 },
  reasonTextActive: { color: '#1669ef', fontWeight: '600' },
  commentInput:     { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 14, color: '#111', backgroundColor: '#F9FAFB', height: 80, textAlignVertical: 'top' },
  footer:           { padding: 16, paddingBottom: 30, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  submitBtn:        { backgroundColor: '#DC2626', borderRadius: 14, padding: 16, alignItems: 'center' },
  submitBtnText:    { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
