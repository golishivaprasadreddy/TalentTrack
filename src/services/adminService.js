import api from './api';

const adminService = {
  createRecruitmentDrive: async (driveData) => {
    const response = await api.post('/admin/drives', driveData);
    return response.data;
  },

  getAllDrives: async () => {
    const response = await api.get('/admin/drives');
    return response.data;
  },

  getDriveDetails: async (driveId) => {
    const response = await api.get(`/admin/drives/${driveId}`);
    return response.data;
  },

  getPanelMembers: async () => {
    const response = await api.get('/admin/panel-members');
    return response.data;
  },

  addRound: async (driveId, roundData) => {
    const response = await api.post(`/admin/drives/${driveId}/rounds`, roundData);
    return response.data;
  },

  addCandidates: async (driveId, candidates) => {
    const response = await api.post(`/admin/drives/${driveId}/candidates`, { candidates });
    return response.data;
  },

  assignPanelToRound: async (roundId, panelMemberIds) => {
    const response = await api.post(`/admin/rounds/${roundId}/assign-panel`, {
      panelMemberIds,
    });
    return response.data;
  },

  addCandidatesToRound: async (roundId, candidateIds) => {
    const response = await api.post(`/admin/rounds/${roundId}/add-candidates`, {
      candidateIds,
    });
    return response.data;
  },

  getRoundResults: async (roundId) => {
    const response = await api.get(`/admin/rounds/${roundId}/results`);
    return response.data;
  },

  approveCandidate: async (resultId, decision) => {
    const response = await api.put(`/admin/results/${resultId}/approve`, {
      decision,
    });
    return response.data;
  },

  promoteToNextRound: async (roundId) => {
    const response = await api.post(`/admin/rounds/${roundId}/promote`);
    return response.data;
  },

  getAllCandidates: async () => {
    const response = await api.get('/admin/candidates');
    return response.data;
  },
};

export default adminService;
