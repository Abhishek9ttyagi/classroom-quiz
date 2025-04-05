import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import submissionApi from '../../services/submissionApi';
import LoadingSpinner from '../../components/Common/LoadingSpinner';
import ErrorMessage from '../../components/Common/ErrorMessage';

function ResultsPage() {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const [resultData, setResultData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchResultData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await submissionApi.getSubmissionResult(submissionId);
            setResultData(data);
        } catch (err) {
            console.error("Error fetching result data:", err.response?.data || err.message);
             if (err.response?.status === 404) {
                 setError("Submission result not found.");
             } else if (err.response?.status === 403) {
                 setError("You are not authorized to view these results.");
             } else {
                setError(err.response?.data?.message || 'Failed to load results.');
            }
        } finally {
            setLoading(false);
        }
    }, [submissionId]);


    useEffect(() => {
        fetchResultData();
    }, [fetchResultData]);

    const getOptionClassName = (option, selectedOption, correctAnswer) => {
        let className = 'flex items-center p-3 border rounded mb-2'; // Base style

        if (option === correctAnswer) {
            className += ' bg-green-100 border-green-400'; // Correct answer style
        }

        if (option === selectedOption) {
             if (option === correctAnswer) {
                 className += ' ring-2 ring-green-500'; // User selected correct answer
             } else {
                className += ' bg-red-100 border-red-400 ring-2 ring-red-500'; // User selected incorrect answer
            }
        } else if (option !== correctAnswer) {
            className += ' opacity-70'; // Non-selected, non-correct options slightly faded
        }

        return className;
    };


    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
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


    if (!resultData) {
        return <p>No result data available.</p>;
    }

    const scorePercentage = ((resultData.score / resultData.totalQuestions) * 100).toFixed(1);

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-4">Assessment Results</h1>
            <div className="bg-white p-6 rounded shadow-md mb-6">
                <h2 className="text-2xl font-semibold mb-3">{resultData.assessmentTitle}</h2>
                <p className="text-lg mb-1">
                    Your Score: <span className="font-bold">{resultData.score}</span> out of {resultData.totalQuestions}
                     <span className={`ml-2 font-bold ${resultData.score / resultData.totalQuestions >= 0.5 ? 'text-green-700' : 'text-red-700'}`}>
                        ({scorePercentage}%)
                    </span>
                </p>
                <p className="text-sm text-gray-600">Submitted on: {new Date(resultData.submittedAt).toLocaleString()}</p>
            </div>

            <h3 className="text-xl font-semibold mb-4">Detailed Breakdown:</h3>

            <div className="space-y-6">
                {resultData.questions.map((q, index) => (
                    <div key={index} className="border p-5 rounded shadow bg-white">
                         <p className="text-sm text-gray-500 mb-2">Question {index + 1}</p>
                        <p className="text-lg font-medium mb-4">{q.questionText}</p>
                        <div className="space-y-2">
                            {q.options.map((option, optIndex) => (
                                <div key={optIndex} className={getOptionClassName(option, q.selectedOption, q.correctAnswer)}>
                                     {/* Radio button purely visual */}
                                    <input
                                        type="radio"
                                        readOnly
                                        checked={option === q.selectedOption}
                                        className="mr-3 h-4 w-4 border-gray-300"
                                        disabled
                                     />
                                    <span className="flex-grow">{option}</span>
                                    {option === q.correctAnswer && <span className="text-xs font-semibold text-green-700 ml-2">(Correct Answer)</span>}
                                     {option === q.selectedOption && option !== q.correctAnswer && <span className="text-xs font-semibold text-red-700 ml-2">(Your Answer)</span>}
                                </div>
                            ))}
                             {q.selectedOption === null && <p className="text-sm text-gray-500 mt-2">(Not Answered)</p>}
                        </div>
                         {q.selectedOption !== q.correctAnswer && q.selectedOption !== null && (
                             <p className="text-sm text-red-600 mt-3 font-medium">
                                 Correct answer was: {q.correctAnswer}
                             </p>
                         )}
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <button
                    onClick={() => navigate('/student/dashboard')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded shadow"
                >
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
}

export default ResultsPage;