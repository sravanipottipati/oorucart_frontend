import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

// Auth Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

// Buyer Screens
import HomeScreen from './src/screens/buyer/HomeScreen';
import ShopDetailScreen from './src/screens/buyer/ShopDetailScreen';
import CheckoutScreen from './src/screens/buyer/CheckoutScreen';
import MyOrdersScreen from './src/screens/buyer/MyOrdersScreen';
import OrderSuccessScreen from './src/screens/buyer/OrderSuccessScreen';
import ProfileScreen from './src/screens/buyer/ProfileScreen';
import EditProfileScreen from './src/screens/buyer/EditProfileScreen';
import NotificationsScreen from './src/screens/buyer/NotificationsScreen';
import WishlistScreen from './src/screens/buyer/WishlistScreen';
import AddressScreen from './src/screens/buyer/AddressScreen';
import HelpSupportScreen from './src/screens/buyer/HelpSupportScreen';
import SearchScreen from './src/screens/buyer/SearchScreen';
import OrderDetailScreen from './src/screens/buyer/OrderDetailScreen';

// Vendor Screens
import VendorHomeScreen from './src/screens/vendor/VendorHomeScreen';
import VendorProductsScreen from './src/screens/vendor/VendorProductsScreen';
import VendorWalletScreen from './src/screens/vendor/VendorWalletScreen';
import VendorRegisterScreen from './src/screens/vendor/VendorRegisterScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const getInitialRoute = () => {
    if (!user) return 'Login';
    if (user.user_type === 'vendor') return 'VendorHome';
    return 'Home';
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={getInitialRoute()}
        screenOptions={{ headerShown: false }}
      >
        {/* Auth */}
        <Stack.Screen name="Login"    component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />

        {/* Buyer */}
        <Stack.Screen name="Home"          component={HomeScreen} />
        <Stack.Screen name="ShopDetail"    component={ShopDetailScreen} />
        <Stack.Screen name="Checkout"      component={CheckoutScreen} />
        <Stack.Screen name="MyOrders"      component={MyOrdersScreen} />
        <Stack.Screen name="OrderSuccess"  component={OrderSuccessScreen} />
        <Stack.Screen name="Profile"       component={ProfileScreen} />
        <Stack.Screen name="EditProfile"   component={EditProfileScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Wishlist"      component={WishlistScreen} />
        <Stack.Screen name="Address"       component={AddressScreen} />
        <Stack.Screen name="HelpSupport"   component={HelpSupportScreen} />
        <Stack.Screen name="Search"        component={SearchScreen} />
        <Stack.Screen name="OrderDetail"   component={OrderDetailScreen} />

        {/* Vendor */}
        <Stack.Screen name="VendorHome"     component={VendorHomeScreen} />
        <Stack.Screen name="VendorProducts" component={VendorProductsScreen} />
        <Stack.Screen name="VendorWallet"   component={VendorWalletScreen} />
        <Stack.Screen name="VendorRegister" component={VendorRegisterScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}