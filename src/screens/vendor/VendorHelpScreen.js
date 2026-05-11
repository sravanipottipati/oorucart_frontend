import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, Linking, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const QUICK_HELP = [
  { icon: '💰', label: 'Payment & Settlement', bg: '#eff6ff', msg: 'Hi, I have a query about my payment or settlement.' },
  { icon: '📦', label: 'Order Issues',         bg: '#FFF7ED', msg: 'Hi, I have an issue with an order.' },
  { icon: '🛍️', label: 'Product Issues',       bg: '#F0FDF4', msg: 'Hi, I have an issue with my product listing.' },
  { icon: '⚙️', label: 'Technical Issues',     bg: '#F5F3FF', msg: 'Hi, I am facing a technical issue with the app.' },
  { icon: '👤', label: 'Account Issues',       bg: '#FEF2F2', msg: 'Hi, I have an issue with my vendor account.' },
];

const FAQS = [
  {
    q: 'How do I receive payments?',
    a: 'Payments are settled to your bank account every Monday. You can view your settlement history in the Earnings & Settlements section.',
  },
  {
    q: 'How do I accept or reject an order?',
    a: 'Go to Orders tab → tap the order → use Accept or Reject buttons at the bottom. You must respond within 30 minutes.',
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
    a: 'Univerin charges commission per order: Vegetables 3%, Groceries 6%, Restaurant/Bakery/FastFood 20%. GST at 18% applies on commission.',
  },
  {
    q: 'When will my shop be approved?',
    a: 'Shop approval usually takes within 24 hours after registration. Contact support if it takes longer.',
  },
  {
    q: 'What is TCS deduction?',
    a: 'TCS (Tax Collected at Source) at 1% is deducted as per Section 52 of CGST Act, 2017. TCS certificates are issued quarterly.',
  },
];

const WHATSAPP_NUMBER = '919000869619';
const SUPPORT_EMAIL   = 'contact@univerin.in';
const SUPPORT_PHONE   = '9000869619';

const openWhatsApp = (msg = 'Hi, I am a Univerin vendor and need support.') => {
  const url = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(msg)}`;
  Linking.canOpenURL(url)
    .then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`);
      }
    })
    .catch(() => Alert.alert('Error', 'Could not open WhatsApp'));
};

