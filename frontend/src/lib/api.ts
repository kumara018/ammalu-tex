import axios from 'axios';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register:       (data: object) => api.post('/api/auth/register', data),
  login:          (data: object) => api.post('/api/auth/login', data),
  getMe:          ()             => api.get('/api/auth/me'),
  updateProfile:  (data: object) => api.put('/api/auth/me', data),
  forgotPassword: (data: object) => api.post('/api/auth/forgot-password', data),
  resetPassword:  (data: object) => api.post('/api/auth/reset-password', data),
};

export const productsAPI = {
  getAll:     (params?: object)       => api.get('/api/products/', { params }),
  getOne:     (id: number)            => api.get(`/api/products/${id}`),
  getCategories: ()                   => api.get('/api/products/categories'),
  getReviews: (id: number)            => api.get(`/api/products/${id}/reviews`),
  addReview:  (id: number, data: object) => api.post(`/api/products/${id}/reviews`, data),
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
  dashboard:         ()                        => api.get('/api/admin/dashboard'),
  getProducts:       ()                        => api.get('/api/admin/products'),
  createProduct:     (data: object)            => api.post('/api/admin/products', data),
  updateProduct:     (id: number, data: object)=> api.put(`/api/admin/products/${id}`, data),
  deleteProduct:     (id: number)              => api.delete(`/api/admin/products/${id}`),
  getOrders:         (status?: string)         => api.get('/api/admin/orders', { params: status ? { status } : {} }),
  updateOrderStatus: (id: number, status: string) => api.put(`/api/admin/orders/${id}/status?new_status=${status}`),
  getUsers:          ()                        => api.get('/api/admin/users'),
};

export default api;
