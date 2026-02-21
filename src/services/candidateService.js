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

  getQuizHistory: async () => {
    const response = await api.get('/quiz/candidate/me');
    return response.data;
  },
};

export default candidateService;
