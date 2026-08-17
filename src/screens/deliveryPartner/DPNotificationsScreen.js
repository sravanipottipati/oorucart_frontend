import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import client from '../../api/client';

const TYPE_ICONS = {
  new_order:          { icon: 'cube-outline',            color: '#1669ef' },
  order_cancelled:    { icon: 'close-circle-outline',     color: '#DC2626' },
  order_delivered:    { icon: 'checkmark-circle-outline', color: '#16a34a' },
  settlement:         { icon: 'wallet-outline',           color: '#16a34a' },
};

export default function DPNotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const res = await client.get('/orders/notifications/', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(res.data.notifications || []);
    } catch (e) {
      // fail silently, show empty state
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleMarkRead = async (id) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      await client.post(`/orders/notifications/${id}/read/`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (e) {
      // ignore
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1669ef" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={22} color="#1669ef" />
        <Text style={styles.backBtnText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Notifications</Text>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="notifications-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No notifications yet</Text>
          </View>
        }
        renderItem={({ item }) => {
          const typeInfo = TYPE_ICONS[item.type] || { icon: 'notifications-outline', color: '#6B7280' };
          return (
            <TouchableOpacity
              style={[styles.notifCard, !item.is_read && styles.notifCardUnread]}
              onPress={() => !item.is_read && handleMarkRead(item.id)}
            >
              <Ionicons name={typeInfo.icon} size={22} color={typeInfo.color} />
              <View style={{ flex: 1 }}>
                <Text style={styles.notifTitle}>{item.title}</Text>
                <Text style={styles.notifMessage}>{item.message}</Text>
              </View>
              {!item.is_read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingHorizontal: 20 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    marginBottom: 16, marginTop: 44, alignSelf: 'flex-start',
    paddingVertical: 8, paddingRight: 12,
  },
  backBtnText: { fontSize: 16, color: '#1669ef', fontWeight: '600' },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 16 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 8 },
  emptyText: { fontSize: 15, color: '#6B7280', fontWeight: '600' },
  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, marginBottom: 10,
  },
  notifCardUnread: { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
  notifTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  notifMessage: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1669ef', marginTop: 4 },
});