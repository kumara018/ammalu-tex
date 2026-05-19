import axios from 'axios';

// Determine backend URL based on where the app is running.
// - localhost / 127.0.0.1  →  local FastAPI server
// - anywhere else (Vercel) →  Render backend
function getApiBase(): string {
  if (typeof window === 'undefined') {
    // Server-side (Next.js SSR) — always use Render
    return 'https://ammalu-tex.onrender.com';
  }
  const host = window.location.hostname;
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:8000';
  }
  return 'https://ammalu-tex.onrender.com';
}

const API_BASE = getApiBase();

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 65000, // 65s — Render cold starts can take up to 60s
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 — but NEVER on auth endpoints or page-load API calls.
// Only redirect to login if /api/auth/me ALSO fails (token truly invalid).
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const url    = err.config?.url || '';
    const status = err.response?.status;

    const isAuthEndpoint =
      url.includes('/api/auth/login')             ||
      url.includes('/api/auth/register')          ||
      url.includes('/api/auth/forgot')            ||
      url.includes('/api/auth/reset')             ||
      url.includes('/api/auth/send-login-otp')    ||
      url.includes('/api/auth/verify-login-otp')  ||
      url.includes('/api/auth/me');

    if (status === 401 && !isAuthEndpoint && typeof window !== 'undefined') {
      // Verify the token is truly dead before logging out
      try {
        await api.get('/api/auth/me');
        // Token is still valid — just this endpoint had an issue, don't logout
      } catch (meErr: any) {
        if (meErr.response?.status === 401) {
          // Token is truly invalid — clear everything and redirect
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/auth/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register:            (data: object) => api.post('/api/auth/register', data),
  login:               (data: object) => api.post('/api/auth/login', data),
  sendLoginOtp:        (data: object) => api.post('/api/auth/send-login-otp', data),
  verifyLoginOtp:      (data: object) => api.post('/api/auth/verify-login-otp', data),
  getMe:               ()             => api.get('/api/auth/me'),
  updateProfile:       (data: object) => api.put('/api/auth/me', data),
  forgotPassword:      (data: object) => api.post('/api/auth/forgot-password', data),
  resetPassword:       (data: object) => api.post('/api/auth/reset-password', data),
  requestDeleteAccount:()             => api.post('/api/auth/request-delete-account'),
  confirmDeleteAccount:(data: object) => api.post('/api/auth/confirm-delete-account', data),
  cancelDeleteAccount: ()             => api.post('/api/auth/cancel-delete-account'),
};

export const productsAPI = {
  getAll:        (params?: object)          => api.get('/api/products/', { params }),
  getOne:        (id: number)               => api.get(`/api/products/${id}`),
  getCategories: ()                         => api.get('/api/products/categories'),
  getReviews:    (id: number)               => api.get(`/api/products/${id}/reviews`),
  addReview:     (id: number, data: object) => api.post(`/api/products/${id}/reviews`, data),
};

export const cartAPI = {
  get:    ()                             => api.get('/api/cart/'),
  add:    (data: object)                 => api.post('/api/cart/', data),
  update: (id: number, quantity: number) => api.put(`/api/cart/${id}?quantity=${quantity}`),
  remove: (id: number)                   => api.delete(`/api/cart/${id}`),
  clear:  ()                             => api.delete('/api/cart/'),
};

export const ordersAPI = {
  place:  (data: object) => api.post('/api/orders/', data),
  getAll: ()             => api.get('/api/orders/'),
  getOne: (id: number)   => api.get(`/api/orders/${id}`),
  cancel: (id: number)   => api.post(`/api/orders/${id}/cancel`),
};

export const adminAPI = {
  dashboard:         ()                           => api.get('/api/admin/dashboard'),
  getProducts:       ()                           => api.get('/api/admin/products'),
  createProduct:     (data: object)               => api.post('/api/admin/products', data),
  updateProduct:     (id: number, data: object)   => api.put(`/api/admin/products/${id}`, data),
  deleteProduct:     (id: number)                 => api.delete(`/api/admin/products/${id}`),
  uploadImage:       (id: number, form: FormData) => api.post(`/api/admin/products/${id}/image`, form, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getOrders:         (status?: string)            => api.get('/api/admin/orders', { params: status ? { status } : {} }),
  updateOrderStatus: (id: number, status: string) => api.put(`/api/admin/orders/${id}/status?new_status=${status}`),
  getUsers:          ()                           => api.get('/api/admin/users'),
  updateSettings:    (data: object)               => api.put('/api/admin/settings', data),
};

export default api;
