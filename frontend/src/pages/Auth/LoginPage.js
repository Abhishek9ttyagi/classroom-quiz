import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import authApi from '../../services/authApi';
import ErrorMessage from '../../components/Common/ErrorMessage'; // Create this

function LoginPage() {
    const { user, loading, authError, setAuthError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Extract error from backend redirect (query param)
    const queryParams = new URLSearchParams(location.search);
    const redirectError = queryParams.get('error');
     const returnUrl = queryParams.get('returnUrl') || '/'; // Default redirect after login


    useEffect(() => {
        // If there's an error from the backend redirect, display it
        if (redirectError) {
            setAuthError(decodeURIComponent(redirectError));
            // Clean the URL - remove error param after displaying
            navigate('/login', { replace: true });
        }
    }, [redirectError, setAuthError, navigate]);

     useEffect(() => {
         // If user is already logged in, redirect them away from login page
         if (!loading && user) {
             const redirectTo = returnUrl !== '/'
                ? returnUrl
                : user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
             navigate(redirectTo, { replace: true });
         }
     }, [user, loading, navigate, returnUrl]);


    const handleLogin = (role) => {
         // Clear previous errors
         setAuthError(null);
        // Redirect the browser to the backend Google OAuth endpoint
        window.location.href = authApi.getGoogleLoginUrl(role);
    };

     if (loading) return <div>Loading...</div>; // Or a spinner
     if (user) return null; // Don't render login form if logged in (should be redirected)

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold mb-6">Login</h1>
            {authError && <ErrorMessage message={authError} />}
             <p className="mb-4 text-gray-600">Please select your role to login with Google:</p>
             <div className="space-y-4">
                <button
                    onClick={() => handleLogin('teacher')}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded w-full"
                >
                    Login as Teacher
                </button>
                <button
                    onClick={() => handleLogin('student')}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded w-full"
                >
                    Login as Student
                </button>
             </div>
             {/* You can add more info or links here */}
        </div>
    );
}

export default LoginPage;