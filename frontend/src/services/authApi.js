// src/services/authApi.js
import api from './api';

const authApi = {
  // Login URLs are handled by direct navigation/redirect, not typical API calls
  // Except for getting the current user or logging out.

  getCurrentUser: async () => {
    try {
      const response = await api.get('/auth/current_user');
      return response.data; // Returns user object or null/401 if not logged in
    } catch (error) {
       // Let the caller handle errors (e.g., AuthContext)
       console.error("Error fetching current user:", error.response?.data?.message || error.message);
       throw error; // Re-throw for handling upstream
    }
  },

  logout: async () => {
    try {
      const response = await api.get('/auth/logout');
      return response.data;
    } catch (error) {
      console.error("Logout API error:", error.response?.data?.message || error.message);
      throw error;
    }
  },

  // Helper to construct the Google login URL
  getGoogleLoginUrl: (role) => {
    if (role !== 'teacher' && role !== 'student') {
        console.error("Invalid role specified for Google login URL");
        return '#'; // Return a safe non-functional link
    }
    // Construct the URL pointing to your backend endpoint
    const backendUrl = process.env.REACT_APP_API_URL.replace('/api', ''); // Get base backend URL
     return `${backendUrl}/api/auth/google?role=${role}`;
  }
};

export default authApi;