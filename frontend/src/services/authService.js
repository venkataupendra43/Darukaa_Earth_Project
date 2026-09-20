import api from './api';

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    const { access_token, user } = response.data;
    if (access_token) {
      localStorage.setItem('darukaa_token', access_token);
      localStorage.setItem('darukaa_user', JSON.stringify(user));
    }
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    if (response.data) {
      localStorage.setItem('darukaa_user', JSON.stringify(response.data));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('darukaa_token');
    localStorage.removeItem('darukaa_user');
  },

  getStoredUser: () => {
    const userStr = localStorage.getItem('darukaa_user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('darukaa_token');
  },
};
