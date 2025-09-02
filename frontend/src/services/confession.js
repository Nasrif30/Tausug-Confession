import api from './api';

export const confessionService = {
  async getConfessions(params = {}) {
    const response = await api.get('/confessions', { params });
    return response.data;
  },

  async getConfessionById(id) {
    const response = await api.get(`/confessions/${id}`);
    return response.data;
  },

  async createConfession(confessionData) {
    const response = await api.post('/confessions', confessionData);
    return response.data;
  },

  async createChapter(confessionId, chapterData) {
    const response = await api.post(`/confessions/${confessionId}/chapters`, chapterData);
    return response.data;
  },

  async likeConfession(confessionId) {
    const response = await api.post(`/confessions/${confessionId}/like`);
    return response.data;
  }
};
