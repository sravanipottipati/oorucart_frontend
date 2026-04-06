import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, ActivityIndicator, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../../api/client';

const CATEGORIES = [
  { key: 'restaurant',  label: '🍽 Restaurant'  },
  { key: 'supermarket', label: '🏪 Supermarket' },
  { key: 'fast_food',   label: '🍔 Fast Food'   },
  { key: 'chinese',     label: '🥡 Chinese'     },
  { key: 'bakery',      label: '🥐 Bakery'      },
  { key: 'vegetables',  label: '🥬 Vegetables'  },
  { key: 'fruits',      label: '🍎 Fruits'      },
  { key: 'dairy',       label: '🥛 Dairy'       },
  { key: 'grocery',     label: '🛒 Grocery'     },
  { key: 'snacks',      label: '🍿 Snacks'      },
  { key: 'beverages',   label: '🧃 Beverages'   },
  { key: 'other',       label: '📦 Other'       },
];

export default function VendorAddProductScreen({ navigation, route }) {
  const { onGoBack } = route.params || {};

  const [name, setName]         = useState('');
  const [price, setPrice]       = useState('');
  const [description, setDesc]  = useState('');
  const [category, setCategory] = useState('other');
  const [image, setImage]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [gst, setGst]               = useState('0');
  const [mrp, setMrp]               = useState('');

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
        if (status !== 'granted') { Alert.alert('Permission needed', 'Camera permission required'); return; }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Permission needed', 'Gallery permission required'); return; }
      }
      const result = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaType.IMAGE, allowsEditing: true, aspect: [1, 1], quality: 0.7 });
      if (!result.canceled) setImage(result.assets[0]);
    } catch (err) {
      Alert.alert('Error', 'Could not pick image');
    }
  };

  const handleAdd = async () => {
    if (!name.trim())  { Alert.alert('Error', 'Please enter product name'); return; }
    if (!price.trim()) { Alert.alert('Error', 'Please enter price'); return; }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (image) {
        const formData = new FormData();
        formData.append('name',         name.trim());
        formData.append('price',        parseFloat(price));
        formData.append('description',  description.trim());
        formData.append('category',     category);
        formData.append('is_available', 'true');
        formData.append('gst_percentage', parseFloat(gst) || 0);
        if (mrp) formData.append('mrp', parseFloat(mrp));
        formData.append('image', { uri: image.uri, name: 'product_image.jpg', type: 'image/jpeg' });
        await client.post('/vendors/products/add/', formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await client.post('/vendors/products/add/', {
          name: name.trim(), price: parseFloat(price),
          description: description.trim(), category, is_available: true, gst_percentage: parseFloat(gst) || 0, mrp: mrp ? parseFloat(mrp) : null,
        }, { headers: { Authorization: `Bearer ${token}` } });
      }
      Alert.alert('✅ Product Added!', `"${name}" has been added successfully!`, [
        { text: 'OK', onPress: () => { if (onGoBack) onGoBack(); navigation.goBack(); } },
      ]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  const selectedCat = CATEGORIES.find(c => c.key === category);

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Product</Text>
        <TouchableOpacity style={styles.bellBtn} onPress={() => navigation.navigate('VendorNotifications')}>
          <Ionicons name="notifications-outline" size={22} color="#444" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.formCard}>

          {/* ── Product Image ── */}
          <Text style={styles.fieldLabel}>
            Product Image <Text style={styles.optional}>(Optional)</Text>
          </Text>
          <TouchableOpacity style={styles.imagePicker} onPress={handlePickImage}>
            {image ? (
              <View style={styles.imagePreviewWrapper}>
                <Image source={{ uri: image.uri }} style={styles.imagePreview} />
                <View style={styles.imageEditBadge}>
                  <Ionicons name="pencil" size={12} color="#fff" />
                  <Text style={styles.imageEditBadgeText}>Change</Text>
                </View>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <View style={styles.imageIconBox}>
                  <Ionicons name="camera-outline" size={32} color="#1669ef" />
                </View>
                <Text style={styles.imagePlaceholderText}>Tap to add photo</Text>
                <Text style={styles.imagePlaceholderSub}>JPG, PNG up to 5MB</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* ── Product Name ── */}
          <Text style={styles.fieldLabel}>Product Name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Fresh Tomatoes"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
          />

          {/* ── Price ── */}
          <Text style={styles.fieldLabel}>Price (₹)</Text>
          <View style={styles.priceInputRow}>
            <View style={styles.pricePrefix}>
              <Text style={styles.pricePrefixText}>₹</Text>
            </View>
            <TextInput
              style={styles.priceInput}
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>

          {/* ── MRP ── */}
          <Text style={styles.fieldLabel}>MRP (Original Price) <Text style={styles.optional}>(optional)</Text></Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 50"
            placeholderTextColor="#9CA3AF"
            value={mrp}
            onChangeText={setMrp}
            keyboardType="numeric"
          />
          {mrp && price && parseFloat(mrp) > parseFloat(price) && (
            <View style={styles.discountInfo}>
              <Ionicons name="pricetag-outline" size={14} color="#16A34A" />
              <Text style={styles.discountInfoText}>
                {Math.round(((parseFloat(mrp) - parseFloat(price)) / parseFloat(mrp)) * 100)}% OFF — Buyer saves ₹{(parseFloat(mrp) - parseFloat(price)).toFixed(0)}
              </Text>
            </View>
          )}

          {/* ── GST ── */}
          <Text style={styles.fieldLabel}>GST %  <Text style={styles.optional}>(0 if not applicable)</Text></Text>
          <View style={styles.gstRow}>
            {['0', '5', '12', '18', '28'].map(g => (
              <TouchableOpacity
                key={g}
                style={[styles.gstChip, gst === g && styles.gstChipActive]}
                onPress={() => setGst(g)}
              >
                <Text style={[styles.gstChipText, gst === g && styles.gstChipTextActive]}>{g}%</Text>
              </TouchableOpacity>
            ))}
          </View>
          {parseFloat(gst) > 0 && (
            <View style={styles.gstInfo}>
              <Ionicons name="information-circle-outline" size={14} color="#888" />
              <Text style={styles.gstInfoText}>
                GST amount: ₹{((parseFloat(price) || 0) * parseFloat(gst) / 100).toFixed(2)} · Total: ₹{((parseFloat(price) || 0) * (1 + parseFloat(gst) / 100)).toFixed(2)}
              </Text>
            </View>
          )}

          {/* ── Category ── */}
          <Text style={styles.fieldLabel}>Category</Text>

          {/* Category grid */}
          <View style={styles.categoryGrid}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat.key}
                style={[styles.categoryChip, category === cat.key && styles.categoryChipActive]}
                onPress={() => setCategory(cat.key)}
              >
                <Text style={[styles.categoryChipText, category === cat.key && styles.categoryChipTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── Description ── */}
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
        <TouchableOpacity style={styles.addBtn} onPress={handleAdd} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name={image ? 'camera' : 'add-circle-outline'} size={20} color="#fff" />
              <Text style={styles.addBtnText}>
                {image ? 'Add Product with Image' : 'Add to Products'}
              </Text>
            </>
          )}
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
  headerTitle: { fontSize: 17, fontWeight: 'bold', color: '#111' },
  bellBtn:     { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },

  formCard: {
    backgroundColor: '#fff', borderRadius: 16,
    margin: 16, padding: 16,
  },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 16 },
  optional:   { fontSize: 12, color: '#9CA3AF', fontWeight: 'normal' },

  // Image picker
  imagePicker: {
    borderWidth: 1.5, borderColor: '#E5E7EB',
    borderRadius: 12, borderStyle: 'dashed', overflow: 'hidden',
  },
  imagePlaceholder: {
    height: 140, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F9FAFB', gap: 8,
  },
  imageIconBox: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center',
    marginBottom: 4,
  },
  imagePlaceholderText: { fontSize: 14, color: '#555', fontWeight: '600' },
  imagePlaceholderSub:  { fontSize: 12, color: '#9CA3AF' },
  imagePreviewWrapper:  { position: 'relative' },
  imagePreview: { width: '100%', height: 180, resizeMode: 'cover' },
  imageEditBadge: {
    position: 'absolute', bottom: 10, right: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  imageEditBadgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  // Inputs
  input: {
    borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 12, fontSize: 14, color: '#111', backgroundColor: '#F9FAFB',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },

  priceInputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#F9FAFB', overflow: 'hidden' },
  pricePrefix: { backgroundColor: '#eff6ff', paddingHorizontal: 14, paddingVertical: 12, borderRightWidth: 1, borderRightColor: '#E5E7EB' },
  pricePrefixText: { fontSize: 16, fontWeight: '700', color: '#1669ef' },
  priceInput: { flex: 1, padding: 12, fontSize: 14, color: '#111' },

  // Selected category
  selectedCatBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#eff6ff', borderRadius: 10, padding: 12,
    marginBottom: 12, borderWidth: 1, borderColor: '#bfdbfe',
  },
  selectedCatText: { flex: 1, fontSize: 13, color: '#1669ef', fontWeight: '600' },
  changeCatText:   { fontSize: 13, color: '#1669ef', fontWeight: '700' },

  // Category groups
  catGroup:      { marginBottom: 16 },
  catGroupTitle: { fontSize: 13, fontWeight: '700', color: '#888', marginBottom: 8 },
  discountInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#f0fdf4', padding: 10, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#bbf7d0' },
  discountInfoText: { fontSize: 12, color: '#16A34A', fontWeight: '600', flex: 1 },
  gstRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  gstChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  gstChipActive: { backgroundColor: '#eff6ff', borderColor: '#1669ef' },
  gstChipText: { fontSize: 13, color: '#555', fontWeight: '600' },
  gstChipTextActive: { color: '#1669ef', fontWeight: '700' },
  gstInfo: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#F8F9FA', padding: 10, borderRadius: 10, marginBottom: 8 },
  gstInfoText: { fontSize: 12, color: '#888', flex: 1 },
  categoryGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB',
  },
  categoryChipActive:     { backgroundColor: '#eff6ff', borderColor: '#1669ef' },
  categoryChipText:       { fontSize: 12, color: '#555' },
  categoryChipTextActive: { color: '#1669ef', fontWeight: '600' },

  footer: {
    padding: 16, paddingBottom: 30, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: '#F0F0F0',
  },
  addBtn: {
    backgroundColor: '#1669ef', borderRadius: 14,
    padding: 16, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 8,
    shadowColor: '#1669ef', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
  },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});