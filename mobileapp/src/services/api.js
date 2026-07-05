import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.29.106:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    const response = await api.post('/auth/login', formData);
    if (response.data.access_token) {
      await AsyncStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },
  register: async (email, password, fullName) => {
    return await api.post('/auth/register', { email, password, full_name: fullName });
  },
  logout: async () => {
    await AsyncStorage.removeItem('token');
  }
};

export const foodService = {
  logFood: async (textInput) => {
    const response = await api.post('/food/log', { text_input: textInput });
    return response.data;
  },
  estimateFood: async (textInput) => {
    const response = await api.post('/food/estimate', { text_input: textInput });
    return response.data;
  },
  estimateFoodImage: async (base64string) => {
    const response = await api.post('/food/estimate/image', { image_base64: base64string });
    return response.data;
  },
  logFoodDirect: async (foodData) => {
    const response = await api.post('/food/log/direct', foodData);
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get('/food/history');
    return response.data;
  },
  clearHistory: async () => {
    const response = await api.delete('/food/history');
    return response.data;
  }
};

export const userService = {
  getMe: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  updateProfile: async (profileData) => {
    const response = await api.put('/users/profile', profileData);
    return response.data;
  }
};

export default api;
