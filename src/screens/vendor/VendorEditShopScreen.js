import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../../api/client';

const CATEGORIES = [
  { key: 'restaurant', label: 'Restaurant', emoji: '🍽' },
  { key: 'supermarket', label: 'Supermarket', emoji: '🏪' },
  { key: 'fast_food', label: 'Fast Food', emoji: '🍔' },
  { key: 'chinese', label: 'Chinese', emoji: '🥡' },
  { key: 'bakery', label: 'Bakery', emoji: '🥐' },
  { key: 'vegetables', label: 'Vegetables', emoji: '🥬' },
  { key: 'fruits', label: 'Fruits', emoji: '🍎' },
  { key: 'dairy', label: 'Dairy', emoji: '🥛' },
  { key: 'grocery', label: 'Grocery', emoji: '🛒' },
  { key: 'snacks', label: 'Snacks', emoji: '🍿' },
  { key: 'beverages', label: 'Beverages', emoji: '🧃' },
  { key: 'other', label: 'Other', emoji: '📦' },
];

const DELIVERY_TIMES = ['15 mins', '30 mins', '45 mins', '60 mins', '90 mins', '120 mins'];
const WEEKLY_OFFS = ['None', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function VendorEditShopScreen({ navigation, route }) {
  const { shop } = route.params || {};
  const [shopName, setShopName]         = useState(shop?.shop_name || '');
  const [ownerName, setOwnerName]       = useState(shop?.owner_name || '');
  const [address, setAddress]           = useState(shop?.address || '');
  const [town, setTown]                 = useState(shop?.town || '');
  const [state, setState]               = useState(shop?.state || 'Andhra Pradesh');
  const [gstin, setGstin]               = useState(shop?.gstin || '');
  const [pan, setPan]                   = useState(shop?.pan || '');
  const [fssai, setFssai]               = useState(shop?.fssai_number || '');
  const [phone, setPhone]               = useState(shop?.phone_number || '');
  const [category, setCategory]         = useState(shop?.category || 'restaurant');
  const [deliveryRadius, setDeliveryRadius] = useState(shop?.delivery_radius?.toString() || '5');
  const [minOrder, setMinOrder]         = useState((shop?.min_order || shop?.min_order_value)?.toString() || '100');
  const [deliveryTime, setDeliveryTime] = useState(shop?.delivery_time || '30 mins');
  const [openTime, setOpenTime]         = useState(shop?.open_time || '9:00 AM');
  const [closeTime, setCloseTime]       = useState(shop?.close_time || '9:00 PM');
  const [weeklyOff, setWeeklyOff]       = useState(shop?.weekly_off || 'None');
  const [description, setDescription]   = useState(shop?.description || '');
  const [latitude, setLatitude]         = useState(shop?.latitude || null);


  const [longitude, setLongitude]       = useState(shop?.longitude || null);
  const [loading, setLoading]           = useState(false);
  const [locLoading, setLocLoading]     = useState(false);
  const [showCatPicker, setShowCatPicker] = useState(false);

  const handleGetLocation = async () => {
    setLocLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission Denied', 'Please allow location access'); return; }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLatitude(loc.coords.latitude);
      setLongitude(loc.coords.longitude);
      Alert.alert('✅ Location Set!', `Lat: ${loc.coords.latitude.toFixed(4)}, Lng: ${loc.coords.longitude.toFixed(4)}`);
    } catch (e) {
      Alert.alert('Error', 'Could not get location. Try again.');
    } finally { setLocLoading(false); }
  };

  const handleSave = async () => {
    if (!shopName.trim()) { Alert.alert('Error', 'Shop name is required'); return; }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      await client.patch('/vendors/myshop/', {
        shop_name:       shopName.trim(),
        address:         address.trim(),
        town:            town.trim(),
        state:           state.trim(),
        gstin:           gstin.trim(),
        pan:             pan.trim(),
        fssai_number:    fssai.trim(),
        phone_number:    phone.trim(),
        description:     description.trim(),
        category:        category,
        delivery_radius: parseFloat(deliveryRadius) || 5,
        min_order:       parseFloat(minOrder) || 100,
        ...(latitude  && { latitude:  parseFloat(latitude)  }),
        ...(longitude && { longitude: parseFloat(longitude) }),
      }, { headers: { Authorization: `Bearer ${token}` } });
      Alert.alert('✅ Updated!', 'Shop details updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (e) {
      console.log('Edit shop error:', JSON.stringify(e.response?.data), e.message);
      Alert.alert('Error', JSON.stringify(e.response?.data) || e.message || 'Failed to update shop');
    } finally { setLoading(false); }
  };

  const selectedCat = CATEGORIES.find(c => c.key === category);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Shop Details</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Basic Info */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Text style={styles.label}>Shop Name *</Text>
          <TextInput style={styles.input} value={shopName} onChangeText={setShopName} placeholder="Enter shop name" placeholderTextColor="#9CA3AF" />

          <Text style={styles.label}>Phone Number</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="Enter phone number" keyboardType="phone-pad" placeholderTextColor="#9CA3AF" />

          <Text style={styles.label}>Description</Text>
          <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} value={description} onChangeText={setDescription} placeholder="Describe your shop..." placeholderTextColor="#9CA3AF" multiline />

          <Text style={styles.label}>Address</Text>
          <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder="Enter address" placeholderTextColor="#9CA3AF" />

          <Text style={styles.label}>Town</Text>
          <TextInput style={styles.input} value={town} onChangeText={setTown} placeholder="Enter town" placeholderTextColor="#9CA3AF" />
        <Text style={styles.label}>State</Text>
          <TextInput style={styles.input} value={state} onChangeText={setState} placeholder="e.g. Andhra Pradesh" placeholderTextColor="#9CA3AF" />
        <Text style={styles.label}>GSTIN (optional)</Text>
          <TextInput style={styles.input} value={gstin} onChangeText={setGstin} placeholder="15-digit GSTIN" placeholderTextColor="#9CA3AF" autoCapitalize="characters" maxLength={15} />
        <Text style={styles.label}>PAN (optional)</Text>
          <TextInput style={styles.input} value={pan} onChangeText={setPan} placeholder="10-digit PAN" placeholderTextColor="#9CA3AF" autoCapitalize="characters" maxLength={10} />
        <Text style={styles.label}>FSSAI Number (optional)</Text>
          <TextInput style={styles.input} value={fssai} onChangeText={setFssai} placeholder="14-digit FSSAI" placeholderTextColor="#9CA3AF" keyboardType="numeric" maxLength={14} />
        </View>

        {/* Category — read only */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Shop Category</Text>
          <View style={[styles.dropdown, { backgroundColor: '#F0FDF4' }]}>
            <Text style={[styles.dropdownText, { color: '#16a34a', fontWeight: '600' }]}>
              {selectedCat ? `${selectedCat.emoji} ${selectedCat.label}` : category}
            </Text>
            <Ionicons name="lock-closed-outline" size={16} color="#16a34a" />
          </View>
          <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>Category cannot be changed after registration.</Text>
        </View>

        {/* Delivery Settings */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Delivery Settings</Text>

          <Text style={styles.label}>Delivery Radius (km)</Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            {['1', '2', '3', '5', '10', '15', '20'].map(r => (
              <TouchableOpacity key={r}
                style={[styles.radiusBtn, deliveryRadius === r && styles.radiusBtnActive]}
                onPress={() => setDeliveryRadius(r)}>
                <Text style={[styles.radiusBtnText, deliveryRadius === r && { color: '#fff' }]}>{r} km</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TextInput style={styles.input} value={deliveryRadius} onChangeText={setDeliveryRadius}
            placeholder="Custom radius in km" keyboardType="numeric" placeholderTextColor="#9CA3AF" />

          <Text style={styles.label}>Minimum Order (₹)</Text>
          <TextInput style={styles.input} value={minOrder} onChangeText={setMinOrder}
            placeholder="e.g. 100" keyboardType="numeric" placeholderTextColor="#9CA3AF" />
        </View>

        {/* Location */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Shop Location (GPS)</Text>
          <TouchableOpacity style={styles.gpsBtn} onPress={handleGetLocation} disabled={locLoading}>
            <Ionicons name="location-sharp" size={18} color="#fff" />
            <Text style={styles.gpsBtnText}>
              {locLoading ? 'Getting Location...' : latitude ? '📍 Location Set — Tap to Update' : 'Use My Current Location'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.gpsBtn, { backgroundColor: '#0891b2', marginTop: 8 }]} onPress={() => navigation.navigate('VendorMapPicker', {
            initialLat: latitude,
            initialLng: longitude,
            onLocationPicked: (lat, lng) => {
              setLatitude(lat.toString());
              setLongitude(lng.toString());
            }
          })}>
            <Ionicons name="map-outline" size={18} color="#fff" />
            <Text style={styles.gpsBtnText}>📍 Pick on Map</Text>
          </TouchableOpacity>
          {latitude ? (
            <Text style={styles.gpsCoords}>📍 {parseFloat(latitude).toFixed(4)}, {parseFloat(longitude).toFixed(4)}</Text>
          ) : (
            <Text style={styles.gpsHint}>Set your shop GPS so customers can find you nearby</Text>
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#F8F9FA' },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn:        { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111', flex: 1, textAlign: 'center' },
  card:           { backgroundColor: '#fff', borderRadius: 16, margin: 16, marginBottom: 0, padding: 16 },
  sectionTitle:   { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 8 },
  label:          { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
  input:          { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 14, color: '#111', backgroundColor: '#F9FAFB' },
  dropdown:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, backgroundColor: '#F9FAFB' },
  dropdownText:   { fontSize: 14, color: '#111' },
  pickerDropdown: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, marginTop: 4, backgroundColor: '#fff' },
  pickerItem:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  pickerItemActive: { backgroundColor: '#EFF6FF' },
  pickerItemText: { fontSize: 14, color: '#111' },
  radiusBtn:      { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  radiusBtnActive: { backgroundColor: '#1669ef', borderColor: '#1669ef' },
  radiusBtnText:  { fontSize: 13, fontWeight: '600', color: '#555' },
  gpsBtn:         { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1669ef', borderRadius: 10, padding: 12, gap: 8, marginBottom: 6 },
  gpsBtnText:     { color: '#fff', fontWeight: '600', fontSize: 14 },
  gpsCoords:      { fontSize: 12, color: '#16A34A', marginBottom: 8 },
  gpsHint:        { fontSize: 12, color: '#9CA3AF', marginBottom: 8 },
  footer:         { padding: 16, paddingBottom: 30, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  saveBtn:        { backgroundColor: '#1669ef', borderRadius: 14, padding: 16, alignItems: 'center' },
  saveBtnText:    { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
