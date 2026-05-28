import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

const GOOGLE_API_KEY = 'AIzaSyCS_YRu6O61LCZn_QlypzjcjSdeRqbQaDI';

export default function VendorMapPickerScreen({ navigation, route }) {
  const { initialLat, initialLng } = route.params || {};
  const mapRef = useRef(null);

  const [region, setRegion] = useState({
    latitude:  initialLat ? parseFloat(initialLat) : 14.4426,
    longitude: initialLng ? parseFloat(initialLng) : 79.9865,
    latitudeDelta: 0.01, longitudeDelta: 0.01,
  });
  const [marker, setMarker]   = useState(
    initialLat ? { latitude: parseFloat(initialLat), longitude: parseFloat(initialLng) } : null
  );
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!initialLat) getCurrentLocation();
    else if (initialLat) reverseGeocode(parseFloat(initialLat), parseFloat(initialLng));
  }, []);

  const getCurrentLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = loc.coords;
      const newRegion = { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
      setRegion(newRegion);
      setMarker({ latitude, longitude });
      mapRef.current?.animateToRegion(newRegion, 500);
      await reverseGeocode(latitude, longitude);
    } catch (e) {} 
    finally { setLocating(false); }
  };

  const reverseGeocode = async (lat, lng) => {
    setLoading(true);
    try {
      const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}`);
      const data = await res.json();
      if (data.results?.[0]) setAddress(data.results[0].formatted_address);
    } catch (e) {} 
    finally { setLoading(false); }
  };

  const handleMapPress = async (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarker({ latitude, longitude });
    await reverseGeocode(latitude, longitude);
  };

  const handleConfirm = () => {
    if (!marker) { Alert.alert('Error', 'Please select your shop location'); return; }
    const { onLocationPicked } = route.params || {};
    if (onLocationPicked) {
      onLocationPicked(marker.latitude, marker.longitude);
    }
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Set Shop Location</Text>
        <View style={{ width: 36 }} />
      </View>
      <MapView ref={mapRef} style={styles.map} region={region} onPress={handleMapPress} showsUserLocation showsMyLocationButton={false}>
        {marker && <Marker coordinate={marker} title="Your Shop" />}
      </MapView>
      <TouchableOpacity style={styles.locationBtn} onPress={getCurrentLocation} disabled={locating}>
        {locating ? <ActivityIndicator size="small" color="#1669ef" /> : <Ionicons name="locate" size={22} color="#1669ef" />}
      </TouchableOpacity>
      <View style={styles.card}>
        {loading
          ? <ActivityIndicator size="small" color="#1669ef" style={{ marginBottom: 8 }} />
          : <Text style={styles.addressText}>{address || 'Tap on map to select shop location'}</Text>
        }
        <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
          <Text style={styles.confirmBtnText}>Confirm Shop Location</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#fff' },
  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn:        { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle:    { fontSize: 18, fontWeight: '700', color: '#111', flex: 1, textAlign: 'center' },
  map:            { flex: 1 },
  locationBtn:    { position: 'absolute', right: 16, top: 120, backgroundColor: '#fff', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
  card:           { backgroundColor: '#fff', padding: 16, paddingBottom: 34 },
  addressText:    { fontSize: 14, color: '#111', marginBottom: 12, fontWeight: '500' },
  confirmBtn:     { backgroundColor: '#1669ef', borderRadius: 12, padding: 16, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
