import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';

const TYPE_CONFIG = {
  new_order:        { icon: 'bag-handle',          color: '#1669ef', bg: '#eff6ff',  label: 'New Order'     },
  order_placed:     { icon: 'receipt',              color: '#1669ef', bg: '#eff6ff',  label: 'Order Placed'  },
  order_accepted:   { icon: 'checkmark-circle',     color: '#16A34A', bg: '#DCFCE7',  label: 'Accepted'      },
  order_rejected:   { icon: 'close-circle',         color: '#EF4444', bg: '#FEF2F2',  label: 'Rejected'      },
  order_preparing:  { icon: 'restaurant',           color: '#F59E0B', bg: '#FFF7ED',  label: 'Preparing'     },
  order_dispatched: { icon: 'bicycle',              color: '#8B5CF6', bg: '#F5F3FF',  label: 'Dispatched'    },
  order_delivered:  { icon: 'home',                 color: '#16A34A', bg: '#DCFCE7',  label: 'Delivered'     },
  order_cancelled:  { icon: 'close-circle-outline', color: '#EF4444', bg: '#FEF2F2',  label: 'Cancelled'     },
  settlement:       { icon: 'cash',                 color: '#16A34A', bg: '#DCFCE7',  label: 'Settlement'    },
};

const getTimeAgo = (dateStr) => {
  const diff = Math.floor((new Date() - new Date(dateStr)) / 60000);
  if (diff < 1)    return 'Just now';
  if (diff < 60)   return `${diff} min ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)} hr ago`;
  if (diff < 2880) return 'Yesterday';
  return `${Math.floor(diff / 1440)} days ago`;
};

const getDateGroup = (dateStr) => {
  const diff = Math.floor((new Date() - new Date(dateStr)) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
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
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (e) { console.log('Error:', e.message); }
  };

  const markRead = async (id, orderId) => {
    try {
      await client.post(`/orders/notifications/${id}/read/`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      if (orderId) navigation.navigate('VendorOrderDetail', { orderId });
    } catch (e) { console.log('Error:', e.message); }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Group notifications by date
  const grouped = notifications.reduce((acc, notif) => {
    const group = getDateGroup(notif.created_at);
    if (!acc[group]) acc[group] = [];
    acc[group].push(notif);
    return acc;
  }, {});

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount} new</Text>
            </View>
          )}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={markAllRead} style={styles.markAllBtn}>
            <Ionicons name="checkmark-done" size={18} color="#1669ef" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {/* Unread summary bar */}
      {unreadCount > 0 && (
        <View style={styles.summaryBar}>
          <Ionicons name="notifications" size={14} color="#1669ef" />
          <Text style={styles.summaryText}>
            You have <Text style={styles.summaryBold}>{unreadCount} unread</Text> notification{unreadCount > 1 ? 's' : ''}
          </Text>
          <TouchableOpacity onPress={markAllRead}>
            <Text style={styles.summaryMarkAll}>Mark all read</Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#1669ef" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1669ef" colors={['#1669ef']} />}
        >
          {notifications.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="notifications-outline" size={48} color="#9CA3AF" />
              </View>
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySubtitle}>
                New orders and updates will appear here
              </Text>
            </View>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <View key={group}>
                {/* Date group header */}
                <View style={styles.groupHeader}>
                  <Text style={styles.groupHeaderText}>{group}</Text>
                </View>

                {items.map(item => {
                  const config = TYPE_CONFIG[item.type] || { icon: 'notifications', color: '#888', bg: '#F3F4F6', label: 'Notification' };
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.notifCard, !item.is_read && styles.notifCardUnread]}
                      onPress={() => markRead(item.id, item.order_id)}
                      activeOpacity={0.75}
                    >
                      {/* Left — icon */}
                      <View style={[styles.iconBox, { backgroundColor: config.bg }]}>
                        <Ionicons name={config.icon} size={22} color={config.color} />
                      </View>

                      {/* Middle — info */}
                      <View style={styles.notifInfo}>
                        <View style={styles.notifTopRow}>
                          <Text style={[styles.notifTitle, !item.is_read && styles.notifTitleUnread]} numberOfLines={1}>
                            {item.title}
                          </Text>
                          <Text style={styles.notifTime}>{getTimeAgo(item.created_at)}</Text>
                        </View>
                        <Text style={styles.notifMessage} numberOfLines={2}>
                          {item.message}
                        </Text>
                        {item.order_id && (
                          <View style={styles.notifAction}>
                            <Ionicons name="receipt-outline" size={12} color="#1669ef" />
                            <Text style={styles.notifActionText}>View Order</Text>
                            <Ionicons name="chevron-forward" size={12} color="#1669ef" />
                          </View>
                        )}
                      </View>

                      {/* Right — unread dot */}
                      {!item.is_read && <View style={styles.unreadDot} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))
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
  backBtn:      { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle:  { fontSize: 17, fontWeight: 'bold', color: '#111' },
  unreadBadge: {
    backgroundColor: '#1669ef', borderRadius: 20,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  unreadBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  markAllBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center',
  },

  summaryBar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#eff6ff', paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#dbeafe',
  },
  summaryText:    { flex: 1, fontSize: 12, color: '#555' },
  summaryBold:    { fontWeight: '700', color: '#1669ef' },
  summaryMarkAll: { fontSize: 12, color: '#1669ef', fontWeight: '600' },

  loadingBox:  { alignItems: 'center', marginTop: 60, gap: 12 },
  loadingText: { fontSize: 14, color: '#888' },

  emptyState: { alignItems: 'center', marginTop: 80, paddingHorizontal: 32 },
  emptyIconCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: '#F3F4F6', justifyContent: 'center',
    alignItems: 'center', marginBottom: 20,
    borderWidth: 2, borderColor: '#E5E7EB',
  },
  emptyTitle:    { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 20 },

  groupHeader: {
    paddingHorizontal: 16, paddingVertical: 8,
    backgroundColor: '#F3F4F6',
  },
  groupHeaderText: { fontSize: 12, fontWeight: '700', color: '#888', letterSpacing: 0.5 },

  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#fff', padding: 16,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  notifCardUnread: { backgroundColor: '#F8FAFF', borderLeftWidth: 3, borderLeftColor: '#1669ef' },

  iconBox: {
    width: 46, height: 46, borderRadius: 23,
    justifyContent: 'center', alignItems: 'center', marginRight: 12, flexShrink: 0,
  },

  notifInfo:   { flex: 1 },
  notifTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  notifTitle:       { fontSize: 14, fontWeight: '500', color: '#555', flex: 1, marginRight: 8 },
  notifTitleUnread: { fontWeight: '700', color: '#111' },
  notifTime:        { fontSize: 11, color: '#9CA3AF', flexShrink: 0 },
  notifMessage:     { fontSize: 13, color: '#888', lineHeight: 18, marginBottom: 6 },
  notifAction: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  notifActionText: { fontSize: 12, color: '#1669ef', fontWeight: '600' },

  unreadDot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#1669ef', marginTop: 6, marginLeft: 8, flexShrink: 0,
  },
});