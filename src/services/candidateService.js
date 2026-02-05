import api from './api';

const candidateService = {
  getDashboard: async () => {
    const response = await api.get('/candidate/dashboard');
    return response.data;
  },

  getSelectionStatus: async () => {
    const response = await api.get('/candidate/status');
    return response.data;
  },
};

export default candidateService;
