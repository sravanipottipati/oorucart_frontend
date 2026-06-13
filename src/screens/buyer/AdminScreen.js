import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, RefreshControl, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../../api/client';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminScreen({ navigation }) {
  const [stats, setStats]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear]   = useState(new Date().getFullYear());

  const fetchStats = async () => {
    try {
      const res = await client.get(`/users/admin/stats/?month=${selectedMonth}&year=${selectedYear}`);
      setStats(res.data);
    } catch (e) {
      console.log('Stats error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, [selectedMonth, selectedYear]);

  const onRefresh = () => { setRefreshing(true); fetchStats(); };

  const downloadExcel = async () => {
    try {
      setDownloading(true);
      const token = await AsyncStorage.getItem('access_token');
      const url = `${client.defaults.baseURL}/invoices/export/admin/?month=${selectedMonth}&year=${selectedYear}`;
      const fileUri = FileSystem.documentDirectory + `univerin_admin_${selectedMonth}_${selectedYear}.xlsx`;
      const downloadRes = await FileSystem.downloadAsync(url, fileUri, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadRes.uri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Save Admin Report',
        });
      }
    } catch (e) {
      console.log('Download error:', e.message);
      Alert.alert('Error', 'Download failed. Please try again!');
    } finally {
      setDownloading(false);
    }
  };

  const downloadTCSExcel = async () => {
    try {
      setDownloading(true);
      const token = await AsyncStorage.getItem('access_token');
      const url = `${client.defaults.baseURL}/invoices/export/tcs-excel/?month=${selectedMonth}&year=${selectedYear}`;
      const fileUri = FileSystem.documentDirectory + `univerin_tcs_${selectedMonth}_${selectedYear}.xlsx`;
      const downloadRes = await FileSystem.downloadAsync(url, fileUri, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadRes.uri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Save TCS Report',
        });
      }
    } catch (e) {
      Alert.alert('Error', 'Download failed. Please try again!');
    } finally {
      setDownloading(false);
    }
  };

  const downloadTDSExcel = async () => {
    try {
      setDownloading(true);
      const token = await AsyncStorage.getItem('access_token');
      const url = `${client.defaults.baseURL}/invoices/export/tds-excel/?month=${selectedMonth}&year=${selectedYear}`;
      const fileUri = FileSystem.documentDirectory + `univerin_tds_${selectedMonth}_${selectedYear}.xlsx`;
      const downloadRes = await FileSystem.downloadAsync(url, fileUri, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(downloadRes.uri, {
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          dialogTitle: 'Save TDS Report',
        });
      }
    } catch (e) {
      Alert.alert('Error', 'Download failed. Please try again!');
    } finally {
      setDownloading(false);
    }
  };

  const StatCard = ({ icon, label, value, color = '#1669ef', bg = '#eff6ff' }) => (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Admin Panel</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <Ionicons name="refresh" size={22} color="#1669ef" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Month/Year Picker */}
        <View style={styles.pickerCard}>
          <Text style={styles.pickerTitle}>📅 Select Month</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.monthScroll}>
            {MONTHS.map((m, i) => (
              <TouchableOpacity
                key={i}
                style={[styles.monthBtn, selectedMonth === i + 1 && styles.monthBtnActive]}
                onPress={() => setSelectedMonth(i + 1)}
              >
                <Text style={[styles.monthBtnText, selectedMonth === i + 1 && styles.monthBtnTextActive]}>
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.yearRow}>
            <TouchableOpacity onPress={() => setSelectedYear(y => y - 1)} style={styles.yearBtn}>
              <Text style={styles.yearBtnText}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.yearText}>{selectedYear}</Text>
            <TouchableOpacity onPress={() => setSelectedYear(y => y + 1)} style={styles.yearBtn}>
              <Text style={styles.yearBtnText}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#1669ef" style={{ marginTop: 40 }} />
        ) : stats ? (
          <>
            {/* All Time Stats */}
            <Text style={styles.sectionTitle}>📊 All Time</Text>
            <View style={styles.statsGrid}>
              <StatCard icon="📦" label="Total Orders"  value={stats.all_time.total_orders}  color="#1669ef" bg="#eff6ff" />
              <StatCard icon="💰" label="Total Revenue" value={`₹${stats.all_time.total_revenue.toFixed(0)}`} color="#16a34a" bg="#f0fdf4" />
              <StatCard icon="🏪" label="Vendors"       value={stats.all_time.total_vendors}  color="#ea580c" bg="#fff7ed" />
              <StatCard icon="👥" label="Buyers"        value={stats.all_time.total_buyers}   color="#7c3aed" bg="#f5f3ff" />
            </View>

            {/* This Month Stats */}
            <Text style={styles.sectionTitle}>📅 {MONTHS[selectedMonth - 1]} {selectedYear}</Text>
            <View style={styles.statsGrid}>
              <StatCard icon="🛒" label="Orders"    value={stats.this_month.total_orders}              color="#1669ef" bg="#eff6ff" />
              <StatCard icon="💵" label="Revenue"   value={`₹${stats.this_month.total_revenue.toFixed(0)}`} color="#16a34a" bg="#f0fdf4" />
              <StatCard icon="✅" label="Delivered" value={stats.this_month.delivered}                 color="#16a34a" bg="#f0fdf4" />
              <StatCard icon="❌" label="Cancelled" value={stats.this_month.cancelled}                 color="#ef4444" bg="#fef2f2" />
            </View>

            {/* Commission & TCS */}
            <Text style={styles.sectionTitle}>💼 Platform Earnings</Text>
            <View style={styles.earningsCard}>
              <View style={styles.earningsRow}>
                <Text style={styles.earningsLabel}>Commission Earned</Text>
                <Text style={styles.earningsValue}>₹{stats.this_month.commission.toFixed(2)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.earningsRow}>
                <Text style={styles.earningsLabel}>TCS Collected</Text>
                <Text style={styles.earningsValue}>₹{stats.this_month.tcs.toFixed(2)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.earningsRow}>
                <Text style={[styles.earningsLabel, { fontWeight: 'bold' }]}>Total Platform Income</Text>
                <Text style={[styles.earningsValue, { color: '#16a34a', fontWeight: 'bold' }]}>
                  ₹{(stats.this_month.commission + stats.this_month.tcs).toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Download Excel */}
            <Text style={styles.sectionTitle}>📥 Export Data</Text>
            <View style={styles.downloadCard}>
              <Text style={styles.downloadTitle}>📊 Admin Billing Report</Text>
              <Text style={styles.downloadSubtitle}>
                GSTR-1 · GSTR-8 TCS · Commission · Settlement Summary
              </Text>
              <TouchableOpacity
                style={[styles.downloadBtn, downloading && styles.downloadBtnDisabled]}
                onPress={downloadExcel}
                disabled={downloading}
              >
                {downloading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="download-outline" size={18} color="#fff" />
                    <Text style={styles.downloadBtnText}>
                      Download {MONTHS[selectedMonth - 1]} {selectedYear} Report
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* TCS Export */}
            <View style={styles.downloadCard}>
              <Text style={styles.downloadTitle}>📋 TCS Register (GSTR-8)</Text>
              <Text style={styles.downloadSubtitle}>GST TCS @ 0.5% — GST registered sellers only</Text>
              <TouchableOpacity
                style={[styles.downloadBtn, { backgroundColor: '#7c3aed' }, downloading && styles.downloadBtnDisabled]}
                onPress={downloadTCSExcel}
                disabled={downloading}
              >
                {downloading ? <ActivityIndicator color="#fff" size="small" /> : (
                  <>
                    <Ionicons name="download-outline" size={18} color="#fff" />
                    <Text style={styles.downloadBtnText}>Download TCS {MONTHS[selectedMonth - 1]} {selectedYear}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* TDS Export */}
            <View style={styles.downloadCard}>
              <Text style={styles.downloadTitle}>📋 TDS Register (194-O)</Text>
              <Text style={styles.downloadSubtitle}>TDS @ 1% — All sellers</Text>
              <TouchableOpacity
                style={[styles.downloadBtn, { backgroundColor: '#ea580c' }, downloading && styles.downloadBtnDisabled]}
                onPress={downloadTDSExcel}
                disabled={downloading}
              >
                {downloading ? <ActivityIndicator color="#fff" size="small" /> : (
                  <>
                    <Ionicons name="download-outline" size={18} color="#fff" />
                    <Text style={styles.downloadBtnText}>Download TDS {MONTHS[selectedMonth - 1]} {selectedYear}</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <View style={styles.errorState}>
            <Text style={styles.errorText}>Could not load stats</Text>
            <TouchableOpacity onPress={fetchStats}>
              <Text style={styles.retryText}>Tap to retry</Text>
            </TouchableOpacity>
          </View>
        )}

            {/* FSSAI Verification */}
            <View style={styles.downloadCard}>
              <Text style={styles.downloadTitle}>🔍 Seller FSSAI Verification</Text>
              <Text style={styles.downloadSubtitle}>Verify seller FSSAI licenses and approve/reject sellers</Text>
              <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: '#7c3aed' }]}
                onPress={() => navigation.navigate('AdminFSSAI')}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#fff" />
                <Text style={styles.downloadBtnText}>Open FSSAI Verification Panel</Text>
              </TouchableOpacity>
            </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn:     { width: 36, height: 36, justifyContent: 'center' },
  refreshBtn:  { width: 36, height: 36, justifyContent: 'center', alignItems: 'flex-end' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111', flex: 1, textAlign: 'center' },

  pickerCard: {
    backgroundColor: '#fff', margin: 16, borderRadius: 16, padding: 16,
  },
  pickerTitle:   { fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 12 },
  monthScroll:   { marginBottom: 12 },
  monthBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F3F4F6', marginRight: 8,
  },
  monthBtnActive:     { backgroundColor: '#1669ef' },
  monthBtnText:       { fontSize: 13, color: '#555', fontWeight: '500' },
  monthBtnTextActive: { color: '#fff' },
  yearRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 24 },
  yearBtn:   { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 18 },
  yearBtnText: { fontSize: 20, color: '#111' },
  yearText:  { fontSize: 16, fontWeight: 'bold', color: '#111' },

  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#111', marginHorizontal: 16, marginBottom: 12, marginTop: 4 },

  statsGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, marginBottom: 8,
  },
  statCard: {
    width: '45%', margin: '2.5%', borderRadius: 14,
    padding: 16, alignItems: 'center',
  },
  statIcon:  { fontSize: 24, marginBottom: 8 },
  statValue: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#888', textAlign: 'center' },

  earningsCard: {
    backgroundColor: '#fff', marginHorizontal: 16,
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  earningsRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  earningsLabel: { fontSize: 14, color: '#444' },
  earningsValue: { fontSize: 14, color: '#111', fontWeight: '600' },
  divider:       { height: 1, backgroundColor: '#F0F0F0' },

  downloadCard: {
    backgroundColor: '#fff', marginHorizontal: 16,
    borderRadius: 16, padding: 16, marginBottom: 16,
  },
  downloadTitle:    { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  downloadSubtitle: { fontSize: 12, color: '#888', marginBottom: 16 },
  downloadBtn: {
    backgroundColor: '#1669ef', borderRadius: 12, padding: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
  },
  downloadBtnDisabled: { backgroundColor: '#93c5fd' },
  downloadBtnText:     { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  errorState: { alignItems: 'center', marginTop: 60 },
  errorText:  { fontSize: 16, color: '#888', marginBottom: 8 },
  retryText:  { fontSize: 14, color: '#1669ef', fontWeight: '600' },
});
