import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, ActivityIndicator, Alert, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../../api/client';

const CATEGORIES = [
  { key: 'vegetables', label: '🥬 Vegetables' },
  { key: 'fruits',     label: '🍎 Fruits'     },
  { key: 'dairy',      label: '🥛 Dairy'      },
  { key: 'bakery',     label: '🥐 Bakery'     },
  { key: 'snacks',     label: '🍿 Snacks'     },
  { key: 'beverages',  label: '🥤 Beverages'  },
  { key: 'food',       label: '🍱 Food'       },
  { key: 'grocery',    label: '🛒 Grocery'    },
  { key: 'other',      label: '📦 Other'      },
];

export default function VendorAddProductScreen({ navigation, route }) {
  const { onGoBack } = route.params || {};

  const [name, setName]             = useState('');
  const [price, setPrice]           = useState('');
  const [description, setDesc]      = useState('');
  const [category, setCategory]     = useState('other');
  const [image, setImage]           = useState(null);
  const [loading, setLoading]       = useState(false);
  const [imgLoading, setImgLoading] = useState(false);

  // ── Pick Image ─────────────────────────────────────────────────────────────
  const handlePickImage = async () => {
    Alert.alert(
      'Product Image',
      'Choose image source',
      [
        { text: 'Camera',  onPress: () => pickImage('camera')  },
        { text: 'Gallery', onPress: () => pickImage('gallery') },
        image ? { text: 'Remove', onPress: () => setImage(null), style: 'destructive' } : null,
        { text: 'Cancel',  style: 'cancel' },
      ].filter(Boolean)
    );
  };

  const pickImage = async (source) => {
    try {
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Camera permission required');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission needed', 'Gallery permission required');
          return;
        }
      }

      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true, aspect: [1, 1], quality: 0.7,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [1, 1], quality: 0.7,
          });

      if (!result.canceled) {
        setImage(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not pick image');
    }
  };

  // ── Add Product ────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    if (!name.trim())  { Alert.alert('Error', 'Please enter product name'); return; }
    if (!price.trim()) { Alert.alert('Error', 'Please enter price'); return; }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');

      // Use FormData if image is attached
      if (image) {
        const formData = new FormData();
        formData.append('name',         name.trim());
        formData.append('price',        parseFloat(price));
        formData.append('description',  description.trim());
        formData.append('category',     category);
        formData.append('is_available', 'true');
        formData.append('image', {
          uri:  image.uri,
          name: 'product_image.jpg',
          type: 'image/jpeg',
        });

        await client.post('/vendors/products/add/', formData, {
          headers: {
            Authorization:  `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        // No image — regular JSON post
        await client.post('/vendors/products/add/', {
          name:         name.trim(),
          price:        parseFloat(price),
          description:  description.trim(),
          category,
          is_available: true,
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      Alert.alert('✅ Success', 'Product added successfully!', [
        {
          text: 'OK', onPress: () => {
            if (onGoBack) onGoBack();
            navigation.goBack();
          },
        },
      ]);
    } catch (e) {
      const msg = e.response?.data?.error || 'Failed to add product';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Product</Text>
        <TouchableOpacity
          style={styles.bellBtn}
          onPress={() => navigation.navigate('VendorNotifications')}
        >
          <Text style={styles.bellIcon}>🔔</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>

          {/* ── Product Image ─────────────────────────────────────────────── */}
          <Text style={styles.fieldLabel}>Product Image <Text style={styles.optional}>(Optional)</Text></Text>
          <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
            {image ? (
              <View style={styles.imagePreviewWrapper}>
                <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                <View style={styles.imageEditBadge}>
                  <Text style={styles.imageEditBadgeText}>✏️ Change</Text>
                </View>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderIcon}>📷</Text>
                <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
                <Text style={styles.imagePlaceholderSub}>JPG, PNG up to 5MB</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* ── Product Name ──────────────────────────────────────────────── */}
          <Text style={styles.fieldLabel}>Product Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Fresh Tomatoes"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
          />

          {/* ── Price ─────────────────────────────────────────────────────── */}
          <Text style={styles.fieldLabel}>Price (₹)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 25"
            placeholderTextColor="#9CA3AF"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          {/* ── Category ──────────────────────────────────────────────────── */}
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.key}
                style={[
                  styles.categoryChip,
                  category === cat.key && styles.categoryChipActive
                ]}
                onPress={() => setCategory(cat.key)}
              >
                <Text style={[
                  styles.categoryChipText,
                  category === cat.key && styles.categoryChipTextActive
                ]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Description ───────────────────────────────────────────────── */}
          <Text style={styles.fieldLabel}>
            Description <Text style={styles.optional}>(Optional)</Text>
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="e.g. Fresh from farm, organic"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDesc}
            multiline
            numberOfLines={3}
          />

        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={handleAdd}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.addBtnText}>
                {image ? '📸 Add Product with Image' : 'Add to Products'}
              </Text>
          }
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  backBtn:     { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  backText:    { fontSize: 24, color: '#111' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#111' },
  bellBtn:     { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  bellIcon:    { fontSize: 22 },

  formCard: {
    backgroundColor: '#fff', borderRadius: 16,
    margin: 16, padding: 16,
  },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 14 },
  optional:   { fontSize: 12, color: '#9CA3AF', fontWeight: 'normal' },

  // ── Image Picker ────────────────────────────────────────────────────────
  imagePicker: {
    borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12,
    borderStyle: 'dashed', overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 140, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F9FAFB', gap: 6,
  },
  imagePlaceholderIcon: { fontSize: 36 },
  imagePlaceholderText: { fontSize: 14, color: '#555', fontWeight: '600' },
  imagePlaceholderSub:  { fontSize: 12, color: '#9CA3AF' },

  imagePreviewWrapper: { position: 'relative' },
  imagePreview: { width: '100%', height: 180, resizeMode: 'cover' },
  imageEditBadge: {
    position: 'absolute', bottom: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  imageEditBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 12, fontSize: 14, color: '#111', backgroundColor: '#F9FAFB',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },

  // ── Category Grid ───────────────────────────────────────────────────────
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB',
  },
  categoryChipActive:     { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  categoryChipText:       { fontSize: 13, color: '#555' },
  categoryChipTextActive: { color: '#2563EB', fontWeight: '600' },

  footer: {
    padding: 16, paddingBottom: 30, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  addBtn: {
    backgroundColor: '#2563EB', borderRadius: 14,
    padding: 16, alignItems: 'center',
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});