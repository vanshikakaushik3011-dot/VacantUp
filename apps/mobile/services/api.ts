import axios from 'axios';
import { Platform } from 'react-native';
import { storage } from './storage';

// Automatically detect best host for Android emulator or iOS simulator
const getDefaultBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getDefaultBaseUrl();

export const mobileApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

mobileApiClient.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mobile Auth APIs
export const mobileAuthApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await mobileApiClient.post('/auth/login', credentials);
    return res.data.data;
  },
  register: async (data: { name: string; email: string; password: string; role?: string; phone?: string }) => {
    const res = await mobileApiClient.post('/auth/register', data);
    return res.data.data;
  },
  getMe: async () => {
    const res = await mobileApiClient.get('/auth/me');
    return res.data.data;
  },
  logout: async () => {
    const res = await mobileApiClient.post('/auth/logout');
    return res.data;
  },
};

// Mobile Doctor APIs
export const mobileDoctorApi = {
  getAll: async (params?: { city?: string; specialty?: string; query?: string; date?: string; maxFee?: number }) => {
    const res = await mobileApiClient.get('/doctors', { params });
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await mobileApiClient.get(`/doctors/${id}`);
    return res.data.data;
  },
  getAvailability: async (id: string, date: string) => {
    const res = await mobileApiClient.get(`/doctors/${id}/availability`, { params: { date } });
    return res.data.data;
  },
};

// Mobile Hospital APIs
export const mobileHospitalApi = {
  getAll: async (params?: { city?: string; query?: string }) => {
    const res = await mobileApiClient.get('/hospitals', { params });
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await mobileApiClient.get(`/hospitals/${id}`);
    return res.data.data;
  },
};

// Mobile Appointment APIs
export const mobileAppointmentApi = {
  create: async (data: { doctorId: string; hospitalId: string; appointmentDate: string; appointmentTime: string; notes?: string }) => {
    const res = await mobileApiClient.post('/appointments', data);
    return res.data.data;
  },
  getMy: async (filter?: 'upcoming' | 'past' | 'cancelled') => {
    const res = await mobileApiClient.get('/appointments/my', { params: { filter } });
    return res.data.data;
  },
  cancel: async (id: string, reason?: string) => {
    const res = await mobileApiClient.post(`/appointments/${id}/cancel`, { reason });
    return res.data.data;
  },
  reschedule: async (id: string, data: { appointmentDate: string; appointmentTime: string; reason?: string }) => {
    const res = await mobileApiClient.post(`/appointments/${id}/reschedule`, data);
    return res.data.data;
  },
};

// Mobile Notifications APIs
export const mobileNotificationApi = {
  getMy: async () => {
    const res = await mobileApiClient.get('/notifications');
    return res.data.data;
  },
  markRead: async (id: string) => {
    const res = await mobileApiClient.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await mobileApiClient.post('/notifications/read-all');
    return res.data;
  },
};
