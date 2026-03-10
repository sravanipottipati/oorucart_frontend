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

// Vendor Screens
import VendorHomeScreen from './src/screens/vendor/VendorHomeScreen';
import VendorProductsScreen from './src/screens/vendor/VendorProductsScreen';
import VendorWalletScreen from './src/screens/vendor/VendorWalletScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#2E7D32" />
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
        <Stack.Screen name="Home"       component={HomeScreen} />
        <Stack.Screen name="ShopDetail" component={ShopDetailScreen} />
        <Stack.Screen name="Checkout"   component={CheckoutScreen} />
        <Stack.Screen name="MyOrders"   component={MyOrdersScreen} />

        {/* Vendor */}
        <Stack.Screen name="VendorHome"     component={VendorHomeScreen} />
        <Stack.Screen name="VendorProducts" component={VendorProductsScreen} />
        <Stack.Screen name="VendorWallet"   component={VendorWalletScreen} />
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