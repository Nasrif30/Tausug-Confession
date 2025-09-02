import api from './api';

export const userService = {
  async getUsers(params = {}) {
    const response = await api.get('/users', { params });
    return response.data;
  },

  async getUserById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  async updateUserRole(id, role) {
    const response = await api.put(`/users/${id}/role`, { role });
    return response.data;
  },

  async getUserStats(id) {
    const response = await api.get(`/users/${id}/stats`);
    return response.data;
  }
};
