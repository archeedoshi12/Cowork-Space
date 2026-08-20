import api from './axios';

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  me: () => api.get('/auth/me'),
};

// Spaces
export const spacesAPI = {
  getAll: (params) => api.get('/spaces', { params }),
  getById: (id) => api.get(`/spaces/${id}`),
  getAvailability: (id, date) => api.get(`/spaces/${id}/availability`, { params: { date } }),
  create: (data) => api.post('/spaces', data),
  update: (id, data) => api.put(`/spaces/${id}`, data),
  delete: (id) => api.delete(`/spaces/${id}`),
};

// Bookings
export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getMy: (params) => api.get('/bookings/my', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
  getAll: (params) => api.get('/bookings', { params }),
  approve: (id, data) => api.patch(`/bookings/${id}/approve`, data),
  reject: (id, data) => api.patch(`/bookings/${id}/reject`, data),
  createMaintenance: (data) => api.post('/bookings/maintenance', data),
};
