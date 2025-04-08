// src/services/assessmentApi.js
import api from './api';

const assessmentApi = {
  // --- Teacher ---
  createAssessment: async (assessmentData) => {
    const response = await api.post('/assessments', assessmentData);
    return response.data;
  },

  getMyAssessments: async () => {
    const response = await api.get('/assessments'); // Backend filters by logged-in teacher
    return response.data;
  },

  updateAssessment: async (id, assessmentData) => {
    const response = await api.put(`/assessments/${id}`, assessmentData);
    return response.data;
  },

  deleteAssessment: async (id) => {
    const response = await api.delete(`/assessments/${id}`);
    return response.data; // Usually a success message
  },

  // --- Teacher/Student ---
  getAssessmentById: async (id) => {
      // Backend handles role-based filtering (answers hidden for students)
     const response = await api.get(`/assessments/${id}`);
     return response.data;
  },
};

export default assessmentApi;