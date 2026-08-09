import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
  Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import client from '../../api/client';

const DOC_TYPES = [
  { key: 'aadhaar_document',         label: 'Aadhaar Card',        required: true,  useCamera: false },
  { key: 'driving_licence_document', label: 'Driving Licence',     required: true,  useCamera: false },
  { key: 'selfie_photo',             label: 'Selfie Photo',        required: true,  useCamera: true  },
  { key: 'pan_document',             label: 'PAN Card (optional)', required: false, useCamera: false },
];

export default function DPDocumentUploadScreen({ navigation }) {
  const [images, setImages] = useState({});
  const [loading, setLoading] = useState(false);

  const pickImage = async (docKey, useCamera) => {
    try {
      let result;
      if (useCamera) {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (perm.status !== 'granted') return Alert.alert('Permission needed', 'Camera access is required for the selfie');
        result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8, cameraType: ImagePicker.CameraType.front });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: false, quality: 0.8 });
      }
      if (!result.canceled) {
        setImages((prev) => ({ ...prev, [docKey]: result.assets[0] }));
      }
    } catch (e) {
      Alert.alert('Error', 'Could not pick image');
    }
  };

  const requiredDocs = DOC_TYPES.filter((d) => d.required);
  const allRequiredPicked = requiredDocs.every((d) => images[d.key]);

  const handleSubmit = async () => {
    if (!allRequiredPicked) {
      return Alert.alert('Missing documents', 'Please upload Aadhaar, Driving Licence, and Selfie to continue');
    }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const formData = new FormData();
      DOC_TYPES.forEach((d) => {
        if (images[d.key]) {
          formData.append(d.key, {
            uri: images[d.key].uri,
            name: `${d.key}.jpg`,
            type: 'image/jpeg',
          });
        }
      });
      const res = await client.post('/dp/onboarding/documents/', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.status === 'pending_verification') {
        navigation.replace('DPPendingVerification');
      } else {
        navigation.replace('DPHome');
      }
    } catch (e) {
      const msg = e.response?.data?.error || 'Failed to upload documents. Please try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
      <Text style={styles.title}>Upload Documents</Text>
      <Text style={styles.subtitle}>We need these to verify your identity</Text>

      {DOC_TYPES.map((doc) => (
        <TouchableOpacity
          key={doc.key}
          style={styles.docCard}
          onPress={() => pickImage(doc.key, doc.useCamera)}
        >
          {images[doc.key] ? (
            <Image source={{ uri: images[doc.key].uri }} style={styles.docThumb} />
          ) : (
            <View style={styles.docPlaceholder}>
              <Ionicons name={doc.useCamera ? 'camera-outline' : 'document-attach-outline'} size={22} color="#6B7280" />
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.docLabel}>{doc.label}</Text>
            <Text style={styles.docStatus}>
              {images[doc.key] ? 'Uploaded — tap to change' : doc.useCamera ? 'Tap to take a photo' : 'Tap to upload'}
            </Text>
          </View>
          {images[doc.key] && <Ionicons name="checkmark-circle" size={22} color="#16a34a" />}
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.primaryBtn, (loading || !allRequiredPicked) && styles.btnDisabled]}
        onPress={handleSubmit}
        disabled={loading || !allRequiredPicked}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryBtnText}>Submit for Verification</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  inner: { padding: 24, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4, marginTop: 20 },
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 24 },
  docCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 12, marginBottom: 12,
  },
  docThumb: { width: 48, height: 48, borderRadius: 8 },
  docPlaceholder: {
    width: 48, height: 48, borderRadius: 8, backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
  },
  docLabel: { fontSize: 14, fontWeight: '600', color: '#111827' },
  docStatus: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  primaryBtn: {
    backgroundColor: '#1669ef', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 20,
  },
  btnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});