import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Timer from '../Common/Timer';
import QuestionCard from './QuestionCard'; // Using the separate component
import submissionApi from '../../services/submissionApi';
import ErrorMessage from '../Common/ErrorMessage';
import LoadingSpinner from '../Common/LoadingSpinner';

function AssessmentAttempt({ assessment }) {
    const navigate = useNavigate();
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    // Store answers as an object: { questionIndex: selectedOption }
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [isTimeUp, setIsTimeUp] = useState(false);
    const hasSubmitted = useRef(false); // Prevent double submission


    const totalQuestions = assessment?.questions?.length || 0;
    const currentQuestion = assessment?.questions?.[currentQuestionIndex];

    // Function to handle submitting the assessment
     const submitAssessment = useCallback(async (submittedAnswers) => {
         // Prevent multiple submissions
         if (hasSubmitted.current) {
            console.log("Submission attempt blocked: Already submitted.");
            return;
         }
        hasSubmitted.current = true; // Mark as submitted immediately

        setIsSubmitting(true);
        setSubmitError(null);
        console.log("Submitting assessment...");

        // Format answers for the API: Array of { questionIndex: number, selectedOption: string }
        const formattedAnswers = Object.entries(submittedAnswers).map(([index, option]) => ({
            questionIndex: parseInt(index, 10),
            selectedOption: option,
        }));

         // Include answers for questions the user might not have visited/answered
         for (let i = 0; i < totalQuestions; i++) {
             if (!submittedAnswers.hasOwnProperty(i)) {
                 formattedAnswers.push({ questionIndex: i, selectedOption: null }); // Or an empty string, based on backend expectation
             }
         }


        try {
            const result = await submissionApi.submitAssessment(assessment._id, formattedAnswers);
            console.log('Submission successful:', result);
            // Navigate to the results page
            navigate(`/results/${result.submissionId}`, { replace: true });
        } catch (err) {
            console.error("Error submitting assessment:", err.response?.data || err.message);
            setSubmitError(err.response?.data?.message || 'Failed to submit assessment.');
            setIsSubmitting(false); // Allow retry if submission failed
            hasSubmitted.current = false; // Reset submission flag on error
        }
        // No need to set isSubmitting to false on success because we navigate away
    }, [assessment?._id, totalQuestions, navigate]); // Dependencies for the submission logic


    // Handler for timer expiring
    const handleTimeUp = useCallback(() => {
         console.log("Time is up! Forcing submission.");
         if (!hasSubmitted.current) {
             setIsTimeUp(true); // Indicate time is up visually if needed
            alert("Time's up! Your assessment will be submitted automatically with your current answers.");
            submitAssessment(answers); // Submit with current answers
         }
    }, [submitAssessment, answers]); // Include answers state


    const handleOptionSelect = (option) => {
        setAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: option
        }));
    };

    const goToNextQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const goToPreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleFinalSubmit = () => {
         if (!hasSubmitted.current) {
            // Optional: Confirmation before manual submit
            if (window.confirm('Are you sure you want to submit your assessment?')) {
                submitAssessment(answers);
            }
         }
    };

     // Effect to prevent leaving the page accidentally while taking the quiz
     useEffect(() => {
         const handleBeforeUnload = (event) => {
             if (!hasSubmitted.current && !isSubmitting && totalQuestions > 0 && !isTimeUp) { // Only warn if quiz started and not finished/submitting
                 event.preventDefault();
                 // Standard way to trigger browser's native confirmation dialog
                 event.returnValue = '';
             }
         };

         window.addEventListener('beforeunload', handleBeforeUnload);

         return () => {
             window.removeEventListener('beforeunload', handleBeforeUnload);
         };
     }, [isSubmitting, totalQuestions, isTimeUp]); // Re-attach listener if these states change


    if (!assessment || !currentQuestion) {
        return <p>Loading assessment question...</p>; // Or a spinner
    }

    const selectedOption = answers[currentQuestionIndex] || null; // Get selected option for current question

    return (
        <div className="assessment-attempt max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-2">{assessment.title}</h2>
             <div className="mb-4 p-3 bg-gray-100 rounded flex justify-between items-center">
                <p className="text-gray-700">{assessment.description}</p>
                 <Timer durationMinutes={assessment.timer} onTimeUp={handleTimeUp} />
            </div>

            {isTimeUp && <ErrorMessage message="Time's up! Submitting your answers..." />}
            {submitError && <ErrorMessage message={submitError} />}

             <QuestionCard
                question={currentQuestion}
                questionIndex={currentQuestionIndex}
                totalQuestions={totalQuestions}
                selectedOption={selectedOption}
                onOptionSelect={handleOptionSelect}
            />

            <div className="flex justify-between mt-6">
                <button
                    onClick={goToPreviousQuestion}
                    disabled={currentQuestionIndex === 0 || isSubmitting || isTimeUp}
                    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
                >
                    Previous
                </button>

                 {currentQuestionIndex < totalQuestions - 1 ? (
                    <button
                        onClick={goToNextQuestion}
                        disabled={isSubmitting || isTimeUp}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded disabled:opacity-50"
                    >
                        Next
                    </button>
                 ) : (
                     <button
                        onClick={handleFinalSubmit}
                        disabled={isSubmitting || isTimeUp}
                         className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-6 rounded ${isSubmitting ? 'opacity-50 cursor-wait' : ''} disabled:opacity-50`}
                     >
                         {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                    </button>
                 )}
            </div>
        </div>
    );
}

export default AssessmentAttempt;