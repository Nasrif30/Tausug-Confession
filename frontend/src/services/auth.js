import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },

  async googleLogin(accessToken) {
    const response = await api.post('/api/auth/google', { accessToken });
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/api/auth/profile');
    return response.data;
  },

  async updateProfile(userData) {
    const response = await api.put('/api/auth/profile', userData);
    return response.data;
  },

  async updateAvatar(formData) {
    const response = await api.post('/api/auth/avatar', formData);
    return response.data;
  },

  async linkGoogleAccount(accessToken) {
    const response = await api.post('/api/auth/google/link', { accessToken });
    return response.data;
  }
};
