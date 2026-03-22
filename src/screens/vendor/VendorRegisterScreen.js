import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as Location from 'expo-location';
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
  const [step, setStep]             = useState(1);
  const [loading, setLoading]       = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);

  const [shopName,  setShopName]  = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone,     setPhone]     = useState('');
  const [town,      setTown]      = useState('');
  const [vendorLat, setVendorLat] = useState(null);
  const [vendorLng, setVendorLng] = useState(null);
  const [password,  setPassword]  = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPassword,  setShowPassword]  = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [category,     setCategory]     = useState('vegetables');
  const [deliveryType, setDeliveryType] = useState('delivery');
  const [minOrder,     setMinOrder]     = useState('100');
  const [deliveryTime, setDeliveryTime] = useState('30');

  const [accountName, setAccountName] = useState('');
  const [bankName,    setBankName]    = useState('');
  const [accountNo,   setAccountNo]   = useState('');
  const [ifsc,        setIfsc]        = useState('');

  const [openTime,  setOpenTime]  = useState('9:00 AM');
  const [closeTime, setCloseTime] = useState('9:00 PM');
  const [weeklyOff, setWeeklyOff] = useState('None');

  const platformFee = () => {
    if (category === 'vegetables') return 'Rs.5 per order';
    if (category === 'restaurant') return 'Rs.10 per order';
    return 'Rs.7 per order';
  };

  const handleDetectLocation = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please allow location access to auto-detect your town.');
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const geocode = await Location.reverseGeocodeAsync({
        latitude:  location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (geocode.length > 0) {
        const place = geocode[0];
        const detectedTown = place.city || place.subregion || place.region || '';
        if (detectedTown) {
          setTown(detectedTown);
          setVendorLat(location.coords.latitude);
          setVendorLng(location.coords.longitude);
          Alert.alert('📍 Location Detected!', `Town set to: ${detectedTown}`);
        } else {
          Alert.alert('Could not detect town', 'Please enter your town manually.');
        }
      }
    } catch (e) {
      Alert.alert('Error', 'Could not detect location. Please enter town manually.');
    } finally {
      setGpsLoading(false);
    }
  };

  // ── Validation on Next ──
  const goNext = () => {
    if (step === 1) {
      if (!shopName.trim())  return Alert.alert('Error', 'Please enter shop name');
      if (!ownerName.trim()) return Alert.alert('Error', 'Please enter owner name');
      if (!phone.trim() || phone.length !== 10) return Alert.alert('Error', 'Enter valid 10-digit phone number');
      if (!town.trim())      return Alert.alert('Error', 'Please enter your town');
      if (!password.trim() || password.length < 6) return Alert.alert('Error', 'Password must be at least 6 characters');
      if (password !== confirmPw) return Alert.alert('Error', 'Passwords do not match');
    }
    setStep(prev => prev + 1);
  };

  const goBack = () => {
    if (step === 1) navigation.goBack();
    else setStep(prev => prev - 1);
  };

  // ── Submit — Final Fixed Version ──
  const handleSubmit = async () => {
    if (!shopName.trim()) return Alert.alert('Error', 'Shop name is required');
    if (!town.trim())     return Alert.alert('Error', 'Town is required');

    setLoading(true);
    try {
      // Step 1 — Register user account
      await client.post('/users/register/', {
        full_name:    ownerName,
        phone_number: phone,
        password:     password,
        user_type:    'vendor',
      });

      // Step 2 — Login — this saves access_token to AsyncStorage via AuthContext
      await login(phone, password);

      // Step 3 — Wait 1 second for token to fully save
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4 — Register shop
      // Client interceptor in client.js reads access_token automatically
      const response = await client.post('/vendors/register/', {
        shop_name:               shopName,
        category:                category,
        town:                    town,
        phone_number:            phone,
        address:                 town,
        latitude:                vendorLat || null,
        longitude:               vendorLng || null,
        delivery_type:           deliveryType,
        estimated_delivery_time: parseInt(deliveryTime),
      });

      console.log('✅ Vendor registered:', response.data);

      Alert.alert(
        'Registration Successful! 🎉',
        'Your shop is now live on Univerin!',
        [{ text: 'OK', onPress: () => navigation.replace('VendorHome') }]
      );
    } catch (e) {
      console.log('❌ Error:', JSON.stringify(e.response?.data));
      const msg = e.response?.data?.phone_number?.[0]
        || e.response?.data?.error
        || e.response?.data?.detail
        || e.response?.data?.shop_name?.[0]
        || e.response?.data?.address?.[0]
        || 'Registration failed. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Progress Bar ──
  const Progress = () => (
    <View style={styles.progressRow}>
      {[1,2,3,4,5].map(i => (
        <View
          key={i}
          style={[
            styles.progressDot,
            { backgroundColor: i <= step ? '#0d9488' : '#E0E0E0', flex: 1 },
          ]}
        />
      ))}
    </View>
  );

  const renderStep1 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Basic Information</Text>
      <Text style={styles.stepSubtitle}>Step 1 of 5 — Shop & Owner Details</Text>
      <Progress />

      <Text style={styles.label}>Shop Name *</Text>
      <TextInput style={styles.input} placeholder="Business Name"
        placeholderTextColor="#9CA3AF" value={shopName} onChangeText={setShopName} />

      <Text style={styles.label}>Owner Name *</Text>
      <TextInput style={styles.input} placeholder="Your full name"
        placeholderTextColor="#9CA3AF" value={ownerName} onChangeText={setOwnerName} />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>Mobile *</Text>
          <TextInput style={styles.input} placeholder="10-digit"
            placeholderTextColor="#9CA3AF" value={phone} onChangeText={setPhone}
            keyboardType="phone-pad" maxLength={10} />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.label}>Town/City *</Text>
          <TextInput
            style={[styles.input, town ? styles.inputFilled : null]}
            placeholder="Your town"
            placeholderTextColor="#9CA3AF"
            value={town}
            onChangeText={text => {
              setTown(text);
              if (!text) { setVendorLat(null); setVendorLng(null); }
            }}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.gpsBtn} onPress={handleDetectLocation} disabled={gpsLoading}>
        {gpsLoading
          ? <ActivityIndicator color="#0d9488" size="small" />
          : <Text style={styles.gpsBtnText}>📍 Auto-detect my location</Text>
        }
      </TouchableOpacity>

      {town && vendorLat ? (
        <View style={styles.townDetected}>
          <View>
            <Text style={styles.townDetectedText}>📍 {town}</Text>
            <Text style={styles.townDetectedSub}>GPS: {vendorLat?.toFixed(4)}, {vendorLng?.toFixed(4)}</Text>
          </View>
          <TouchableOpacity onPress={() => { setTown(''); setVendorLat(null); setVendorLng(null); }}>
            <Text style={styles.townClear}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : town ? (
        <View style={styles.townManual}>
          <Text style={styles.townManualText}>📍 {town} (entered manually)</Text>
        </View>
      ) : null}

      <Text style={styles.label}>Password *</Text>
      <View style={styles.passwordWrapper}>
        <TextInput style={styles.passwordInput} placeholder="Min 6 characters"
          placeholderTextColor="#9CA3AF" value={password}
          onChangeText={setPassword} secureTextEntry={!showPassword} />
        <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Confirm Password *</Text>
      <View style={styles.passwordWrapper}>
        <TextInput style={styles.passwordInput} placeholder="Re-enter password"
          placeholderTextColor="#9CA3AF" value={confirmPw}
          onChangeText={setConfirmPw} secureTextEntry={!showConfirmPw} />
        <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirmPw(!showConfirmPw)}>
          <Text style={styles.eyeText}>{showConfirmPw ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Shop Details</Text>
      <Text style={styles.stepSubtitle}>Step 2 of 5 — Category & Delivery</Text>
      <Progress />

      <Text style={styles.label}>Category *</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity key={cat.id}
            style={[styles.categoryCard, category === cat.id && styles.categoryCardActive]}
            onPress={() => setCategory(cat.id)}>
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
        {[['delivery','Shop Delivers'],['pickup','Self Pickup'],['both','Both']].map(([val, label]) => (
          <TouchableOpacity key={val}
            style={[styles.toggleBtn, deliveryType === val && styles.toggleBtnActive]}
            onPress={() => setDeliveryType(val)}>
            <Text style={[styles.toggleBtnText, deliveryType === val && styles.toggleBtnTextActive]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>Delivery Time (mins)</Text>
          <TextInput style={styles.input} placeholder="30" placeholderTextColor="#9CA3AF"
            value={deliveryTime} onChangeText={setDeliveryTime} keyboardType="numeric" />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.label}>Min Order (Rs.)</Text>
          <TextInput style={styles.input} placeholder="100" placeholderTextColor="#9CA3AF"
            value={minOrder} onChangeText={setMinOrder} keyboardType="numeric" />
        </View>
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Bank Details</Text>
      <Text style={styles.stepSubtitle}>Step 3 of 5 — For weekly settlement</Text>
      <Progress />

      <View style={styles.feeInfo}>
        <Text style={styles.feeInfoText}>Bank details are used by admin to settle earnings weekly</Text>
      </View>

      <Text style={styles.label}>Account Holder Name</Text>
      <TextInput style={styles.input} placeholder="Name as per bank"
        placeholderTextColor="#9CA3AF" value={accountName} onChangeText={setAccountName} />

      <Text style={styles.label}>Bank Name</Text>
      <TextInput style={styles.input} placeholder="e.g. SBI, HDFC"
        placeholderTextColor="#9CA3AF" value={bankName} onChangeText={setBankName} />

      <Text style={styles.label}>Account Number</Text>
      <TextInput style={styles.input} placeholder="Account number"
        placeholderTextColor="#9CA3AF" value={accountNo}
        onChangeText={setAccountNo} keyboardType="numeric" />

      <Text style={styles.label}>IFSC Code</Text>
      <TextInput style={styles.input} placeholder="e.g. SBIN0001234"
        placeholderTextColor="#9CA3AF" value={ifsc}
        onChangeText={setIfsc} autoCapitalize="characters" />

      <View style={styles.optionalNote}>
        <Text style={styles.optionalNoteText}>
          ℹ️ Bank details can be added later from your profile settings
        </Text>
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const renderStep4 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Shop Timings</Text>
      <Text style={styles.stepSubtitle}>Step 4 of 5 — When are you open?</Text>
      <Progress />

      <View style={styles.row}>
        <View style={styles.halfField}>
          <Text style={styles.label}>Opening Time</Text>
          <TextInput style={styles.input} placeholder="e.g. 9:00 AM"
            placeholderTextColor="#9CA3AF" value={openTime} onChangeText={setOpenTime} />
        </View>
        <View style={styles.halfField}>
          <Text style={styles.label}>Closing Time</Text>
          <TextInput style={styles.input} placeholder="e.g. 9:00 PM"
            placeholderTextColor="#9CA3AF" value={closeTime} onChangeText={setCloseTime} />
        </View>
      </View>

      <Text style={styles.label}>Weekly Off</Text>
      <View style={styles.weeklyGrid}>
        {WEEKLY_OFF.map(day => (
          <TouchableOpacity key={day}
            style={[styles.dayBtn, weeklyOff === day && styles.dayBtnActive]}
            onPress={() => setWeeklyOff(day)}>
            <Text style={[styles.dayBtnText, weeklyOff === day && styles.dayBtnTextActive]}>
              {day}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  const renderStep5 = () => (
    <ScrollView style={styles.stepContent} showsVerticalScrollIndicator={false}>
      <Text style={styles.stepTitle}>Review & Submit</Text>
      <Text style={styles.stepSubtitle}>Step 5 of 5 — Check your details</Text>
      <Progress />

      <View style={styles.reviewCard}>
        <Text style={styles.reviewSection}>🏪 Shop Info</Text>
        <Text style={styles.reviewRow}><Text style={styles.reviewKey}>Shop: </Text>{shopName}</Text>
        <Text style={styles.reviewRow}><Text style={styles.reviewKey}>Owner: </Text>{ownerName}</Text>
        <Text style={styles.reviewRow}><Text style={styles.reviewKey}>Phone: </Text>{phone}</Text>
        <Text style={styles.reviewRow}><Text style={styles.reviewKey}>Town: </Text>{town}</Text>
        {vendorLat && (
          <Text style={styles.reviewRow}>
            <Text style={styles.reviewKey}>GPS: </Text>
            {vendorLat?.toFixed(4)}, {vendorLng?.toFixed(4)} ✅
          </Text>
        )}
      </View>

      <View style={styles.reviewCard}>
        <Text style={styles.reviewSection}>📦 Shop Details</Text>
        <Text style={styles.reviewRow}><Text style={styles.reviewKey}>Category: </Text>{category}</Text>
        <Text style={styles.reviewRow}><Text style={styles.reviewKey}>Delivery: </Text>{deliveryType}</Text>
        <Text style={styles.reviewRow}><Text style={styles.reviewKey}>Min Order: </Text>Rs.{minOrder}</Text>
        <Text style={styles.reviewRow}><Text style={styles.reviewKey}>Platform Fee: </Text>{platformFee()}</Text>
      </View>

      {(accountName || bankName) && (
        <View style={styles.reviewCard}>
          <Text style={styles.reviewSection}>🏦 Bank Details</Text>
          <Text style={styles.reviewRow}><Text style={styles.reviewKey}>Account: </Text>{accountName}</Text>
          <Text style={styles.reviewRow}><Text style={styles.reviewKey}>Bank: </Text>{bankName}</Text>
          <Text style={styles.reviewRow}><Text style={styles.reviewKey}>IFSC: </Text>{ifsc}</Text>
        </View>
      )}

      <View style={styles.reviewCard}>
        <Text style={styles.reviewSection}>🕐 Timings</Text>
        <Text style={styles.reviewRow}><Text style={styles.reviewKey}>Hours: </Text>{openTime} - {closeTime}</Text>
        <Text style={styles.reviewRow}><Text style={styles.reviewKey}>Weekly Off: </Text>{weeklyOff}</Text>
      </View>

      <View style={styles.approvalNote}>
        <Text style={styles.approvalText}>✅ Your shop will go live immediately on Univerin!</Text>
      </View>
      <View style={{ height: 20 }} />
    </ScrollView>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.logoRow}>
          <View style={styles.logoIconBox}>
            <Text style={styles.logoIconText}>U</Text>
          </View>
          <Text style={styles.logoText}>
            <Text style={styles.logoTeal}>Uni</Text>
            <Text style={styles.logoDark}>verin</Text>
          </Text>
        </View>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity style={styles.tabInactive} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.tabInactiveText}>🛒 Buyer</Text>
        </TouchableOpacity>
        <View style={styles.tabActive}>
          <Text style={styles.tabActiveText}>🏪 Seller</Text>
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
            style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
            onPress={handleSubmit} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.nextBtnText}>Join as Seller 🎉</Text>
            }
          </TouchableOpacity>
        )}
      </View>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0fdfa' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#ccfbf1', backgroundColor: '#f0fdfa',
  },
  backBtn:  { padding: 4, width: 60 },
  backText: { color: '#0d9488', fontSize: 15, fontWeight: '600' },
  logoRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logoIconBox: {
    width: 32, height: 32, borderRadius: 8,
    backgroundColor: '#0d9488', justifyContent: 'center', alignItems: 'center',
  },
  logoIconText: { fontSize: 16, fontWeight: '900', color: 'white' },
  logoText:     { fontSize: 20, fontWeight: '700' },
  logoTeal:     { color: '#0d9488' },
  logoDark:     { color: '#0f172a' },
  tabRow: {
    flexDirection: 'row', margin: 16, borderRadius: 14,
    backgroundColor: '#E5E7EB', padding: 4,
  },
  tabActive: {
    flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 10,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  tabActiveText:   { fontWeight: '700', color: '#0d9488', fontSize: 14 },
  tabInactive:     { flex: 1, padding: 10, alignItems: 'center' },
  tabInactiveText: { color: '#888', fontSize: 14, fontWeight: '500' },
  stepContent:  { flex: 1, paddingHorizontal: 16 },
  stepTitle:    { fontSize: 22, fontWeight: '700', color: '#0f172a', marginTop: 16, marginBottom: 4 },
  stepSubtitle: { fontSize: 13, color: '#888', marginBottom: 12 },
  progressRow:  { flexDirection: 'row', gap: 6, marginBottom: 20, height: 5 },
  progressDot:  { height: 5, borderRadius: 3 },
  label: { fontSize: 13, color: '#444', fontWeight: '600', marginBottom: 6, marginTop: 4 },
  input: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 13, fontSize: 15, marginBottom: 12, backgroundColor: '#F9FAFB', color: '#111',
  },
  inputFilled: { borderColor: '#0d9488', backgroundColor: '#f0fdfa' },
  row:         { flexDirection: 'row', gap: 12 },
  halfField:   { flex: 1 },
  passwordWrapper: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1.5,
    borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#F9FAFB',
    marginBottom: 12, overflow: 'hidden',
  },
  passwordInput: { flex: 1, padding: 13, fontSize: 15, color: '#111' },
  eyeButton:     { paddingHorizontal: 14, paddingVertical: 13 },
  eyeText:       { fontSize: 13, color: '#0d9488', fontWeight: '600' },
  gpsBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f0fdfa', borderRadius: 12, borderWidth: 1.5,
    borderColor: '#0d9488', padding: 12, marginBottom: 10,
  },
  gpsBtnText:       { fontSize: 14, color: '#0d9488', fontWeight: '600' },
  townDetected: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#dcfce7', borderRadius: 10, padding: 10, marginBottom: 12,
  },
  townDetectedText: { fontSize: 13, color: '#16A34A', fontWeight: '600' },
  townDetectedSub:  { fontSize: 11, color: '#16A34A', marginTop: 2 },
  townClear:        { fontSize: 18, color: '#EF4444', fontWeight: '700', paddingHorizontal: 8 },
  townManual: {
    backgroundColor: '#FFF7ED', borderRadius: 10, padding: 10,
    marginBottom: 12, borderWidth: 1, borderColor: '#FED7AA',
  },
  townManualText:  { fontSize: 13, color: '#EA580C', fontWeight: '500' },
  categoryGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 12 },
  categoryCard: {
    width: '47%', borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 14, padding: 14, alignItems: 'center', backgroundColor: '#F9FAFB',
  },
  categoryCardActive:  { borderColor: '#0d9488', backgroundColor: '#f0fdfa' },
  categoryEmoji:       { fontSize: 28, marginBottom: 6 },
  categoryLabel:       { fontSize: 13, color: '#555', fontWeight: '600' },
  categoryLabelActive: { color: '#0d9488' },
  feeInfo: {
    backgroundColor: '#f0fdfa', borderRadius: 10, padding: 10,
    marginBottom: 12, borderWidth: 1, borderColor: '#99f6e4',
  },
  feeInfoText:  { fontSize: 13, color: '#0d9488' },
  optionalNote: {
    backgroundColor: '#fefce8', borderRadius: 10, padding: 10,
    marginTop: 4, borderWidth: 1, borderColor: '#fde68a',
  },
  optionalNoteText: { fontSize: 12, color: '#854d0e' },
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  toggleBtn: {
    flex: 1, borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 10, padding: 10, alignItems: 'center', backgroundColor: '#F9FAFB',
  },
  toggleBtnActive:     { borderColor: '#0d9488', backgroundColor: '#0d9488' },
  toggleBtnText:       { fontSize: 12, color: '#555', fontWeight: '600' },
  toggleBtnTextActive: { color: '#fff' },
  weeklyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  dayBtn: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 7, backgroundColor: '#F9FAFB',
  },
  dayBtnActive:     { backgroundColor: '#0d9488', borderColor: '#0d9488' },
  dayBtnText:       { fontSize: 13, color: '#555' },
  dayBtnTextActive: { color: '#fff', fontWeight: '600' },
  reviewCard: {
    backgroundColor: '#F9FAFB', borderRadius: 14, padding: 14,
    marginBottom: 12, borderWidth: 1, borderColor: '#F0F0F0',
  },
  reviewSection: { fontSize: 14, fontWeight: '700', color: '#111', marginBottom: 8 },
  reviewRow:     { fontSize: 13, color: '#555', marginBottom: 4 },
  reviewKey:     { fontWeight: '600', color: '#333' },
  approvalNote:  { backgroundColor: '#dcfce7', borderRadius: 12, padding: 14, marginBottom: 20 },
  approvalText:  { fontSize: 13, color: '#16A34A', lineHeight: 18, fontWeight: '500' },
  footer: {
    padding: 16, paddingBottom: 30,
    borderTopWidth: 1, borderTopColor: '#ccfbf1', backgroundColor: '#f0fdfa',
  },
  nextBtn:           { backgroundColor: '#0d9488', padding: 16, borderRadius: 14, alignItems: 'center' },
  submitBtn:         { backgroundColor: '#16A34A', padding: 16, borderRadius: 14, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#99f6e4' },
  nextBtnText:       { color: '#fff', fontSize: 16, fontWeight: '700' },
});