// src/pages/Public/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import '../../styles.css';

function HomePage() {
    const { user, loading } = useAuth();

    // Determine dashboard link based on user role
    const dashboardLink = user
        ? user.role === 'teacher'
            ? '/teacher/dashboard'
            : '/student/dashboard'
        : '/login'; // Fallback to login if not logged in

    return (
        <div className="container mx-auto p-8 text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to the MERN Quiz Platform!</h1>
            <p className="text-lg text-gray-700 mb-8">
                Create engaging MCQ assessments as a teacher, or test your knowledge as a student.
            </p>

            <div className="space-y-4">
                {loading ? (
                     <p>Loading user information...</p>
                 ) : user ? (
                    <div>
                         <p className="text-xl mb-4">You are logged in as {user.displayName} ({user.role}).</p>
                        <Link
                            to={dashboardLink}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded shadow-lg text-lg"
                        >
                            Go to Your Dashboard
                        </Link>
                    </div>
                 ) : (
                     <div>
                        <p className="text-xl mb-4">Get started by logging in:</p>
                        <Link
                            to="/login"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded shadow-lg text-lg"
                        >
                            Login / Sign Up
                        </Link>
                    </div>
                 )}
            </div>

            {/* You could add more sections here: Features, How it works, etc. */}
            <div className="mt-16 pt-8 border-t">
                 <h2 className="text-2xl font-semibold mb-4">Features</h2>
                 <ul className="list-disc list-inside text-left max-w-md mx-auto text-gray-600">
                     <li>Easy Google Sign-in for Teachers & Students</li>
                     <li>Teachers: Create, Edit, Delete MCQ Assessments</li>
                     <li>Unique Sharable Links for Assessments</li>
                     <li>Timed Quizzes</li>
                     <li>Students: Attempt Quizzes & View Results Instantly</li>
                     <li>Track Your Assessment History</li>
                 </ul>
            </div>
        </div>
    );
}

export default HomePage;