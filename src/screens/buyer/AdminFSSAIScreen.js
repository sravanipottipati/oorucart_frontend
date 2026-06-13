import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert, RefreshControl, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';

export default function AdminFSSAIScreen({ navigation }) {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchSellers = async () => {
    try {
      const res = await client.get('/users/admin/sellers/');
      setSellers(res.data.sellers || []);
    } catch (e) {
      Alert.alert('Error', 'Could not load sellers');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchSellers(); }, []);

  const handleVerify = async (vendorId, action, shopName) => {
    Alert.alert(
      action === 'approve' ? 'Approve Seller' : 'Reject Seller',
      `${action === 'approve' ? 'Approve' : 'Reject'} ${shopName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action === 'approve' ? 'Approve' : 'Reject',
          style: action === 'reject' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              const res = await client.post(`/users/admin/sellers/${vendorId}/verify/`, { action });
              Alert.alert('Success', res.data.message);
              fetchSellers();
            } catch (e) {
              Alert.alert('Error', 'Action failed');
            }
          }
        }
      ]
    );
  };

  const filtered = sellers.filter(s => {
    if (filter === 'all') return true;
    if (filter === 'gst') return !!s.gstin;
    if (filter === 'no_gst') return !s.gstin;
    if (filter === 'fssai') return !!s.fssai_number;
    if (filter === 'no_fssai') return !s.fssai_number;
    if (filter === 'pending') return s.status === 'pending';
    return true;
  });

  const StatusBadge = ({ status }) => {
    const colors = { approved: '#16a34a', pending: '#ea580c', rejected: '#dc2626' };
    return (
      <View style={{ backgroundColor: colors[status] || '#6b7280', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 }}>
        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>{status}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Seller FSSAI Verification</Text>
        <TouchableOpacity onPress={() => { setRefreshing(true); fetchSellers(); }} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={22} color="#1669ef" />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryNum}>{sellers.length}</Text>
          <Text style={styles.summaryLabel}>Total</Text>
        </View>
        <View style={[styles.summaryBox, { backgroundColor: '#f0fdf4' }]}>
          <Text style={[styles.summaryNum, { color: '#16a34a' }]}>{sellers.filter(s => !!s.fssai_number).length}</Text>
          <Text style={styles.summaryLabel}>Has FSSAI</Text>
        </View>
        <View style={[styles.summaryBox, { backgroundColor: '#fef2f2' }]}>
          <Text style={[styles.summaryNum, { color: '#dc2626' }]}>{sellers.filter(s => !s.fssai_number).length}</Text>
          <Text style={styles.summaryLabel}>No FSSAI</Text>
        </View>
        <View style={[styles.summaryBox, { backgroundColor: '#fff7ed' }]}>
          <Text style={[styles.summaryNum, { color: '#ea580c' }]}>{sellers.filter(s => s.status === 'pending').length}</Text>
          <Text style={styles.summaryLabel}>Pending</Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {[
          { key: 'all', label: 'All' },
          { key: 'pending', label: 'Pending' },
          { key: 'fssai', label: 'Has FSSAI' },
          { key: 'no_fssai', label: 'No FSSAI' },
          { key: 'gst', label: 'GST Reg' },
          { key: 'no_gst', label: 'No GST' },
        ].map(f => (
          <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)}
            style={[styles.filterBtn, filter === f.key && styles.filterBtnActive]}>
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? <ActivityIndicator size="large" color="#1669ef" style={{ marginTop: 40 }} /> : (
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchSellers} />}>
          {filtered.map(seller => (
            <View key={seller.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.shopName}>{seller.shop_name}</Text>
                  <Text style={styles.shopCategory}>{seller.category} • {seller.town}</Text>
                </View>
                <StatusBadge status={seller.status} />
              </View>

              <View style={styles.infoRow}>
                <Ionicons name={seller.fssai_number ? "checkmark-circle" : "close-circle"} size={16} color={seller.fssai_number ? "#16a34a" : "#dc2626"} />
                <Text style={styles.infoText}>FSSAI: {seller.fssai_number || 'Not provided'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name={seller.gstin ? "checkmark-circle" : "alert-circle"} size={16} color={seller.gstin ? "#16a34a" : "#ea580c"} />
                <Text style={styles.infoText}>GSTIN: {seller.gstin || 'Not registered'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={16} color="#6b7280" />
                <Text style={styles.infoText}>{seller.phone_number} • Joined: {seller.created_at}</Text>
              </View>

              {seller.fssai_certificate ? (
                <TouchableOpacity onPress={() => Linking.openURL(seller.fssai_certificate)} style={styles.certBtn}>
                  <Ionicons name="document-outline" size={16} color="#1669ef" />
                  <Text style={styles.certBtnText}>View FSSAI Certificate</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.noCertBadge}>
                  <Text style={styles.noCertText}>No certificate uploaded</Text>
                </View>
              )}

              <View style={styles.actionRow}>
                <TouchableOpacity onPress={() => handleVerify(seller.id, 'approve', seller.shop_name)}
                  style={[styles.actionBtn, { backgroundColor: '#16a34a' }]}>
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.actionBtnText}>Approve</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleVerify(seller.id, 'reject', seller.shop_name)}
                  style={[styles.actionBtn, { backgroundColor: '#dc2626' }]}>
                  <Ionicons name="close" size={16} color="#fff" />
                  <Text style={styles.actionBtnText}>Reject</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  refreshBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'flex-end' },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111', flex: 1, textAlign: 'center' },
  summaryRow: { flexDirection: 'row', padding: 12, gap: 8 },
  summaryBox: { flex: 1, backgroundColor: '#eff6ff', borderRadius: 12, padding: 10, alignItems: 'center' },
  summaryNum: { fontSize: 20, fontWeight: '700', color: '#1669ef' },
  summaryLabel: { fontSize: 10, color: '#6b7280', marginTop: 2 },
  filterRow: { paddingHorizontal: 12, paddingVertical: 8, maxHeight: 50 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F3F4F6', marginRight: 8 },
  filterBtnActive: { backgroundColor: '#1669ef' },
  filterText: { fontSize: 12, color: '#555', fontWeight: '500' },
  filterTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', margin: 12, marginBottom: 0, borderRadius: 16, padding: 16, elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  shopName: { fontSize: 15, fontWeight: '700', color: '#111' },
  shopCategory: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  infoText: { fontSize: 12, color: '#444', flex: 1 },
  certBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#eff6ff', borderRadius: 8, padding: 8, marginVertical: 8 },
  certBtnText: { color: '#1669ef', fontSize: 12, fontWeight: '600' },
  noCertBadge: { backgroundColor: '#fef2f2', borderRadius: 8, padding: 8, marginVertical: 8 },
  noCertText: { color: '#dc2626', fontSize: 12, textAlign: 'center' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 8, padding: 10 },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
