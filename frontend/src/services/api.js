// client/src/services/api.js
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
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

// Response interceptor to handle errors and responses
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle network errors
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(new Error('Network error'));
    }

    const { status, data } = error.response;

    // Handle authentication errors
    if (status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
      return Promise.reject(error);
    }

    // Handle forbidden errors
    if (status === 403) {
      toast.error(data?.message || 'Access denied');
      return Promise.reject(error);
    }

    // Handle validation errors
    if (status === 400 && data?.errors) {
      const errorMessages = data.errors.map(err => err.msg).join(', ');
      return Promise.reject(new Error(errorMessages));
    }

    // Handle other errors
    const message = data?.message || data?.error || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export default api;