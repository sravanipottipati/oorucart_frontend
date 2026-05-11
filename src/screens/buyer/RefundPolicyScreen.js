import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const sections = [
  {
    title: '1. Order Cancellation',
    content: [
      'Orders can be cancelled before vendor accepts — full refund applicable.',
      'If vendor rejects the order — automatic cancellation, no charge to buyer.',
      'Once vendor accepts the order, cancellation may not be possible.',
      'To cancel, go to My Orders → Order Details → Cancel Order.',
    ],
  },
  {
    title: '2. Refund Policy',
    content: [
      'For COD orders — no advance payment, so no refund processing needed.',
      'In case of wrong or damaged products — contact support within 24 hours.',
      'Refund disputes are resolved within 3–5 business days.',
      'Refunds (if applicable) will be processed to original payment method.',
      'Contact: contact@univerin.in for all refund queries.',
    ],
  },
  {
    title: '3. Return Policy',
    content: [
      'Returns are accepted for wrong or damaged items only.',
      'Report the issue within 24 hours of delivery with photo evidence.',
      'Perishable items (vegetables, food) cannot be returned once delivered.',
      'Return pickup will be arranged by Univerin support team.',
    ],
  },
  {
    title: '4. Non-Refundable Items',
    content: [
      'Platform fee (Rs.10) is non-refundable once order is placed.',
      'Delivery charges are non-refundable once order is accepted by vendor.',
      'Perishable items cannot be returned or refunded after delivery.',
    ],
  },
  {
    title: '5. How to Raise a Refund Request',
    content: [
      'Step 1: Go to My Orders → tap the order.',
      'Step 2: Tap "Report Issue" or contact support.',
      'Step 3: Describe the issue and attach photo if applicable.',
      'Step 4: Our team will review and respond within 24 hours.',
      'Step 5: Refund will be processed within 3–5 business days.',
    ],
  },
  {
    title: '6. Contact for Refunds',
    content: [
      'Email: contact@univerin.in',
      'Phone: 9000869619',
      'WhatsApp: +91 9000869619',
      'Support hours: Mon–Sat, 9AM – 6PM',
    ],
  },
];

export default function RefundPolicyScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Refund & Cancellation</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerIcon}>↩️</Text>
          <Text style={styles.bannerTitle}>Refund & Cancellation Policy</Text>
          <Text style={styles.bannerSub}>Univerin Private Limited</Text>
          <Text style={styles.bannerDate}>Effective Date: 28 April 2026</Text>
        </View>

        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introText}>
            We want you to have a great experience with Univerin. If something goes wrong
            with your order, we're here to help. Please read our refund and cancellation
            policy below.
          </Text>
        </View>

        {/* Sections */}
        {sections.map((section, index) => (
          <View key={index} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.content.map((point, i) => (
              <View key={i} style={styles.pointRow}>
                <View style={styles.bullet} />
                <Text style={styles.pointText}>{point}</Text>
              </View>
            ))}
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Univerin Private Limited</Text>
          <Text style={styles.footerText}>GSTIN: 37AADCU8846J1ZP</Text>
          <Text style={styles.footerText}>contact@univerin.in | 9000869619</Text>
          <Text style={styles.footerText}>univerin.in</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn:     { width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#111' },
  scroll:      { padding: 16 },

  banner: {
    backgroundColor: '#ea580c', borderRadius: 16, padding: 24,
    alignItems: 'center', marginBottom: 16,
  },
  bannerIcon:  { fontSize: 36, marginBottom: 8 },
  bannerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  bannerSub:   { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  bannerDate:  { fontSize: 12, color: 'rgba(255,255,255,0.7)' },

  introCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    borderLeftWidth: 4, borderLeftColor: '#ea580c',
  },
  introText: { fontSize: 13, color: '#555', lineHeight: 20 },

  sectionCard:  { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#ea580c', marginBottom: 12 },
  pointRow:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  bullet: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#ea580c',
    marginTop: 6, marginRight: 10, flexShrink: 0,
  },
  pointText: { fontSize: 13, color: '#444', lineHeight: 20, flex: 1 },

  footer: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    alignItems: 'center', marginTop: 8,
  },
  footerText: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
});
