import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Linking, Alert, Modal, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';

const STATUS_STEPS = ['placed', 'accepted', 'preparing', 'dispatched', 'delivered'];
const STATUS_INFO = {
  placed:     { label: 'Order Placed',     icon: 'receipt-outline',     desc: 'Your order has been placed' },
  accepted:   { label: 'Order Accepted',   icon: 'checkmark-circle-outline', desc: 'Vendor accepted your order' },
  preparing:  { label: 'Being Prepared',   icon: 'restaurant-outline',  desc: 'Vendor is preparing your order' },
  dispatched: { label: 'Out for~Delivery', icon: 'bicycle-outline',     desc: 'Your order is on the way' },
  delivered:  { label: 'Delivered',        icon: 'home-outline',        desc: 'Order delivered successfully!' },
  cancelled:  { label: 'Cancelled',        icon: 'close-circle-outline', desc: 'Order was cancelled' },
  rejected:   { label: 'Rejected',         icon: 'close-circle-outline', desc: 'Order was rejected by vendor' },
};

export default function OrderDetailScreen({ navigation, route }) {
  const { orderId }             = route.params;
  const [order, setOrder]       = useState(null);
  const [loading, setLoading]   = useState(true);

  const [showRating, setShowRating]         = useState(false);
  const [rating, setRating]                 = useState(0);
  const [comment, setComment]               = useState('');
  const [submitting, setSubmitting]         = useState(false);
  const [hasReview, setHasReview]           = useState(false);
  const [existingRating, setExistingRating] = useState(null);

  const fetchOrder = async () => {
    try {
      const res = await client.get(`/orders/${orderId}/`);
      setOrder(res.data);
      if (res.data.status === 'delivered') checkReview(orderId);
    } catch (e) {
      console.log('Error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const checkReview = async (id) => {
    try {
      const res = await client.get(`/orders/${id}/review/`);
      if (res.data.has_review) {
        setHasReview(true);
        setExistingRating(res.data.rating);
        setRating(res.data.rating);
        setComment(res.data.comment || '');
      }
    } catch (e) {
      console.log('Review check error:', e.message);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) { Alert.alert('Rate First', 'Please select a star rating'); return; }
    setSubmitting(true);
    try {
      await client.post(`/orders/${order.id}/review/`, { rating, comment });
      setHasReview(true);
      setExistingRating(rating);
      setShowRating(false);
      Alert.alert('Thank you! 🌟', 'Your review has been submitted!');
    } catch (e) {
      Alert.alert('Error', 'Could not submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [orderId]);

  const handleTrackLocation = () => {
    const address = encodeURIComponent(order.delivery_address);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${address}`)
      .catch(() => Alert.alert('Error', 'Could not open maps'));
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1669ef" />
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  const currentStep  = STATUS_STEPS.indexOf(order.status);
  const isCancelled  = ['cancelled', 'rejected'].includes(order.status);
  const isDelivered  = order.status === 'delivered';
  const statusInfo   = STATUS_INFO[order.status] || STATUS_INFO.placed;
  const date         = new Date(order.created_at).toLocaleString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

  // ── Bill calculation ──
  const subtotal    = order.items?.reduce((sum, item) => sum + item.quantity * parseFloat(item.price), 0) || 0;
  const deliveryFee = parseFloat(order.delivery_fee || 0);
  const total       = parseFloat(order.total_amount || 0);

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Status Banner */}
        <View style={[
          styles.statusBanner,
          isCancelled && styles.statusBannerRed,
          isDelivered && styles.statusBannerGreen,
        ]}>
          <Ionicons name={statusInfo.icon} size={32} color="#fff" />
          <View>
            <Text style={styles.statusBannerTitle}>{statusInfo.label}</Text>
            <Text style={styles.statusBannerDesc}>{statusInfo.desc}</Text>
          </View>
        </View>

        {/* Horizontal Progress Stepper */}
        {!isCancelled && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Progress</Text>

            <View style={styles.activeStepBanner}>
              <View style={styles.activeStepIconBox}>
                <Ionicons name={statusInfo.icon} size={22} color="#fff" />
              </View>
              <View style={styles.activeStepInfo}>
                <Text style={styles.activeStepLabel}>{statusInfo.label}</Text>
                <Text style={styles.activeStepDesc}>{statusInfo.desc}</Text>
              </View>
            </View>

            <View style={styles.hStepper}>
              {STATUS_STEPS.map((step, index) => {
                const isDone    = currentStep >= index;
                const isActive  = currentStep === index;
                const isLast    = index === STATUS_STEPS.length - 1;
                const info      = STATUS_INFO[step];
                return (
                  <View key={step} style={styles.hStepWrapper}>
                    <View style={[
                      styles.hStepDot,
                      isDone && styles.hStepDotDone,
                      isActive && styles.hStepDotActive,
                    ]}>
                      {isDone && !isActive
                        ? <Ionicons name="checkmark" size={11} color="#fff" />
                        : isActive
                        ? <View style={styles.hStepDotPulse} />
                        : null
                      }
                    </View>
                    <View style={styles.hStepLabelBox}>
                      {step === 'dispatched' ? (
                        <>
                          <Text style={[styles.hStepLabel, isDone && styles.hStepLabelDone, isActive && styles.hStepLabelActive]}>Out for</Text>
                          <Text style={[styles.hStepLabel, isDone && styles.hStepLabelDone, isActive && styles.hStepLabelActive]}>Delivery</Text>
                        </>
                      ) : (
                        info.label.split('~').map((word, i) => (
                          <Text key={i} style={[styles.hStepLabel, isDone && styles.hStepLabelDone, isActive && styles.hStepLabelActive]}>
                            {word}
                          </Text>
                        ))
                      )}
                    </View>
                    {!isLast && (
                      <View style={[
                        styles.hStepLine,
                        isDone && index < currentStep && styles.hStepLineDone,
                      ]} />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Rating Card */}
        {isDelivered && (
          <View style={styles.ratingCard}>
            {hasReview ? (
              <View style={styles.ratingDone}>
                <Text style={styles.ratingDoneEmoji}>🌟</Text>
                <View>
                  <Text style={styles.ratingDoneTitle}>You rated this order</Text>
                  <View style={styles.starsRow}>
                    {[1,2,3,4,5].map(s => (
                      <Text key={s} style={[styles.starIcon, { color: s <= existingRating ? '#F59E0B' : '#E5E7EB' }]}>★</Text>
                    ))}
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.ratingPrompt}>
                <Text style={styles.ratingPromptEmoji}>🎉</Text>
                <View style={styles.ratingPromptInfo}>
                  <Text style={styles.ratingPromptTitle}>How was your order?</Text>
                  <Text style={styles.ratingPromptDesc}>Rate your experience</Text>
                </View>
                <TouchableOpacity style={styles.rateBtn} onPress={() => setShowRating(true)}>
                  <Text style={styles.rateBtnText}>Rate Now</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Order Info */}
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Order ID</Text>
            <Text style={styles.infoValue}>#{order.order_number || order.id?.slice(0, 8).toUpperCase()}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date & Time</Text>
            <Text style={styles.infoValue}>{date}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Payment</Text>
            <Text style={[styles.infoValue, { color: '#16A34A' }]}>💵 Cash on Delivery</Text>
          </View>
        </View>

        {/* Delivery Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivery Details</Text>
          <Text style={styles.fieldLabel}>Deliver to</Text>
          <Text style={styles.fieldValue}>{order.delivery_address}</Text>
          <TouchableOpacity style={styles.mapsBtn} onPress={handleTrackLocation}>
            <Ionicons name="location-outline" size={16} color="#1669ef" />
            <Text style={styles.mapsBtnText}>View on Maps</Text>
          </TouchableOpacity>
        </View>

        {/* Order Items + Bill */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Items Ordered ({order.items?.length || 0})
          </Text>
          {order.items?.map((item, i) => (
            <View key={i} style={[styles.itemRow, i < order.items.length - 1 && styles.itemRowBorder]}>
              <View style={styles.itemQtyBox}>
                <Text style={styles.itemQtyText}>{item.quantity}</Text>
              </View>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.product_name || item.name}</Text>
                <Text style={styles.itemUnit}>₹{parseFloat(item.price).toFixed(0)} each</Text>
              </View>
              <Text style={styles.itemPrice}>
                ₹{(item.quantity * parseFloat(item.price)).toFixed(0)}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Items Total (incl. GST)</Text>
            <Text style={styles.billValue}>₹{subtotal.toFixed(0)}</Text>
          </View>

          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Fee</Text>
            {deliveryFee === 0 ? (
              <Text style={[styles.billValue, { color: '#16A34A', fontWeight: '600' }]}>FREE ✅</Text>
            ) : (
              <Text style={styles.billValue}>₹{deliveryFee.toFixed(0)}</Text>
            )}
          </View>

          <View style={[styles.billRow, styles.billTotal]}>
            <Text style={styles.billTotalLabel}>Total Paid</Text>
            <Text style={styles.billTotalValue}>₹{total.toFixed(0)}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Tab */}
      <View style={styles.bottomTab}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home-outline" size={22} color="#9CA3AF" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart-outline" size={22} color="#9CA3AF" />
          <Text style={styles.tabLabel}>Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Ionicons name="receipt" size={22} color="#1669ef" />
          <Text style={styles.tabLabelActive}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-outline" size={22} color="#9CA3AF" />
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Rating Modal */}
      <Modal visible={showRating} transparent animationType="slide" onRequestClose={() => setShowRating(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowRating(false)}>
          <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Rate Your Order 🌟</Text>
            <Text style={styles.modalShop}>{order.vendor_name || 'Shop'}</Text>

            <View style={styles.starsRowLarge}>
              {[1,2,3,4,5].map(s => (
                <TouchableOpacity key={s} onPress={() => setRating(s)}>
                  <Text style={[styles.starLarge, { color: s <= rating ? '#F59E0B' : '#E5E7EB' }]}>★</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.ratingLabel}>
              {rating === 0 ? 'Tap to rate' :
               rating === 1 ? '😞 Poor' :
               rating === 2 ? '😕 Fair' :
               rating === 3 ? '😊 Good' :
               rating === 4 ? '😃 Very Good' : '🤩 Excellent!'}
            </Text>

            <TextInput
              style={styles.commentInput}
              placeholder="Share your experience (optional)..."
              placeholderTextColor="#9CA3AF"
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.submitRatingBtn, rating === 0 && styles.submitRatingBtnDisabled]}
              onPress={handleSubmitReview}
              disabled={submitting || rating === 0}
            >
              {submitting
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.submitRatingBtnText}>Submit Review</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity style={styles.skipBtn} onPress={() => setShowRating(false)}>
              <Text style={styles.skipBtnText}>Skip for now</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText:        { fontSize: 16, color: '#888' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn:     { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#111' },

  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: '#1669ef', margin: 16, borderRadius: 16, padding: 16,
  },
  statusBannerRed:   { backgroundColor: '#EF4444' },
  statusBannerGreen: { backgroundColor: '#16A34A' },
  statusBannerTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  statusBannerDesc:  { fontSize: 12, color: 'rgba(255,255,255,0.85)' },

  card: {
    backgroundColor: '#fff', borderRadius: 16,
    margin: 16, marginBottom: 0, padding: 16,
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 14 },
  divider:   { height: 1, backgroundColor: '#F5F5F5', marginVertical: 4 },

  activeStepBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#eff6ff', borderRadius: 12, padding: 12,
    marginBottom: 20, borderWidth: 1, borderColor: '#bfdbfe',
  },
  activeStepIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#1669ef', justifyContent: 'center', alignItems: 'center',
  },
  activeStepInfo:  { flex: 1 },
  activeStepLabel: { fontSize: 14, fontWeight: '800', color: '#1669ef', marginBottom: 2 },
  activeStepDesc:  { fontSize: 12, color: '#555' },

  hStepper: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', paddingHorizontal: 4,
  },
  hStepWrapper: { flex: 1, alignItems: 'center', position: 'relative' },
  hStepDot: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#E5E7EB', justifyContent: 'center',
    alignItems: 'center', marginBottom: 8, zIndex: 1,
    borderWidth: 2, borderColor: '#E5E7EB',
  },
  hStepDotDone:   { backgroundColor: '#1669ef', borderColor: '#1669ef' },
  hStepDotActive: {
    backgroundColor: '#fff', borderColor: '#1669ef',
    shadowColor: '#1669ef', shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
  },
  hStepDotPulse: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#1669ef' },
  hStepLine: {
    position: 'absolute', top: 10, left: '50%', right: '-50%',
    height: 2, backgroundColor: '#E5E7EB', zIndex: 0,
  },
  hStepLineDone:    { backgroundColor: '#1669ef' },
  hStepLabelBox:    { alignItems: 'center', width: 54 },
  hStepLabel:       { fontSize: 10, color: '#9CA3AF', textAlign: 'center', fontWeight: '500', lineHeight: 14 },
  hStepLabelDone:   { color: '#555', fontWeight: '600' },
  hStepLabelActive: { color: '#1669ef', fontWeight: '800' },

  ratingCard: {
    backgroundColor: '#fff', borderRadius: 16,
    margin: 16, marginBottom: 0, padding: 16,
    borderWidth: 1.5, borderColor: '#FEF3C7',
  },
  ratingPrompt:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ratingPromptEmoji: { fontSize: 32 },
  ratingPromptInfo:  { flex: 1 },
  ratingPromptTitle: { fontSize: 15, fontWeight: '700', color: '#111' },
  ratingPromptDesc:  { fontSize: 12, color: '#888', marginTop: 2 },
  rateBtn: {
    backgroundColor: '#F59E0B', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  rateBtnText:     { color: '#fff', fontSize: 13, fontWeight: '700' },
  ratingDone:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ratingDoneEmoji: { fontSize: 28 },
  ratingDoneTitle: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 4 },
  starsRow:        { flexDirection: 'row', gap: 2 },
  starIcon:        { fontSize: 18 },

  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 8,
  },
  infoLabel: { fontSize: 13, color: '#888' },
  infoValue: { fontSize: 13, color: '#111', fontWeight: '500' },

  fieldLabel: { fontSize: 12, color: '#888', marginBottom: 4 },
  fieldValue: { fontSize: 14, color: '#111', fontWeight: '500', lineHeight: 20, marginBottom: 12 },

  mapsBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#eff6ff', borderRadius: 10, padding: 12,
    justifyContent: 'center',
  },
  mapsBtnText: { fontSize: 13, color: '#1669ef', fontWeight: '600' },

  itemRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  itemRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  itemQtyBox: {
    width: 30, height: 30, borderRadius: 8,
    backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center',
  },
  itemQtyText: { fontSize: 13, fontWeight: 'bold', color: '#1669ef' },
  itemInfo:    { flex: 1 },
  itemName:    { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 2 },
  itemUnit:    { fontSize: 12, color: '#888' },
  itemPrice:   { fontSize: 14, fontWeight: 'bold', color: '#111' },

  billRow:        { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  billLabel:      { fontSize: 13, color: '#888' },
  billValue:      { fontSize: 13, color: '#111' },
  billTotal:      { borderTopWidth: 1, borderTopColor: '#F5F5F5', marginTop: 4, paddingTop: 10 },
  billTotalLabel: { fontSize: 14, fontWeight: 'bold', color: '#111' },
  billTotalValue: { fontSize: 15, fontWeight: 'bold', color: '#1669ef' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: '#fff', borderTopLeftRadius: 28,
    borderTopRightRadius: 28, padding: 24, paddingBottom: 40,
  },
  modalHandle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: '#111', textAlign: 'center', marginBottom: 4 },
  modalShop:  { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 20 },

  starsRowLarge: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 12 },
  starLarge:     { fontSize: 44 },
  ratingLabel:   { fontSize: 16, color: '#555', textAlign: 'center', marginBottom: 20, fontWeight: '500' },

  commentInput: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 14,
    padding: 14, fontSize: 14, color: '#111',
    backgroundColor: '#F9FAFB', minHeight: 80,
    textAlignVertical: 'top', marginBottom: 16,
  },
  submitRatingBtn:         { backgroundColor: '#F59E0B', padding: 16, borderRadius: 14, alignItems: 'center', marginBottom: 10 },
  submitRatingBtnDisabled: { backgroundColor: '#FDE68A' },
  submitRatingBtnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
  skipBtn:     { alignItems: 'center', padding: 12 },
  skipBtnText: { fontSize: 14, color: '#888' },

  bottomTab: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
    paddingBottom: 24, paddingTop: 10,
    position: 'absolute', bottom: 0, left: 0, right: 0,
  },
  tabItem:        { flex: 1, alignItems: 'center', gap: 3 },
  tabLabel:       { fontSize: 11, color: '#9CA3AF' },
  tabLabelActive: { fontSize: 11, color: '#1669ef', fontWeight: 'bold' },
});