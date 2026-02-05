import api from './api';

const authService = {
  register: async (name, email, password, role) => {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      role,
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', {
      email,
      password,
    });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  forgotPassword: async (email, newPassword) => {
    const response = await api.post('/auth/forgot-password', { 
      email, 
      newPassword 
    });
    return response.data;
  },

  resetPassword: async (email, newPassword) => {
    const response = await api.post('/auth/forgot-password', { 
      email, 
      newPassword 
    });
    return response.data;
  },
};

export default authService;
