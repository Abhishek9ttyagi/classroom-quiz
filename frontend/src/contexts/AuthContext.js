// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useCallback } from 'react';
import authApi from '../services/authApi';
import LoadingSpinner from '../components/Common/LoadingSpinner'; // Assuming you have this component

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Start loading initially
  const [authError, setAuthError] = useState(null);

   const checkAuthState = useCallback(async () => {
        setLoading(true);
        setAuthError(null);
        try {
            const currentUser = await authApi.getCurrentUser();
            setUser(currentUser); // Set user if logged in, null otherwise
        } catch (error) {
             // This usually means not logged in (401) or server error
             console.error('Auth check failed:', error.response?.data?.message || error.message);
             setUser(null);
            // Optionally set an error state if it's not a simple 401
             if (error.response?.status !== 401) {
                 setAuthError('Failed to check authentication status.');
             }
        } finally {
            setLoading(false);
        }
   }, []); // Empty dependency array means this function is created once


  useEffect(() => {
    checkAuthState();
  }, [checkAuthState]); // Run checkAuthState on mount and whenever it changes (though it shouldn't)


  const logout = async () => {
    setLoading(true);
    try {
      await authApi.logout();
      setUser(null);
      // Optionally redirect here or let consuming components handle redirect
    } catch (error) {
      console.error('Logout failed:', error);
       setAuthError('Logout failed. Please try again.');
    } finally {
        setLoading(false);
    }
  };


  const value = {
    user,
    setUser, // Might be needed if login is handled directly in context
    loading,
    authError,
    setAuthError,
    logout,
    checkAuthState // Expose checkAuthState if needed elsewhere
  };

  // Render loading spinner while checking auth state initially
  if (loading && user === null && window.location.pathname !== '/login') { // Avoid flicker on login page itself
     return <LoadingSpinner />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;