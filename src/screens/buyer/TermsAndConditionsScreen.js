import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const sections = [
  {
    title: '1. About Univerin',
    content: [
      'Univerin is a hyperlocal marketplace connecting buyers with local shops in small towns of Andhra Pradesh.',
      'Univerin acts as an intermediary platform (e-commerce operator) between buyers and vendors.',
      'Univerin is registered as Univerin Private Limited with GSTIN: 37AADCU8846J1ZP.',
      'The platform is currently operational in Railway Kodur, Andhra Pradesh.',
    ],
  },
  {
    title: '2. Eligibility',
    content: [
      'You must be at least 13 years of age to use the Univerin app.',
      'You must provide accurate and complete information during registration.',
      'One phone number can only be registered for one account.',
      'Vendors must be legal business entities operating within India.',
    ],
  },
  {
    title: '3. Buyer Terms',
    content: [
      'Buyers can browse local shops, add items to cart, and place orders.',
      'Orders are fulfilled by the respective local vendors, not by Univerin directly.',
      'Currently, only Cash on Delivery (COD) payment is available.',
      'Buyers must ensure accurate delivery address before placing orders.',
      'Buyers must be present at the delivery address to receive orders.',
      'Univerin charges a platform fee of Rs.10 per order.',
      'Delivery charges range from Rs.25 to Rs.45 based on distance.',
      'Order cancellation is allowed before vendor accepts the order.',
    ],
  },
  {
    title: '4. Vendor Terms',
    content: [
      'Vendors must register with accurate shop details, GST information, and bank account.',
      'Vendors are responsible for product quality, accuracy, and availability.',
      'Vendors must accept or reject orders within 30 minutes of placement.',
      'Commission rates: Vegetables 3%, Groceries 6%, Restaurant/Bakery/FastFood 20%.',
      'GST at 18% is applicable on platform fee and commission (CGST 9% + SGST 9%).',
      'TCS at 1% (CGST 0.5% + SGST 0.5%) is deducted as per Section 52 of CGST Act, 2017.',
      'Net earnings are settled weekly every Monday via bank transfer.',
      'Univerin reserves the right to remove vendors for policy violations.',
    ],
  },
  {
    title: '5. Prohibited Activities',
    content: [
      'Providing false or misleading product information.',
      'Using the platform for illegal activities.',
      'Attempting to hack, reverse engineer, or disrupt the platform.',
      'Creating multiple accounts to abuse offers or promotions.',
      'Harassing other users, vendors, or delivery personnel.',
      'Listing prohibited or illegal products on the platform.',
    ],
  },
  {
    title: '6. Refund and Cancellation Policy',
    content: [
      'Orders can be cancelled before vendor acceptance — full refund applicable.',
      'If vendor rejects the order — automatic cancellation, no charge to buyer.',
      'For COD orders — no advance payment, so no refund processing needed.',
      'In case of wrong or damaged products — contact support within 24 hours.',
      'Refund disputes are resolved within 3–5 business days.',
      'Contact: contact@univerin.in for all refund queries.',
    ],
  },
  {
    title: '7. Intellectual Property',
    content: [
      'The Univerin name, logo, and branding are owned by Univerin Private Limited.',
      'All app content, design, and code are proprietary to Univerin.',
      'Users may not copy, reproduce, or distribute Univerin content without permission.',
      'Product images uploaded by vendors remain the property of respective vendors.',
    ],
  },
  {
    title: '8. Limitation of Liability',
    content: [
      'Univerin acts as an intermediary and is not liable for product quality issues.',
      'Univerin is not liable for delays caused by vendors or delivery personnel.',
      'Univerin is not liable for losses due to incorrect delivery address provided by buyer.',
      'Maximum liability of Univerin is limited to the order value in any case.',
      'Univerin is not liable for force majeure events including natural disasters, strikes, or network outages.',
    ],
  },
  {
    title: '9. GST and Tax Compliance',
    content: [
      'Univerin is registered under GST with GSTIN: 37AADCU8846J1ZP.',
      'Univerin collects TCS at 1% on all transactions as per Section 52 of CGST Act, 2017.',
      'GST invoices are provided to buyers and vendors for all transactions.',
      'Vendors are responsible for their own GST compliance and filing.',
      'TCS certificates are issued quarterly to vendors.',
    ],
  },
  {
    title: '10. Termination',
    content: [
      'Univerin reserves the right to suspend or terminate accounts for policy violations.',
      'Users may delete their account by contacting contact@univerin.in.',
      'Upon termination, all pending orders will be fulfilled before account closure.',
      'Data retention post-termination is as per our Privacy Policy.',
    ],
  },
  {
    title: '11. Governing Law and Disputes',
    content: [
      'These Terms are governed by the laws of India.',
      'Any disputes shall be subject to the exclusive jurisdiction of courts in Andhra Pradesh.',
      'For dispute resolution, contact: contact@univerin.in.',
      'We encourage amicable resolution before legal proceedings.',
    ],
  },
  {
    title: '12. Changes to Terms',
    content: [
      'Univerin may update these Terms from time to time.',
      'Significant changes will be notified via SMS or app notification.',
      'Continued use of the app constitutes acceptance of updated Terms.',
      'Latest Terms are always available at univerin.in/terms.',
    ],
  },
  {
    title: '13. Contact Us',
    content: [
      'Email: contact@univerin.in',
      'Phone: 9000869619',
      'Address: 4/11, Sankarapuram, Govindampalli, Obulavaripalle - 516105, Andhra Pradesh',
      'Website: www.univerin.in',
    ],
  },
];

