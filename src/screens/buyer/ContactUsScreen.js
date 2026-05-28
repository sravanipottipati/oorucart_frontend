import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const SUPPORT_EMAIL = 'contact@univerin.in';
const SUPPORT_PHONE = '9000869619';

const openEmail = () => Linking.openURL('mailto:' + SUPPORT_EMAIL).catch(() => Alert.alert('Error', 'Could not open email'));
const openCall = () => Linking.openURL('tel:' + SUPPORT_PHONE).catch(() => Alert.alert('Error', 'Could not open phone'));

export default function ContactUsScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.banner}>
          <Text style={styles.bannerIcon}>📞</Text>
          <Text style={styles.bannerTitle}>We are here to help!</Text>
          <Text style={styles.bannerSub}>Reach us via email or call</Text>
        </View>
        <Text style={styles.sectionTitle}>Get in Touch</Text>
        <View style={styles.contactCard}>
          <TouchableOpacity style={styles.contactItem} onPress={openEmail}>
            <View style={[styles.contactIconBox, { backgroundColor: '#eff6ff' }]}>
              <Text style={styles.contactIcon}>📧</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Email</Text>
              <Text style={styles.contactSub}>{SUPPORT_EMAIL}</Text>
              <Text style={styles.contactHint}>Response within 24 hours</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.contactItem} onPress={openCall}>
            <View style={[styles.contactIconBox, { backgroundColor: '#fef9c3' }]}>
              <Text style={styles.contactIcon}>📞</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactTitle}>Call Us</Text>
              <Text style={styles.contactSub}>+91 {SUPPORT_PHONE}</Text>
              <Text style={styles.contactHint}>Mon-Sat, 9AM - 6PM</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionTitle}>Business Information</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Company</Text><Text style={styles.infoValue}>Univerin Private Limited</Text></View>
          <View style={styles.divider} />
          <View style={styles.infoRow}><Text style={styles.infoLabel}>GSTIN</Text><Text style={styles.infoValue}>37AADCU8846J1ZP</Text></View>
          <View style={styles.divider} />
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Address</Text><Text style={styles.infoValue}>4/11, Sankarapuram, Govindampalli, Obulavaripalle - 516105, AP</Text></View>
          <View style={styles.divider} />
          <View style={styles.infoRow}><Text style={styles.infoLabel}>Support Hours</Text><Text style={styles.infoValue}>Mon-Sat, 9AM - 6PM</Text></View>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { width: 36, height: 36, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111', flex: 1, textAlign: 'center' },
  scroll: { padding: 16 },
  banner: { backgroundColor: '#1669ef', borderRadius: 16, padding: 24, alignItems: 'center', marginBottom: 16 },
  bannerIcon: { fontSize: 36, marginBottom: 8 },
  bannerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff', marginBottom: 4 },
  bannerSub: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 12, marginTop: 4 },
  contactCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, overflow: 'hidden' },
  contactItem: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  contactIconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  contactIcon: { fontSize: 24 },
  contactInfo: { flex: 1 },
  contactTitle: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 2 },
  contactSub: { fontSize: 13, color: '#555', marginBottom: 2 },
  contactHint: { fontSize: 11, color: '#9CA3AF' },
  divider: { height: 1, backgroundColor: '#F5F5F5', marginHorizontal: 16 },
  infoCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, overflow: 'hidden' },
  infoRow: { flexDirection: 'row', padding: 16, gap: 12 },
  infoLabel: { fontSize: 13, color: '#888', width: 100, flexShrink: 0 },
  infoValue: { fontSize: 13, color: '#111', flex: 1, fontWeight: '500' },
});
