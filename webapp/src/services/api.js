import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: async (email, password, fullName) => {
    const response = await api.post('/auth/register', { email, password, full_name: fullName });
    return response.data;
  },
  
  login: async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return response.data;
  },
  
  logout: () => {
    localStorage.removeItem('token');
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

export const foodService = {
  logFood: async (textInput) => {
    const response = await api.post('/food/log', { text_input: textInput });
    return response.data;
  },
  estimateFood: async (textInput) => {
    const response = await api.post('/food/estimate', { text_input: textInput });
    return response.data;
  },
  logFoodDirect: async (foodData) => {
    const response = await api.post('/food/log/direct', foodData);
    return response.data;
  },
  getHistory: async () => {
    const response = await api.get('/food/history');
    return response.data;
  }
};

export default api;