const openEmail = () => {
  Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Vendor Support Request`)
    .catch(() => Alert.alert('Error', 'Could not open email app'));
};

const openCall = () => {
  Linking.openURL(`tel:${SUPPORT_PHONE}`)
    .catch(() => Alert.alert('Error', 'Could not open phone app'));
};

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
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* WhatsApp Banner */}
        <TouchableOpacity style={styles.whatsappBanner} onPress={() => openWhatsApp()}>
          <View style={styles.whatsappLeft}>
            <Text style={styles.whatsappIcon}>💬</Text>
            <View>
              <Text style={styles.whatsappTitle}>Chat on WhatsApp</Text>
              <Text style={styles.whatsappSub}>Vendor support — reply in minutes</Text>
            </View>
          </View>
          <View style={styles.whatsappBadge}>
            <Text style={styles.whatsappBadgeText}>Online</Text>
          </View>
        </TouchableOpacity>

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
              onPress={() => openWhatsApp(item.msg)}
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
          {filteredFaqs.length === 0 ? (
            <View style={styles.noResult}>
              <Text style={styles.noResultText}>No results found</Text>
              <TouchableOpacity onPress={() => openWhatsApp()}>
                <Text style={styles.noResultLink}>Ask us on WhatsApp →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredFaqs.map((faq, index) => (
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
            ))
          )}
        </View>

        {/* Contact Support */}
        <Text style={styles.sectionTitle}>Contact Us</Text>
        <View style={styles.contactCard}>

          {/* WhatsApp */}
          <TouchableOpacity style={[styles.contactItem, styles.contactItemBorder]} onPress={() => openWhatsApp()}>
            <View style={[styles.contactIconBox, { backgroundColor: '#dcfce7' }]}>
              <Text style={styles.contactIcon}>💬</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>WhatsApp</Text>
              <Text style={styles.contactSub}>+91 {SUPPORT_PHONE}</Text>
            </View>
            <Text style={styles.contactArrow}>›</Text>
          </TouchableOpacity>

          {/* Email */}
          <TouchableOpacity style={[styles.contactItem, styles.contactItemBorder]} onPress={openEmail}>
            <View style={[styles.contactIconBox, { backgroundColor: '#eff6ff' }]}>
              <Text style={styles.contactIcon}>📧</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Email</Text>
              <Text style={styles.contactSub}>{SUPPORT_EMAIL}</Text>
            </View>
            <Text style={styles.contactArrow}>›</Text>
          </TouchableOpacity>

          {/* Call */}
          <TouchableOpacity style={styles.contactItem} onPress={openCall}>
            <View style={[styles.contactIconBox, { backgroundColor: '#fef9c3' }]}>
              <Text style={styles.contactIcon}>📞</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Call Us</Text>
              <Text style={styles.contactSub}>Mon–Sat, 9AM – 6PM</Text>
            </View>
            <Text style={styles.contactArrow}>›</Text>
          </TouchableOpacity>

        </View>

        {/* Address */}
        <View style={styles.addressCard}>
          <Text style={styles.addressTitle}>📍 Registered Address</Text>
          <Text style={styles.addressText}>Univerin Private Limited</Text>
          <Text style={styles.addressText}>4/11, Sankarapuram, Govindampalli</Text>
          <Text style={styles.addressText}>Obulavaripalle - 516105</Text>
          <Text style={styles.addressText}>Andhra Pradesh, India</Text>
          <Text style={styles.addressText}>GSTIN: 37AADCU8846J1ZP</Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
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

  whatsappBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#25D366', margin: 16, borderRadius: 14, padding: 16,
  },
  whatsappLeft:      { flexDirection: 'row', alignItems: 'center', gap: 12 },
  whatsappIcon:      { fontSize: 28 },
  whatsappTitle:     { fontSize: 15, fontWeight: 'bold', color: '#fff' },
  whatsappSub:       { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  whatsappBadge:     { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  whatsappBadgeText: { fontSize: 12, color: '#fff', fontWeight: '600' },

  searchBar: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    marginHorizontal: 16, marginBottom: 16, padding: 12,
  },
  searchIcon:  { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#111' },

  sectionTitle: {
    fontSize: 15, fontWeight: 'bold', color: '#111',
    marginHorizontal: 16, marginBottom: 10, marginTop: 4,
  },

  quickList:       { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16, marginBottom: 16, overflow: 'hidden' },
  quickItem:       { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  quickItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  quickIconBox:    { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  quickIcon:       { fontSize: 20 },
  quickLabel:      { flex: 1, fontSize: 14, fontWeight: '500', color: '#111' },
  quickArrow:      { fontSize: 20, color: '#9CA3AF' },

  faqCard:       { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16, marginBottom: 16, overflow: 'hidden' },
  faqItem:       { padding: 16 },
  faqItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  faqRow:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion:   { fontSize: 14, fontWeight: '600', color: '#111', flex: 1, paddingRight: 8 },
  faqArrow:      { fontSize: 11, color: '#9CA3AF' },
  faqAnswer:     { fontSize: 13, color: '#555', marginTop: 10, lineHeight: 20 },

  noResult:     { padding: 24, alignItems: 'center' },
  noResultText: { fontSize: 14, color: '#888', marginBottom: 8 },
  noResultLink: { fontSize: 14, color: '#25D366', fontWeight: '600' },

  contactCard:       { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16, marginBottom: 16, overflow: 'hidden' },
  contactItem:       { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  contactItemBorder: { borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  contactIconBox:    { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  contactIcon:       { fontSize: 22 },
  contactInfo:       { flex: 1 },
  contactTitle:      { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 2 },
  contactSub:        { fontSize: 12, color: '#888' },
  contactArrow:      { fontSize: 20, color: '#9CA3AF' },

  addressCard:  { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 16, marginBottom: 16, padding: 16 },
  addressTitle: { fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 10 },
  addressText:  { fontSize: 13, color: '#555', lineHeight: 22 },
});