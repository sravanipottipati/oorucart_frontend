import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput,
} from 'react-native';

const QUICK_HELP = [
  { icon: '💰', label: 'Payment & Settlement', bg: '#EFF6FF' },
  { icon: '📦', label: 'Order Issues',         bg: '#FFF7ED' },
  { icon: '🛍',  label: 'Product Issues',       bg: '#F0FDF4' },
  { icon: '⚙️', label: 'Technical Issues',     bg: '#F5F3FF' },
  { icon: '👤', label: 'Account Issues',       bg: '#FEF2F2' },
];

const FAQS = [
  {
    q: 'How do I receive payments?',
    a: 'Payments are settled to your bank account weekly. You can view your settlement history in Earnings & Settlements.',
  },
  {
    q: 'How do I accept or reject an order?',
    a: 'Go to Orders tab → tap the order → use Accept or Reject buttons at the bottom.',
  },
  {
    q: 'How do I add or edit products?',
    a: 'Go to Products tab → tap "+ Add New Product" to add, or tap ✏️ on any product to edit it.',
  },
  {
    q: 'How do I open or close my shop?',
    a: 'On the Dashboard, use the Shop Status toggle to open or close your shop instantly.',
  },
  {
    q: 'What is the platform fee?',
    a: 'Shop2me charges a small platform fee per order: ₹5 for vegetables, ₹7 for bakery/supermarket, ₹10 for restaurants.',
  },
];

export default function VendorHelpScreen({ navigation }) {
  const [search, setSearch]           = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const filteredFaqs = FAQS.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Search */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search help topics"
            placeholderTextColor="#9CA3AF"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Quick Help */}
        <Text style={styles.sectionTitle}>Quick Help</Text>
        <View style={styles.quickList}>
          {QUICK_HELP.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.quickItem, index < QUICK_HELP.length - 1 && styles.quickItemBorder]}
            >
              <View style={[styles.quickIconBox, { backgroundColor: item.bg }]}>
                <Text style={styles.quickIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.quickLabel}>{item.label}</Text>
              <Text style={styles.quickArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQs */}
        <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
        <View style={styles.faqCard}>
          {filteredFaqs.map((faq, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.faqItem,
                index < filteredFaqs.length - 1 && styles.faqItemBorder,
              ]}
              onPress={() => setExpandedFaq(expandedFaq === index ? null : index)}
            >
              <View style={styles.faqRow}>
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <Text style={styles.faqArrow}>
                  {expandedFaq === index ? '▲' : '▼'}
                </Text>
              </View>
              {expandedFaq === index && (
                <Text style={styles.faqAnswer}>{faq.a}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Contact Support */}
        <Text style={styles.sectionTitle}>Contact Support</Text>
        <View style={styles.contactCard}>
          <TouchableOpacity style={[styles.contactItem, styles.contactItemBorder]}>
            <View style={[styles.contactIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Text style={styles.contactIcon}>💬</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Chat with Support</Text>
              <Text style={styles.contactSub}>Response within 5 minutes</Text>
            </View>
            <Text style={styles.contactArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.contactItem, styles.contactItemBorder]}>
            <View style={[styles.contactIconBox, { backgroundColor: '#F0FDF4' }]}>
              <Text style={styles.contactIcon}>📧</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Email Support</Text>
              <Text style={styles.contactSub}>seller@shop2me.in</Text>
            </View>
            <Text style={styles.contactArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.contactItem}>
            <View style={[styles.contactIconBox, { backgroundColor: '#FFF7ED' }]}>
              <Text style={styles.contactIcon}>📞</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Call Support</Text>
              <Text style={styles.contactSub}>Mon-Sat, 9AM - 6PM</Text>
            </View>
            <Text style={styles.contactArrow}>›</Text>
          </TouchableOpacity>
        </View>

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

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    margin: 16, padding: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#111' },

  sectionTitle: {
    fontSize: 15, fontWeight: 'bold', color: '#111',
    marginHorizontal: 16, marginBottom: 10, marginTop: 4,
  },

  quickList: {
    backgroundColor: '#fff', borderRadius: 16,
    marginHorizontal: 16, marginBottom: 16, overflow: 'hidden',
  },
  quickItem: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 12,
  },
  quickItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  quickIconBox: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  quickIcon: { fontSize: 20 },
  quickLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: '#111' },
  quickArrow: { fontSize: 20, color: '#9CA3AF' },

  faqCard: {
    backgroundColor: '#fff', borderRadius: 16,
    marginHorizontal: 16, marginBottom: 16, overflow: 'hidden',
  },
  faqItem: { padding: 16 },
  faqItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  faqRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { fontSize: 14, fontWeight: '600', color: '#111', flex: 1, paddingRight: 8 },
  faqArrow: { fontSize: 11, color: '#9CA3AF' },
  faqAnswer: { fontSize: 13, color: '#555', marginTop: 10, lineHeight: 20 },

  contactCard: {
    backgroundColor: '#fff', borderRadius: 16,
    marginHorizontal: 16, marginBottom: 16, overflow: 'hidden',
  },
  contactItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  contactItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  contactIconBox: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: 'center', alignItems: 'center',
  },
  contactIcon: { fontSize: 22 },
  contactInfo: { flex: 1 },
  contactTitle: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 2 },
  contactSub: { fontSize: 12, color: '#888' },
  contactArrow: { fontSize: 20, color: '#9CA3AF' },
});