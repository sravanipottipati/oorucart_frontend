import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Modal, Image, Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useCart } from '../../context/CartContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48) / 2;

const CATEGORY_EMOJIS = {
  vegetables: '🥬', fruits: '🍎', dairy: '🥛',
  bakery: '🥐', snacks: '🍿', beverages: '🥤',
  food: '🍱', grocery: '🛒', other: '📦',
};
const SHOP_COLORS = ['#4CAF50', '#FF7043', '#FFA726', '#42A5F5', '#AB47BC', '#26A69A'];
const CATEGORY_LABELS = {
  all:              { label: 'All Items',             emoji: '🍽' },
  supermarket:      { label: 'All Items',             emoji: '🛒' },
  groceries:        { label: 'Groceries & Staples',   emoji: '🌾' },
  staples:          { label: 'Groceries & Staples',   emoji: '🌾' },
  dal_pulses:       { label: 'Dal & Pulses',          emoji: '🫘' },
  oils:             { label: 'Oils & Ghee',           emoji: '🫙' },
  sugar_salt:       { label: 'Sugar & Salt',          emoji: '🧂' },
  spices:           { label: 'Spices',                emoji: '🌶' },
  flour:            { label: 'Flour & Grains',        emoji: '🌾' },
  rice_grains:      { label: 'Rice & Grains',         emoji: '🌾' },
  beverages:        { label: 'Beverages',             emoji: '🧃' },
  snacks:           { label: 'Snacks & Packaged',     emoji: '🍿' },
  packaged:         { label: 'Packaged Food',         emoji: '🥫' },
  dairy_eggs:       { label: 'Dairy & Eggs',          emoji: '🥛' },
  milk:             { label: 'Milk',                  emoji: '🥛' },
  curd:             { label: 'Curd & Yogurt',         emoji: '🥣' },
  butter:           { label: 'Butter & Cheese',       emoji: '🧈' },
  paneer:           { label: 'Paneer',                emoji: '🧀' },
  ghee:             { label: 'Ghee',                  emoji: '🫙' },
  dairy:            { label: 'Dairy',                 emoji: '🥛' },
  eggs:             { label: 'Eggs',                  emoji: '🥚' },
  personal_care:    { label: 'Personal Care',         emoji: '🧴' },
  cleaning:         { label: 'Household Cleaning',    emoji: '🧹' },
  baby_kids:        { label: 'Baby & Kids',           emoji: '👶' },
  stationery:       { label: 'Fancy & Stationery',    emoji: '✏️' },
  health_wellness:  { label: 'Health & Wellness',     emoji: '💊' },
  frozen:           { label: 'Frozen & Chilled',      emoji: '🧊' },
  grocery:          { label: 'Grocery',               emoji: '🛒' },
  chips:            { label: 'Chips',                 emoji: '🥔' },
  namkeen:          { label: 'Namkeen',               emoji: '🍿' },
  soft_drinks:      { label: 'Soft Drinks',           emoji: '🥤' },
  chocolates:       { label: 'Chocolates',            emoji: '🍫' },
  juices:           { label: 'Juices',                emoji: '🧃' },
  water:            { label: 'Water',                 emoji: '💧' },
  restaurant:       { label: 'All Items',             emoji: '🍽' },
  breakfast:        { label: 'Breakfast',             emoji: '🍳' },
  lunch:            { label: 'Lunch',                 emoji: '🍛' },
  dinner:           { label: 'Dinner',                emoji: '🌙' },
  vegetarian:       { label: 'Vegetarian',            emoji: '🥗' },
  non_vegetarian:   { label: 'Non-Veg',               emoji: '🍗' },
  tiffins_snacks:   { label: 'Tiffins & Snacks',      emoji: '🥙' },
  beverages_juices: { label: 'Beverages & Juices',    emoji: '🥤' },
  desserts_sweets:  { label: 'Desserts & Sweets',     emoji: '🍮' },
  combos:           { label: 'Combos & Meals',        emoji: '🍱' },
  main_course:      { label: 'Main Course',           emoji: '🍛' },
  biryani:          { label: 'Biryani',               emoji: '🍚' },
  rice:             { label: 'Rice',                  emoji: '🍚' },
  starters:         { label: 'Starters',              emoji: '🥗' },
  desserts:         { label: 'Desserts',              emoji: '🍮' },
  drinks:           { label: 'Drinks',                emoji: '🥤' },
  fast_food:        { label: 'All Items',             emoji: '🍔' },
  burgers:          { label: 'Burgers',               emoji: '🍔' },
  pizza:            { label: 'Pizza',                 emoji: '🍕' },
  fries_sides:      { label: 'Fries & Sides',         emoji: '🍟' },
  wraps_rolls:      { label: 'Wraps & Rolls',         emoji: '🌯' },
  fried_chicken:    { label: 'Fried Chicken',         emoji: '🍗' },
  hot_dogs:         { label: 'Hot Dogs & Sandwiches', emoji: '🌭' },
  chinese:          { label: 'All Items',             emoji: '🥡' },
  chinese_rice:     { label: 'Rice',                  emoji: '🍚' },
  noodles:          { label: 'Noodles',               emoji: '🍜' },
  manchurian:       { label: 'Manchurian & Starters', emoji: '🥢' },
  momos:            { label: 'Momos',                 emoji: '🥟' },
  soups:            { label: 'Soups',                 emoji: '🍲' },
  chilli_dishes:    { label: 'Chilli Dishes',         emoji: '🌶' },
  bakery:           { label: 'All Items',             emoji: '🎂' },
  cakes:            { label: 'Cakes',                 emoji: '🎂' },
  breads:           { label: 'Breads & Loaves',       emoji: '🍞' },
  puffs:            { label: 'Puffs & Savouries',     emoji: '🥐' },
  biscuits_cookies: { label: 'Biscuits & Cookies',    emoji: '🍪' },
  cookies:          { label: 'Cookies',               emoji: '🍪' },
  sweets_mithais:   { label: 'Sweets & Mithais',      emoji: '🍬' },
  hot_snacks:       { label: 'Hot Snacks',            emoji: '🍿' },
  rusks:            { label: 'Rusks & Toast',         emoji: '🍞' },
  pastries:         { label: 'Pastries & Tarts',      emoji: '🧁' },
  festival:         { label: 'Festival Specials',     emoji: '🎉' },
  buns:             { label: 'Buns',                  emoji: '🥐' },
  vegetables:       { label: 'All Vegetables',        emoji: '🥦' },
  leafy_greens:     { label: 'Leafy Vegetables',      emoji: '🥬' },
  root_vegetables:  { label: 'Root Vegetables',       emoji: '🥕' },
  gourds:           { label: 'Gourds & Squash',       emoji: '🥒' },
  beans_pods:       { label: 'Beans & Pods',          emoji: '🫘' },
  stem_flower:      { label: 'Stem & Flower',         emoji: '🥦' },
  tomatoes:         { label: 'Tomato & Capsicum',     emoji: '🍅' },
  exotic_veg:       { label: 'Exotic & Specialty',    emoji: '🍄' },
  herbs:            { label: 'Herbs & Aromatics',     emoji: '🌿' },
  onions:           { label: 'Onions',                emoji: '🧅' },
  potatoes:         { label: 'Potatoes',              emoji: '🥔' },
  carrots:          { label: 'Carrots',               emoji: '🥕' },
  cucumber:         { label: 'Cucumber',              emoji: '🥒' },
  brinjal:          { label: 'Brinjal',               emoji: '🍆' },
  chillies:         { label: 'Chillies',              emoji: '🌶' },
  ice_cream:        { label: 'All Items',             emoji: '🍦' },
  scoops:           { label: 'Ice Cream Scoops',      emoji: '🍨' },
  shakes:           { label: 'Shakes & Floats',       emoji: '🥤' },
  sundaes:          { label: 'Sundaes & Splits',      emoji: '🍧' },
  kulfi:            { label: 'Kulfi & Indian',        emoji: '🍡' },
  waffles:          { label: 'Waffles & Crepes',      emoji: '🧇' },
  dessert_cakes:    { label: 'Cakes & Dessert Jars',  emoji: '🎂' },
  bulk_packs:       { label: 'Bulk & Party Packs',    emoji: '📦' },
  fruits:           { label: 'All Fruits',            emoji: '🍎' },
  common_fruits:    { label: 'Common Indian Fruits',  emoji: '🍌' },
  citrus:           { label: 'Citrus Fruits',         emoji: '🍊' },
  tropical:         { label: 'Tropical Fruits',       emoji: '🍍' },
  temperate:        { label: 'Temperate Fruits',      emoji: '🍇' },
  berries:          { label: 'Berries & Small',       emoji: '🍓' },
  dry_fruits:       { label: 'Dry Fruits & Nuts',     emoji: '🥜' },
  exotic_fruits:    { label: 'Exotic & Imported',     emoji: '🥝' },
  seasonal:         { label: 'Seasonal Specials',     emoji: '🥭' },
  bananas:          { label: 'Bananas',               emoji: '🍌' },
  apples:           { label: 'Apples',                emoji: '🍎' },
  mangoes:          { label: 'Mangoes',               emoji: '🥭' },
  grapes:           { label: 'Grapes',                emoji: '🍇' },
  melons:           { label: 'Melons',                emoji: '🍉' },
  exotic:           { label: 'Exotic',                emoji: '🍍' },
  fresh_leafies:    { label: 'Fresh Leafies',         emoji: '🥬' },
  fresh_veggies:    { label: 'Fresh Veggies',         emoji: '🥕' },
  masala_powders:   { label: 'Masala & Spice Powders',emoji: '🌶' },
  other:            { label: 'Other',                 emoji: '📦' },
};