export default function TermsAndConditionsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Top Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerIcon}>📋</Text>
          <Text style={styles.bannerTitle}>Terms & Conditions</Text>
          <Text style={styles.bannerSub}>Univerin Private Limited</Text>
          <Text style={styles.bannerDate}>Effective Date: 28 April 2026</Text>
        </View>

        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introText}>
            These Terms and Conditions govern your use of the Univerin mobile application and
            website. By accessing or using Univerin, you agree to be bound by these Terms.
            If you do not agree, please do not use our services.
          </Text>
        </View>

        {/* Sections */}
        {sections.map((section, index) => (
          <View
            key={index}
            style={[
              styles.sectionCard,
              section.title.includes('Refund') && styles.refundCard,
            ]}
          >
            <Text
              style={[
                styles.sectionTitle,
                section.title.includes('Refund') && styles.refundTitle,
              ]}
            >
              {section.title}
            </Text>
            {section.content.map((point, i) => (
              <View key={i} style={styles.pointRow}>
                <View
                  style={[
                    styles.bullet,
                    section.title.includes('Refund') && styles.refundBullet,
                  ]}
                />
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
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111', flex: 1, textAlign: 'center' },
  scroll:      { padding: 16 },

  banner: {
    backgroundColor: '#1669ef', borderRadius: 16, padding: 24,
    alignItems: 'center', marginBottom: 16,
  },
  bannerIcon:  { fontSize: 36, marginBottom: 8 },
  bannerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  bannerSub:   { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  bannerDate:  { fontSize: 12, color: 'rgba(255,255,255,0.7)' },

  introCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
    borderLeftWidth: 4, borderLeftColor: '#1669ef',
  },
  introText: { fontSize: 13, color: '#555', lineHeight: 20 },

  sectionCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12,
  },
  refundCard: {
    backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa',
  },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1669ef', marginBottom: 12 },
  refundTitle:  { color: '#ea580c' },

  pointRow:  { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  bullet: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#1669ef',
    marginTop: 6, marginRight: 10, flexShrink: 0,
  },
  refundBullet: { backgroundColor: '#ea580c' },
  pointText:    { fontSize: 13, color: '#444', lineHeight: 20, flex: 1 },

  footer: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    alignItems: 'center', marginTop: 8,
  },
  footerText: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
});