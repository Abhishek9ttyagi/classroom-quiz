import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AssessmentForm from '../../components/Teacher/AssessmentForm';
import assessmentApi from '../../services/assessmentApi';
import ErrorMessage from '../../components/Common/ErrorMessage';

function CreateAssessmentPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCreateAssessment = async (assessmentData) => {
        setLoading(true);
        setError(null);
        try {
            const newAssessment = await assessmentApi.createAssessment(assessmentData);
            console.log('Assessment created:', newAssessment);
            alert('Assessment created successfully!'); // Simple feedback
            navigate('/teacher/dashboard'); // Redirect after successful creation
        } catch (err) {
            console.error("Error creating assessment:", err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to create assessment. Please check the form and try again.');
            setLoading(false);
        }
        // No need to set loading to false on success because we navigate away
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Create New Assessment</h1>
            {error && <ErrorMessage message={error} />}
            <AssessmentForm
                onSubmit={handleCreateAssessment}
                loading={loading}
                // error={error} // Pass error down if AssessmentForm handles displaying it
             />
        </div>
    );
}

export default CreateAssessmentPage;