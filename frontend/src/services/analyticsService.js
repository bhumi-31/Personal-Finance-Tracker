import api from './api';

export const analyticsService = {
  getSummary(params = {}) {
    return api.get('/analytics/summary', { params });
  },

  getCategoryBreakdown(params = {}) {
    return api.get('/analytics/category-breakdown', { params });
  },

  getTrends(params = {}) {
    return api.get('/analytics/trends', { params });
  },

  getCacheStats() {
    return api.get('/analytics/cache-stats');
  },
};