const getCatLabel = (cat) => {
  const info = CATEGORY_LABELS[cat];
  if (!info) return { label: cat.charAt(0).toUpperCase() + cat.slice(1).replace('_', ' '), emoji: '📦' };
  return info;
};

const getDiscount = (price, mrp) => {
  if (!mrp || !price) return null;
  const p = parseFloat(price);
  const m = parseFloat(mrp);
  if (m <= p) return null;
  return Math.round(((m - p) / m) * 100);
};

const formatPrice = (price) => {
  const p = parseFloat(price);
  return p % 1 === 0 ? `₹${Math.round(p)}` : `₹${p.toFixed(2)}`;
};

// ─── GRID PRODUCT CARD ────────────────────────────────────────────────────────
const ProductCard = ({ product, qty, onAdd, onRemove, shopColor }) => {
  const [showVariants, setShowVariants]       = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const hasVariants = product.variants && product.variants.length > 0;

  const productOutOfStock     = !hasVariants && product.stock_quantity === 0;
  const allVariantsOutOfStock = hasVariants && product.variants.every(v => v.stock_quantity === 0);
  const isOutOfStock          = productOutOfStock || allVariantsOutOfStock;

  const handleAddPress = () => {
    if (isOutOfStock) return;
    if (hasVariants && !selectedVariant) { setShowVariants(true); return; }
    onAdd(product, selectedVariant);
  };

  const handleVariantSelect = (variant) => {
    if (variant.stock_quantity === 0) return;
    setSelectedVariant(variant);
    setShowVariants(false);
    onAdd(product, variant);
  };

  const activePrice = selectedVariant ? selectedVariant.price : product.price;
  const activeMrp   = selectedVariant ? selectedVariant.mrp   : product.mrp;
  const discount    = getDiscount(activePrice, activeMrp);

  return (
    <View style={[styles.gridCard, isOutOfStock && { opacity: 0.85 }]}>

      {/* ── Large Image ── */}
      <View style={[styles.gridImageBox, { backgroundColor: shopColor + '15' }]}>
        {product.image_url ? (
          <Image source={{ uri: product.image_url }}
            style={[styles.gridImage, isOutOfStock && { opacity: 0.4 }]}
            resizeMode="cover" />
        ) : (
          <Text style={[styles.gridEmoji, isOutOfStock && { opacity: 0.4 }]}>
            {CATEGORY_EMOJIS[product.category] || '🛍'}
          </Text>
        )}
        {/* Discount badge — top left */}
        {!isOutOfStock && discount && (
          <View style={styles.gridDiscountBadge}>
            <Text style={styles.gridDiscountText}>{discount}% OFF</Text>
          </View>
        )}
        {/* OOS overlay */}
        {isOutOfStock && (
          <View style={styles.gridOOSOverlay}>
            <Text style={styles.gridOOSOverlayText}>Out of{'\n'}Stock</Text>
          </View>
        )}
        {/* Veg/Non-veg dot — top right */}
        {['restaurant','fast_food','chinese','breakfast','lunch','dinner',
          'vegetarian','non_vegetarian','tiffins_snacks','main_course',
          'biryani','starters','combos'].includes(product.category) && (
          <View style={[styles.gridVegDot, product.category === 'non_vegetarian' && styles.gridNonVegDot]}>
            <View style={[styles.gridVegInner, product.category === 'non_vegetarian' && styles.gridNonVegInner]} />
          </View>
        )}
      </View>

      {/* ── Info ── */}
      <View style={styles.gridInfo}>
        <Text style={[styles.gridName, isOutOfStock && { color: '#9CA3AF' }]} numberOfLines={2}>
          {product.name}
        </Text>
        {product.description ? (
          <Text style={styles.gridDesc} numberOfLines={1}>{product.description}</Text>
        ) : null}

        {/* Variant pills */}
        {hasVariants && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 6 }} contentContainerStyle={{ gap: 4 }}>
            {product.variants.map(v => {
              const isActive = selectedVariant?.id === v.id;
              const isVarOOS = v.stock_quantity === 0;
              return (
                <TouchableOpacity key={v.id}
                  style={[
                    styles.gridVariantPill,
                    isActive && { backgroundColor: shopColor, borderColor: shopColor },
                    isVarOOS && { opacity: 0.5 },
                  ]}
                  onPress={() => !isVarOOS && setSelectedVariant(isActive ? null : v)}
                  disabled={isVarOOS}>
                  <Text style={[
                    styles.gridVariantText,
                    isActive && { color: '#fff' },
                    isVarOOS && { textDecorationLine: 'line-through', color: '#9CA3AF' },
                  ]}>
                    {v.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* Price */}
        <View style={styles.gridPriceRow}>
          <Text style={[styles.gridPrice, isOutOfStock && { color: '#9CA3AF' }]}>
            {formatPrice(activePrice)}
          </Text>
          {!isOutOfStock && activeMrp && parseFloat(activeMrp) > parseFloat(activePrice) && (
            <Text style={styles.gridMrp}>{formatPrice(activeMrp)}</Text>
          )}
        </View>

        {/* Button */}
        {isOutOfStock ? (
          <View style={styles.gridOOSBtn}>
            <Text style={styles.gridOOSBtnText}>Out of Stock</Text>
          </View>
        ) : qty === 0 ? (
          <TouchableOpacity style={[styles.gridAddBtn, { backgroundColor: shopColor }]} onPress={handleAddPress}>
            <Text style={styles.gridAddBtnText}>
              {hasVariants && !selectedVariant ? 'ADD  ▾' : 'ADD'}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.gridQtyControl, { borderColor: shopColor }]}>
            <TouchableOpacity style={styles.gridQtyBtn} onPress={() => onRemove(product)}>
              <Text style={[styles.gridQtyBtnText, { color: shopColor }]}>−</Text>
            </TouchableOpacity>
            <Text style={[styles.gridQtyText, { color: shopColor }]}>{qty}</Text>
            <TouchableOpacity style={styles.gridQtyBtn} onPress={handleAddPress}>
              <Text style={[styles.gridQtyBtnText, { color: shopColor }]}>+</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ── Variant Modal ── */}
      <Modal visible={showVariants} animationType="slide" transparent onRequestClose={() => setShowVariants(false)}>
        <TouchableOpacity style={styles.variantOverlay} activeOpacity={1} onPress={() => setShowVariants(false)} />
        <View style={styles.variantModal}>
          <View style={styles.variantModalHeader}>
            <Text style={styles.variantModalTitle}>{product.name}</Text>
            <TouchableOpacity onPress={() => setShowVariants(false)}>
              <Text style={styles.variantModalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.variantModalSub}>Select size / weight</Text>
          <TouchableOpacity
            style={[styles.variantOption, !selectedVariant && styles.variantOptionActive]}
            onPress={() => { setSelectedVariant(null); setShowVariants(false); onAdd(product, null); }}>
            <View style={styles.variantOptionLeft}>
              <Text style={styles.variantOptionName}>Standard</Text>
              <Text style={styles.variantOptionDesc}>Default size</Text>
            </View>
            <View style={styles.variantOptionRight}>
              <Text style={[styles.variantOptionPrice, { color: shopColor }]}>{formatPrice(product.price)}</Text>
              {product.mrp && parseFloat(product.mrp) > parseFloat(product.price) && (
                <Text style={styles.variantOptionMrp}>{formatPrice(product.mrp)}</Text>
              )}
            </View>
          </TouchableOpacity>
          {product.variants.map(v => {
            const vDiscount = getDiscount(v.price, v.mrp);
            const isVarOOS  = v.stock_quantity === 0;
            return (
              <TouchableOpacity key={v.id}
                style={[styles.variantOption, selectedVariant?.id === v.id && styles.variantOptionActive, isVarOOS && { opacity: 0.6 }]}
                onPress={() => !isVarOOS && handleVariantSelect(v)} disabled={isVarOOS}>
                <View style={styles.variantOptionLeft}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.variantOptionName, isVarOOS && { color: '#9CA3AF' }]}>{v.name}</Text>
                    {isVarOOS ? (
                      <View style={styles.modalOOSBadge}><Text style={styles.modalOOSText}>Out of stock</Text></View>
                    ) : vDiscount ? (
                      <View style={styles.modalDiscountBadge}><Text style={styles.modalDiscountText}>{vDiscount}% OFF</Text></View>
                    ) : null}
                  </View>
                  {!isVarOOS && v.stock_quantity > 0 && <Text style={styles.variantOptionDesc}>In stock</Text>}
                </View>
                <View style={styles.variantOptionRight}>
                  <Text style={[styles.variantOptionPrice, { color: isVarOOS ? '#9CA3AF' : shopColor }]}>{formatPrice(v.price)}</Text>
                  {!isVarOOS && v.mrp && parseFloat(v.mrp) > parseFloat(v.price) && (
                    <Text style={styles.variantOptionMrp}>{formatPrice(v.mrp)}</Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
          <View style={{ height: 20 }} />
        </View>
      </Modal>
    </View>
  );
};

// ─── MAIN SCREEN ──────────────────────────────────────────────────────────────
export default function ShopDetailScreen({ navigation, route }) {
  const { vendorId, shopName, distance } = route.params;
  const [shop, setShop]                     = useState(null);
  const [products, setProducts]             = useState([]);
  const [loading, setLoading]               = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const { carts, addToCart, removeFromCart, cartCount } = useCart();
  const cart          = carts[vendorId]?.items || {};
  const shopCartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const shopColor     = SHOP_COLORS[Math.abs((vendorId?.charCodeAt(0) || 65) - 65) % SHOP_COLORS.length] || '#1669ef';

  const fetchShopData = async () => {
    try {
      const [shopRes, productsRes] = await Promise.all([
        client.get(`/vendors/${vendorId}/`),
        client.get(`/vendors/${vendorId}/products/`),
      ]);
      setShop(shopRes.data);
      if (Array.isArray(productsRes.data)) setProducts(productsRes.data);
      else if (productsRes.data.products) setProducts(productsRes.data.products);
      else setProducts([]);
    } catch (e) { console.log('Error:', e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchShopData(); }, []);

  const handleAddToCart = (product, variant = null) => {
    const productToAdd = variant
      ? { ...product, price: variant.price, name: `${product.name} (${variant.name})` }
      : product;
    addToCart(productToAdd, shop);
  };

  const productCategories = ['all', ...new Set(products.map(p => p.category))];
  const visibleProducts   = products.filter(p => p.is_available !== false);
  const filteredProducts  = activeCategory === 'all'
    ? visibleProducts
    : visibleProducts.filter(p => p.category === activeCategory);

  // Build 2-column grid rows
  const gridRows = [];
  for (let i = 0; i < filteredProducts.length; i += 2) {
    gridRows.push(filteredProducts.slice(i, i + 2));
  }

  if (loading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#1669ef" />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Shop Banner */}
      <View style={[styles.shopBanner, { backgroundColor: shopColor }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
          <Ionicons name="notifications-outline" size={20} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.bannerEmoji}>{CATEGORY_EMOJIS[shop?.category] || '🏪'}</Text>
      </View>

      {/* Shop Info Card */}
      <View style={styles.shopInfoCard}>
        <View style={styles.shopInfoTop}>
          <View style={styles.shopInfoLeft}>
            <Text style={styles.shopInfoName}>{shop?.shop_name || shopName}</Text>
            <Text style={styles.shopInfoCategory}>
              {shop?.category?.charAt(0).toUpperCase() + shop?.category?.slice(1)} • {shop?.town}
            </Text>
          </View>
          <View style={[styles.shopOpenBadge, { backgroundColor: shop?.is_open ? '#DCFCE7' : '#F3F4F6' }]}>
            <View style={[styles.shopOpenDot, { backgroundColor: shop?.is_open ? '#16A34A' : '#9CA3AF' }]} />
            <Text style={[styles.shopOpenText, { color: shop?.is_open ? '#16A34A' : '#9CA3AF' }]}>
              {shop?.is_open ? 'Open' : 'Closed'}
            </Text>
          </View>
        </View>
        <View style={styles.shopMeta}>
          {shop?.rating > 0 ? (
            <View style={styles.ratingBox}>
              <Text style={styles.ratingStars}>★</Text>
              <Text style={styles.ratingText}>{parseFloat(shop.rating).toFixed(1)}</Text>
              {shop?.total_reviews > 0 && <Text style={styles.reviewCount}>({shop.total_reviews})</Text>}
            </View>
          ) : (
            <View style={styles.ratingBox}>
              <Text style={styles.ratingStars}>★</Text>
              <Text style={styles.ratingNew}>New</Text>
            </View>
          )}
          <Text style={styles.metaDot}>•</Text>
          <Text style={styles.shopMetaText}>⏱ {shop?.estimated_delivery_time || 30} mins</Text>
          <Text style={styles.metaDot}>•</Text>
          {(distance !== null && distance !== undefined) && (
            <Text style={styles.shopDistance}>📍 {distance === 0 ? '0.1' : distance} km</Text>
          )}
        </View>
      </View>

      {/* Category Tabs */}
      {productCategories.length > 1 && (
        <View style={styles.categoryTabsWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}
            style={styles.categoryTabs} contentContainerStyle={{ paddingHorizontal: 16 }}>
            {productCategories.map(cat => {
              const { label, emoji } = getCatLabel(cat);
              const isActive = activeCategory === cat;
              return (
                <TouchableOpacity key={cat}
                  style={[styles.categoryTab, isActive && { borderBottomColor: shopColor, borderBottomWidth: 2 }]}
                  onPress={() => setActiveCategory(cat)}>
                  <Text style={styles.categoryTabEmoji}>{emoji}</Text>
                  <Text style={[styles.categoryTabText, isActive && { color: shopColor, fontWeight: '700' }]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Products Grid */}
      <ScrollView style={styles.productsList} showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 8 }}>
        <Text style={styles.itemsCount}>
          {filteredProducts.length} item{filteredProducts.length !== 1 ? 's' : ''}
        </Text>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="cube-outline" size={40} color="#9CA3AF" />
            </View>
            <Text style={styles.emptyTitle}>No products available</Text>
            <Text style={styles.emptySubtitle}>This shop has not added products yet</Text>
          </View>
        ) : (
          gridRows.map((row, rowIdx) => (
            <View key={rowIdx} style={styles.gridRow}>
              {row.map(product => (
                <ProductCard key={product.id} product={product}
                  qty={cart[product.id] || 0}
                  onAdd={handleAddToCart} onRemove={removeFromCart} shopColor={shopColor} />
              ))}
              {row.length === 1 && <View style={{ width: CARD_WIDTH }} />}
            </View>
          ))
        )}
        <View style={{ height: 160 }} />
      </ScrollView>

      {/* Cart Footer */}
      {shopCartCount > 0 && (
        <TouchableOpacity style={[styles.cartFooter, { backgroundColor: shopColor }]}
          onPress={() => navigation.navigate('Cart')}>
          <View style={styles.cartFooterLeft}>
            <View style={styles.cartCountBadge}>
              <Text style={styles.cartCountText}>{shopCartCount}</Text>
            </View>
            <Text style={styles.cartFooterLabel}>{shopCartCount} item{shopCartCount > 1 ? 's' : ''}</Text>
          </View>
          <Text style={styles.cartFooterShop}>View Cart</Text>
          <Text style={styles.cartFooterTotal}>
            ₹{(carts[vendorId]?.products || []).reduce((sum, p) => sum + (cart[p.id] || 0) * parseFloat(p.price), 0).toFixed(0)} →
          </Text>
        </TouchableOpacity>
      )}

      {/* Bottom Tab */}
      <View style={styles.bottomTab}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Home')}>
          <Ionicons name="home-outline" size={22} color="#9CA3AF" />
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Cart')}>
          <View style={{ position: 'relative' }}>
            <Ionicons name={cartCount > 0 ? 'cart' : 'cart-outline'} size={22} color={cartCount > 0 ? '#1669ef' : '#9CA3AF'} />
            {cartCount > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
              </View>
            )}
          </View>
          <Text style={[styles.tabLabel, cartCount > 0 && { color: '#1669ef' }]}>Cart</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('MyOrders')}>
          <Ionicons name="receipt-outline" size={22} color="#9CA3AF" />
          <Text style={styles.tabLabel}>Orders</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-outline" size={22} color="#9CA3AF" />
          <Text style={styles.tabLabel}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: '#F8F9FA' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  shopBanner:       { height: 160, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  backBtn:  { position: 'absolute', top: 52, left: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
  notifBtn: { position: 'absolute', top: 52, right: 16, width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'center', alignItems: 'center' },
  bannerEmoji: { fontSize: 64 },
  shopInfoCard: { backgroundColor: '#fff', marginHorizontal: 16, marginTop: -20, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 4, marginBottom: 8 },
  shopInfoTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  shopInfoLeft:     { flex: 1 },
  shopInfoName:     { fontSize: 18, fontWeight: '800', color: '#111', marginBottom: 4 },
  shopInfoCategory: { fontSize: 13, color: '#888' },
  shopOpenBadge:    { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  shopOpenDot:      { width: 7, height: 7, borderRadius: 4 },
  shopOpenText:     { fontSize: 12, fontWeight: '600' },
  shopMeta:         { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F5F5F5' },
  ratingBox:        { flexDirection: 'row', alignItems: 'center', gap: 3 },
  ratingStars:      { fontSize: 13, color: '#F59E0B' },
  ratingText:       { fontSize: 12, fontWeight: 'bold', color: '#111' },
  ratingNew:        { fontSize: 12, color: '#888' },
  reviewCount:      { fontSize: 11, color: '#888' },
  metaDot:          { fontSize: 10, color: '#D1D5DB' },
  shopMetaText:     { fontSize: 12, color: '#555' },
  shopDistance:     { fontSize: 12, color: '#1669ef', fontWeight: '600' },
  categoryTabsWrapper: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  categoryTabs:        { paddingVertical: 4 },
  categoryTab:         { alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, marginRight: 4, borderBottomWidth: 2, borderBottomColor: 'transparent', gap: 4 },
  categoryTabEmoji:    { fontSize: 18 },
  categoryTabText:     { fontSize: 12, color: '#888', fontWeight: '500' },
  productsList:        { flex: 1 },
  itemsCount:          { fontSize: 12, color: '#888', fontWeight: '500', paddingBottom: 8 },

  // ── Grid ──
  gridRow:  { flexDirection: 'row', gap: 16, marginBottom: 16 },

  // ── Grid Card ──
  gridCard: {
    width: CARD_WIDTH, backgroundColor: '#fff', borderRadius: 16,
    overflow: 'hidden', shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07,
    shadowRadius: 8, elevation: 3,
  },
  gridImageBox: { width: '100%', height: CARD_WIDTH * 0.85, justifyContent: 'center', alignItems: 'center', position: 'relative' },
  gridImage:    { width: '100%', height: '100%' },
  gridEmoji:    { fontSize: 52 },

  gridDiscountBadge:  { position: 'absolute', top: 8, left: 8, backgroundColor: '#16A34A', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  gridDiscountText:   { fontSize: 10, color: '#fff', fontWeight: '800' },
  gridOOSOverlay:     { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center' },
  gridOOSOverlayText: { color: '#fff', fontSize: 12, fontWeight: '800', textAlign: 'center', lineHeight: 16 },
  gridVegDot:         { position: 'absolute', top: 8, right: 8, width: 18, height: 18, borderRadius: 3, borderWidth: 1.5, borderColor: '#16A34A', backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  gridNonVegDot:      { borderColor: '#dc2626' },
  gridVegInner:       { width: 10, height: 10, borderRadius: 5, backgroundColor: '#16A34A' },
  gridNonVegInner:    { backgroundColor: '#dc2626' },

  gridInfo:     { padding: 10 },
  gridName:     { fontSize: 13, fontWeight: '700', color: '#111', marginBottom: 2, lineHeight: 18 },
  gridDesc:     { fontSize: 11, color: '#888', marginBottom: 6 },
  gridPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8 },
  gridPrice:    { fontSize: 15, fontWeight: '800', color: '#111' },
  gridMrp:      { fontSize: 11, color: '#9CA3AF', textDecorationLine: 'line-through' },

  gridVariantPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' },
  gridVariantText: { fontSize: 10, fontWeight: '600', color: '#374151' },

  gridAddBtn:     { borderRadius: 10, paddingVertical: 9, alignItems: 'center', justifyContent: 'center' },
  gridAddBtnText: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  gridQtyControl: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 10, justifyContent: 'space-between' },
  gridQtyBtn:     { paddingHorizontal: 12, paddingVertical: 6 },
  gridQtyBtnText: { fontSize: 18, fontWeight: 'bold' },
  gridQtyText:    { fontSize: 14, fontWeight: 'bold', minWidth: 20, textAlign: 'center' },
  gridOOSBtn:     { borderRadius: 10, paddingVertical: 8, alignItems: 'center', backgroundColor: '#F3F4F6' },
  gridOOSBtnText: { fontSize: 11, color: '#9CA3AF', fontWeight: '600' },

  emptyState:    { alignItems: 'center', marginTop: 60, paddingHorizontal: 32 },
  emptyIconBox:  { width: 84, height: 84, borderRadius: 42, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  emptyTitle:    { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: '#888', textAlign: 'center' },

  // ── Variant Modal ──
  variantOverlay:     { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)' },
  variantModal:       { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '70%' },
  variantModalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  variantModalTitle:  { fontSize: 16, fontWeight: 'bold', color: '#111' },
  variantModalClose:  { fontSize: 18, color: '#9CA3AF' },
  variantModalSub:    { fontSize: 13, color: '#888', marginBottom: 16 },
  variantOption:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderRadius: 12, backgroundColor: '#F9FAFB', marginBottom: 8, borderWidth: 1, borderColor: '#F3F4F6' },
  variantOptionActive:{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  variantOptionLeft:  { flex: 1 },
  variantOptionRight: { alignItems: 'flex-end' },
  variantOptionName:  { fontSize: 14, fontWeight: '600', color: '#111', marginBottom: 2 },
  variantOptionDesc:  { fontSize: 12, color: '#888' },
  variantOptionPrice: { fontSize: 16, fontWeight: 'bold' },
  variantOptionMrp:   { fontSize: 12, color: '#9CA3AF', textDecorationLine: 'line-through' },
  modalOOSBadge:      { backgroundColor: '#FEE2E2', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  modalOOSText:       { fontSize: 10, color: '#EF4444', fontWeight: '700' },
  modalDiscountBadge: { backgroundColor: '#DCFCE7', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  modalDiscountText:  { fontSize: 11, color: '#16A34A', fontWeight: '700' },

  // ── Cart Footer ──
  cartFooter:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 16, borderRadius: 14, padding: 16, position: 'absolute', bottom: 74, left: 0, right: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 6 },
  cartFooterLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cartCountBadge:  { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 6, width: 26, height: 26, justifyContent: 'center', alignItems: 'center' },
  cartCountText:   { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  cartFooterLabel: { color: '#fff', fontSize: 13, opacity: 0.9 },
  cartFooterShop:  { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  cartFooterTotal: { color: '#fff', fontSize: 15, fontWeight: 'bold' },

  // ── Bottom Tab ──
  bottomTab:    { flexDirection: 'row', backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingBottom: 24, paddingTop: 10, position: 'absolute', bottom: 0, left: 0, right: 0 },
  tabItem:      { flex: 1, alignItems: 'center', gap: 3 },
  tabBadge:     { position: 'absolute', top: -4, right: -8, backgroundColor: '#EF4444', borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 3, borderWidth: 1.5, borderColor: '#fff' },
  tabBadgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
  tabLabel:     { fontSize: 11, color: '#9CA3AF' },
});