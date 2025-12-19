import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
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

// Auth APIs
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getProfile = () => api.get('/auth/me');

// Medicine APIs
export const getMedicines = (params) => api.get('/medicines', { params });
export const getMedicine = (id) => api.get(`/medicines/${id}`);
export const addMedicine = (data) => api.post('/medicines', data);
export const updateMedicine = (id, data) => api.put(`/medicines/${id}`, data);
export const deleteMedicine = (id) => api.delete(`/medicines/${id}`);

// Prescription APIs
export const getPrescriptions = (params) => api.get('/prescriptions', { params });
export const getPrescription = (id) => api.get(`/prescriptions/${id}`);
export const createPrescription = (data) => api.post('/prescriptions', data);
export const completePrescription = (id) => api.post(`/prescriptions/${id}/complete`);
export const updatePrescriptionStatus = (id, status) =>
  api.put(`/prescriptions/${id}/status`, { status });

export default api;