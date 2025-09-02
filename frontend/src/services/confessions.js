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

  async updateConfession(id, confessionData) {
    const response = await api.put(`/confessions/${id}`, confessionData);
    return response.data;
  },

  async deleteConfession(id) {
    const response = await api.delete(`/confessions/${id}`);
    return response.data;
  },

  async createChapter(confessionId, chapterData) {
    const response = await api.post(`/confessions/${confessionId}/chapters`, chapterData);
    return response.data;
  },

  async updateChapter(confessionId, chapterId, chapterData) {
    const response = await api.put(`/confessions/${confessionId}/chapters/${chapterId}`, chapterData);
    return response.data;
  },

  async likeConfession(confessionId) {
    const response = await api.post(`/confessions/${confessionId}/like`);
    return response.data;
  },

  async getUserConfessions(userId, params = {}) {
    const response = await api.get('/confessions', { 
      params: { ...params, userId } 
    });
    return response.data;
  }
};
