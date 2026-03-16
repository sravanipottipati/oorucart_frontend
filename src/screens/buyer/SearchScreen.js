import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, ActivityIndicator, Modal,
} from 'react-native';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const SORT_OPTIONS = [
  { id: 'relevant',   label: '✨ Relevant'   },
  { id: 'price_low',  label: '💲 Price: Low'  },
  { id: 'price_high', label: '💲 Price: High' },
  { id: 'rating',     label: '⭐ Top Rated'   },
  { id: 'name',       label: '🔤 Name A-Z'    },
];

export default function SearchScreen({ navigation }) {
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [activeTab, setActiveTab]   = useState('products');
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy,    setSortBy]      = useState('relevant');
  const [minPrice,  setMinPrice]    = useState('');
  const [maxPrice,  setMaxPrice]    = useState('');
  const [appliedFilters, setAppliedFilters] = useState({
    sortBy: 'relevant', minPrice: '', maxPrice: '',
  });
  const debounceRef = useRef(null);
  const { user }    = useAuth();
  const town        = user?.town || '';

  const activeFilterCount = [
    appliedFilters.sortBy !== 'relevant',
    appliedFilters.minPrice !== '',
    appliedFilters.maxPrice !== '',
  ].filter(Boolean).length;

  const handleSearch = (text) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) { setResults(null); return; }
    debounceRef.current = setTimeout(() => doSearch(text, appliedFilters), 400);
  };

  const doSearch = async (q, filters = appliedFilters) => {
    setLoading(true);
    try {
      let url = `/vendors/search/?q=${q}`;
      if (town)             url += `&town=${town}`;
      if (filters.sortBy)   url += `&sort_by=${filters.sortBy}`;
      if (filters.minPrice) url += `&min_price=${filters.minPrice}`;
      if (filters.maxPrice) url += `&max_price=${filters.maxPrice}`;
      const res = await client.get(url);
      setResults(res.data);
    } catch (e) {
      console.log('Search error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const filters = { sortBy, minPrice, maxPrice };
    setAppliedFilters(filters);
    setShowFilter(false);
    if (query.trim()) doSearch(query, filters);
  };

  const resetFilters = () => {
    setSortBy('relevant');
    setMinPrice('');
    setMaxPrice('');
    const filters = { sortBy: 'relevant', minPrice: '', maxPrice: '' };
    setAppliedFilters(filters);
    if (query.trim()) doSearch(query, filters);
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
        <TouchableOpacity
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
          onPress={() => setShowFilter(true)}
        >
          <Text style={styles.filterIcon}>⚙️</Text>
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Town indicator */}
      {town ? (
        <View style={styles.townBar}>
          <Text style={styles.townBarText}>
            📍 Showing results in <Text style={styles.townBarBold}>{town}</Text>
          </Text>
        </View>
      ) : null}

      {/* Active filters bar */}
      {activeFilterCount > 0 && (
        <ScrollView
          horizontal showsHorizontalScrollIndicator={false}
          style={styles.activeFiltersRow}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, alignItems: 'center' }}
        >
          {appliedFilters.sortBy !== 'relevant' && (
            <View style={styles.activeFilterChip}>
              <Text style={styles.activeFilterText}>
                {SORT_OPTIONS.find(s => s.id === appliedFilters.sortBy)?.label}
              </Text>
            </View>
          )}
          {appliedFilters.minPrice !== '' && (
            <View style={styles.activeFilterChip}>
              <Text style={styles.activeFilterText}>Min ₹{appliedFilters.minPrice}</Text>
            </View>
          )}
          {appliedFilters.maxPrice !== '' && (
            <View style={styles.activeFilterChip}>
              <Text style={styles.activeFilterText}>Max ₹{appliedFilters.maxPrice}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.clearFiltersChip} onPress={resetFilters}>
            <Text style={styles.clearFiltersText}>✕ Clear</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

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
              <TouchableOpacity key={s} style={styles.suggestionChip} onPress={() => handleSearch(s)}>
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
          {activeFilterCount > 0 && (
            <TouchableOpacity style={styles.clearFiltersBtn} onPress={resetFilters}>
              <Text style={styles.clearFiltersBtnText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>

      ) : results ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }}>
          {activeTab === 'products' && (
            <>
              {results.products?.length === 0 ? (
                <View style={styles.tabEmpty}><Text style={styles.tabEmptyText}>No products found</Text></View>
              ) : (
                results.products.map(product => (
                  <TouchableOpacity
                    key={product.id} style={styles.productCard}
                    onPress={() => navigation.navigate('ShopDetail', { vendorId: product.shop_id })}
                  >
                    <View style={styles.productIconBox}>
                      <Text style={styles.productIcon}>🛍</Text>
                    </View>
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productShop}>🏪 {product.shop_name}</Text>
                      <Text style={styles.productTown}>📍 {product.town}</Text>
                      {product.rating > 0 && (
                        <Text style={styles.productRating}>⭐ {parseFloat(product.rating).toFixed(1)}</Text>
                      )}
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

          {activeTab === 'shops' && (
            <>
              {results.shops?.length === 0 ? (
                <View style={styles.tabEmpty}><Text style={styles.tabEmptyText}>No shops found</Text></View>
              ) : (
                results.shops.map(shop => (
                  <TouchableOpacity
                    key={shop.id} style={styles.shopCard}
                    onPress={() => navigation.navigate('ShopDetail', { vendorId: shop.id })}
                  >
                    <View style={styles.shopAvatar}>
                      <Text style={styles.shopAvatarText}>{shop.shop_name?.[0]?.toUpperCase() || 'S'}</Text>
                    </View>
                    <View style={styles.shopInfo}>
                      <Text style={styles.shopName}>{shop.shop_name}</Text>
                      <Text style={styles.shopCategory}>{shop.category}</Text>
                      <Text style={styles.shopTown}>📍 {shop.town}</Text>
                      {shop.rating > 0 && (
                        <Text style={styles.shopRating}>⭐ {parseFloat(shop.rating).toFixed(1)}</Text>
                      )}
                    </View>
                    <View style={styles.shopRight}>
                      <View style={[styles.openBadge, { backgroundColor: shop.is_open ? '#DCFCE7' : '#F3F4F6' }]}>
                        <Text style={[styles.openText, { color: shop.is_open ? '#16A34A' : '#9CA3AF' }]}>
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

      {/* Filter Modal */}
      <Modal visible={showFilter} animationType="slide" transparent onRequestClose={() => setShowFilter(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFilter(false)} />
        <View style={styles.filterModal}>
          <View style={styles.filterModalHeader}>
            <Text style={styles.filterModalTitle}>Filter & Sort</Text>
            <TouchableOpacity onPress={resetFilters}>
              <Text style={styles.resetText}>Reset All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.filterSectionTitle}>Sort By</Text>
            <View style={styles.sortOptions}>
              {SORT_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.id}
                  style={[styles.sortChip, sortBy === opt.id && styles.sortChipActive]}
                  onPress={() => setSortBy(opt.id)}
                >
                  <Text style={[styles.sortChipText, sortBy === opt.id && styles.sortChipTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterSectionTitle}>Price Range (₹)</Text>
            <View style={styles.priceRow}>
              <View style={styles.priceInput}>
                <Text style={styles.priceLabel}>Min Price</Text>
                <TextInput
                  style={styles.priceTextInput} placeholder="0"
                  placeholderTextColor="#9CA3AF" keyboardType="numeric"
                  value={minPrice} onChangeText={setMinPrice}
                />
              </View>
              <Text style={styles.priceDash}>—</Text>
              <View style={styles.priceInput}>
                <Text style={styles.priceLabel}>Max Price</Text>
                <TextInput
                  style={styles.priceTextInput} placeholder="1000"
                  placeholderTextColor="#9CA3AF" keyboardType="numeric"
                  value={maxPrice} onChangeText={setMaxPrice}
                />
              </View>
            </View>

            <View style={styles.quickPriceRow}>
              {[
                { label: 'Under ₹50',  min: '',    max: '50'  },
                { label: '₹50-₹100',   min: '50',  max: '100' },
                { label: '₹100-₹200',  min: '100', max: '200' },
                { label: 'Above ₹200', min: '200', max: ''    },
              ].map(p => (
                <TouchableOpacity
                  key={p.label}
                  style={[styles.quickPriceChip, minPrice === p.min && maxPrice === p.max && styles.quickPriceChipActive]}
                  onPress={() => { setMinPrice(p.min); setMaxPrice(p.max); }}
                >
                  <Text style={[styles.quickPriceText, minPrice === p.min && maxPrice === p.max && styles.quickPriceTextActive]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.applyBtn} onPress={applyFilters}>
            <Text style={styles.applyBtnText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', gap: 8,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 24, color: '#111' },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F3F4F6', borderRadius: 12,
    paddingHorizontal: 12, height: 42, gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: 14, color: '#111' },
  clearIcon: { fontSize: 16, color: '#9CA3AF' },
  filterBtn: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', position: 'relative',
  },
  filterBtnActive: { backgroundColor: '#EFF6FF', borderWidth: 1, borderColor: '#2563EB' },
  filterIcon: { fontSize: 18 },
  filterBadge: {
    position: 'absolute', top: -4, right: -4, backgroundColor: '#2563EB',
    borderRadius: 8, width: 16, height: 16, justifyContent: 'center', alignItems: 'center',
  },
  filterBadgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },
  townBar: {
    backgroundColor: '#EFF6FF', paddingHorizontal: 16,
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#DBEAFE',
  },
  townBarText: { fontSize: 12, color: '#2563EB' },
  townBarBold: { fontWeight: 'bold' },
  activeFiltersRow: {
    backgroundColor: '#fff', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0', maxHeight: 46,
  },
  activeFilterChip: {
    backgroundColor: '#EFF6FF', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  activeFilterText: { fontSize: 12, color: '#2563EB', fontWeight: '500' },
  clearFiltersChip: { backgroundColor: '#FEE2E2', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  clearFiltersText: { fontSize: 12, color: '#EF4444', fontWeight: '500' },
  tabsRow: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    paddingHorizontal: 16, gap: 8, paddingVertical: 10,
  },
  tab: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F3F4F6' },
  tabActive: { backgroundColor: '#2563EB' },
  tabText: { fontSize: 13, color: '#555', fontWeight: '500' },
  tabTextActive: { color: '#fff', fontWeight: 'bold' },
  emptyState: { alignItems: 'center', marginTop: 50, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 52, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: '#888', textAlign: 'center', marginBottom: 24 },
  clearFiltersBtn: {
    backgroundColor: '#2563EB', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, marginTop: 8,
  },
  clearFiltersBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  suggestionsBox: { width: '100%' },
  suggestionsLabel: { fontSize: 13, color: '#888', marginBottom: 10 },
  suggestionChip: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB',
  },
  suggestionText: { fontSize: 14, color: '#111' },
  tabEmpty: { alignItems: 'center', marginTop: 40 },
  tabEmptyText: { fontSize: 14, color: '#888' },
  productCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, padding: 14, marginBottom: 10, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  productIconBox: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center',
  },
  productIcon: { fontSize: 22 },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 3 },
  productShop: { fontSize: 12, color: '#555', marginBottom: 2 },
  productTown: { fontSize: 11, color: '#888' },
  productRating: { fontSize: 11, color: '#F59E0B', marginTop: 2 },
  productRight: { alignItems: 'flex-end', gap: 4 },
  productPrice: { fontSize: 15, fontWeight: 'bold', color: '#2563EB' },
  productArrow: { fontSize: 20, color: '#9CA3AF' },
  shopCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, padding: 14, marginBottom: 10, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  shopAvatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center',
  },
  shopAvatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  shopInfo: { flex: 1 },
  shopName: { fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 3 },
  shopCategory: { fontSize: 12, color: '#555', marginBottom: 2 },
  shopTown: { fontSize: 11, color: '#888' },
  shopRating: { fontSize: 11, color: '#F59E0B', marginTop: 2 },
  shopRight: { alignItems: 'flex-end', gap: 6 },
  openBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  openText: { fontSize: 11, fontWeight: '600' },
  shopArrow: { fontSize: 20, color: '#9CA3AF' },
  modalOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  filterModal: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, maxHeight: '80%',
  },
  filterModalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20,
  },
  filterModalTitle: { fontSize: 17, fontWeight: 'bold', color: '#111' },
  resetText: { fontSize: 14, color: '#EF4444', fontWeight: '500' },
  filterSectionTitle: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 12, marginTop: 8 },
  sortOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  sortChip: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB',
  },
  sortChipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  sortChipText: { fontSize: 13, color: '#555', fontWeight: '500' },
  sortChipTextActive: { color: '#fff', fontWeight: 'bold' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  priceInput: { flex: 1 },
  priceLabel: { fontSize: 12, color: '#888', marginBottom: 6 },
  priceTextInput: {
    backgroundColor: '#F3F4F6', borderRadius: 10, padding: 12,
    fontSize: 14, color: '#111', borderWidth: 1, borderColor: '#E5E7EB',
  },
  priceDash: { fontSize: 18, color: '#9CA3AF', marginTop: 20 },
  quickPriceRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  quickPriceChip: {
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB',
  },
  quickPriceChipActive: { backgroundColor: '#EFF6FF', borderColor: '#2563EB' },
  quickPriceText: { fontSize: 12, color: '#555' },
  quickPriceTextActive: { color: '#2563EB', fontWeight: '600' },
  applyBtn: { backgroundColor: '#2563EB', borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  applyBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
});