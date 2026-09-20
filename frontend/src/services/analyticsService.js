import api from './api';

export const analyticsService = {
  getSiteAnalytics: async (siteId) => {
    const response = await api.get(`/sites/${siteId}/analytics`);
    return response.data;
  },
};
