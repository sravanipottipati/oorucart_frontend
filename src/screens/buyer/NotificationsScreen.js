import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';

const NOTIFICATIONS = [
  {
    id: 1, type: 'order', read: false,
    title: 'Order Accepted!',
    message: 'Ravi Vegetables has accepted your order.',
    time: '2 mins ago', icon: '✅',
  },
  {
    id: 2, type: 'order', read: false,
    title: 'Order is being prepared',
    message: 'Your order from Ravi Vegetables is being prepared.',
    time: '10 mins ago', icon: '👨‍🍳',
  },
  {
    id: 3, type: 'promo', read: true,
    title: 'New shops in Nellore!',
    message: '3 new shops have joined OoruCart in your area.',
    time: '1 hour ago', icon: '🏪',
  },
  {
    id: 4, type: 'order', read: true,
    title: 'Order Delivered!',
    message: 'Your order from Ravi Vegetables was delivered.',
    time: 'Yesterday', icon: '🎉',
  },
  {
    id: 5, type: 'promo', read: true,
    title: 'Welcome to OoruCart!',
    message: 'Discover local shops and order fresh products.',
    time: '2 days ago', icon: '👋',
  },
];

export default function NotificationsScreen({ navigation }) {
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
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 70 }} />
        )}
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔔</Text>
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptySubtitle}>You're all caught up!</Text>
          </View>
        ) : (
          notifications.map(item => (
            <TouchableOpacity
              key={item.id}
              style={[styles.notifCard, !item.read && styles.notifCardUnread]}
              onPress={() => markRead(item.id)}
            >
              <View style={[styles.iconBox, !item.read && styles.iconBoxUnread]}>
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
          ))
        )}
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
  markAllText: { fontSize: 13, color: '#2563EB', fontWeight: '600' },

  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#fff', padding: 16,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  notifCardUnread: { backgroundColor: '#F0F7FF' },
  iconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#F3F4F6', justifyContent: 'center',
    alignItems: 'center', marginRight: 12,
  },
  iconBoxUnread: { backgroundColor: '#DBEAFE' },
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

  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 60, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 8 },
  emptySubtitle: { fontSize: 13, color: '#888' },
});