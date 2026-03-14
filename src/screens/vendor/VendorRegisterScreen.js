import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES = [
  { id: 'vegetables',  label: 'Vegetables',  emoji: '🥦' },
  { id: 'bakery',      label: 'Bakery',      emoji: '🍞' },
  { id: 'restaurant',  label: 'Restaurant',  emoji: '🍽' },
  { id: 'supermarket', label: 'Supermarket', emoji: '🛒' },
];

const WEEKLY_OFF = ['None','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function VendorRegisterScreen({ navigation }) {
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [shopName, setShopName]   = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone]         = useState('');
  const [town, setTown]           = useState('');
  const [password, setPassword]   = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const [category, setCategory]         = useState('vegetables');
  const [deliveryType, setDeliveryType] = useState('delivery');
  const [minOrder, setMinOrder]         = useState('100');
  const [deliveryTime, setDeliveryTime] = useState('30');

  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName]       = useState('');
  const [accountNo, setAccountNo]     = useState('');
  const [ifsc, setIfsc]               = useState('');

  const [openTime, setOpenTime]   = useState('9:00 AM');
  const [closeTime, setCloseTime] = useState('9:00 PM');
  const [weeklyOff, setWeeklyOff] = useState('None');

  const platformFee = () => {
    if (category === 'vegetables') return 'Rs.5 per order';
    if (category === 'restaurant') return 'Rs.10 per order';
    return 'Rs.7 per order';
  };

  const goNext = () => {
    setStep(prev => prev + 1);
  };

  const goBack = () => {
    if (step === 1) {
      navigation.goBack();
    } else {
      setStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await client.post('/users/register/', {
        full_name: ownerName,
        phone_number: phone,
        password: password,
        user_type: 'vendor',
      });
      await login(phone, password);
      await client.post('/vendors/register/', {
        shop_name: shopName,
        category: category,
        town: town,
        delivery_type: deliveryType,
        estimated_delivery_time: parseInt(deliveryTime),
      });
      Alert.alert(
        'Registration Successful!',
        'Your shop has been submitted for admin approval. Usually takes 24 hours.',
        [{ text: 'OK', onPress: () => navigation.replace('VendorHome') }]
      );
    } catch (e) {
      const msg = e.response?.data?.phone_number?.[0]
        || e.response?.data?.error
        || 'Registration failed. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  const Progress = () => (
    <View style={styles.progressRow}>
      {[1,2,3,4,5].map(i => (
        <View
          key={i}
          style={[
            styles.progressDot,
            { backgroundColor: i <= step ? '#2E7D32' : '#E0E0E0', flex: 1 },
          ]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepSubtitle}>Step 1 of 5</Text>
      <Progress />

      <Text style={styles.label}>Shop Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Business Name"
        value={shopName}
        onChangeText={setShopName}
      />

      <Text style={styles.label}>Owner Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Your full name"
        value={ownerName}
        onChangeText={setOwnerName}
      />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>Mobile *</Text>
          <TextInput
            style={styles.input}
            placeholder="10-digit number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            maxLength={10}
          />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.label}>Town/City *</Text>
          <TextInput
            style={styles.input}
            placeholder="Your town"
            value={town}
            onChangeText={setTown}
          />
        </View>
      </View>

      <Text style={styles.label}>Password *</Text>
      <TextInput
        style={styles.input}
        placeholder="Min 6 characters"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.label}>Confirm Password *</Text>
      <TextInput
        style={styles.input}
        placeholder="Re-enter password"
        value={confirmPw}
        onChangeText={setConfirmPw}
        secureTextEntry
      />
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Shop Details</Text>
      <Text style={styles.stepSubtitle}>Step 2 of 5</Text>
      <Progress />

      <Text style={styles.label}>Category *</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.categoryCard, category === cat.id && styles.categoryCardActive]}
            onPress={() => setCategory(cat.id)}
          >
            <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
            <Text style={[styles.categoryLabel, category === cat.id && styles.categoryLabelActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.feeInfo}>
        <Text style={styles.feeInfoText}>
          Platform fee: <Text style={{ fontWeight: 'bold' }}>{platformFee()}</Text>
        </Text>
      </View>

      <Text style={styles.label}>Delivery Type *</Text>
      <View style={styles.toggleRow}>
        {[
          ['delivery', 'Shop Delivers'],
          ['pickup',   'Self Pickup'],
          ['both',     'Both'],
        ].map(([val, label]) => (
          <TouchableOpacity
            key={val}
            style={[styles.toggleBtn, deliveryType === val && styles.toggleBtnActive]}
            onPress={() => setDeliveryType(val)}
          >
            <Text style={[styles.toggleBtnText, deliveryType === val && styles.toggleBtnTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>Delivery Time (mins)</Text>
          <TextInput
            style={styles.input}
            placeholder="30"
            value={deliveryTime}
            onChangeText={setDeliveryTime}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.label}>Min Order (Rs.)</Text>
          <TextInput
            style={styles.input}
            placeholder="100"
            value={minOrder}
            onChangeText={setMinOrder}
            keyboardType="numeric"
          />
        </View>
      </View>
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Bank Details</Text>
      <Text style={styles.stepSubtitle}>Step 3 of 5</Text>
      <Progress />

      <View style={styles.feeInfo}>
        <Text style={styles.feeInfoText}>
          Bank details are used by admin to settle platform fees weekly
        </Text>
      </View>

      <Text style={styles.label}>Account Holder Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="Name as per bank"
        value={accountName}
        onChangeText={setAccountName}
      />

      <Text style={styles.label}>Bank Name *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. SBI, HDFC"
        value={bankName}
        onChangeText={setBankName}
      />

      <Text style={styles.label}>Account Number *</Text>
      <TextInput
        style={styles.input}
        placeholder="Account number"
        value={accountNo}
        onChangeText={setAccountNo}
        keyboardType="numeric"
      />

      <Text style={styles.label}>IFSC Code *</Text>
      <TextInput
        style={styles.input}
        placeholder="e.g. SBIN0001234"
        value={ifsc}
        onChangeText={setIfsc}
        autoCapitalize="characters"
      />
    </ScrollView>
  );

  const renderStep4 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Shop Timings</Text>
      <Text style={styles.stepSubtitle}>Step 4 of 5</Text>
      <Progress />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>Opening Time</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 9:00 AM"
            value={openTime}
            onChangeText={setOpenTime}
          />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.label}>Closing Time</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 9:00 PM"
            value={closeTime}
            onChangeText={setCloseTime}
          />
        </View>
      </View>

      <Text style={styles.label}>Weekly Off</Text>
      <View style={styles.weeklyGrid}>
        {WEEKLY_OFF.map(day => (
          <TouchableOpacity
            key={day}
            style={[styles.dayBtn, weeklyOff === day && styles.dayBtnActive]}
            onPress={() => setWeeklyOff(day)}
          >
            <Text style={[styles.dayBtnText, weeklyOff === day && styles.dayBtnTextActive]}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );

  const renderStep5 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Review & Submit</Text>
      <Text style={styles.stepSubtitle}>Step 5 of 5</Text>
      <Progress />

      <View style={styles.reviewCard}>
        <Text style={styles.reviewSection}>🏪 Shop Info</Text>
        <Text style={styles.reviewRow}><Text style={styles.reviewKey}>Shop: </Text>{shopName}</Text>
        <Text style={styles.reviewRow}><Text style={styles.reviewKey}>Owner: </Text>{ownerName}</Text>
        <Text style={styles.reviewRow}><Text style={styles.reviewKey}>Phone: </Text>{phone}</Text>
        <Text style={styles.reviewRow}><Text style={styles.reviewKey}>Town: </Text>{town}</Text>
      </View>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewSection}>📦 Shop Details</Text>
        <Text style={styles.reviewRow}><Text style={styles.reviewKey}>Category: </Text>{category}</Text>
        <Text style={styles.reviewRow}><Text style={styles.reviewKey}>Delivery: </Text>{deliveryType}</Text>
        <Text style={styles.reviewRow}><Text style={styles.reviewKey}>Min Order: </Text>Rs.{minOrder}</Text>
        <Text style={styles.reviewRow}><Text style={styles.reviewKey}>Platform Fee: </Text>{platformFee()}</Text>
      </View>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewSection}>🏦 Bank Details</Text>
        <Text style={styles.reviewRow}><Text style={styles.reviewKey}>Account: </Text>{accountName}</Text>
        <Text style={styles.reviewRow}><Text style={styles.reviewKey}>Bank: </Text>{bankName}</Text>
        <Text style={styles.reviewRow}><Text style={styles.reviewKey}>IFSC: </Text>{ifsc}</Text>
      </View>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewSection}>🕐 Timings</Text>
        <Text style={styles.reviewRow}><Text style={styles.reviewKey}>Hours: </Text>{openTime} - {closeTime}</Text>
        <Text style={styles.reviewRow}><Text style={styles.reviewKey}>Weekly Off: </Text>{weeklyOff}</Text>
      </View>

      <View style={styles.approvalNote}>
        <Text style={styles.approvalText}>
          Your shop will be reviewed by admin before going live. Usually takes 24 hours.
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.logoRow}>
          <Text style={styles.logoIcon}>🛒</Text>
          <Text style={styles.logoText}>Shop2me</Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={styles.tabInactive}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.tabInactiveText}>Buyer</Text>
        </TouchableOpacity>
        <View style={styles.tabActive}>
          <Text style={styles.tabActiveText}>Seller</Text>
        </View>
      </View>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
      {step === 5 && renderStep5()}

      <View style={styles.footer}>
        {step < 5 ? (
          <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
            <Text style={styles.nextBtnText}>Next →</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: '#2E7D32' }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.nextBtnText}>Join as Seller</Text>}
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 50, paddingHorizontal: 16, paddingBottom: 10,
    borderBottomWidth: 1, borderBottomColor: '#f0f0f0',
  },
  backBtn: { padding: 4, width: 60 },
  backText: { color: '#2E7D32', fontSize: 15, fontWeight: '600' },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoIcon: { fontSize: 22 },
  logoText: { fontSize: 20, fontWeight: 'bold', color: '#111' },
  tabRow: {
    flexDirection: 'row', margin: 16, borderRadius: 14,
    backgroundColor: '#f0f0f0', padding: 4,
  },
  tabActive: {
    flex: 1, backgroundColor: '#fff', borderRadius: 10,
    padding: 10, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  tabActiveText: { fontWeight: 'bold', color: '#2E7D32', fontSize: 15 },
  tabInactive: { flex: 1, padding: 10, alignItems: 'center' },
  tabInactiveText: { color: '#888', fontSize: 15 },
  stepContent: { flex: 1, paddingHorizontal: 16 },
  stepTitle: { fontSize: 22, fontWeight: 'bold', color: '#111', marginTop: 16, marginBottom: 4 },
  stepSubtitle: { fontSize: 13, color: '#888', marginBottom: 12 },
  progressRow: { flexDirection: 'row', gap: 6, marginBottom: 20, height: 5 },
  progressDot: { height: 5, borderRadius: 3 },
  label: { fontSize: 13, color: '#444', fontWeight: '600', marginBottom: 6, marginTop: 4 },
  input: {
    borderWidth: 1.5, borderColor: '#ececec', borderRadius: 12,
    padding: 13, fontSize: 15, marginBottom: 12,
    backgroundColor: '#fafafa', color: '#111',
  },
  row: { flexDirection: 'row', gap: 12 },
  halfField: { flex: 1 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  categoryCard: {
    width: '47%', borderWidth: 1.5, borderColor: '#e0e0e0',
    borderRadius: 14, padding: 14, alignItems: 'center', backgroundColor: '#fafafa',
  },
  categoryCardActive: { borderColor: '#2E7D32', backgroundColor: '#E8F5E9' },
  categoryEmoji: { fontSize: 28, marginBottom: 6 },
  categoryLabel: { fontSize: 13, color: '#555', fontWeight: '600' },
  categoryLabelActive: { color: '#2E7D32' },
  feeInfo: {
    backgroundColor: '#E8F5E9', borderRadius: 10,
    padding: 10, marginBottom: 12,
  },
  feeInfoText: { fontSize: 13, color: '#2E7D32' },
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  toggleBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#e0e0e0',
    borderRadius: 10, padding: 10, alignItems: 'center',
  },
  toggleBtnActive: { borderColor: '#111', backgroundColor: '#111' },
  toggleBtnText: { fontSize: 12, color: '#555', fontWeight: '600', textAlign: 'center' },
  toggleBtnTextActive: { color: '#fff' },
  weeklyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  dayBtn: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7,
  },
  dayBtnActive: { backgroundColor: '#111', borderColor: '#111' },
  dayBtnText: { fontSize: 13, color: '#555' },
  dayBtnTextActive: { color: '#fff', fontWeight: 'bold' },
  reviewCard: {
    backgroundColor: '#f9f9f9', borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: '#f0f0f0',
  },
  reviewSection: { fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 8 },
  reviewRow: { fontSize: 13, color: '#555', marginBottom: 4 },
  reviewKey: { fontWeight: '600', color: '#333' },
  approvalNote: {
    backgroundColor: '#FFF3E0', borderRadius: 12,
    padding: 14, marginBottom: 20,
  },
  approvalText: { fontSize: 13, color: '#E65100', lineHeight: 18 },
  footer: {
    padding: 16, paddingBottom: 30,
    borderTopWidth: 1, borderTopColor: '#f0f0f0', backgroundColor: '#fff',
  },
  nextBtn: {
    backgroundColor: '#111', padding: 16,
    borderRadius: 14, alignItems: 'center',
  },
  nextBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});