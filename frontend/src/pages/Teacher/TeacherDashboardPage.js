import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import assessmentApi from '../../services/assessmentApi';
import AssessmentList from '../../components/Teacher/AssessmentList'; // Updated import
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';
import useAuth from '../../hooks/useAuth'; // To display user name perhaps

function TeacherDashboardPage() {
    const { user } = useAuth(); // Get logged in user info if needed
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAssessments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await assessmentApi.getMyAssessments();
            setAssessments(data);
        } catch (err) {
            console.error("Error fetching assessments:", err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to load your assessments.');
        } finally {
            setLoading(false);
        }
    }, []); // Empty dependency array, fetchAssessments function is stable


    useEffect(() => {
        fetchAssessments();
    }, [fetchAssessments]); // Fetch on mount

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
                 <Link
                    to="/teacher/assessments/new"
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow"
                >
                    + Create New Assessment
                </Link>
            </div>

             {user && <p className="mb-4 text-lg">Welcome back, {user.displayName}!</p>}


            <h2 className="text-2xl font-semibold mb-4">Your Assessments</h2>
            {loading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}
             {!loading && !error && (
                <AssessmentList
                    assessments={assessments}
                    refreshAssessments={fetchAssessments} // Pass the fetch function so list can trigger refresh
                 />
             )}
        </div>
    );
}

export default TeacherDashboardPage;