// src/App.js
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from './hooks/useAuth';

// Common Components
import Navbar from './components/Common/Navbar';
import LoadingSpinner from './components/Common/LoadingSpinner';

// Page Components
import HomePage from './pages/Public/HomePage'; // Optional public landing
import LoginPage from './pages/Auth/LoginPage';
import TeacherDashboardPage from './pages/Teacher/TeacherDashboardPage';
import CreateAssessmentPage from './pages/Teacher/CreateAssessmentPage';
import EditAssessmentPage from './pages/Teacher/EditAssessmentPage';
import StudentDashboardPage from './pages/Student/StudentDashboardPage';
import TakeAssessmentPage from './pages/Student/TakeAssessmentPage';
import ResultsPage from './pages/Student/ResultsPage';
import NotFoundPage from './pages/NotFoundPage';

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <LoadingSpinner />; // Show loading indicator while auth state is resolving
    }

    if (!user) {
        // Not logged in, redirect to login page
         // Pass the intended destination URL so login can redirect back
         const returnUrl = window.location.pathname + window.location.search;
        return <Navigate to={`/login?returnUrl=${encodeURIComponent(returnUrl)}`} replace />;
    }

    if (roles && !roles.includes(user.role)) {
        // Logged in but wrong role, redirect based on their actual role or to a generic 'forbidden' page
         console.warn(`Access denied: User role '${user.role}' not in allowed roles '${roles.join(', ')}'`);
         // Redirect to their respective dashboard or a generic unauthorized page
         return user.role === 'teacher' ? <Navigate to="/teacher/dashboard" replace /> : <Navigate to="/student/dashboard" replace />;
         // Or: return <Navigate to="/unauthorized" replace />;
    }

    // User is authenticated and has the correct role (or no specific role required)
    return children;
};


function App() {
  const { user, loading } = useAuth(); // Use auth state here if needed for Navbar etc.

  // Could potentially show a global loading spinner here instead of inside ProtectedRoute
  // if (loading) return <LoadingSpinner />;

  return (
    <div className="App">
      <Navbar /> {/* Navbar can use useAuth() to display user info/logout */}
      <main className="container mx-auto p-4"> {/* Basic container styling */}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Teacher Routes */}
          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute roles={['teacher']}>
                <TeacherDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/assessments/new"
            element={
              <ProtectedRoute roles={['teacher']}>
                <CreateAssessmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teacher/assessments/edit/:assessmentId"
            element={
              <ProtectedRoute roles={['teacher']}>
                <EditAssessmentPage />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute roles={['student']}>
                <StudentDashboardPage />
              </ProtectedRoute>
            }
          />
           <Route
            path="/assessment/attempt/:assessmentId" // Unique link for students
            element={
              <ProtectedRoute roles={['student']}>
                <TakeAssessmentPage />
              </ProtectedRoute>
            }
          />
           <Route
            path="/results/:submissionId" // View specific result details
            element={
              <ProtectedRoute roles={['student']}>
                <ResultsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Not Found Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;