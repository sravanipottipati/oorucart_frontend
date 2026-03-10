import React, { useState, useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, Alert, TouchableOpacity, RefreshControl,
} from 'react-native';
import client from '../../api/client';

export default function VendorWalletScreen({ navigation }) {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [sumRes, txRes] = await Promise.all([
        client.get('/wallet/summary/'),
        client.get('/wallet/transactions/'),
      ]);
      setSummary(sumRes.data);
      setTransactions(txRes.data.transactions);
    } catch (e) {
      Alert.alert('Error', 'Could not load wallet data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredTx = transactions.filter(t => {
    if (activeTab === 'pending') return t.status === 'pending';
    if (activeTab === 'settled') return t.status === 'settled';
    return true;
  });

  const renderTransaction = ({ item }) => (
    <View style={styles.txCard}>
      <View style={styles.txLeft}>
        <Text style={styles.txEmoji}>
          {item.status === 'settled' ? '✅' : '🕐'}
        </Text>
        <View>
          <Text style={styles.txDesc}>{item.description || 'Platform fee'}</Text>
          <Text style={styles.txDate}>
            {new Date(item.created_at).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </Text>
          {item.status === 'settled' && item.settled_at && (
            <Text style={styles.txSettled}>
              Settled: {new Date(item.settled_at).toLocaleDateString('en-IN')}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.txRight}>
        <Text style={styles.txAmount}>Rs.{item.amount}</Text>
        <View style={[styles.txBadge, {
          backgroundColor: item.status === 'settled' ? '#E8F5E9' : '#FFF3E0'
        }]}>
          <Text style={[styles.txBadgeText, {
            color: item.status === 'settled' ? '#2E7D32' : '#E65100'
          }]}>
            {item.status === 'settled' ? 'Settled' : 'Pending'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color="#2E7D32" />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Wallet & Fees</Text>
        <View style={{ width: 60 }} />
      </View>

      <FlatList
        data={filteredTx}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchData(); }}
          />
        }
        ListHeaderComponent={
          <>
            {/* Summary Cards */}
            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, { backgroundColor: '#E8F5E9' }]}>
                <Text style={styles.summaryEmoji}>💰</Text>
                <Text style={styles.summaryNum}>Rs.{summary?.pending_amount || 0}</Text>
                <Text style={styles.summaryLabel}>Pending Fees</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: '#E3F2FD' }]}>
                <Text style={styles.summaryEmoji}>✅</Text>
                <Text style={styles.summaryNum}>Rs.{summary?.settled_amount || 0}</Text>
                <Text style={styles.summaryLabel}>Settled</Text>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: '#F3E5F5' }]}>
                <Text style={styles.summaryEmoji}>📊</Text>
                <Text style={styles.summaryNum}>Rs.{summary?.total_fees || 0}</Text>
                <Text style={styles.summaryLabel}>Total Fees</Text>
              </View>
            </View>

            {/* Info Box */}
            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>💡 How fees work</Text>
              <Text style={styles.infoText}>
                Platform fee is recorded when you accept an order.
                Admin collects the fee weekly via cash or bank transfer.
              </Text>
              <View style={styles.feeTable}>
                <Text style={styles.feeRow}>🥦 Vegetables   — Rs.5 per order</Text>
                <Text style={styles.feeRow}>🍞 Bakery        — Rs.7 per order</Text>
                <Text style={styles.feeRow}>🍽 Restaurant   — Rs.10 per order</Text>
                <Text style={styles.feeRow}>🛒 Supermarket — Rs.7 per order</Text>
              </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
              {[['all','All'],['pending','Pending'],['settled','Settled']].map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={[styles.tab, activeTab === key && styles.activeTab]}
                  onPress={() => setActiveTab(key)}
                >
                  <Text style={[styles.tabText, activeTab === key && styles.activeTabText]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {filteredTx.length === 0 && (
              <View style={styles.empty}>
                <Text style={styles.emptyIcon}>💸</Text>
                <Text style={styles.emptyText}>No transactions yet</Text>
              </View>
            )}
          </>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    backgroundColor: '#fff', padding: 20, paddingTop: 50,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  backBtn: { padding: 4 },
  backText: { color: '#2E7D32', fontSize: 15, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  summaryRow: {
    flexDirection: 'row', gap: 10, padding: 16,
  },
  summaryCard: {
    flex: 1, borderRadius: 14, padding: 14, alignItems: 'center',
  },
  summaryEmoji: { fontSize: 24, marginBottom: 6 },
  summaryNum: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 2 },
  summaryLabel: { fontSize: 11, color: '#555', textAlign: 'center' },
  infoBox: {
    backgroundColor: '#fff', margin: 16, marginTop: 0,
    borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: '#f0f0f0',
  },
  infoTitle: { fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 6 },
  infoText: { fontSize: 13, color: '#666', lineHeight: 18, marginBottom: 10 },
  feeTable: { backgroundColor: '#f9f9f9', borderRadius: 10, padding: 10, gap: 4 },
  feeRow: { fontSize: 13, color: '#444', marginBottom: 3 },
  tabs: {
    flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 16,
    borderRadius: 12, padding: 4, marginBottom: 12,
    borderWidth: 1, borderColor: '#f0f0f0',
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: '#111' },
  tabText: { fontSize: 13, color: '#888', fontWeight: '600' },
  activeTabText: { color: '#fff', fontWeight: 'bold' },
  list: { paddingBottom: 40 },
  txCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginHorizontal: 16,
    marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', borderWidth: 1, borderColor: '#f0f0f0',
  },
  txLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  txEmoji: { fontSize: 24 },
  txDesc: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 2 },
  txDate: { fontSize: 12, color: '#888' },
  txSettled: { fontSize: 11, color: '#2E7D32', marginTop: 2 },
  txRight: { alignItems: 'flex-end', gap: 6 },
  txAmount: { fontSize: 15, fontWeight: 'bold', color: '#111' },
  txBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  txBadgeText: { fontSize: 11, fontWeight: 'bold' },
  empty: { alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#888' },
});