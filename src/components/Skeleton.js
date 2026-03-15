import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

export const SkeletonBox = ({ width, height, borderRadius = 8, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width, height, borderRadius,
          backgroundColor: '#E5E7EB',
          opacity,
        },
        style,
      ]}
    />
  );
};

// Shop Card Skeleton
export const ShopCardSkeleton = () => (
  <View style={styles.shopCard}>
    <SkeletonBox width="100%" height={100} borderRadius={0} />
    <View style={styles.shopCardBody}>
      <View style={styles.shopCardTop}>
        <SkeletonBox width="60%" height={18} borderRadius={6} />
        <SkeletonBox width={60} height={22} borderRadius={20} />
      </View>
      <SkeletonBox width="40%" height={13} borderRadius={4} style={{ marginTop: 8 }} />
      <View style={styles.metaRow}>
        <SkeletonBox width={60} height={13} borderRadius={4} />
        <SkeletonBox width={80} height={13} borderRadius={4} />
        <SkeletonBox width={90} height={13} borderRadius={4} />
      </View>
    </View>
  </View>
);

// Product Card Skeleton
export const ProductCardSkeleton = () => (
  <View style={styles.productCard}>
    <View style={styles.productLeft}>
      <SkeletonBox width="70%" height={16} borderRadius={6} />
      <SkeletonBox width="90%" height={12} borderRadius={4} style={{ marginTop: 8 }} />
      <SkeletonBox width="90%" height={12} borderRadius={4} style={{ marginTop: 4 }} />
      <SkeletonBox width="30%" height={16} borderRadius={6} style={{ marginTop: 10 }} />
    </View>
    <View style={styles.productRight}>
      <SkeletonBox width={80} height={80} borderRadius={12} />
      <SkeletonBox width={80} height={32} borderRadius={8} style={{ marginTop: 8 }} />
    </View>
  </View>
);

// Order Card Skeleton
export const OrderCardSkeleton = () => (
  <View style={styles.orderCard}>
    <View style={styles.orderTop}>
      <SkeletonBox width={44} height={44} borderRadius={22} />
      <View style={styles.orderInfo}>
        <SkeletonBox width="60%" height={16} borderRadius={6} />
        <SkeletonBox width="40%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
      </View>
      <SkeletonBox width={80} height={28} borderRadius={20} />
    </View>
    <SkeletonBox width="100%" height={1} borderRadius={0} style={{ marginVertical: 10 }} />
    <SkeletonBox width="80%" height={13} borderRadius={4} />
    <SkeletonBox width="60%" height={13} borderRadius={4} style={{ marginTop: 6 }} />
    <View style={styles.orderBottom}>
      <SkeletonBox width={80} height={16} borderRadius={6} />
      <SkeletonBox width={100} height={36} borderRadius={10} />
    </View>
  </View>
);

// Notification Card Skeleton
export const NotificationSkeleton = () => (
  <View style={styles.notifCard}>
    <SkeletonBox width={44} height={44} borderRadius={22} />
    <View style={styles.notifInfo}>
      <SkeletonBox width="70%" height={14} borderRadius={6} />
      <SkeletonBox width="90%" height={12} borderRadius={4} style={{ marginTop: 6 }} />
      <SkeletonBox width="30%" height={10} borderRadius={4} style={{ marginTop: 6 }} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  // Shop card
  shopCard: {
    backgroundColor: '#fff', marginHorizontal: 16,
    marginBottom: 16, borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07, shadowRadius: 8, elevation: 3,
  },
  shopCardBody: { padding: 14 },
  shopCardTop:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  metaRow:      { flexDirection: 'row', gap: 10, marginTop: 8 },

  // Product card
  productCard: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: 16, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
    backgroundColor: '#fff',
  },
  productLeft:  { flex: 1, paddingRight: 12 },
  productRight: { alignItems: 'center' },

  // Order card
  orderCard: {
    backgroundColor: '#fff', borderRadius: 16,
    padding: 16, marginBottom: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 2,
  },
  orderTop:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  orderInfo:  { flex: 1 },
  orderBottom:{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },

  // Notification card
  notifCard: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#fff', padding: 16, gap: 12,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  notifInfo: { flex: 1 },
});
