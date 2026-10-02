import axios from 'axios';

const getBaseURL = () => {
  if (typeof window !== 'undefined' && window.location.origin.includes('github.io')) {
    return 'https://concerns-attorneys-temp-associations.trycloudflare.com/api';
  }
  return '/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to inject JWT token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('mwu_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor for responses
API.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  getMe: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
  addAddress: (data) => API.post('/auth/address', data),
  deleteAddress: (id) => API.delete(`/auth/address/${id}`),
  toggleWishlist: (productId) => API.post(`/auth/wishlist/${productId}`)
};

export const productsAPI = {
  getAll: (params) => API.get('/products', { params }),
  getSuggestions: (q) => API.get('/products/search-suggestions', { params: { q } }),
  getCategories: () => API.get('/products/categories'),
  getFeatured: () => API.get('/products/featured'),
  getById: (id) => API.get(`/products/${id}`),
  create: (data) => API.post('/products', data),
  update: (id, data) => API.put(`/products/${id}`, data),
  delete: (id) => API.delete(`/products/${id}`)
};

export const ordersAPI = {
  create: (data) => API.post('/orders', data),
  getMyOrders: () => API.get('/orders'),
  getById: (id) => API.get(`/orders/${id}`),
  cancel: (id) => API.put(`/orders/${id}/cancel`),
  rate: (id, data) => API.post(`/orders/${id}/rate`, data)
};

export const deliveryAPI = {
  register: (data) => API.post('/delivery/register', data),
  getProfile: () => API.get('/delivery/profile'),
  toggleOnline: (isOnline) => API.put('/delivery/availability', { isOnline }),
  getAvailable: () => API.get('/delivery/orders/available'),
  getActive: () => API.get('/delivery/orders/active'),
  accept: (orderId) => API.post(`/delivery/orders/${orderId}/accept`),
  updateStatus: (orderId, data) => API.put(`/delivery/orders/${orderId}/status`, data),
  updateLocation: (data) => API.put('/delivery/location', data)
};

export const adminAPI = {
  getStats: () => API.get('/admin/dashboard'),
  getOrders: (params) => API.get('/admin/orders', { params }),
  updateOrderStatus: (id, data) => API.put(`/admin/orders/${id}/status`, data),
  refundOrder: (id, data) => API.post(`/admin/orders/${id}/refund`, data),
  getAgents: () => API.get('/admin/delivery-agents'),
  updateAgentStatus: (id, data) => API.put(`/admin/delivery-agents/${id}/status`, data),
  getUsers: () => API.get('/admin/users'),
  getStores: () => API.get('/admin/stores')
};

export default API;
