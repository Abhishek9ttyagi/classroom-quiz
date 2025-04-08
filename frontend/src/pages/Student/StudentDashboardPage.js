import React, { useState, useEffect, useCallback } from 'react';
import submissionApi from '../../services/submissionApi';
import ResultList from '../../components/Student/ResultList';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';
import useAuth from '../../hooks/useAuth';

function StudentDashboardPage() {
    const { user } = useAuth();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSubmissions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await submissionApi.getMySubmissions();
            setSubmissions(data);
        } catch (err) {
            console.error("Error fetching submissions:", err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to load your assessment history.');
        } finally {
            setLoading(false);
        }
     }, []); // stable function


    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]); // Fetch on mount

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>
            {user && <p className="mb-4 text-lg">Welcome, {user.displayName}!</p>}

            <h2 className="text-2xl font-semibold mb-4">Your Assessment Attempts</h2>
            {loading && <LoadingSpinner />}
            {error && <ErrorMessage message={error} />}
            {!loading && !error && <ResultList submissions={submissions} />}
             {/* You could add a section here to find new assessments if needed */}
        </div>
    );
}

export default StudentDashboardPage;