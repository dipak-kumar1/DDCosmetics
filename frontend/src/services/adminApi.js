import axios from 'axios';

const adminApi = axios.create({
  baseURL: 'https://ddcosmetics.onrender.com/api/admin',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add token
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dd_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear admin token and redirect
      localStorage.removeItem('dd_admin_token');
      localStorage.removeItem('dd_admin_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default adminApi;
