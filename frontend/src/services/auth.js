import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async googleLogin(accessToken) {
    const response = await api.post('/auth/google', { accessToken });
    return response.data;
  },

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  async updateProfile(userData) {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  async updateAvatar(formData) {
    const response = await api.post('/auth/avatar', formData);
    return response.data;
  },

  async linkGoogleAccount(accessToken) {
    const response = await api.post('/auth/google/link', { accessToken });
    return response.data;
  }
};
