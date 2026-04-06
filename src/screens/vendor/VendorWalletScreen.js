import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native';
import client from '../../api/client';

export default function VendorWalletScreen({ navigation }) {
  const [wallet, setWallet]         = useState(null);
  const [transactions, setTrans]    = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const [walletRes, transRes] = await Promise.all([
        client.get('/wallet/summary/'),
        client.get('/wallet/transactions/'),
      ]);
      setWallet(walletRes.data);
      const data = Array.isArray(transRes.data)
        ? transRes.data
        : transRes.data.transactions || [];
      setTrans(data);
    } catch (e) {
      console.log('Error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1669ef" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings</Text>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => navigation.navigate('VendorNotifications')}
        >
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >

        {/* Total Earnings Card */}
        <View style={styles.totalCard}>
          <View style={styles.totalCardLeft}>
            <Text style={styles.totalLabel}>Total Earnings</Text>
            <Text style={styles.totalValue}>
              ₹{wallet?.total_earnings?.toFixed(0) || wallet?.wallet_balance?.toFixed(2) || '0'}
            </Text>
            <Text style={styles.lifetimeLabel}>Lifetime earnings</Text>
          </View>
          <View style={styles.totalCardIcon}>
            <Text style={styles.totalCardIconText}>💰</Text>
          </View>
        </View>

        {/* Pending + Settled */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#FFF7ED' }]}>
            <Text style={styles.statIcon}>🕐</Text>
            <Text style={styles.statLabel}>Pending Settlement</Text>
            <Text style={[styles.statValue, { color: '#EA580C' }]}>
              ₹{wallet?.pending_settlement?.toFixed(0) || wallet?.wallet_balance?.toFixed(0) || '0'}
            </Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#F0FDF4' }]}>
            <Text style={styles.statIcon}>✅</Text>
            <Text style={styles.statLabel}>Settled Amount</Text>
            <Text style={[styles.statValue, { color: '#16A34A' }]}>
              ₹{wallet?.settled_amount?.toFixed(0) || '0'}
            </Text>
          </View>
        </View>

        {/* Settlement History */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Settlement History</Text>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {transactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💸</Text>
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.emptySubtitle}>Your settlements will appear here</Text>
          </View>
        ) : (
          transactions.map((txn, index) => (
            <View key={index} style={styles.txnCard}>
              <View style={styles.txnLeft}>
                <Text style={styles.txnId}>
                  SETT#{txn.id?.toString().slice(-4).toUpperCase() || index + 1001}
                </Text>
                <Text style={styles.txnDate}>{formatDate(txn.created_at || txn.date)}</Text>
              </View>
              <View style={styles.txnRight}>
                <Text style={styles.txnAmount}>₹{parseFloat(txn.amount || txn.net_amount || 0).toFixed(0)}</Text>
                <View style={[
                  styles.txnBadge,
                  { backgroundColor: txn.status === 'settled' ? '#DCFCE7' : '#FFF7ED' }
                ]}>
                  <Text style={[
                    styles.txnBadgeText,
                    { color: txn.status === 'settled' ? '#16A34A' : '#EA580C' }
                  ]}>
                    ● {txn.status === 'settled' ? 'Paid' : 'Pending'}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 24, color: '#111' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#111' },
  bellBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  bellIcon: { fontSize: 22 },

  totalCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#1669ef', margin: 16, borderRadius: 20, padding: 24,
  },
  totalCardLeft: {},
  totalLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  totalValue: { fontSize: 32, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  lifetimeLabel: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  totalCardIcon: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  totalCardIconText: { fontSize: 26 },

  statsRow: {
    flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 16,
  },
  statCard: {
    flex: 1, borderRadius: 16, padding: 16,
  },
  statIcon: { fontSize: 22, marginBottom: 8 },
  statLabel: { fontSize: 12, color: '#888', marginBottom: 6 },
  statValue: { fontSize: 20, fontWeight: 'bold' },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingHorizontal: 16, marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#111' },
  viewAll: { fontSize: 13, color: '#1669ef', fontWeight: '600' },

  txnCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10,
    borderRadius: 14, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  txnLeft: {},
  txnId: { fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  txnDate: { fontSize: 12, color: '#888' },
  txnRight: { alignItems: 'flex-end', gap: 6 },
  txnAmount: { fontSize: 15, fontWeight: 'bold', color: '#111' },
  txnBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  txnBadgeText: { fontSize: 12, fontWeight: '600' },

  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyEmoji: { fontSize: 50, marginBottom: 12 },
  emptyTitle: { fontSize: 16, fontWeight: 'bold', color: '#111', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: '#888' },
});