import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, TextInput,
} from 'react-native';
import client from '../../api/client';

const RECENT = ['Tomatoes', 'Bread', 'Milk'];
const POPULAR = ['Vegetables', 'Bakery', 'Restaurant', 'Grocery', 'Dairy'];

export default function SearchScreen({ navigation }) {
  const [query, setQuery]     = useState('');
  const [tab, setTab]         = useState('products');
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (text) => {
    setQuery(text);
    if (text.length < 2) { setResults([]); setSearched(false); return; }
    try {
      const res = await client.get(`/vendors/nearby/?town=Nellore`);
      const shops = res.data.shops || res.data || [];
      if (tab === 'shops') {
        setResults(shops.filter(s =>
          s.shop_name.toLowerCase().includes(text.toLowerCase())
        ));
      } else {
        const allProducts = [];
        shops.forEach(shop => {
          (shop.products || []).forEach(p => {
            if (p.name.toLowerCase().includes(text.toLowerCase())) {
              allProducts.push({ ...p, shopName: shop.shop_name, shopId: shop.id });
            }
          });
        });
        setResults(allProducts);
      }
      setSearched(true);
    } catch (e) {
      console.log(e.message);
    }
  };

  return (
    <View style={styles.container}>

      {/* Search Bar */}
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search shops or products"
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={handleSearch}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); setSearched(false); }}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, tab === 'products' && styles.tabActive]}
          onPress={() => setTab('products')}
        >
          <Text style={[styles.tabText, tab === 'products' && styles.tabTextActive]}>Products</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, tab === 'shops' && styles.tabActive]}
          onPress={() => setTab('shops')}
        >
          <Text style={[styles.tabText, tab === 'shops' && styles.tabTextActive]}>Shops</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={{ padding: 16 }}>

        {!searched ? (
          <>
            {/* Recent Searches */}
            <Text style={styles.sectionTitle}>Recent Searches</Text>
            <View style={styles.chipsRow}>
              {RECENT.map(item => (
                <TouchableOpacity
                  key={item}
                  style={styles.chip}
                  onPress={() => handleSearch(item)}
                >
                  <Text style={styles.chipIcon}>🕐</Text>
                  <Text style={styles.chipText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Popular Searches */}
            <Text style={styles.sectionTitle}>Popular Searches</Text>
            <View style={styles.chipsRow}>
              {POPULAR.map(item => (
                <TouchableOpacity
                  key={item}
                  style={[styles.chip, styles.chipPopular]}
                  onPress={() => handleSearch(item)}
                >
                  <Text style={styles.chipText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        ) : results.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>No results found</Text>
            <Text style={styles.emptySubtitle}>Try a different search term</Text>
          </View>
        ) : (
          results.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.resultCard}
              onPress={() => tab === 'shops'
                ? navigation.navigate('ShopDetail', { vendorId: item.id, shopName: item.shop_name })
                : navigation.navigate('ShopDetail', { vendorId: item.shopId, shopName: item.shopName })
              }
            >
              <View style={styles.resultIcon}>
                <Text style={styles.resultIconText}>{tab === 'shops' ? '🏪' : '📦'}</Text>
              </View>
              <View style={styles.resultInfo}>
                <Text style={styles.resultName}>
                  {tab === 'shops' ? item.shop_name : item.name}
                </Text>
                <Text style={styles.resultSub}>
                  {tab === 'shops' ? item.town : `₹${item.price} • ${item.shopName}`}
                </Text>
              </View>
              <Text style={styles.resultArrow}>›</Text>
            </TouchableOpacity>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingTop: 52, paddingHorizontal: 16, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F3F4F6', borderRadius: 12, padding: 10,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: '#111' },
  clearBtn: { fontSize: 14, color: '#9CA3AF', paddingHorizontal: 4 },
  cancelBtn: { paddingHorizontal: 4 },
  cancelText: { fontSize: 14, color: '#2563EB', fontWeight: '600' },

  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1, borderBottomColor: '#F0F0F0',
  },
  tab: {
    flex: 1, paddingVertical: 12, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive: { borderBottomColor: '#2563EB' },
  tabText: { fontSize: 14, color: '#888' },
  tabTextActive: { color: '#2563EB', fontWeight: 'bold' },

  sectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#111', marginBottom: 12, marginTop: 8 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F3F4F6', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  chipPopular: { backgroundColor: '#EFF6FF' },
  chipIcon: { fontSize: 12 },
  chipText: { fontSize: 13, color: '#555' },

  resultCard: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  resultIcon: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#F3F4F6', justifyContent: 'center',
    alignItems: 'center', marginRight: 12,
  },
  resultIconText: { fontSize: 22 },
  resultInfo: { flex: 1 },
  resultName: { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 2 },
  resultSub: { fontSize: 12, color: '#888' },
  resultArrow: { fontSize: 20, color: '#9CA3AF' },

  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyEmoji: { fontSize: 50, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: '#111', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: '#888' },
});