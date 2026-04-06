import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput, ActivityIndicator, Modal, Alert, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const TEAL = '#1669ef';
const GRAY = '#9CA3AF';

const SORT_OPTIONS = [
  { id: 'relevant',   label: 'Relevant',    icon: 'sparkles-outline'      },
  { id: 'price_low',  label: 'Price: Low',  icon: 'trending-down-outline' },
  { id: 'price_high', label: 'Price: High', icon: 'trending-up-outline'   },
  { id: 'rating',     label: 'Top Rated',   icon: 'star-outline'          },
  { id: 'name',       label: 'Name A-Z',    icon: 'text-outline'          },
];

const QUICK_SEARCHES = [
  { label: 'Tomatoes',   emoji: '🍅' },
  { label: 'Bread',      emoji: '🍞' },
  { label: 'Rice',       emoji: '🌾' },
  { label: 'Milk',       emoji: '🥛' },
  { label: 'Vegetables', emoji: '🥦' },
  { label: 'Bakery',     emoji: '🥐' },
  { label: 'Dal',        emoji: '🫘' },
  { label: 'Oil',        emoji: '🫙' },
  { label: 'Eggs',       emoji: '🥚' },
  { label: 'Fruits',     emoji: '🍎' },
  { label: 'Snacks',     emoji: '🍿' },
  { label: 'Paneer',     emoji: '🧀' },
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
  const [isFocused, setIsFocused]   = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [appliedFilters, setAppliedFilters] = useState({
    sortBy: 'relevant', minPrice: '', maxPrice: '',
  });

  const inputRef    = useRef(null);
  const debounceRef = useRef(null);
  const { user }    = useAuth();
  const town        = user?.town || '';

  useEffect(() => {
    AsyncStorage.getItem('recent_searches').then(data => {
      if (data) setRecentSearches(JSON.parse(data));
    }).catch(() => {});
  }, []);

  const saveRecentSearch = async (text) => {
    try {
      const updated = [text, ...recentSearches.filter(s => s !== text)].slice(0, 6);
      setRecentSearches(updated);
      await AsyncStorage.setItem('recent_searches', JSON.stringify(updated));
    } catch (e) {}
  };

  const removeRecentSearch = async (text) => {
    try {
      const updated = recentSearches.filter(s => s !== text);
      setRecentSearches(updated);
      await AsyncStorage.setItem('recent_searches', JSON.stringify(updated));
    } catch (e) {}
  };

  const clearAllRecent = async () => {
    try {
      setRecentSearches([]);
      await AsyncStorage.removeItem('recent_searches');
    } catch (e) {}
  };

  const { carts, addToCart, removeFromCart, cartCount, cartTotal } = useCart();
  const cartShop = Object.values(carts)[0]?.shop || null;
  const cart = Object.values(carts).reduce((acc, sc) => ({ ...acc, ...sc.items }), {});

  const handleAddToCart = (product) => {
    const shopData    = { id: product.shop_id, shop_name: product.shop_name };
    const productData = {
      id:    product.id,
      name:  product.name,
      price: product.price,
      image: product.image_url || product.image || null,
    };
    addToCart(productData, shopData);
  };

  const activeFilterCount = [
    appliedFilters.sortBy !== 'relevant',
    appliedFilters.minPrice !== '',
    appliedFilters.maxPrice !== '',
  ].filter(Boolean).length;

  const handleSearch = (text) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) { setResults(null); return; }
    debounceRef.current = setTimeout(() => { doSearch(text, appliedFilters); saveRecentSearch(text); }, 400);
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
          <Ionicons name="arrow-back" size={22} color="#111" />
        </TouchableOpacity>
        <View style={[styles.searchBar, isFocused && styles.searchBarFocused]}>
          <Ionicons name="search-outline" size={18} color={isFocused ? TEAL : GRAY} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search Univerin..."
            placeholderTextColor={GRAY}
            value={query}
            onChangeText={handleSearch}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            autoFocus
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
            selectionColor="transparent"
            underlineColorAndroid="transparent"
            cursorColor="transparent"
          />
          {query.length > 0 && (
            <TouchableOpacity
              onPress={() => { setQuery(''); setResults(null); inputRef.current?.focus(); }}
              style={styles.clearBtn}
            >
              <Ionicons name="close-circle" size={18} color={GRAY} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterBtn, activeFilterCount > 0 && styles.filterBtnActive]}
          onPress={() => setShowFilter(true)}
        >
          <Ionicons name="options-outline" size={20} color={activeFilterCount > 0 ? TEAL : '#444'} />
          {activeFilterCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Active filters */}
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
            <Ionicons name="cube-outline" size={14} color={activeTab === 'products' ? '#fff' : '#555'} />
            <Text style={[styles.tabText, activeTab === 'products' && styles.tabTextActive]}>
              Products ({results.products?.length || 0})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'shops' && styles.tabActive]}
            onPress={() => setActiveTab('shops')}
          >
            <Ionicons name="storefront-outline" size={14} color={activeTab === 'shops' ? '#fff' : '#555'} />
            <Text style={[styles.tabText, activeTab === 'shops' && styles.tabTextActive]}>
              Shops ({results.shops?.length || 0})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results count */}
      {results && totalResults > 0 && (
        <View style={styles.resultsCountBar}>
          <Text style={styles.resultsCountText}>
            <Text style={styles.resultsCountBold}>{totalResults}</Text> results for "{query}"
          </Text>
        </View>
      )}

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={TEAL} />
          <Text style={styles.loadingText}>Searching...</Text>
        </View>

      ) : !query ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.emptyScroll}>
          <View style={styles.quickSection}>

            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <View style={styles.recentSection}>
                <View style={styles.recentHeader}>
                  <Text style={styles.recentTitle}>🕐 Recent Searches</Text>
                  <TouchableOpacity onPress={clearAllRecent}>
                    <Text style={styles.clearAllText}>Clear all</Text>
                  </TouchableOpacity>
                </View>
                {recentSearches.map((s, i) => (
                  <View key={i} style={styles.recentRow}>
                    <TouchableOpacity style={styles.recentItem} onPress={() => handleSearch(s)}>
                      <Ionicons name="time-outline" size={16} color="#9CA3AF" />
                      <Text style={styles.recentText}>{s}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeRecentSearch(s)} style={styles.recentRemoveBtn}>
                      <Ionicons name="close" size={16} color="#9CA3AF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Popular Searches */}
            <Text style={styles.quickSectionTitle}>🔥 Popular Searches</Text>
            <View style={styles.quickGrid}>
              {QUICK_SEARCHES.map(s => (
                <TouchableOpacity
                  key={s.label}
                  style={styles.quickChip}
                  onPress={() => { handleSearch(s.label); saveRecentSearch(s.label); }}
                  activeOpacity={0.75}
                >
                  <Text style={styles.quickChipEmoji}>{s.emoji}</Text>
                  <Text style={styles.quickChipLabel}>{s.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

      ) : results && totalResults === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="sad-outline" size={40} color={GRAY} />
          </View>
          <Text style={styles.emptyTitle}>No results for "{query}"</Text>
          <Text style={styles.emptySubtitle}>
            {town ? `No results in ${town}. Try a different term.` : 'Try a different search term'}
          </Text>
          {activeFilterCount > 0 && (
            <TouchableOpacity style={styles.clearFiltersBtn} onPress={resetFilters}>
              <Text style={styles.clearFiltersBtnText}>Clear Filters</Text>
            </TouchableOpacity>
          )}
        </View>

      ) : results ? (
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Products tab */}
          {activeTab === 'products' && (
            results.products?.length === 0 ? (
              <View style={styles.tabEmpty}>
                <Text style={styles.tabEmptyText}>No products found</Text>
              </View>
            ) : (
              results.products.map((product) => {
                const mrp         = product.mrp || null;
                const discountPct = mrp && mrp > product.price
                  ? Math.round(((mrp - product.price) / mrp) * 100)
                  : null;
                const isRollback  = discountPct && discountPct >= 5;
                const qty         = cart[product.id] || 0;

                return (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.productCard}
                    onPress={() => navigation.navigate('ShopDetail', { vendorId: product.shop_id, shopName: product.shop_name })}
                    activeOpacity={0.95}
                  >
                    {isRollback && (
                      <View style={styles.rollbackBadge}>
                        <Ionicons name="arrow-down" size={10} color="#fff" />
                        <Text style={styles.rollbackText}>Rollback</Text>
                      </View>
                    )}
                    <View style={styles.productImgBox}>
                      {product.image_url || product.image ? (
                        <Image
                          source={{ uri: product.image_url || `https://res.cloudinary.com/dxavm870k/image/upload/v1/${product.image}` }}
                          style={styles.productImg}
                          resizeMode="contain"
                        />
                      ) : (
                        <View style={styles.productImgPlaceholder}>
                          <Ionicons name="cube-outline" size={36} color={GRAY} />
                        </View>
                      )}
                      <TouchableOpacity style={styles.wishlistBtn}>
                        <Ionicons name="heart-outline" size={18} color={GRAY} />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.productInfo}>
                      {discountPct ? (
                        <View style={styles.priceRow}>
                          <Text style={styles.priceNow}>Now </Text>
                          <Text style={styles.priceCurrent}>₹{product.price}</Text>
                          <Text style={styles.priceMrp}>  ₹{mrp}</Text>
                        </View>
                      ) : (
                        <Text style={styles.priceSingle}>₹{product.price}</Text>
                      )}
                      {discountPct && <Text style={styles.discountLine}>{discountPct}% OFF</Text>}
                      <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
                      <Text style={styles.productShop} numberOfLines={1}>{product.shop_name}</Text>
                      {product.rating > 0 && (
                        <View style={styles.ratingRow}>
                          {[1,2,3,4,5].map(i => (
                            <Ionicons key={i} name={i <= Math.round(product.rating) ? 'star' : 'star-outline'} size={12} color="#F59E0B" />
                          ))}
                          {product.rating_count > 0 && <Text style={styles.ratingCount}>{product.rating_count.toLocaleString()}</Text>}
                        </View>
                      )}
                      <View style={styles.deliveryRow}>
                        <View style={styles.deliveryBadge}>
                          <Ionicons name="flash" size={11} color="#fff" />
                          <Text style={styles.deliveryBadgeText}>
                            Delivery in {product.estimated_delivery_time || 30} mins
                          </Text>
                        </View>
                      </View>
                      {qty === 0 ? (
                        <TouchableOpacity
                          style={styles.addToCartBtn}
                          activeOpacity={0.85}
                          onPress={(e) => { e.stopPropagation && e.stopPropagation(); handleAddToCart(product); }}
                        >
                          <Text style={styles.addToCartText}>Add to cart</Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={[styles.qtyControl, { backgroundColor: TEAL }]}>
                          <TouchableOpacity style={styles.qtyBtn} onPress={(e) => { e.stopPropagation && e.stopPropagation(); removeFromCart(product); }}>
                            <Text style={styles.qtyBtnText}>−</Text>
                          </TouchableOpacity>
                          <Text style={styles.qtyText}>{qty}</Text>
                          <TouchableOpacity style={styles.qtyBtn} onPress={(e) => { e.stopPropagation && e.stopPropagation(); handleAddToCart(product); }}>
                            <Text style={styles.qtyBtnText}>+</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )
          )}

          {/* Shops tab */}
          {activeTab === 'shops' && (
            <View style={{ padding: 16 }}>
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
                      <Text style={styles.shopAvatarText}>{shop.shop_name?.[0]?.toUpperCase() || 'S'}</Text>
                    </View>
                    <View style={styles.shopInfo}>
                      <Text style={styles.shopName}>{shop.shop_name}</Text>
                      <Text style={styles.shopCategory}>{shop.category}</Text>
                      <Text style={styles.shopTown}>
                        <Ionicons name="location-outline" size={11} color={GRAY} /> {shop.town}
                      </Text>
                    </View>
                    <View style={styles.shopRight}>
                      <View style={[styles.openBadge, { backgroundColor: shop.is_open ? '#DCFCE7' : '#FEF2F2' }]}>
                        <View style={[styles.openDot, { backgroundColor: shop.is_open ? '#16A34A' : '#DC2626' }]} />
                        <Text style={[styles.openText, { color: shop.is_open ? '#16A34A' : '#DC2626' }]}>
                          {shop.is_open ? 'Open' : 'Closed'}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color={GRAY} />
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : null}

      {/* Floating cart bar */}
      {cartCount > 0 && (
        <TouchableOpacity
          style={styles.cartBar}
          onPress={() => navigation.navigate('ShopDetail', {
            vendorId: cartShop?.id,
            shopName: cartShop?.shop_name || cartShop?.name,
          })}
          activeOpacity={0.9}
        >
          <View style={styles.cartBarLeft}>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
            <Text style={styles.cartBarItems}>{cartCount} item{cartCount > 1 ? 's' : ''} added</Text>
          </View>
          <View style={styles.cartBarRight}>
            <Text style={styles.cartBarShop}>{cartShop?.shop_name || cartShop?.name}</Text>
            <Text style={styles.cartBarTotal}>₹{cartTotal.toFixed(0)} →</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Filter Modal */}
      <Modal visible={showFilter} animationType="slide" transparent onRequestClose={() => setShowFilter(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFilter(false)} />
        <View style={styles.filterModal}>
          <View style={styles.filterModalHandle} />
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
                  <Ionicons name={opt.icon} size={14} color={sortBy === opt.id ? '#fff' : '#555'} />
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
                  placeholderTextColor={GRAY} keyboardType="numeric"
                  value={minPrice} onChangeText={setMinPrice}
                  selectionColor="transparent"
                  underlineColorAndroid="transparent"
                />
              </View>
              <Text style={styles.priceDash}>—</Text>
              <View style={styles.priceInput}>
                <Text style={styles.priceLabel}>Max Price</Text>
                <TextInput
                  style={styles.priceTextInput} placeholder="1000"
                  placeholderTextColor={GRAY} keyboardType="numeric"
                  value={maxPrice} onChangeText={setMaxPrice}
                  selectionColor="transparent"
                  underlineColorAndroid="transparent"
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
    backgroundColor: '#fff', borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0', gap: 10,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F3F4F6', borderRadius: 12,
    paddingHorizontal: 12, height: 44, gap: 8,
    borderWidth: 1.5, borderColor: 'transparent',
  },
  searchBarFocused: { backgroundColor: '#F3F4F6', borderColor: 'transparent' },
  searchInput: {
    flex: 1, fontSize: 14, color: '#111',
    outlineWidth: 0, borderWidth: 0,
  },
  clearBtn:     { padding: 2 },
  filterBtn: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#F3F4F6', justifyContent: 'center',
    alignItems: 'center', position: 'relative',
  },
  filterBtnActive: { backgroundColor: '#eff6ff', borderWidth: 1.5, borderColor: TEAL },
  filterBadge: {
    position: 'absolute', top: -4, right: -4, backgroundColor: TEAL,
    borderRadius: 8, width: 16, height: 16,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: '#fff',
  },
  filterBadgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold' },

  activeFiltersRow: {
    backgroundColor: '#fff', paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0', maxHeight: 46,
  },
  activeFilterChip: {
    backgroundColor: '#eff6ff', borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: '#bfdbfe',
  },
  activeFilterText:  { fontSize: 12, color: TEAL, fontWeight: '500' },
  clearFiltersChip:  { backgroundColor: '#FEE2E2', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5 },
  clearFiltersText:  { fontSize: 12, color: '#EF4444', fontWeight: '500' },

  tabsRow: {
    flexDirection: 'row', backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    paddingHorizontal: 16, gap: 8, paddingVertical: 10,
  },
  tab:           { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F3F4F6' },
  tabActive:     { backgroundColor: TEAL },
  tabText:       { fontSize: 13, color: '#555', fontWeight: '500' },
  tabTextActive: { color: '#fff', fontWeight: 'bold' },

  resultsCountBar: {
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  resultsCountText: { fontSize: 13, color: '#555' },
  resultsCountBold: { fontWeight: 'bold', color: '#111' },

  loadingBox:  { alignItems: 'center', marginTop: 60, gap: 12 },
  loadingText: { fontSize: 14, color: GRAY },

  emptyScroll:       { paddingBottom: 40 },
  quickSection:      { paddingHorizontal: 16, paddingTop: 24 },
  quickSectionTitle: { fontSize: 15, fontWeight: '700', color: '#111', marginBottom: 14 },
  quickGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickChip: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 50,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
  },
  quickChipEmoji: { fontSize: 16 },
  quickChipLabel: { fontSize: 13, color: '#111', fontWeight: '500' },

  emptyState: { alignItems: 'center', marginTop: 60, paddingHorizontal: 32 },
  emptyIconBox: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: '#F3F4F6', justifyContent: 'center',
    alignItems: 'center', marginBottom: 16,
  },
  emptyTitle:    { fontSize: 20, fontWeight: 'bold', color: '#111', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: GRAY, textAlign: 'center', marginBottom: 8 },
  clearFiltersBtn: {
    backgroundColor: TEAL, borderRadius: 12,
    paddingHorizontal: 24, paddingVertical: 12, marginTop: 8,
  },
  clearFiltersBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  productCard: {
    flexDirection: 'row', backgroundColor: '#fff',
    paddingHorizontal: 16, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
    position: 'relative',
  },
  rollbackBadge: {
    position: 'absolute', top: 16, left: 16,
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#EF4444', borderRadius: 4,
    paddingHorizontal: 7, paddingVertical: 3, zIndex: 2,
  },
  rollbackText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  productImgBox: {
    width: 130, height: 130, backgroundColor: '#F8F8F8',
    borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    marginRight: 14, flexShrink: 0, position: 'relative',
  },
  productImg:            { width: 120, height: 120 },
  productImgPlaceholder: {
    width: 130, height: 130, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#F3F4F6', borderRadius: 12,
  },
  wishlistBtn: {
    position: 'absolute', top: 6, right: 6,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  productInfo:  { flex: 1, justifyContent: 'flex-start' },
  priceRow:     { flexDirection: 'row', alignItems: 'baseline', marginBottom: 2, flexWrap: 'wrap' },
  priceNow:     { fontSize: 13, color: '#16A34A', fontWeight: '600' },
  priceCurrent: { fontSize: 18, fontWeight: 'bold', color: '#16A34A' },
  priceMrp:     { fontSize: 12, color: GRAY, textDecorationLine: 'line-through', marginLeft: 4 },
  priceSingle:  { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 4 },
  discountLine: { fontSize: 12, color: '#2563EB', fontWeight: '700', marginBottom: 4 },
  productName:  { fontSize: 13, fontWeight: '600', color: '#111', marginBottom: 3, lineHeight: 18 },
  productShop:  { fontSize: 11, color: '#888', marginBottom: 5 },
  ratingRow:    { flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 6 },
  ratingCount:  { fontSize: 11, color: '#888', marginLeft: 3 },
  deliveryRow:  { marginBottom: 10 },
  deliveryBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#1e3a8a', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4, alignSelf: 'flex-start',
  },
  deliveryBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  addToCartBtn: {
    backgroundColor: TEAL, borderRadius: 50,
    paddingVertical: 9, alignItems: 'center',
  },
  addToCartText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  qtyControl: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 50, overflow: 'hidden', justifyContent: 'space-between',
  },
  qtyBtn:     { paddingHorizontal: 16, paddingVertical: 9 },
  qtyBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  qtyText:    { color: '#fff', fontSize: 15, fontWeight: 'bold', minWidth: 24, textAlign: 'center' },

  cartBar: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: TEAL, marginHorizontal: 16, borderRadius: 14,
    padding: 14, position: 'absolute', bottom: 16, left: 0, right: 0,
    shadowColor: TEAL, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 10, elevation: 8,
  },
  cartBarLeft:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cartBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 8,
    width: 28, height: 28, justifyContent: 'center', alignItems: 'center',
  },
  cartBadgeText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  cartBarItems:  { color: '#fff', fontSize: 13, fontWeight: '600' },
  cartBarRight:  { alignItems: 'flex-end' },
  cartBarShop:   { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginBottom: 2 },
  cartBarTotal:  { color: '#fff', fontSize: 15, fontWeight: 'bold' },

  shopCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 14, padding: 14, marginBottom: 10, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  shopAvatar:     { width: 46, height: 46, borderRadius: 23, backgroundColor: TEAL, justifyContent: 'center', alignItems: 'center' },
  shopAvatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  shopInfo:       { flex: 1 },
  shopName:       { fontSize: 14, fontWeight: 'bold', color: '#111', marginBottom: 3 },
  shopCategory:   { fontSize: 12, color: '#555', marginBottom: 2 },
  shopTown:       { fontSize: 11, color: GRAY },
  shopRight:      { alignItems: 'flex-end', gap: 6 },
  openBadge:      { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  openDot:        { width: 6, height: 6, borderRadius: 3 },
  openText:       { fontSize: 11, fontWeight: '600' },

  tabEmpty:     { alignItems: 'center', marginTop: 40 },
  tabEmptyText: { fontSize: 14, color: GRAY },

  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  filterModal: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff', borderTopLeftRadius: 24,
    borderTopRightRadius: 24, padding: 20, maxHeight: '80%',
  },
  filterModalHandle:  { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 16 },
  filterModalHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  filterModalTitle:   { fontSize: 17, fontWeight: 'bold', color: '#111' },
  resetText:          { fontSize: 14, color: '#EF4444', fontWeight: '500' },
  filterSectionTitle: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 12, marginTop: 8 },
  sortOptions:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  sortChip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20,
    backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB',
  },
  sortChipActive:     { backgroundColor: TEAL, borderColor: TEAL },
  sortChipText:       { fontSize: 13, color: '#555', fontWeight: '500' },
  sortChipTextActive: { color: '#fff', fontWeight: 'bold' },
  priceRow:   { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  priceInput: { flex: 1 },
  priceLabel: { fontSize: 12, color: GRAY, marginBottom: 6 },
  priceTextInput: {
    backgroundColor: '#F3F4F6', borderRadius: 10, padding: 12,
    fontSize: 14, color: '#111', borderWidth: 1, borderColor: '#E5E7EB',
  },
  priceDash:            { fontSize: 18, color: GRAY, marginTop: 20 },
  quickPriceRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 24 },
  quickPriceChip:       { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#F3F4F6', borderWidth: 1, borderColor: '#E5E7EB' },
  quickPriceChipActive: { backgroundColor: '#eff6ff', borderColor: TEAL },
  quickPriceText:       { fontSize: 12, color: '#555' },
  quickPriceTextActive: { color: TEAL, fontWeight: '600' },
  applyBtn:     { backgroundColor: TEAL, borderRadius: 14, padding: 16, alignItems: 'center', marginTop: 8 },
  applyBtnText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

  recentSection: { marginBottom: 24 },
  recentHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 10,
  },
  recentTitle:     { fontSize: 15, fontWeight: '700', color: '#111' },
  clearAllText:    { fontSize: 13, color: TEAL, fontWeight: '600' },
  recentRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12,
    marginBottom: 8, paddingRight: 12,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  recentItem: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    gap: 10, padding: 12,
  },
  recentText:      { fontSize: 14, color: '#111', flex: 1 },
  recentRemoveBtn: { padding: 4 },
});