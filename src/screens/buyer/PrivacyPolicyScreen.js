import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const sections = [
  {
    title: '1. Information We Collect',
    content: [
      'Personal Information: Full name, phone number, email address (optional), delivery address.',
      'Location Data: We collect your approximate location to show nearby shops and calculate delivery distance.',
      'Order Information: Items ordered, order history, payment mode (Cash on Delivery).',
      'Device Information: Device type, operating system, app version for technical support.',
      'Usage Data: How you interact with the app, screens visited, search queries.',
      'Vendor Information: Shop name, GSTIN, PAN, bank account details (for vendors only).',
    ],
  },
  {
    title: '2. How We Use Your Information',
    content: [
      'To process and deliver your orders from local shops.',
      'To send OTP verification for login and password reset via SMS.',
      'To show nearby shops and products based on your location.',
      'To calculate delivery charges, platform fees, and commissions.',
      'To generate GST-compliant invoices and billing documents.',
      'To provide customer support and resolve disputes.',
      'To improve our app and services based on usage patterns.',
      'To comply with legal obligations including GST filing and TCS deduction.',
    ],
  },
  {
    title: '3. Information Sharing',
    content: [
      'With Vendors: We share your name, phone number, and delivery address with the vendor fulfilling your order.',
      'Cloudinary (cloudinary.com): Used for image storage — product and shop images stored on their secure servers.',
      'SMS Provider: Used to send OTP verification SMS messages.',
      'Government Authorities: We may share data as required by law, including GST returns filed with the Government of India.',
      'We do NOT sell, rent, or trade your personal information to third parties for marketing purposes.',
      'We do NOT share your data with advertisers or data brokers.',
    ],
  },
  {
    title: '4. Data Storage & Security',
    content: [
      'Your data is stored on secure servers hosted on Railway (railway.app) platform.',
      'We use industry-standard encryption (HTTPS/TLS) for all data transmission.',
      'Passwords are hashed and never stored in plain text.',
      'Access to personal data is restricted to authorized personnel only.',
      'We retain your data as long as your account is active or as required by law.',
      'You may request deletion of your account and data by contacting us.',
    ],
  },
  {
    title: '5. Your Rights',
    content: [
      'Access: You can access your personal information through the app profile section.',
      'Correction: You can update your name, address, and other details in the app.',
      'Deletion: You may request deletion of your account by emailing contact@univerin.in.',
      'Opt-out: You may opt out of promotional SMS by contacting us.',
      'Data Portability: You may request a copy of your data in a readable format.',
    ],
  },
  {
    title: '6. Location Data',
    content: [
      'We collect location data only when you use the app and have granted location permission.',
      'Location is used to show nearby shops and calculate delivery distance.',
      'We do not track your location in the background.',
      'You can revoke location permission at any time through your device settings.',
    ],
  },
  {
    title: '7. Children\'s Privacy',
    content: [
      'Univerin services are not intended for children under 13 years of age.',
      'We do not knowingly collect personal information from children under 13.',
      'If you believe a child has provided us with personal information, please contact us immediately.',
    ],
  },
  {
    title: '8. Cookies and Tracking',
    content: [
      'The Univerin mobile app does not use cookies.',
      'The Univerin website (univerin.in) may use essential cookies for functionality only.',
      'We do not use tracking cookies or third-party advertising cookies.',
    ],
  },
  {
    title: '9. Changes to This Policy',
    content: [
      'We may update this Privacy Policy from time to time.',
      'We will notify you of significant changes via SMS or app notification.',
      'Continued use of the app after changes constitutes acceptance of the new policy.',
      'The latest version is always available at univerin.in/privacy-policy.',
    ],
  },
  {
    title: '10. Contact Us',
    content: [
      'Email: contact@univerin.in',
      'Phone: 9000869619',
      'Address: 4/11, Sankarapuram, Govindampalli, Obulavaripalle - 516105, Andhra Pradesh',
      'Grievance Officer: Univerin Private Limited',
      'Governing Law: This policy is governed by the laws of India.',
    ],
  },
];

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {/* Top Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerIcon}>🔒</Text>
          <Text style={styles.bannerTitle}>Privacy Policy</Text>
          <Text style={styles.bannerSub}>Univerin Private Limited</Text>
          <Text style={styles.bannerDate}>Effective Date: 28 April 2026</Text>
        </View>

        {/* Intro */}
        <View style={styles.introCard}>
          <Text style={styles.introText}>
            This Privacy Policy explains how Univerin collects, uses, and protects your personal
            information when you use the Univerin mobile application and website. By using our
            services, you agree to this policy.
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
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1669ef', marginBottom: 12 },
  pointRow:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  bullet: {
    width: 6, height: 6, borderRadius: 3, backgroundColor: '#1669ef',
    marginTop: 6, marginRight: 10, flexShrink: 0,
  },
  pointText: { fontSize: 13, color: '#444', lineHeight: 20, flex: 1 },

  footer: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    alignItems: 'center', marginTop: 8,
  },
  footerText: { fontSize: 12, color: '#9CA3AF', marginBottom: 4 },
});