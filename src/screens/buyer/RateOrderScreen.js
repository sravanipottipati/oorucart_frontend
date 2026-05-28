import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';

export default function RateOrderScreen({ navigation, route }) {
  const { order } = route.params || {};
  const [rating, setRating]   = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { Alert.alert('Error', 'Please select a rating'); return; }
    setLoading(true);
    try {
      await client.post(`/orders/${order.id}/review/`, { rating, comment });
      Alert.alert('🎉 Thank you!', 'Your review has been submitted!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Could not submit review');
    } finally { setLoading(false); }
  };

  const TAGS = ['Fast Delivery', 'Fresh Products', 'Good Packaging', 'Great Quality', 'Value for Money'];
  const [selectedTags, setSelectedTags] = useState([]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Your Order</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.shopName}>{order?.shop_name}</Text>
          <Text style={styles.orderNum}>Order #{order?.order_number}</Text>

          {/* Star Rating */}
          <Text style={styles.rateLabel}>How was your experience?</Text>
          <View style={styles.starsRow}>
            {[1,2,3,4,5].map(star => (
              <TouchableOpacity key={star} onPress={() => setRating(star)}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={44}
                  color={star <= rating ? '#FFA500' : '#D1D5DB'}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingLabel}>
            {rating === 0 ? 'Tap to rate' : rating === 1 ? '😞 Poor' : rating === 2 ? '😐 Fair' : rating === 3 ? '🙂 Good' : rating === 4 ? '😊 Very Good' : '🤩 Excellent!'}
          </Text>

          {/* Tags */}
          <Text style={styles.sectionLabel}>What did you like?</Text>
          <View style={styles.tagsRow}>
            {TAGS.map(tag => (
              <TouchableOpacity
                key={tag}
                style={[styles.tag, selectedTags.includes(tag) && styles.tagActive]}
                onPress={() => setSelectedTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
              >
                <Text style={[styles.tagText, selectedTags.includes(tag) && styles.tagTextActive]}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Comment */}
          <Text style={styles.sectionLabel}>Write a review (optional)</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Tell us about your experience..."
            placeholderTextColor="#9CA3AF"
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={4}
          />
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Review</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: '#F8F9FA' },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn:       { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111', flex: 1, textAlign: 'center' },
  card:          { backgroundColor: '#fff', borderRadius: 16, margin: 16, padding: 20 },
  shopName:      { fontSize: 18, fontWeight: '700', color: '#111', marginBottom: 4 },
  orderNum:      { fontSize: 13, color: '#888', marginBottom: 20 },
  rateLabel:     { fontSize: 15, fontWeight: '600', color: '#111', marginBottom: 12, textAlign: 'center' },
  starsRow:      { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  ratingLabel:   { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 20 },
  sectionLabel:  { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 10 },
  tagsRow:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag:           { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  tagActive:     { backgroundColor: '#EFF6FF', borderColor: '#1669ef' },
  tagText:       { fontSize: 13, color: '#555' },
  tagTextActive: { color: '#1669ef', fontWeight: '600' },
  commentInput:  { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 14, color: '#111', backgroundColor: '#F9FAFB', height: 100, textAlignVertical: 'top' },
  footer:        { padding: 16, paddingBottom: 30, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  submitBtn:     { backgroundColor: '#1669ef', borderRadius: 14, padding: 16, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
