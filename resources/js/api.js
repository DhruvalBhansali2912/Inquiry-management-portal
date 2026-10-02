import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Request interceptor to attach Bearer token if saved in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('inquiry_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for handling 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('inquiry_auth_token');
      localStorage.removeItem('inquiry_auth_user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  getTeam: () => api.get('/team'),
};

export const publicApi = {
  submitInquiry: (formData) => api.post('/inquiries', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const inquiriesApi = {
  getAll: (params) => api.get('/inquiries', { params }),
  getOne: (id) => api.get(`/inquiries/${id}`),
  updateStatus: (id, data) => api.patch(`/inquiries/${id}/status`, data),
  assign: (id, assigned_to) => api.patch(`/inquiries/${id}/assign`, { assigned_to }),
  delete: (id) => api.delete(`/inquiries/${id}`),
  exportCsv: (params) => {
    return api.get('/inquiries/export', {
      params,
      responseType: 'blob',
    });
  },
  addNote: (inquiryId, data) => api.post(`/inquiries/${inquiryId}/notes`, data),
  deleteNote: (inquiryId, noteId) => api.delete(`/inquiries/${inquiryId}/notes/${noteId}`),
  addReminder: (inquiryId, data) => api.post(`/inquiries/${inquiryId}/reminders`, data),
  uploadAttachment: (inquiryId, formData) => api.post(`/inquiries/${inquiryId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAttachment: (inquiryId, attachmentId) => api.delete(`/inquiries/${inquiryId}/attachments/${attachmentId}`),
  getDownloadUrl: (inquiryId, attachmentId) => `/api/inquiries/${inquiryId}/attachments/${attachmentId}/download`,
};

export const dashboardApi = {
  getMetrics: () => api.get('/dashboard/metrics'),
};

export const remindersApi = {
  getUpcoming: () => api.get('/reminders/upcoming'),
  toggle: (id) => api.patch(`/reminders/${id}/toggle`),
};

export default api;
