import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function DPHelpScreen({ navigation }) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
        <Ionicons name="chevron-back" size={22} color="#1669ef" />
        <Text style={styles.backBtnText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Help & Support</Text>
      <Text style={styles.subtitle}>We're here to help with any issues during delivery</Text>

      <TouchableOpacity style={styles.contactCard} onPress={() => Linking.openURL('tel:+919010056936')}>
        <Ionicons name="call-outline" size={22} color="#1669ef" />
        <View style={{ flex: 1 }}>
          <Text style={styles.contactTitle}>Call Support</Text>
          <Text style={styles.contactSubtext}>Available 9 AM – 9 PM</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.contactCard} onPress={() => Linking.openURL('mailto:contact@univerin.in')}>
        <Ionicons name="mail-outline" size={22} color="#1669ef" />
        <View style={{ flex: 1 }}>
          <Text style={styles.contactTitle}>Email Support</Text>
          <Text style={styles.contactSubtext}>contact@univerin.in</Text>
        </View>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Common Questions</Text>
      <View style={styles.faqItem}>
        <Text style={styles.faqQ}>What if a customer isn't available at delivery?</Text>
        <Text style={styles.faqA}>Contact support immediately using the number above — do not leave the order unattended.</Text>
      </View>
      <View style={styles.faqItem}>
        <Text style={styles.faqQ}>What if the delivery OTP doesn't match?</Text>
        <Text style={styles.faqA}>Double-check with the customer. If it still doesn't work, contact support before marking the order as delivered.</Text>
      </View>
      <View style={styles.faqItem}>
        <Text style={styles.faqQ}>When will my earnings be paid out?</Text>
        <Text style={styles.faqA}>Settlement details will be shared once the earnings feature is live.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
    marginBottom: 16, marginTop: 44, alignSelf: 'flex-start',
    paddingVertical: 8, paddingRight: 12,
  },
  backBtnText: { fontSize: 16, color: '#1669ef', fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#6B7280', marginBottom: 20 },
  contactCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, marginBottom: 10,
  },
  contactTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  contactSubtext: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginTop: 20, marginBottom: 10 },
  faqItem: { marginBottom: 14 },
  faqQ: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 4 },
  faqA: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
});