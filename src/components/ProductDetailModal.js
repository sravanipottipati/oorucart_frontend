import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../api/client';
import { useCart } from '../context/CartContext';
const TEAL = '#1669ef';
export default function ProductDetailModal({ product, visible, onClose, navigation }) {
  const [moreProducts, setMoreProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { carts, addToCart, removeFromCart } = useCart();
  const allItems = Object.values(carts).reduce((acc, sc) => ({ ...acc, ...sc.items }), {});
  const qty = product ? (allItems[product.id] || 0) : 0;
  const shopData = product ? { id: product.vendor_id || product.shop_id, shop_name: product.shop_name } : null;
  useEffect(() => { if (visible && product) fetchMore(); }, [visible, product]);
  const fetchMore = async () => {
    setLoading(true);
    try {
      const vid = product.vendor_id || product.shop_id;
      const res = await client.get(`/vendors/${vid}/products/`);
      const all = Array.isArray(res.data) ? res.data : res.data.products || [];
      setMoreProducts(all.filter(p => p.id !== product.id).slice(0, 6));
    } catch (e) { console.log(e.message); } finally { setLoading(false); }
  };
  const getImg = (p) => p && (p.image_url || (p.image ? (p.image.startsWith('http') ? p.image : 'https://res.cloudinary.com/dxavm870k/image/upload/v1/' + p.image) : null));
  if (!product) return null;
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.imgBox}>
            {getImg(product) ? <Image source={{ uri: getImg(product) }} style={styles.img} resizeMode="contain" /> : <Ionicons name="cube-outline" size={60} color="#9CA3AF" />}
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.productName}>{product.name}</Text>
            {product.description ? <Text style={styles.productDesc}>{product.description}</Text> : null}
            <View style={styles.priceRow}>
              <Text style={styles.price}>Rs.{parseFloat(product.price).toFixed(0)}</Text>
              <View style={styles.shopTag}>
                <Ionicons name="storefront-outline" size={12} color={TEAL} />
                <Text style={styles.shopTagText}>{product.shop_name}</Text>
              </View>
            </View>
          </View>
          <View style={styles.cartSection}>
            {qty === 0 ? (
              <TouchableOpacity style={styles.addBtn} onPress={() => addToCart({ id: product.id, name: product.name, price: product.price, image: getImg(product) }, shopData)}>
                <Ionicons name="cart-outline" size={20} color="#fff" />
                <Text style={styles.addBtnText}>Add to Cart</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.qtyRow}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => removeFromCart({ id: product.id }, shopData && shopData.id)}><Text style={styles.qtyBtnText}>-</Text></TouchableOpacity>
                <Text style={styles.qtyNum}>{qty}</Text>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => addToCart({ id: product.id, name: product.name, price: product.price, image: getImg(product) }, shopData)}><Text style={styles.qtyBtnText}>+</Text></TouchableOpacity>
              </View>
            )}
          </View>
          <View style={styles.divider} />
          <View style={styles.moreSection}>
            <View style={styles.moreHeader}>
              <Text style={styles.moreTitle}>More from {product.shop_name}</Text>
              <TouchableOpacity onPress={() => { onClose(); navigation.navigate('ShopDetail', { vendorId: product.vendor_id || product.shop_id, shopName: product.shop_name }); }}>
                <Text style={styles.viewShopText}>View Shop</Text>
              </TouchableOpacity>
            </View>
            {loading ? <ActivityIndicator color={TEAL} style={{ marginTop: 16 }} /> : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                {moreProducts.map(p => {
                  const pQty = allItems[p.id] || 0;
                  return (
                    <View key={p.id} style={styles.moreCard}>
                      <View style={styles.moreImgBox}>
                        {getImg(p) ? <Image source={{ uri: getImg(p) }} style={styles.moreImg} resizeMode="contain" /> : <Text style={{ fontSize: 28 }}>🛍</Text>}
                      </View>
                      <Text style={styles.moreName} numberOfLines={2}>{p.name}</Text>
                      <Text style={styles.morePrice}>Rs.{parseFloat(p.price).toFixed(0)}</Text>
                      {pQty === 0 ? (
                        <TouchableOpacity style={styles.moreAddBtn} onPress={() => addToCart({ id: p.id, name: p.name, price: p.price, image: getImg(p) }, shopData)}>
                          <Text style={styles.moreAddBtnText}>ADD</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.moreQtyControl}>
                          <TouchableOpacity onPress={() => removeFromCart({ id: p.id }, shopData && shopData.id)}><Text style={styles.moreQtyBtn}>-</Text></TouchableOpacity>
                          <Text style={styles.moreQtyNum}>{pQty}</Text>
                          <TouchableOpacity onPress={() => addToCart({ id: p.id, name: p.name, price: p.price, image: getImg(p) }, shopData)}><Text style={styles.moreQtyBtn}>+</Text></TouchableOpacity>
                        </View>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </View>
          <TouchableOpacity style={styles.viewShopBtn} onPress={() => { onClose(); navigation.navigate('ShopDetail', { vendorId: product.vendor_id || product.shop_id, shopName: product.shop_name }); }}>
            <Ionicons name="storefront-outline" size={18} color={TEAL} />
            <Text style={styles.viewShopBtnText}>View All Products from {product.shop_name}</Text>
            <Ionicons name="chevron-forward" size={16} color={TEAL} />
          </TouchableOpacity>
          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)' },
  sheet: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '90%', paddingBottom: 20 },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginVertical: 12 },
  imgBox: { height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F8F9FA', marginHorizontal: 16, borderRadius: 16, marginBottom: 16 },
  img: { width: 160, height: 160 },
  infoBox: { paddingHorizontal: 16, marginBottom: 16 },
  productName: { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 6 },
  productDesc: { fontSize: 13, color: '#888', lineHeight: 20, marginBottom: 10 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: 22, fontWeight: '900', color: '#111' },
  shopTag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#eff6ff', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  shopTagText: { fontSize: 12, color: TEAL, fontWeight: '600' },
  cartSection: { paddingHorizontal: 16, marginBottom: 16 },
  addBtn: { backgroundColor: TEAL, borderRadius: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  addBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: TEAL, borderRadius: 14, overflow: 'hidden' },
  qtyBtn: { paddingHorizontal: 28, paddingVertical: 14, backgroundColor: '#fff' },
  qtyBtnText: { fontSize: 22, fontWeight: 'bold', color: TEAL },
  qtyNum: { fontSize: 18, fontWeight: '900', color: '#111', minWidth: 50, textAlign: 'center' },
  divider: { height: 8, backgroundColor: '#F3F4F6', marginBottom: 16 },
  moreSection: { paddingHorizontal: 16, marginBottom: 16 },
  moreHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  moreTitle: { fontSize: 15, fontWeight: '800', color: '#111' },
  viewShopText: { fontSize: 13, color: TEAL, fontWeight: '600' },
  moreCard: { width: 120, backgroundColor: '#F8F9FA', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' },
  moreImgBox: { width: 70, height: 70, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  moreImg: { width: 65, height: 65 },
  moreName: { fontSize: 11, fontWeight: '600', color: '#111', textAlign: 'center', marginBottom: 4, lineHeight: 15 },
  morePrice: { fontSize: 13, fontWeight: '800', color: '#111', marginBottom: 8 },
  moreAddBtn: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: TEAL, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 5 },
  moreAddBtnText: { color: TEAL, fontSize: 12, fontWeight: '800' },
  moreQtyControl: { flexDirection: 'row', alignItems: 'center', backgroundColor: TEAL, borderRadius: 8, overflow: 'hidden' },
  moreQtyBtn: { color: '#fff', fontSize: 16, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4 },
  moreQtyNum: { color: '#fff', fontSize: 13, fontWeight: '800', minWidth: 20, textAlign: 'center' },
  viewShopBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, padding: 14, backgroundColor: '#eff6ff', borderRadius: 14, borderWidth: 1, borderColor: '#bfdbfe' },
  viewShopBtnText: { color: TEAL, fontSize: 14, fontWeight: '700', flex: 1, textAlign: 'center' },
});
