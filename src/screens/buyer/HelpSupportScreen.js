import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput,
} from 'react-native';

const QUICK_HELP = [
  { icon: '📦', label: 'Track Order' },
  { icon: '↩️', label: 'Return & Refund' },
  { icon: '💳', label: 'Payment Issue' },
  { icon: '🏪', label: 'Shop Issue' },
];

const FAQS = [
  {
    q: 'How do I track my order?',
    a: 'Go to My Orders → tap your order → you can see live status updates.',
  },
  {
    q: 'Can I cancel my order?',
    a: 'You can cancel within 2 minutes of placing the order. Go to My Orders → Order Details → Cancel.',
  },
  {
    q: 'What payment methods are accepted?',
    a: 'Currently Cash on Delivery (COD) is supported. Online payments coming soon!',
  },
  {
    q: 'How do I change my delivery address?',
    a: 'You can update your address during checkout before placing the order.',
  },
  {
    q: 'How do I become a vendor?',
    a: 'Register as a vendor from the signup screen. Your shop will be reviewed and approved within 24 hours.',
  },
];

export default function HelpSupportScreen({ navigation }) {
  const [search, setSearch]       = useState('');
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
        <View style={styles.quickGrid}>
          {QUICK_HELP.map((item, index) => (
            <TouchableOpacity key={index} style={styles.quickCard}>
              <Text style={styles.quickIcon}>{item.icon}</Text>
              <Text style={styles.quickLabel}>{item.label}</Text>
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
          <TouchableOpacity style={styles.contactItem}>
            <View style={styles.contactIconBox}>
              <Text style={styles.contactIcon}>💬</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Chat with us</Text>
              <Text style={styles.contactSub}>Usually replies in minutes</Text>
            </View>
            <Text style={styles.contactArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.contactDivider} />

          <TouchableOpacity style={styles.contactItem}>
            <View style={styles.contactIconBox}>
              <Text style={styles.contactIcon}>📧</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Email us</Text>
              <Text style={styles.contactSub}>support@oorucart.com</Text>
            </View>
            <Text style={styles.contactArrow}>›</Text>
          </TouchableOpacity>

          <View style={styles.contactDivider} />

          <TouchableOpacity style={styles.contactItem}>
            <View style={styles.contactIconBox}>
              <Text style={styles.contactIcon}>📞</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Call us</Text>
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
    marginHorizontal: 16, marginBottom: 12, marginTop: 8,
  },

  quickGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: 12, marginBottom: 8,
  },
  quickCard: {
    width: '45%', backgroundColor: '#fff', borderRadius: 14,
    margin: '2.5%', padding: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  quickIcon: { fontSize: 28, marginBottom: 8 },
  quickLabel: { fontSize: 13, fontWeight: '600', color: '#111', textAlign: 'center' },

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
  contactItem: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  contactDivider: { height: 1, backgroundColor: '#F5F5F5', marginHorizontal: 16 },
  contactIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#EFF6FF', justifyContent: 'center',
    alignItems: 'center', marginRight: 12,
  },
  contactIcon: { fontSize: 22 },
  contactInfo: { flex: 1 },
  contactTitle: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 2 },
  contactSub: { fontSize: 12, color: '#888' },
  contactArrow: { fontSize: 20, color: '#9CA3AF' },
});