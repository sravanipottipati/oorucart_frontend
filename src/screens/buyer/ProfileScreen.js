import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const initials = user?.full_name
    ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  const menuItems = [
    { icon: '👤', label: 'Edit Profile',   screen: 'EditProfile' },
    { icon: '📍', label: 'My Addresses',   screen: 'Address' },
    { icon: '📦', label: 'My Orders',      screen: 'MyOrders' },
    { icon: '❤️',  label: 'Wishlist',       screen: 'Wishlist' },
    { icon: '❓', label: 'Help & Support', screen: 'HelpSupport' },
    { icon: '📄', label: 'Privacy Policy', screen: null },
  ];

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <TouchableOpacity
              style={styles.editIconBtn}
              onPress={() => navigation.navigate('EditProfile')}
            >
              <Text style={styles.editIcon}>✏️</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
          <Text style={styles.userPhone}>+91 {user?.phone_number || ''}</Text>
          {user?.email ? <Text style={styles.userEmail}>{user.email}</Text> : null}
        </View>

        {/* Menu Items */}
        <View style={styles.menuCard}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index < menuItems.length - 1 && styles.menuItemBorder,
              ]}
              onPress={() => item.screen && navigation.navigate(item.screen)}
            >
              <View style={styles.menuLeft}>
                <View style={styles.menuIconBox}>
                  <Text style={styles.menuIcon}>{item.icon}</Text>
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪  Logout</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Shop2me v1.0.0</Text>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Tab */}
      <View style={styles.bottomTab}>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('MyOrders')}
        >
          <Text style={styles.tabIcon}>📋</Text>
          <Text style={styles.tabLabel}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={styles.tabIcon}>🛒</Text>
          <Text style={styles.tabLabel}>Cart</Text>
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
  avatarRow: { width: '100%', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#fff', fontSize: 26, fontWeight: 'bold' },
  editIconBtn: {
    position: 'absolute', right: 0, top: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
  },
  editIcon: { fontSize: 14 },
  userName: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  userPhone: { fontSize: 14, color: '#888', marginBottom: 2 },
  userEmail: { fontSize: 13, color: '#888' },

  menuCard: {
    backgroundColor: '#fff', marginHorizontal: 16,
    borderRadius: 16, marginBottom: 12, overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', padding: 16,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  menuIconBox: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center',
  },
  menuIcon: { fontSize: 18 },
  menuLabel: { fontSize: 14, color: '#111', fontWeight: '500' },
  menuArrow: { fontSize: 20, color: '#9CA3AF' },

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