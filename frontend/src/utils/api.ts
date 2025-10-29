import axios from 'axios';

// Base API URL
export const API_BASE_URL = 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API endpoints
export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
  },
  students: {
    getAll: '/students',
    getById: (id: number) => `/students/${id}`,
    create: '/students',
    update: (id: number) => `/students/${id}`,
    delete: (id: number) => `/students/${id}`,
  },
  attendance: {
    getAll: '/attendance',
    create: '/attendance',
    stats: '/attendance/stats',
  },
  timetable: {
    getAll: '/timetable',
    create: '/timetable',
  },
  analytics: {
    dashboard: '/analytics/dashboard',
    predictions: '/analytics/predictions',
  },
  reports: {
    getAll: '/reports',
    attendance: '/reports/attendance',
    performance: '/reports/performance',
    aiSummary: '/reports/ai-summary',
  },
  chatbot: {
    sendMessage: '/chatbot/message',
    getHistory: '/chatbot/history',
    clearHistory: '/chatbot/history',
  },
  notifications: {
    getAll: '/notifications',
    markAsRead: (id: number) => `/notifications/${id}/read`,
    markAllAsRead: '/notifications/read-all',
    delete: (id: number) => `/notifications/${id}`,
  },
};
