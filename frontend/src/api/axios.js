import axios from 'axios';

const api = axios.create({
  // Use import.meta.env for Vite
  baseURL: import.meta.env.VITE_API_BASE_URL, 
});

// Interceptor to add the auth token to every request (no changes here)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;