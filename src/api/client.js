import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Change this to your Mac IP when testing on phone
const BASE_URL = 'http://127.0.0.1:8000/api';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Auto-attach JWT token to every request
client.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default client;