import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import assessmentApi from '../../services/assessmentApi';
import AssessmentAttempt from '../../components/Student/AssessmentAttempt';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';

function TakeAssessmentPage() {
    const { assessmentId } = useParams();
    const navigate = useNavigate();
    const [assessment, setAssessment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [alreadyAttempted, setAlreadyAttempted] = useState(false);
    const [submissionIdForRedirect, setSubmissionIdForRedirect] = useState(null);


    const fetchAssessmentData = useCallback(async () => {
        setLoading(true);
        setError(null);
        setAlreadyAttempted(false);
        setSubmissionIdForRedirect(null);

        try {
            const data = await assessmentApi.getAssessmentById(assessmentId);
            if (data) {
                 setAssessment(data);
            } else {
                // This case might indicate an issue or potentially already attempted if backend returns null/specific code
                 setError("Could not load assessment details.");
            }
        } catch (err) {
            console.error("Error fetching assessment:", err.response?.data || err.message);
             // Specifically check for the "already attempted" error from the backend
             if (err.response?.status === 403 && err.response?.data?.message.includes('already attempted')) {
                setError(err.response.data.message);
                setAlreadyAttempted(true);
                 setSubmissionIdForRedirect(err.response.data.submissionId); // Get submission ID if backend provides it
            } else if (err.response?.status === 404) {
                setError("Assessment not found.");
             } else if (err.response?.status === 403) { // General forbidden (not student?)
                 setError("You are not authorized to take this assessment.");
             }
             else {
                setError(err.response?.data?.message || 'Failed to load assessment.');
            }
        } finally {
            setLoading(false);
        }
     }, [assessmentId]); // Dependency: assessmentId


    useEffect(() => {
        fetchAssessmentData();
    }, [fetchAssessmentData]); // Fetch on mount or when ID changes

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        // Special handling for already attempted error
         if (alreadyAttempted && submissionIdForRedirect) {
            return (
                 <div className="container mx-auto p-4 text-center">
                     <ErrorMessage message={error} />
                     <button
                         onClick={() => navigate(`/results/${submissionIdForRedirect}`)}
                         className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                     >
                         View Your Results
                     </button>
                      <button
                         onClick={() => navigate('/student/dashboard')}
                         className="mt-4 ml-2 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                     >
                         Go to Dashboard
                     </button>
                 </div>
             );
         } else if (alreadyAttempted) { // If ID not available for some reason
              return (
                 <div className="container mx-auto p-4 text-center">
                     <ErrorMessage message={error} />
                      <button
                         onClick={() => navigate('/student/dashboard')}
                         className="mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                     >
                         Go to Dashboard
                     </button>
                 </div>
             );
         }
        // General error display
        return (
             <div className="container mx-auto p-4 text-center">
                 <ErrorMessage message={error} />
                 <button
                     onClick={() => navigate('/student/dashboard')}
                     className="mt-4 bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                 >
                     Go to Dashboard
                 </button>
             </div>
         );
    }


    if (!assessment) {
        // Should be covered by error state, but as a fallback
        return <p>Could not load assessment data.</p>;
    }


    return (
        <div className="container mx-auto p-4">
             {/* Pass the fetched assessment data (without answers) to the attempt component */}
            <AssessmentAttempt assessment={assessment} />
        </div>
    );
}

export default TakeAssessmentPage;