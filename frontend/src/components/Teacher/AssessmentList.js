import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import assessmentApi from '../../services/assessmentApi';
import ErrorMessage from '../Common/ErrorMessage';
import LoadingSpinner from '../Common/LoadingSpinner'; // Assuming you have this

function AssessmentList({ assessments: initialAssessments, refreshAssessments }) {
    const [assessments, setAssessments] = useState(initialAssessments);
    const [deletingId, setDeletingId] = useState(null); // Track which assessment is being deleted
    const [error, setError] = useState(null);

    // Update local state if the prop changes (e.g., after refresh)
    useEffect(() => {
        setAssessments(initialAssessments);
    }, [initialAssessments]);


    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this assessment and all related submissions? This action cannot be undone.')) {
            return;
        }
        setDeletingId(id); // Show loading state for this specific item
        setError(null);
        try {
            await assessmentApi.deleteAssessment(id);
            // Option 1: Refresh the whole list from the parent
            if (refreshAssessments) {
                 refreshAssessments();
             }
            // Option 2: Update local state directly (simpler if parent refresh isn't needed elsewhere)
            // setAssessments(prev => prev.filter(assessment => assessment._id !== id));

        } catch (err) {
            console.error("Error deleting assessment:", err.response?.data || err.message);
            setError(err.response?.data?.message || 'Failed to delete assessment.');
        } finally {
            setDeletingId(null); // Clear loading state for this item
        }
    };

    const getShareableLink = (id) => {
        // Construct the link based on your frontend routing for students
        return `${window.location.origin}/assessment/attempt/${id}`;
    };

     const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => alert('Link copied to clipboard!'))
            .catch(err => alert('Failed to copy link.'));
    };


    if (!assessments || assessments.length === 0) {
        return <p>You haven't created any assessments yet.</p>;
    }

    return (
        <div className="space-y-4">
             {error && <ErrorMessage message={error} />}
            {assessments.map((assessment) => (
                <div key={assessment._id} className="border p-4 rounded shadow-md bg-white relative">
                    {deletingId === assessment._id && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                            <LoadingSpinner /> {/* Show spinner while deleting */}
                        </div>
                     )}
                     <h3 className="text-xl font-semibold mb-2">{assessment.title}</h3>
                    <p className="text-gray-600 mb-1 text-sm">{assessment.description || 'No description'}</p>
                     <p className="text-gray-500 text-xs mb-3">
                         Created: {new Date(assessment.createdAt).toLocaleDateString()} |
                         Questions: {assessment.questions.length} |
                         Timer: {assessment.timer} min
                     </p>
                    <div className="flex space-x-2 items-center">
                        <Link
                            to={`/teacher/assessments/edit/${assessment._id}`}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-bold py-1 px-3 rounded"
                        >
                            Edit
                        </Link>
                        <button
                            onClick={() => handleDelete(assessment._id)}
                            disabled={deletingId === assessment._id}
                            className={`bg-red-500 hover:bg-red-700 text-white text-sm font-bold py-1 px-3 rounded ${deletingId === assessment._id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                             {deletingId === assessment._id ? 'Deleting...' : 'Delete'}
                        </button>
                         <button
                             onClick={() => copyToClipboard(getShareableLink(assessment._id))}
                             className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-1 px-3 rounded"
                             title="Copy student attempt link"
                         >
                             Share Link
                         </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

// Exporting AssessmentList as default if it's the main export of this file
// If it's just a helper, you might not need the default export.
export default AssessmentList;