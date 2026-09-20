import api from './api';

export const siteService = {
  getSitesByProject: async (projectId) => {
    const response = await api.get(`/projects/${projectId}/sites`);
    return response.data;
  },

  createSite: async (projectId, siteData) => {
    const response = await api.post(`/projects/${projectId}/sites`, siteData);
    return response.data;
  },

  getSiteById: async (siteId) => {
    const response = await api.get(`/sites/${siteId}`);
    return response.data;
  },

  updateSite: async (siteId, siteData) => {
    const response = await api.put(`/sites/${siteId}`, siteData);
    return response.data;
  },

  deleteSite: async (siteId) => {
    const response = await api.delete(`/sites/${siteId}`);
    return response.data;
  },

  getSiteMetrics: async (siteId) => {
    const response = await api.get(`/sites/${siteId}/metrics`);
    return response.data;
  },

  addSiteMetric: async (siteId, metricData) => {
    const response = await api.post(`/sites/${siteId}/metrics`, metricData);
    return response.data;
  },
};
