import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, ActivityIndicator,
} from 'react-native';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function SearchScreen({ navigation }) {
  const [query, setQuery]         = useState('');
  const [results, setResults]     = useState(null);
  const [loading, setLoading]     = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const debounceRef               = useRef(null);
  const { user }                  = useAuth();
  const town                      = user?.town || '';

  const handleSearch = (text) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) { setResults(null); return; }
    debounceRef.current = setTimeout(() => doSearch(text), 400);
  };

  const doSearch = async (q) => {
    setLoading(true);
    try {
      const url = town
        ? `/vendors/search/?q=${q}&town=${town}`
        : `/vendors/search/?q=${q}`;
      const res = await client.get(url);
      setResults(res.data);
    } catch (e) {
      console.log('Search error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const totalResults = (results?.products?.length || 0) + (results?.shops?.length || 0);

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder={town ? `Search in ${town}...` : 'Search products or shops...'}
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={handleSearch}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults(null); }}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Town indicator */}
      {town ? (
        <View style={styles.townBar}>
          <Text style={styles.townBarText}>📍 Showing results in <Text style={styles.townBarBold}>{town}</Text></Text>
        </View>
      ) : null}

      {/* Tabs */}
      {results && (
        <View style={styles.tabsRow}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'products' && styles.tabActive]}
            onPress={() => setActiveTab('products')}
          >
            <Text style={[styles.tabText, activeTab === 'products' && styles.tabTextActive]}>
              Products ({results.products?.length || 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'shops' && styles.tabActive]}
            onPress={() => setActiveTab('shops')}
          >
            <Text style={[styles.tabText, activeTab === 'shops' && styles.tabTextActive]}>
              Shops ({results.shops?.length || 0})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />

      ) : !query ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>Search Shop2me</Text>
          <Text style={styles.emptySubtitle}>
            {town ? `Find products and shops in ${town}` : 'Find products and shops near you'}
          </Text>
          <View style={styles.suggestionsBox}>
            <Text style={styles.suggestionsLabel}>Try searching for</Text>
            {['Tomatoes', 'Bread', 'Rice', 'Vegetables', 'Bakery'].map(s => (
              <TouchableOpacity
                key={s}
                style={styles.suggestionChip}
                onPress={() => handleSearch(s)}
              >
                <Text style={styles.suggestionText}>🔎 {s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      ) : results && totalResults === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>😕</Text>
          <Text style={styles.emptyTitle}>No results for "{query}"</Text>
          <Text style={styles.emptySubtitle}>
            {town ? `No results in ${town}. Try a different search term.` : 'Try a different search term'}
          </Text>
        </View>

      ) : results ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>

          {/* Products Tab */}
          {activeTab === 'products' && (
            <>
              {results.products?.length === 0 ? (
                <View style={styles.tabEmpty}>
                  <Text style={styles.tabEmptyText}>No products found</Text>
                </View>
              ) : (
                results.products.map(product => (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.productCard}
                    onPress={() => navigation.navigate('ShopDetail', { vendorId: product.shop_id })}
                  >
                    <View style={styles.productIconBox}>
                      <Text style={styles.productIcon}>🛍</Text>
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productShop}>🏪 {product.shop_name}</Text>
                      <Text style={styles.productTown}>📍 {product.town}</Text>
                    </View>
                    <View style={styles.productRight}>
                      <Text style={styles.productPrice}>₹{product.price}</Text>
                      <Text style={styles.productArrow}>›</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </>
          )}

          {/* Shops Tab */}
          {activeTab === 'shops' && (
            <>
              {results.shops?.length === 0 ? (
                <View style={styles.tabEmpty}>
                  <Text style={styles.tabEmptyText}>No shops found</Text>
                </View>
              ) : (
                results.shops.map(shop => (
                  <TouchableOpacity
                    key={shop.id}
                    style={styles.shopCard}
                    onPress={() => navigation.navigate('ShopDetail', { vendorId: shop.id })}
                  >
                    <View style={styles.shopAvatar}>
                      <Text style={styles.shopAvatarText}>
                        {shop.shop_name?.[0]?.toUpperCase() || 'S'}
                      </Text>
                    </View>
                    <View style={styles.shopInfo}>
                      <Text style={styles.shopName}>{shop.shop_name}</Text>
                      <Text style={styles.shopCategory}>{shop.category}</Text>
                      <Text style={styles.shopTown}>📍 {shop.town}</Text>
                    </View>
                    <View style={styles.shopRight}>
                      <View style={[
                        styles.openBadge,
                        { backgroundColor: shop.is_open ? '#DCFCE7' : '#F3F4F6' }
                      ]}>
                        <Text style={[
                          styles.openText,
                          { color: shop.is_open ? '#16A34A' : '#9CA3AF' }
                        ]}>
                          {shop.is_open ? '● Open' : '● Closed'}
                        </Text>
                      </View>
                      <Text style={styles.shopArrow}>›</Text>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>

      ) : null}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', gap: 10,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 24, color: '#111' },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F3F4F6', borderRadius: 12,
    paddingHorizontal: 12, height: 42, gap: 8,
  },
  searchIcon:  { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: '#111' },
  clearIcon:   { fontSize: 16, color: '#9CA3AF' },

  townBar: {
    backgroundColor: '#EFF6FF', paddingHorizontal: 16,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#DBEAFE',
  },
  townBarText: { fontSize: 12, color: '#2563EB' },
  townBarBold: { fontWeight: 'bold' },

  tabsRow: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    paddingHorizontal: 16, gap: 8, paddingVertical: 10,
  },
  tab:           { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F3F4F6' },
  tabActive:     { backgroundColor: '#2563EB' },
  tabText:       { fontSize: 13, color: '#555', fontWeight: '500' },
  tabTextActive: { color: '#fff', fontWeight: 'bold' },

  emptyState:    { alignItems: 'center', marginTop: 50, paddingHorizontal: 32 },
  emptyEmoji:    { fontSize: 52, marginBottom: 12 },
  emptyTitle:    { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24 },

  suggestionsBox:   { width: '100%' },
  suggestionsLabel: { fontSize: 13, color: '#888', marginBottom: 10 },
  suggestionChip: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB',
  },
  suggestionText: { fontSize: 14, color: '#111' },

  tabEmpty:     { alignItems: 'center', marginTop: 40 },
  tabEmptyText: { fontSize: 14, color: '#888' },

  productCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14,
    padding: 14, marginBottom: 10, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  productIconBox: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center',
  },
  productIcon:  { fontSize: 22 },
  productInfo:  { flex: 1 },
  productName:  { fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 3 },
  productShop:  { fontSize: 12, color: '#555', marginBottom: 2 },
  productTown:  { fontSize: 11, color: '#888' },
  productRight: { alignItems: 'flex-end', gap: 4 },
  productPrice: { fontSize: 15, fontWeight: 'bold', color: '#2563EB' },
  productArrow: { fontSize: 20, color: '#9CA3AF' },

  shopCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14,
    padding: 14, marginBottom: 10, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  shopAvatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center',
  },
  shopAvatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  shopInfo:       { flex: 1 },
  shopName:       { fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 3 },
  shopCategory:   { fontSize: 12, color: '#555', marginBottom: 2 },
  shopTown:       { fontSize: 11, color: '#888' },
  shopRight:      { alignItems: 'flex-end', gap: 6 },
  openBadge:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  openText:       { fontSize: 11, fontWeight: '600' },
  shopArrow:      { fontSize: 20, color: '#9CA3AF' },
});