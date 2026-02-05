import api from './api';

const panelService = {
  getAssignedRounds: async () => {
    const response = await api.get('/panel/rounds');
    return response.data;
  },

  getAssignedCandidates: async (roundId) => {
    const response = await api.get(`/panel/rounds/${roundId}/candidates`);
    return response.data;
  },

  submitEvaluation: async (roundId, candidateId, evaluationData) => {
    const response = await api.post(
      `/panel/rounds/${roundId}/candidates/${candidateId}/evaluate`,
      evaluationData
    );
    return response.data;
  },

  getEvaluations: async (roundId) => {
    const response = await api.get(`/panel/rounds/${roundId}/evaluations`);
    return response.data;
  },

  getCandidateEvaluation: async (roundId, candidateId) => {
    const response = await api.get(
      `/panel/rounds/${roundId}/candidates/${candidateId}/evaluations`
    );
    return response.data;
  },
};

export default panelService;
