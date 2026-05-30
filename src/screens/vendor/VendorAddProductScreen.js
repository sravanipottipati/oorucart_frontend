import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform, TextInput, ActivityIndicator, Alert, Image, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../../api/client';

// Product category mapped from shop category
const SHOP_TO_PRODUCT_CATEGORY = {
  'restaurant':  { key: 'food_meals',       label: 'Food & Meals',       icon: 'restaurant-outline',  color: '#dc2626' },
  'supermarket': { key: 'grocery_staples',  label: 'Grocery & Staples',  icon: 'storefront-outline',  color: '#7c3aed' },
  'bakery':      { key: 'bakery_sweets',    label: 'Bakery & Sweets',    icon: 'cafe-outline',        color: '#d97706' },
  'veg_fruits':  { key: 'fresh_produce',    label: 'Fresh Produce',      icon: 'leaf-outline',        color: '#16a34a' },
};
const CATEGORIES = [
  { key: 'food_meals',      label: 'Food & Meals',      icon: 'restaurant-outline', color: '#dc2626' },
  { key: 'grocery_staples', label: 'Grocery & Staples', icon: 'storefront-outline', color: '#7c3aed' },
  { key: 'bakery_sweets',   label: 'Bakery & Sweets',   icon: 'cafe-outline',       color: '#d97706' },
  { key: 'fresh_produce',   label: 'Fresh Produce',     icon: 'leaf-outline',       color: '#16a34a' },
];

const SUBCATEGORIES = {
  food_meals:      ['Breakfast', 'Lunch / Dinner', 'Biryani & Rice', 'Curries & Gravies', 'Snacks & Starters', 'Desserts', 'Beverages', 'Combos & Meals'],
  grocery_staples: ['Rice, Dal & Grains', 'Atta & Flours', 'Oils & Ghee', 'Spices & Masala', 'Packaged & Ready-to-eat', 'Dairy & Eggs', 'Beverages & Drinks', 'Cleaning & Household', 'Personal Care', 'Baby & Kids'],
  bakery_sweets:   ['Breads & Buns', 'Cakes & Pastries', 'Cookies & Biscuits', 'Indian Sweets', 'Savory Snacks', 'Festive Specials'],
  fresh_produce:   ['Leafy Vegetables', 'Root Vegetables', 'Gourds & Beans', 'Seasonal Fruits', 'Tropical Fruits', 'Herbs & Greens', 'Cut & Ready'],
};

const DELIVERY_TIMES = ['15 mins','30 mins','45 mins','60 mins','90 mins','120 mins'];

