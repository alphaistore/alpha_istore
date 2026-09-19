// frontend/lib/api.js
import axios from 'axios';
import siteConfig from '../config';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: siteConfig.apiEndpoint || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add a response interceptor for handling global errors
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${token}`,
        };
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Authentication error (401).');
    } else if (error.response && error.response.status === 403) {
      console.error('Authorization error (403).');
    } else {
      console.error('API Error:', error.response?.data?.message || error.message || 'Unknown error');
    }
    return Promise.reject(error);
  }
);

// --- API Call Functions ---

// Products
export const getProducts = (params) => apiClient.get('/products', { params });
export const getHomeProducts = () => apiClient.get('/products/homefeed');
export const getProduct = (id) => apiClient.get(`/products/${id}`);
export const createProduct = (productData) => apiClient.post('/products', productData);
export const updateProduct = (id, productData) => apiClient.put(`/products/${id}`, productData);
export const deleteProduct = (id) => apiClient.delete(`/products/${id}`);
export const uploadProductImages = (formData) => apiClient.post('/upload/images', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

// Orders
export const createOrder = (orderData) => apiClient.post('/orders', orderData);
export const getMyOrders = () => apiClient.get('/orders/my');
export const trackOrder = (orderNumber) => apiClient.get(`/orders/track/${orderNumber}`);
export const getAllOrders = (params) => apiClient.get('/orders', { params });
export const updateOrderStatus = (id, status) => apiClient.patch(`/orders/${id}/status`, { status });
export const updatePaymentStatus = (id, status, reference) => apiClient.patch(`/orders/${id}/payment`, { status, reference });
export const getDashboardStats = () => apiClient.get('/orders/dashboard-stats');
// Settings
export const getSettings = () => apiClient.get('/settings');
export const updateSettings = (settingsData) => apiClient.put('/settings', settingsData);
export const validatePromoCode = (code) => apiClient.get(`/settings/promo/${code}`);

// Password reset
export const forgotPassword = (email) => apiClient.post('/auth/forgot-password', { email });
export const resetPassword = (data) => apiClient.post('/auth/reset-password', data);

// Generic fetch
export const fetchAPI = (endpoint, method = 'GET', data = null, params = null) => {
  return apiClient({
    url: endpoint,
    method,
    data,
    params,
  });
};

export const authAPI = {
  login: async (credentials) => {
    const t0 = Date.now();
    const res = await apiClient.post('/auth/login', credentials);
    const t1 = Date.now();
    try {
      console.info(`[auth] client login duration: ${t1 - t0}ms`);
    } catch (e) {}
    return res;
  },
  register: (data) => apiClient.post('/auth/register', data),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/me', data),
  changePassword: (payload) => {
    if (typeof payload === 'string') {
      return apiClient.put('/auth/password', { newPassword: payload });
    }
    return apiClient.put('/auth/password', payload);
  },
  changeCredentials: (payload) => apiClient.put('/auth/credentials', payload),
};

export const ordersAPI = {
  create: createOrder,
  myOrders: getMyOrders,
  track: trackOrder,
  getAll: getAllOrders,
  updateStatus: updateOrderStatus,
  updatePaymentStatus,
  getDashboardStats: getDashboardStats,
  clearAll: () => apiClient.delete('/orders/clear'),
};

export const productsAPI = {
  list: getProducts,
  get: getProduct,
  create: createProduct,
  update: updateProduct,
  delete: deleteProduct,
  upload: uploadProductImages,
};

export const settingsAPI = {
  get: getSettings,
  update: updateSettings,
};

export const paymentsAPI = {
  verifyPaystack: (reference) => apiClient.post('/payments/verify-paystack', { reference }),
};

export const uploadAPI = {
  images: uploadProductImages,
};

export const contactAPI = {
  submit: (data) => apiClient.post('/contact', data),
  getAll: (params) => apiClient.get('/contact', { params }),
  markReplied: (id) => apiClient.patch(`/contact/${id}/reply`),
  delete: (id) => apiClient.delete(`/contact/${id}`),
};
