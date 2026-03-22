import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native';
import client from '../../api/client';

const TYPE_CONFIG = {
  new_order:       { icon: '📦', bg: '#f0fdfa' },
  order_cancelled: { icon: '❌', bg: '#FEF2F2' },
  order_delivered: { icon: '✅', bg: '#DCFCE7' },
  settlement:      { icon: '💰', bg: '#DCFCE7' },
  order_placed:    { icon: '🛒', bg: '#FFF7ED' },
};

const getTimeAgo = (dateStr) => {
  const diff = Math.floor((new Date() - new Date(dateStr)) / 60000);
  if (diff < 1)    return 'just now';
  if (diff < 60)   return `${diff} mins ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)} hrs ago`;
  return `${Math.floor(diff / 1440)} days ago`;
};

export default function VendorNotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await client.get('/orders/notifications/');
      setNotifications(res.data.notifications || []);
    } catch (e) {
      console.log('Error:', e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);
  const onRefresh = () => { setRefreshing(true); fetchNotifications(); };

  const markAllRead = async () => {
    try {
      await client.post('/orders/notifications/read/');
      fetchNotifications();
    } catch (e) {
      console.log('Error:', e.message);
    }
  };

  const markRead = async (id, orderId) => {
    try {
      await client.post(`/orders/notifications/${id}/read/`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      if (orderId) navigation.navigate('VendorOrderDetail', { orderId });
    } catch (e) {
      console.log('Error:', e.message);
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.headerSub}>{unreadCount} unread</Text>
          )}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
            <Text style={styles.markAllIcon}>✓</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0d9488" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>🔔</Text>
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySubtitle}>New orders will appear here</Text>
            </View>
          ) : (
            notifications.map(item => {
              const config = TYPE_CONFIG[item.type] || { icon: '🔔', bg: '#F3F4F6' };
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.notifCard, !item.is_read && styles.notifCardUnread]}
                  onPress={() => markRead(item.id, item.order_id)}
                >
                  <View style={[styles.iconBox, { backgroundColor: config.bg }]}>
                    <Text style={styles.iconText}>{config.icon}</Text>
                  </View>
                  <View style={styles.notifInfo}>
                    <Text style={[styles.notifTitle, !item.is_read && styles.notifTitleUnread]}>
                      {item.title}
                    </Text>
                    <Text style={styles.notifMessage}>{item.message}</Text>
                    <Text style={styles.notifTime}>{getTimeAgo(item.created_at)}</Text>
                  </View>
                  {!item.is_read && <View style={styles.unreadDot} />}
                </TouchableOpacity>
              );
            })
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
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
    backgroundColor: '#f0fdfa', justifyContent: 'center', alignItems: 'center',
  },
  markAllIcon: { fontSize: 18, color: '#0d9488', fontWeight: 'bold' },

  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#888', textAlign: 'center' },

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
    backgroundColor: '#0d9488', marginTop: 4,
  },
});