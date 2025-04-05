// src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true, // Send cookies with requests (needed for session auth)
});

// Optional: Add interceptors for request/response handling if needed
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific errors globally if needed (e.g., 401 Unauthorized)
    if (error.response && error.response.status === 401) {
      // Could redirect to login or refresh token if using JWT
      console.log('Unauthorized access - redirecting or handling...');
      // window.location.href = '/login'; // Example redirect
    }
    return Promise.reject(error);
  }
);

export default api;