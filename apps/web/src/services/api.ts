import axios from 'axios';
import {
  AuthResponse,
  DoctorSummary,
  HospitalSummary,
  DoctorAvailability,
  Appointment,
  InAppNotification,
} from '@vacantup/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('vacantup_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/login', credentials);
    return res.data.data;
  },
  register: async (userData: { name: string; email: string; password: string; role?: string; phone?: string }) => {
    const res = await apiClient.post<{ success: boolean; data: AuthResponse }>('/auth/register', userData);
    return res.data.data;
  },
  getMe: async () => {
    const res = await apiClient.get<{ success: boolean; data: any }>('/auth/me');
    return res.data.data;
  },
  logout: async () => {
    const res = await apiClient.post('/auth/logout');
    return res.data;
  },
};

// Doctor APIs
export const doctorApi = {
  getAll: async (params?: { city?: string; specialty?: string; query?: string; hospitalId?: string; date?: string; maxFee?: number }) => {
    const res = await apiClient.get<{ success: boolean; count: number; data: DoctorSummary[] }>('/doctors', { params });
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: any }>(`/doctors/${id}`);
    return res.data.data;
  },
  getAvailability: async (id: string, date: string) => {
    const res = await apiClient.get<{ success: boolean; data: DoctorAvailability }>(`/doctors/${id}/availability`, {
      params: { date },
    });
    return res.data.data;
  },
};

// Hospital APIs
export const hospitalApi = {
  getAll: async (params?: { city?: string; query?: string }) => {
    const res = await apiClient.get<{ success: boolean; count: number; data: HospitalSummary[] }>('/hospitals', { params });
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: any }>(`/hospitals/${id}`);
    return res.data.data;
  },
  create: async (data: any) => {
    const res = await apiClient.post<{ success: boolean; data: any }>('/hospitals', data);
    return res.data.data;
  },
};

// Appointment APIs
export const appointmentApi = {
  create: async (data: { doctorId: string; hospitalId: string; appointmentDate: string; appointmentTime: string; notes?: string }) => {
    const res = await apiClient.post<{ success: boolean; message: string; data: Appointment }>('/appointments', data);
    return res.data.data;
  },
  getMy: async (filter?: 'upcoming' | 'past' | 'cancelled') => {
    const res = await apiClient.get<{ success: boolean; count: number; data: Appointment[] }>('/appointments/my', {
      params: { filter },
    });
    return res.data.data;
  },
  getById: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: Appointment }>(`/appointments/${id}`);
    return res.data.data;
  },
  cancel: async (id: string, reason?: string) => {
    const res = await apiClient.post<{ success: boolean; data: Appointment }>(`/appointments/${id}/cancel`, { reason });
    return res.data.data;
  },
  reschedule: async (id: string, data: { appointmentDate: string; appointmentTime: string; reason?: string }) => {
    const res = await apiClient.post<{ success: boolean; data: Appointment }>(`/appointments/${id}/reschedule`, data);
    return res.data.data;
  },
};

// Schedule APIs
export const scheduleApi = {
  getDoctorSchedules: async (doctorId: string) => {
    const res = await apiClient.get<{ success: boolean; data: { schedules: any[]; exceptions: any[] } }>(`/schedules/${doctorId}`);
    return res.data.data;
  },
  updateSlot: async (doctorId: string, config: any) => {
    const res = await apiClient.post(`/schedules/${doctorId}`, config);
    return res.data;
  },
  addException: async (doctorId: string, exception: { date: string; reason: string; isLeave?: boolean }) => {
    const res = await apiClient.post(`/schedules/${doctorId}/exception`, exception);
    return res.data;
  },
  deleteException: async (exceptionId: string) => {
    const res = await apiClient.delete(`/schedules/exception/${exceptionId}`);
    return res.data;
  },
};

// Notification APIs
export const notificationApi = {
  getMy: async () => {
    const res = await apiClient.get<{ success: boolean; data: { notifications: InAppNotification[]; unreadCount: number } }>(
      '/notifications'
    );
    return res.data.data;
  },
  markRead: async (id: string) => {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllRead: async () => {
    const res = await apiClient.post('/notifications/read-all');
    return res.data;
  },
};

// Metadata APIs
export const metaApi = {
  getCities: async () => {
    const res = await apiClient.get<{ success: boolean; data: { name: string; doctorCount: number; hospitalCount: number }[] }>('/meta/cities');
    return res.data.data;
  },
  getSpecialties: async () => {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/meta/specialties');
    return res.data.data;
  },
};

// Admin APIs
export const adminApi = {
  getStats: async () => {
    const res = await apiClient.get<{ success: boolean; data: any }>('/admin/stats');
    return res.data.data;
  },
  getUsers: async () => {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/admin/users');
    return res.data.data;
  },
  verifyDoctor: async (doctorId: string, isVerified: boolean) => {
    const res = await apiClient.patch(`/admin/doctors/${doctorId}/verify`, { isVerified });
    return res.data;
  },
  verifyHospital: async (hospitalId: string, isVerified: boolean) => {
    const res = await apiClient.patch(`/admin/hospitals/${hospitalId}/verify`, { isVerified });
    return res.data;
  },
  getAuditLogs: async () => {
    const res = await apiClient.get<{ success: boolean; data: any[] }>('/admin/audit-logs');
    return res.data.data;
  },
};
