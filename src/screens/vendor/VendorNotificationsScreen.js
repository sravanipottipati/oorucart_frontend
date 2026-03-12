import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';

const NOTIFICATIONS = [
  {
    id: 1, read: false, icon: '📦',
    iconBg: '#EFF6FF',
    title: 'New Order Received',
    message: 'Order #A3E55C9C received for ₹40',
    time: '2 mins ago',
  },
  {
    id: 2, read: true, icon: '✅',
    iconBg: '#DCFCE7',
    title: 'Order Delivered',
    message: 'Order #406FEC75 successfully delivered',
    time: '30 mins ago',
  },
  {
    id: 3, read: true, icon: '💰',
    iconBg: '#DCFCE7',
    title: 'Settlement Completed',
    message: '₹500 credited to your account',
    time: 'Today, 10:30 AM',
  },
  {
    id: 4, read: true, icon: '⚠️',
    iconBg: '#FFF7ED',
    title: 'Low Stock Alert',
    message: 'Fresh Tomatoes stock is running low',
    time: 'Yesterday',
  },
  {
    id: 5, read: true, icon: '❌',
    iconBg: '#FEF2F2',
    title: 'Order Cancelled',
    message: 'Order #D0E0BE60 cancelled by customer',
    time: '2 days ago',
  },
];

export default function VendorNotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSub}>{notifications.length} Notifications</Text>
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllIcon}>✓</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {notifications.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[styles.notifCard, !item.read && styles.notifCardUnread]}
            onPress={() => markRead(item.id)}
          >
            <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
              <Text style={styles.iconText}>{item.icon}</Text>
            </View>
            <View style={styles.notifInfo}>
              <Text style={[styles.notifTitle, !item.read && styles.notifTitleUnread]}>
                {item.title}
              </Text>
              <Text style={styles.notifMessage}>{item.message}</Text>
              <Text style={styles.notifTime}>{item.time}</Text>
            </View>
            {!item.read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 24, color: '#111' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#111' },
  headerSub: { fontSize: 12, color: '#888', marginTop: 2 },
  markAllBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center',
  },
  markAllIcon: { fontSize: 18, color: '#2563EB', fontWeight: 'bold' },

  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#fff', padding: 16,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  notifCardUnread: { backgroundColor: '#F8FAFF' },
  iconBox: {
    width: 46, height: 46, borderRadius: 23,
    justifyContent: 'center', alignItems: 'center', marginRight: 12,
  },
  iconText: { fontSize: 22 },
  notifInfo: { flex: 1 },
  notifTitle: { fontSize: 14, fontWeight: '500', color: '#555', marginBottom: 4 },
  notifTitleUnread: { fontWeight: 'bold', color: '#111' },
  notifMessage: { fontSize: 13, color: '#888', lineHeight: 18, marginBottom: 4 },
  notifTime: { fontSize: 11, color: '#9CA3AF' },
  unreadDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#2563EB', marginTop: 4,
  },
});