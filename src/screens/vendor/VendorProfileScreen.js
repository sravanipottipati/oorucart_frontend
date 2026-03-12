import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import client from '../../api/client';

export default function VendorProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [shop, setShop]   = useState(null);
  const [wallet, setWallet] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [shopRes, walletRes] = await Promise.all([
          client.get('/vendors/myshop/'),
          client.get('/wallet/summary/'),
        ]);
        setShop(shopRes.data);
        setWallet(walletRes.data);
      } catch (e) {
        console.log('Error:', e.message);
      }
    };
    fetchData();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'V';

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => navigation.navigate('VendorNotifications')}
        >
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.editIconBtn}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editIcon}>✏️</Text>
          </TouchableOpacity>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>{user?.full_name || 'Vendor'}</Text>
          <Text style={styles.shopName}>{shop?.shop_name || 'Your Shop'}</Text>
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>📍</Text>
            <Text style={styles.locationText}>{shop?.town || 'Your Town'}</Text>
          </View>
        </View>

        {/* Earnings Card */}
        <TouchableOpacity
          style={styles.earningsCard}
          onPress={() => navigation.navigate('VendorWallet')}
        >
          <View>
            <Text style={styles.earningsLabel}>Total Earnings</Text>
            <Text style={styles.earningsValue}>
              ₹{wallet?.total_earnings?.toFixed(0) || wallet?.wallet_balance?.toFixed(0) || '0'}
            </Text>
            <Text style={styles.viewEarnings}>View Earnings {'>'}</Text>
          </View>
          <View style={styles.earningsIconBox}>
            <Text style={styles.earningsIcon}>💰</Text>
          </View>
        </TouchableOpacity>

        {/* Account Menu */}
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.menuCard}>

          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: '#EFF6FF' }]}>
                <Text style={styles.menuIcon}>👤</Text>
              </View>
              <Text style={styles.menuLabel}>Edit Profile</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => navigation.navigate('VendorWallet')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: '#DCFCE7' }]}>
                <Text style={styles.menuIcon}>💵</Text>
              </View>
              <Text style={styles.menuLabel}>Earnings & Settlements</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, styles.menuItemBorder]}
            onPress={() => navigation.navigate('VendorHelp')}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: '#FFF7ED' }]}>
                <Text style={styles.menuIcon}>❓</Text>
              </View>
              <Text style={styles.menuLabel}>Help & Support</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={[styles.menuIconBox, { backgroundColor: '#F3F4F6' }]}>
                <Text style={styles.menuIcon}>📄</Text>
              </View>
              <Text style={styles.menuLabel}>Privacy Policy</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>

        </View>

        {/* Shop Details */}
        <Text style={styles.sectionTitle}>Shop Details</Text>
        <View style={styles.menuCard}>
          <View style={[styles.infoRow, styles.menuItemBorder]}>
            <Text style={styles.infoLabel}>Shop Name</Text>
            <Text style={styles.infoValue}>{shop?.shop_name || '—'}</Text>
          </View>
          <View style={[styles.infoRow, styles.menuItemBorder]}>
            <Text style={styles.infoLabel}>Category</Text>
            <Text style={styles.infoValue}>{shop?.category || '—'}</Text>
          </View>
          <View style={[styles.infoRow, styles.menuItemBorder]}>
            <Text style={styles.infoLabel}>Delivery Type</Text>
            <Text style={styles.infoValue}>{shop?.delivery_type || '—'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Est. Delivery Time</Text>
            <Text style={styles.infoValue}>{shop?.estimated_delivery_time || 30} mins</Text>
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪  Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>OoruCart Seller v1.0.0</Text>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Tab */}
      <View style={styles.bottomTab}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('VendorHome')}
        >
          <Text style={styles.tabIcon}>⊞</Text>
          <Text style={styles.tabLabel}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('VendorOrders')}
        >
          <Text style={styles.tabIcon}>📋</Text>
          <Text style={styles.tabLabel}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('VendorProducts')}
        >
          <Text style={styles.tabIcon}>📦</Text>
          <Text style={styles.tabLabel}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={[styles.tabIcon, { color: '#2563EB' }]}>👤</Text>
          <Text style={styles.tabLabelActive}>Profile</Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#111' },
  bellBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  bellIcon: { fontSize: 22 },

  profileCard: {
    backgroundColor: '#fff', margin: 16, borderRadius: 16,
    padding: 20, alignItems: 'center',
  },
  editIconBtn: {
    alignSelf: 'flex-end', width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
    marginBottom: 8,
  },
  editIcon: { fontSize: 14 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#2563EB', justifyContent: 'center',
    alignItems: 'center', marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  shopName: { fontSize: 14, color: '#555', marginBottom: 6 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationIcon: { fontSize: 14 },
  locationText: { fontSize: 13, color: '#888' },

  earningsCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#2563EB', marginHorizontal: 16, marginBottom: 16,
    borderRadius: 16, padding: 20,
  },
  earningsLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 6 },
  earningsValue: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  viewEarnings: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  earningsIconBox: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center',
  },
  earningsIcon: { fontSize: 24 },

  sectionTitle: {
    fontSize: 14, fontWeight: '600', color: '#888',
    marginHorizontal: 16, marginBottom: 8, marginTop: 4,
  },
  menuCard: {
    backgroundColor: '#fff', marginHorizontal: 16,
    borderRadius: 16, marginBottom: 16, overflow: 'hidden',
  },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIconBox: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  menuIcon: { fontSize: 18 },
  menuLabel: { fontSize: 14, color: '#111', fontWeight: '500' },
  menuArrow: { fontSize: 20, color: '#9CA3AF' },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  infoLabel: { fontSize: 13, color: '#888' },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#111' },

  logoutBtn: {
    backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 16,
    padding: 16, alignItems: 'center', marginBottom: 12,
  },
  logoutText: { fontSize: 15, color: '#EF4444', fontWeight: '600' },
  version: { textAlign: 'center', fontSize: 12, color: '#9CA3AF', marginBottom: 8 },

  bottomTab: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
    paddingBottom: 24, paddingTop: 10,
    position: 'absolute', bottom: 0, left: 0, right: 0,
  },
  tabItem: { flex: 1, alignItems: 'center' },
  tabIcon: { fontSize: 22, marginBottom: 2, color: '#9CA3AF' },
  tabLabel: { fontSize: 11, color: '#9CA3AF' },
  tabLabelActive: { fontSize: 11, color: '#2563EB', fontWeight: 'bold' },
});