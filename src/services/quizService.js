import api from './api';

const quizService = {
  // Admin methods
  createQuiz: async (quizData) => {
    const response = await api.post('/quiz', quizData);
    return response.data;
  },

  getAllQuizzes: async () => {
    const response = await api.get('/quiz/admin/all');
    return response.data;
  },

  getQuizById: async (quizId) => {
    const response = await api.get(`/quiz/admin/${quizId}`);
    return response.data;
  },

  updateQuiz: async (quizId, quizData) => {
    const response = await api.put(`/quiz/${quizId}`, quizData);
    return response.data;
  },

  deleteQuiz: async (quizId) => {
    const response = await api.delete(`/quiz/${quizId}`);
    return response.data;
  },

  toggleQuizStatus: async (quizId) => {
    const response = await api.patch(`/quiz/${quizId}/toggle-status`);
    return response.data;
  },

  getQuizResponses: async (quizId) => {
    const response = await api.get(`/quiz/${quizId}/responses`);
    return response.data;
  },

  getQuizStatistics: async (quizId) => {
    const response = await api.get(`/quiz/${quizId}/statistics`);
    return response.data;
  },

  // Candidate methods
  getQuizByLink: async (quizLink) => {
    const response = await api.get(`/quiz/link/${quizLink}`);
    return response.data;
  },

  submitQuizAnswers: async (submissionData) => {
    const response = await api.post(`/quiz/submit`, submissionData);
    return response.data;
  },

  getCandidateQuizResult: async (quizResponseId) => {
    const response = await api.get(`/quiz/result/${quizResponseId}`);
    return response.data;
  },

  getCandidateQuizzes: async (candidateId) => {
    const response = await api.get(`/quiz/candidate/${candidateId}`);
    return response.data;
  },
};

export default quizService;
