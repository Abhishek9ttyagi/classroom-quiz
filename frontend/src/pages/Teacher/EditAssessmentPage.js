import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AssessmentForm from '../../components/Teacher/AssessmentForm';
import assessmentApi from '../../services/assessmentApi';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';

function EditAssessmentPage() {
    const { assessmentId } = useParams();
    const navigate = useNavigate();
    const [assessmentData, setAssessmentData] = useState(null);
    const [loading, setLoading] = useState(true); // Loading initial data
    const [updating, setUpdating] = useState(false); // Loading during update submission
    const [error, setError] = useState(null);

    const fetchAssessment = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await assessmentApi.getAssessmentById(assessmentId);
             // Ensure the fetched data is suitable for the form (e.g., questions exist)
             if (data && data.questions) {
                setAssessmentData(data);
            } else {
                 throw new Error("Invalid assessment data received.");
            }
        } catch (err) {
            console.error("Error fetching assessment for edit:", err.response?.data || err.message);
             // Handle specific errors like 403 Forbidden (not owner) or 404 Not Found
             if (err.response?.status === 404) {
                setError("Assessment not found.");
             } else if (err.response?.status === 403) {
                 setError("You are not authorized to edit this assessment.");
                 // Optionally redirect
                 // navigate('/teacher/dashboard');
             }
             else {
                setError(err.response?.data?.message || 'Failed to load assessment data.');
            }
        } finally {
            setLoading(false);
        }
     }, [assessmentId]); // Add navigate if using it in error handling


    useEffect(() => {
        fetchAssessment();
    }, [fetchAssessment]);


    const handleUpdateAssessment = async (updatedData) => {
        setUpdating(true);
        setError(null);
        try {
            await assessmentApi.updateAssessment(assessmentId, updatedData);
            alert('Assessment updated successfully!');
            navigate('/teacher/dashboard'); // Redirect after successful update
        } catch (err) {
            console.error("Error updating assessment:", err.response?.data || err.message);
            // Handle specific errors like trying to edit after submissions
             if (err.response?.data?.message.includes('Cannot edit assessment: Students have already submitted')) {
                 setError('Cannot edit assessment: Students have already submitted attempts.');
             } else {
                 setError(err.response?.data?.message || 'Failed to update assessment. Please check the form and try again.');
             }
            setUpdating(false);
        }
         // No need to set updating to false on success because we navigate away
    };

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error && !assessmentData) { // Show error only if we couldn't load the data at all
         return <ErrorMessage message={error} />;
    }

    if (!assessmentData) {
        // Should ideally be covered by error state, but as a fallback
        return <p>Assessment data could not be loaded.</p>;
    }


    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Edit Assessment</h1>
             {/* Display update-specific error here */}
             {error && <ErrorMessage message={error} />}
            <AssessmentForm
                onSubmit={handleUpdateAssessment}
                initialData={assessmentData}
                isEditing={true}
                loading={updating} // Pass the updating status to the form's submit button
                // error={error} // Pass error if form displays it
             />
        </div>
    );
}

export default EditAssessmentPage;