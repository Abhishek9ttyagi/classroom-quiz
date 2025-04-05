// src/services/submissionApi.js
import api from './api';

const submissionApi = {
  // --- Student ---
  submitAssessment: async (assessmentId, answers) => {
    const response = await api.post(`/submissions/${assessmentId}`, { answers });
    return response.data; // Contains submissionId, score, totalQuestions
  },

  getMySubmissions: async () => {
    const response = await api.get('/submissions/my-results');
    return response.data; // Array of submission objects with populated assessment title etc.
  },

  getSubmissionResult: async (submissionId) => {
    const response = await api.get(`/submissions/${submissionId}`);
    return response.data; // Detailed result with questions, correct answers, selected answers
  },
};

export default submissionApi;