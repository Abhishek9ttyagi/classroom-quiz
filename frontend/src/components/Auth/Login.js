// src/components/Auth/Login.js
// Note: This component mainly provides the login buttons.
// The full login logic (handling redirects, errors, role selection)
// is managed by src/pages/Auth/LoginPage.js

import React from 'react';
import authApi from '../../services/authApi';

function Login({ onLoginStart, authError }) { // Pass down handlers/state if needed

    const handleLoginClick = (role) => {
        if (onLoginStart) {
            onLoginStart(); // Notify parent that login process is starting
        }
        // Redirect the browser to the backend Google OAuth endpoint
        window.location.href = authApi.getGoogleLoginUrl(role);
    };

    return (
        <div className="w-full max-w-sm p-6 bg-white rounded shadow-md">
            <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
            {authError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4" role="alert">
                    {authError}
                </div>
            )}
            <p className="mb-4 text-center text-gray-600">Select your role to login with Google:</p>
            <div className="space-y-4">
                <button
                    onClick={() => handleLoginClick('teacher')}
                    className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    {/* You can add a Google Icon here */}
                    Login as Teacher
                </button>
                <button
                    onClick={() => handleLoginClick('student')}
                    className="w-full bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    {/* You can add a Google Icon here */}
                    Login as Student
                </button>
            </div>
        </div>
    );
}

export default Login;