export default function VendorAddProductScreen({ navigation, route }) {
  const { onGoBack } = route.params || {};
  // Auto-set product category based on shop category
  const getDefaultCategory = async () => {
    try {
      const res = await client.get('/vendors/myshop/');
      const shopCat = res.data.category;
      const mapped = SHOP_TO_PRODUCT_CATEGORY[shopCat];
      if (mapped) setCategory(mapped.key);
    } catch (e) {}
  };

  const [name, setName]             = useState('');
  const [hsnCode, setHsnCode]       = useState('');
  const [price, setPrice]           = useState('');
  const [mrp, setMrp]               = useState('');
  const [description, setDesc]      = useState('');
  const [category, setCategory]     = useState('');
  const [subcategory, setSubcat]    = useState('');
  const [gst, setGst]               = useState('0');
  const [deliveryTime, setDelivery] = useState('30 mins');
  const [isReturnable, setReturnable] = useState(true);
  const [isCod, setCod]             = useState(true);
  const [image, setImage]           = useState(null);
  const [loading, setLoading]       = useState(false);
  const [variants, setVariants]     = useState([]);
  const [isVeg, setIsVeg]           = useState(true);
  const [showCatPicker, setShowCatPicker]   = useState(false);
  const [showSubPicker, setShowSubPicker]   = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const addVariant = () => setVariants([...variants, { name: '', mrp: '', price: '', available: true }]);
  const updateVariant = (i, field, val) => { const u = [...variants]; u[i] = { ...u[i], [field]: val }; setVariants(u); };
  const removeVariant = (i) => setVariants(variants.filter((_, idx) => idx !== i));

  const handlePickImage = async () => {
    Alert.alert('Product Image', 'Choose image source', [
      { text: 'Camera',  onPress: () => pickImage('camera')  },
      { text: 'Gallery', onPress: () => pickImage('gallery') },
      image ? { text: 'Remove', onPress: () => setImage(null), style: 'destructive' } : null,
      { text: 'Cancel',  style: 'cancel' },
    ].filter(Boolean));
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
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1,1], quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1,1], quality: 0.7 });
      if (!result.canceled) setImage(result.assets[0]);
    } catch (err) { Alert.alert('Error', 'Could not pick image'); }
  };

  const handleSave = async (saveAsDraft = false) => {
    if (!name.trim())  { Alert.alert('Error', 'Please enter product name'); return; }
    if (!price.trim() && variants.length === 0) { Alert.alert('Error', 'Please enter price or add variants'); return; }
    if (!category)     { Alert.alert('Error', 'Please select category'); return; }
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      const deliveryMins = parseInt(deliveryTime) || 30;
      const productData = {
        name: name.trim(), price: variants.length > 0 ? 0 : parseFloat(price),
        is_veg: isVeg,
        description: description.trim(), category,
        subcategory: subcategory || '', hsn_code: hsnCode.trim(),
        mrp: mrp ? parseFloat(mrp) : null,
        gst_percentage: parseFloat(gst) || 0,
        is_available: true, is_returnable: isReturnable,
        is_cod: isCod, is_draft: saveAsDraft, delivery_time: deliveryMins,
      };
      let productRes;
      if (image) {
        const formData = new FormData();
        Object.entries(productData).forEach(([k, v]) => { if (v !== null && v !== undefined) formData.append(k, String(v)); });
        formData.append('image', { uri: image.uri, name: 'product_image.jpg', type: 'image/jpeg' });
        productRes = await client.post('/vendors/products/add/', formData, {
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
      } else {
        productRes = await client.post('/vendors/products/add/', productData, { headers: { Authorization: `Bearer ${token}` } });
      }
      if (variants.length > 0 && productRes.data?.product?.id) {
        const productId = productRes.data.product.id;
        for (const v of variants) {
          if (v.name.trim() && v.price.trim()) {
            await client.post(`/vendors/products/${productId}/variants/`, {
              name: v.name.trim(), price: parseFloat(v.price),
              mrp: v.mrp ? parseFloat(v.mrp) : null,
              stock_quantity: v.available ? 100 : 0, is_available: v.available,
            }, { headers: { Authorization: `Bearer ${token}` } });
          }
        }
      }
      const msg = saveAsDraft ? 'saved as draft' : 'added successfully';
      Alert.alert(saveAsDraft ? '📝 Saved as Draft' : '✅ Product Added!', `"${name}" has been ${msg}!`, [
        { text: 'OK', onPress: () => { if (onGoBack) onGoBack(); navigation.goBack(); } },
      ]);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Failed to save product');
    } finally { setLoading(false); }
  };

  useEffect(() => { getDefaultCategory(); }, []);

  const selectedCat = CATEGORIES.find(c => c.key === category);
  const subcats = SUBCATEGORIES[category] || [];

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex:1}}>
    <View style={styles.container}>
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

          {/* Image */}
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
                <Text style={styles.imagePlaceholderText}>Tap to add photos</Text>
                <Text style={styles.imagePlaceholderSub}>JPG, PNG up to 5MB</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Name + HSN */}
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Product Name <Text style={styles.required}>*</Text></Text>
              <TextInput style={styles.input} placeholder="e.g. Fresh Tomatoes" placeholderTextColor="#9CA3AF" value={name} onChangeText={setName} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>HSN Code <Text style={styles.optional}>(optional)</Text></Text>
              <TextInput style={styles.input} placeholder="e.g. 0702" placeholderTextColor="#9CA3AF" value={hsnCode} onChangeText={setHsnCode} keyboardType="numeric" />
            </View>
          </View>

          {/* Description */}
          <Text style={styles.fieldLabel}>Short Description</Text>
          <TextInput style={styles.input} placeholder="e.g. Fresh and juicy tomatoes" placeholderTextColor="#9CA3AF" value={description} onChangeText={setDesc} />

          {/* Category + Subcategory */}
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Category <Text style={styles.required}>*</Text></Text>
              <View style={[styles.dropdown, { backgroundColor: '#F0FDF4' }]}>
                <Text style={[styles.dropdownText, !category && { color: '#9CA3AF' }]}>
                  {selectedCat ? selectedCat.label : 'Select category'}
                </Text>
                <Ionicons name="chevron-down" size={16} color="#888" />
              </View>
              {showCatPicker && (
                <View style={styles.pickerDropdown}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity key={cat.key} style={[styles.pickerItem, { flexDirection: 'row', alignItems: 'center' }, category === cat.key && styles.pickerItemActive]} onPress={() => { setCategory(cat.key); setSubcat(''); setShowCatPicker(false); }}>
                      <Ionicons name={cat.icon} size={18} color={category === cat.key ? '#1669ef' : cat.color} style={{ marginRight: 8 }} />
                      <Text style={[styles.pickerItemText, category === cat.key && { color: '#1669ef', fontWeight: '700' }]}>{cat.label}</Text>
                      {category === cat.key && <Ionicons name="checkmark" size={16} color="#1669ef" />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Subcategory <Text style={styles.optional}>(optional)</Text></Text>
              <TouchableOpacity style={[styles.dropdown, !category && { opacity: 0.5 }]} onPress={() => { if (category) { setShowSubPicker(!showSubPicker); setShowCatPicker(false); } }} disabled={!category}>
                <Text style={[styles.dropdownText, !subcategory && { color: '#9CA3AF' }]}>{subcategory || 'Select'}</Text>
                <Ionicons name="chevron-down" size={16} color="#888" />
              </TouchableOpacity>
              {showSubPicker && subcats.length > 0 && (
                <View style={styles.pickerDropdown}>
                  {subcats.map(sub => (
                    <TouchableOpacity key={sub} style={[styles.pickerItem, subcategory === sub && styles.pickerItemActive]} onPress={() => { setSubcat(sub); setShowSubPicker(false); }}>
                      <Text style={[styles.pickerItemText, subcategory === sub && { color: '#1669ef', fontWeight: '700' }]}>{sub}</Text>
                      {subcategory === sub && <Ionicons name="checkmark" size={16} color="#1669ef" />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {category && (
            <View style={styles.catBreadcrumb}>
              <Text style={styles.catBreadcrumbText}>
                Category: <Text style={styles.catBreadcrumbValue}>{selectedCat?.label}</Text>
                {subcategory ? <Text>  ›  Subcategory: <Text style={styles.catBreadcrumbValue}>{subcategory}</Text></Text> : null}
              </Text>
              <TouchableOpacity onPress={() => { setCategory(''); setSubcat(''); }}>
                <Ionicons name="close" size={16} color="#888" />
              </TouchableOpacity>
            </View>
          )}

          {/* Veg / Non-veg */}
          <Text style={styles.fieldLabel}>Food Type <Text style={styles.required}>*</Text></Text>
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
            <TouchableOpacity
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 10, borderWidth: 2, borderColor: isVeg ? '#16A34A' : '#E5E7EB', backgroundColor: isVeg ? '#F0FDF4' : '#fff', gap: 8 }}
              onPress={() => setIsVeg(true)}>
              <View style={{ width: 16, height: 16, borderRadius: 2, borderWidth: 2, borderColor: '#16A34A', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: 8, height: 8, borderRadius: 1, backgroundColor: '#16A34A' }} />
              </View>
              <Text style={{ fontWeight: '700', color: isVeg ? '#16A34A' : '#888' }}>🟢 Veg</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, borderRadius: 10, borderWidth: 2, borderColor: !isVeg ? '#DC2626' : '#E5E7EB', backgroundColor: !isVeg ? '#FEF2F2' : '#fff', gap: 8 }}
              onPress={() => setIsVeg(false)}>
              <View style={{ width: 16, height: 16, borderRadius: 2, borderWidth: 2, borderColor: '#DC2626', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: 8, height: 8, borderRadius: 1, backgroundColor: '#DC2626' }} />
              </View>
              <Text style={{ fontWeight: '700', color: !isVeg ? '#DC2626' : '#888' }}>🔴 Non-Veg</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.fieldLabel}>Variants <Text style={styles.optional}>(Optional)</Text></Text>
          {variants.length > 0 && (
            <View style={styles.variantTable}>
              <View style={styles.variantHeaderRow}>
                <Text style={[styles.variantHeaderCell, { flex: 2 }]}>Variant</Text>
                <Text style={[styles.variantHeaderCell, { flex: 1.5 }]}>MRP (₹)</Text>
                <Text style={[styles.variantHeaderCell, { flex: 1.8 }]}>Discounted Price (₹)</Text>
                <Text style={[styles.variantHeaderCell, { flex: 1.5 }]}>Status</Text>
                <Text style={[styles.variantHeaderCell, { flex: 0.6 }]}></Text>
              </View>
              {variants.map((v, index) => (
                <View key={index} style={[styles.variantRow, index % 2 === 1 && { backgroundColor: '#F9FAFB' }]}>
                  <TextInput style={[styles.variantInput, { flex: 2 }]} placeholder="e.g. 1kg" placeholderTextColor="#9CA3AF" value={v.name} onChangeText={val => updateVariant(index, 'name', val)} />
                  <TextInput style={[styles.variantInput, { flex: 1.5 }]} placeholder="0" placeholderTextColor="#9CA3AF" value={v.mrp} onChangeText={val => updateVariant(index, 'mrp', val)} keyboardType="numeric" />
                  <TextInput style={[styles.variantInput, { flex: 1.8 }]} placeholder="0" placeholderTextColor="#9CA3AF" value={v.price} onChangeText={val => updateVariant(index, 'price', val)} keyboardType="numeric" />
                  <View style={[{ flex: 1.5, alignItems: 'center', justifyContent: 'center' }]}>
                    <Switch value={v.available} onValueChange={val => updateVariant(index, 'available', val)} trackColor={{ false: '#E5E7EB', true: '#86efac' }} thumbColor={v.available ? '#16A34A' : '#9CA3AF'} style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }} />
                  </View>
                  <TouchableOpacity style={[{ flex: 0.6, alignItems: 'center', justifyContent: 'center' }]} onPress={() => removeVariant(index)}>
                    <Ionicons name="trash-outline" size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          <TouchableOpacity style={styles.addVariantBtn} onPress={addVariant}>
            <Ionicons name="add-circle-outline" size={18} color="#1669ef" />
            <Text style={styles.addVariantBtnText}>Add Variant</Text>
          </TouchableOpacity>

          {/* Delivery Time */}
          <Text style={styles.fieldLabel}>Delivery Time</Text>
          <TouchableOpacity style={styles.dropdown} onPress={() => setShowTimePicker(!showTimePicker)}>
            <Text style={styles.dropdownText}>{deliveryTime}</Text>
            <Ionicons name="chevron-down" size={16} color="#888" />
          </TouchableOpacity>
          {showTimePicker && (
            <View style={styles.pickerDropdown}>
              {DELIVERY_TIMES.map(t => (
                <TouchableOpacity key={t} style={[styles.pickerItem, deliveryTime === t && styles.pickerItemActive]} onPress={() => { setDelivery(t); setShowTimePicker(false); }}>
                  <Text style={[styles.pickerItemText, deliveryTime === t && { color: '#1669ef', fontWeight: '700' }]}>{t}</Text>
                  {deliveryTime === t && <Ionicons name="checkmark" size={16} color="#1669ef" />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* GST */}
          <Text style={styles.fieldLabel}>GST % <Text style={styles.optional}>(0 if not applicable)</Text></Text>
          <View style={styles.gstRow}>
            {['0','5','12','18','28','40'].map(g => (
              <TouchableOpacity key={g} style={[styles.gstChip, gst === g && styles.gstChipActive]} onPress={() => setGst(g)}>
                <Text style={[styles.gstChipText, gst === g && styles.gstChipTextActive]}>{g}%</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Returnable */}
          <View style={styles.toggleRow}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.toggleLabel}>Returnable?</Text>
              <Text style={styles.toggleSub}>Can buyer return this item?</Text>
            </View>
            <Switch value={isReturnable} onValueChange={setReturnable} trackColor={{ false: '#E5E7EB', true: '#86efac' }} thumbColor={isReturnable ? '#16A34A' : '#9CA3AF'} />
          </View>

          {/* COD */}
          <View style={[styles.toggleRow, { borderTopWidth: 1, borderTopColor: '#F5F5F5' }]}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.toggleLabel}>Cash on Delivery</Text>
              <Text style={styles.toggleSub}>COD availability depends on your business settings</Text>
            </View>
            <Switch value={isCod} onValueChange={setCod} trackColor={{ false: '#E5E7EB', true: '#86efac' }} thumbColor={isCod ? '#16A34A' : '#9CA3AF'} />
          </View>

        </View>
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.draftBtn} onPress={() => handleSave(true)} disabled={loading}>
          <Ionicons name="document-outline" size={16} color="#1669ef" />
          <Text style={styles.draftBtnText}>Save as Draft</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.previewBtn} onPress={() => Alert.alert('Preview', 'Coming soon!')} disabled={loading}>
          <Ionicons name="eye-outline" size={16} color="#1669ef" />
          <Text style={styles.previewBtnText}>Preview Product</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} onPress={() => handleSave(false)} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <><Ionicons name="add-circle-outline" size={18} color="#fff" /><Text style={styles.addBtnText}>Add Product</Text></>
          )}
        </TouchableOpacity>
      </View>
    </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#F8F9FA' },
  header:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn:     { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111', flex: 1, textAlign: 'center' },
  bellBtn:     { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  formCard:    { backgroundColor: '#fff', borderRadius: 16, margin: 16, padding: 16 },
  fieldLabel:  { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 8, marginTop: 16 },
  required:    { color: '#EF4444' },
  optional:    { fontSize: 12, color: '#9CA3AF', fontWeight: 'normal' },
  imagePicker:          { borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, borderStyle: 'dashed', overflow: 'hidden', marginBottom: 8 },
  imagePlaceholder:     { height: 120, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB', gap: 6 },
  imageIconBox:         { width: 56, height: 56, borderRadius: 28, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  imagePlaceholderText: { fontSize: 14, color: '#555', fontWeight: '600' },
  imagePlaceholderSub:  { fontSize: 11, color: '#9CA3AF' },
  imagePreviewWrapper:  { position: 'relative' },
  imagePreview:         { width: '100%', height: 160, resizeMode: 'cover' },
  imageEditBadge:       { position: 'absolute', bottom: 10, right: 10, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  imageEditBadgeText:   { color: '#fff', fontSize: 12, fontWeight: '600' },
  twoCol:      { flexDirection: 'row', gap: 12 },
  input:       { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, fontSize: 14, color: '#111', backgroundColor: '#F9FAFB' },
  dropdown:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, backgroundColor: '#F9FAFB' },
  dropdownText:{ fontSize: 14, color: '#111', flex: 1 },
  pickerDropdown:   { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#fff', marginTop: 4, marginBottom: 8 },
  pickerItem:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  pickerItemActive: { backgroundColor: '#eff6ff' },
  pickerItemText:   { fontSize: 14, color: '#111' },
  catBreadcrumb:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 10, padding: 10, marginTop: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  catBreadcrumbText:  { fontSize: 12, color: '#555', flex: 1 },
  catBreadcrumbValue: { color: '#1669ef', fontWeight: '600' },
  variantTable:      { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, overflow: 'hidden', marginBottom: 8 },
  variantHeaderRow:  { flexDirection: 'row', backgroundColor: '#F3F4F6', paddingVertical: 10, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  variantHeaderCell: { fontSize: 11, fontWeight: '700', color: '#555', textAlign: 'center' },
  variantRow:        { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  variantInput:      { fontSize: 13, color: '#111', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, backgroundColor: '#fff', marginHorizontal: 3, textAlign: 'center' },
  addVariantBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#eff6ff', borderRadius: 12, paddingVertical: 12, marginTop: 4 },
  addVariantBtnText: { fontSize: 14, color: '#1669ef', fontWeight: '600' },
  gstRow:            { flexDirection: 'row', gap: 8, marginBottom: 8, flexWrap: 'wrap' },
  gstChip:           { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  gstChipActive:     { backgroundColor: '#eff6ff', borderColor: '#1669ef' },
  gstChipText:       { fontSize: 13, color: '#555', fontWeight: '600' },
  gstChipTextActive: { color: '#1669ef', fontWeight: '700' },
  toggleRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14 },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 2 },
  toggleSub:   { fontSize: 12, color: '#888' },
  footer:      { flexDirection: 'row', padding: 16, paddingBottom: 30, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0F0F0', gap: 8 },
  draftBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderWidth: 1.5, borderColor: '#1669ef', borderRadius: 12, paddingVertical: 12 },
  draftBtnText:   { fontSize: 12, color: '#1669ef', fontWeight: '600' },
  previewBtn:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, borderWidth: 1.5, borderColor: '#1669ef', borderRadius: 12, paddingVertical: 12 },
  previewBtnText: { fontSize: 12, color: '#1669ef', fontWeight: '600' },
  addBtn:      { flex: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#1669ef', borderRadius: 12, paddingVertical: 12 },
  addBtnText:  { color: '#fff', fontSize: 13, fontWeight: 'bold' },
});