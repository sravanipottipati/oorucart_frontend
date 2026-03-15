import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView,
} from 'react-native';

export default function AccountTypeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
      </View>

      {/* Logo */}
      <View style={styles.logoSection}>
        <View style={styles.iconBox}>
          <Text style={styles.iconText}>S</Text>
        </View>
        <Text style={styles.logoText}>Shop2me</Text>
        <Text style={styles.logoTagline}>Your local shops, delivered</Text>
      </View>

      {/* Title */}
      <View style={styles.titleSection}>
        <Text style={styles.title}>Join Shop2me</Text>
        <Text style={styles.subtitle}>Choose how you want to get started</Text>
      </View>

      {/* Options */}
      <View style={styles.optionsSection}>

        {/* Buyer */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => navigation.navigate('Register')}
        >
          <View style={styles.optionIconBox}>
            <Text style={styles.optionEmoji}>🛒</Text>
          </View>
          <View style={styles.optionInfo}>
            <Text style={styles.optionTitle}>Buyer Account</Text>
            <Text style={styles.optionDesc}>
              Order fresh products from local shops near you. Track orders in real-time.
            </Text>
            <View style={styles.optionTags}>
              <View style={styles.tag}><Text style={styles.tagText}>Order</Text></View>
              <View style={styles.tag}><Text style={styles.tagText}>Track</Text></View>
              <View style={styles.tag}><Text style={styles.tagText}>COD</Text></View>
            </View>
          </View>
          <View style={styles.optionArrow}>
            <Text style={styles.optionArrowText}>›</Text>
          </View>
        </TouchableOpacity>

        {/* Seller */}
        <TouchableOpacity
          style={[styles.optionCard, styles.optionCardVendor]}
          onPress={() => navigation.navigate('VendorRegister')}
        >
          <View style={[styles.optionIconBox, styles.optionIconBoxVendor]}>
            <Text style={styles.optionEmoji}>🏪</Text>
          </View>
          <View style={styles.optionInfo}>
            <Text style={[styles.optionTitle, styles.optionTitleVendor]}>
              Seller Account
            </Text>
            <Text style={styles.optionDesc}>
              List your shop, add products and start receiving orders from local buyers.
            </Text>
            <View style={styles.optionTags}>
              <View style={[styles.tag, styles.tagVendor]}>
                <Text style={[styles.tagText, styles.tagTextVendor]}>5-step setup</Text>
              </View>
              <View style={[styles.tag, styles.tagVendor]}>
                <Text style={[styles.tagText, styles.tagTextVendor]}>Free</Text>
              </View>
            </View>
          </View>
          <View style={[styles.optionArrow, styles.optionArrowVendor]}>
            <Text style={[styles.optionArrowText, { color: '#16A34A' }]}>›</Text>
          </View>
        </TouchableOpacity>

      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Already have an account?{' '}
        <Text
          style={styles.footerLink}
          onPress={() => navigation.navigate('Login')}
        >
          Login
        </Text>
      </Text>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  header: {
    paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4, elevation: 2,
  },
  backText: { fontSize: 22, color: '#111' },

  logoSection: {
    alignItems: 'center', paddingVertical: 24,
  },
  iconBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: '#2563EB', justifyContent: 'center',
    alignItems: 'center', marginBottom: 12,
  },
  iconText:    { fontSize: 36, fontWeight: '900', color: 'white' },
  logoText:    { fontSize: 28, fontWeight: '700', color: '#111', letterSpacing: -1, marginBottom: 4 },
  logoTagline: { fontSize: 13, color: '#888' },

  titleSection: { paddingHorizontal: 24, marginBottom: 24 },
  title:    { fontSize: 24, fontWeight: '700', color: '#111', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#888' },

  optionsSection: { paddingHorizontal: 24, gap: 16 },

  optionCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 20,
    padding: 20, gap: 14,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  optionCardVendor: {
    borderColor: '#16A34A', backgroundColor: '#F0FDF4',
  },

  optionIconBox: {
    width: 60, height: 60, borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center',
  },
  optionIconBoxVendor: { backgroundColor: '#DCFCE7' },
  optionEmoji: { fontSize: 28 },

  optionInfo: { flex: 1 },
  optionTitle: {
    fontSize: 17, fontWeight: '700', color: '#111', marginBottom: 6,
  },
  optionTitleVendor: { color: '#16A34A' },
  optionDesc: {
    fontSize: 12, color: '#888', lineHeight: 18, marginBottom: 10,
  },

  optionTags: { flexDirection: 'row', gap: 6 },
  tag: {
    backgroundColor: '#EFF6FF', paddingHorizontal: 10,
    paddingVertical: 4, borderRadius: 20,
  },
  tagVendor:     { backgroundColor: '#DCFCE7' },
  tagText:       { fontSize: 11, color: '#2563EB', fontWeight: '600' },
  tagTextVendor: { color: '#16A34A' },

  optionArrow: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center', alignItems: 'center',
  },
  optionArrowVendor: { backgroundColor: '#DCFCE7' },
  optionArrowText:   { fontSize: 22, color: '#2563EB', fontWeight: '700' },

  footer: {
    textAlign: 'center', color: '#888',
    fontSize: 14, marginTop: 32,
  },
  footerLink: { color: '#2563EB', fontWeight: '700' },
});
