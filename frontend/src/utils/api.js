import axios from 'axios';

// In production, VITE_API_URL should be empty (uses relative paths)
// In development, falls back to localhost:5000
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

console.log('🔗 API Base URL:', API_URL);
console.log('🔧 Environment:', import.meta.env.MODE);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('firebaseToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('firebaseToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
