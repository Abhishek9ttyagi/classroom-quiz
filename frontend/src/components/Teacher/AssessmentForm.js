import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../Common/ErrorMessage'; // Assuming you have this
import QuestionInput from './QuestionInput';


// Simple Question Input sub-component logic within AssessmentForm
// function QuestionInput({ index, question, updateQuestion, removeQuestion }) {
//     const handleInputChange = (e) => {
//         updateQuestion(index, { ...question, [e.target.name]: e.target.value });
//     };

//     const handleOptionChange = (optionIndex, value) => {
//         const newOptions = [...question.options];
//         newOptions[optionIndex] = value;
//         // If the updated option was the correct answer, update correctAnswer too
//         const newCorrectAnswer = question.correctAnswer === question.options[optionIndex] ? value : question.correctAnswer;
//         updateQuestion(index, { ...question, options: newOptions, correctAnswer: newCorrectAnswer });
//     };

//      const handleCorrectAnswerChange = (e) => {
//         updateQuestion(index, { ...question, correctAnswer: e.target.value });
//     };

//     const addOption = () => {
//         updateQuestion(index, { ...question, options: [...question.options, ''] });
//     };

//     const removeOption = (optionIndex) => {
//         // Prevent removing if only two options left (or adjust logic as needed)
//         if (question.options.length <= 2) {
//             alert("Each question must have at least two options.");
//             return;
//         }
//         const newOptions = question.options.filter((_, i) => i !== optionIndex);
//         // Check if removed option was the correct answer
//         let newCorrectAnswer = question.correctAnswer;
//         if (!newOptions.includes(question.correctAnswer)) {
//             newCorrectAnswer = newOptions[0] || ''; // Default to first option or empty if none left (shouldn't happen with validation)
//         }
//         updateQuestion(index, { ...question, options: newOptions, correctAnswer: newCorrectAnswer });
//     };


//     return (
//         <>
//         <h3 className="text-lg font-semibold">Questions</h3>
//              {questions.map((q, index) => (
//                 <QuestionInput
//                     key={index} // Consider using a more stable unique ID if questions can be reordered/deleted often
//                     index={index}
//                     question={q}
//                     updateQuestion={updateQuestion} // Pass down the handler function
//                     removeQuestion={removeQuestion} // Pass down the handler function
//                 />
//             ))}
//         </>
//     );
// }


// Main Assessment Form Component
function AssessmentForm({ onSubmit, initialData = null, isEditing = false, loading = false, error = null }) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [timer, setTimer] = useState(10); // Default timer in minutes
    const [questions, setQuestions] = useState([
        { questionText: '', options: ['', ''], correctAnswer: '' } // Start with one empty question
    ]);

    useEffect(() => {
        if (isEditing && initialData) {
            setTitle(initialData.title || '');
            setDescription(initialData.description || '');
            setTimer(initialData.timer || 10);
            setQuestions(initialData.questions && initialData.questions.length > 0 ? initialData.questions : [{ questionText: '', options: ['', ''], correctAnswer: '' }]);
        }
    }, [initialData, isEditing]);

    const addQuestion = () => {
        setQuestions([...questions, { questionText: '', options: ['', ''], correctAnswer: '' }]);
    };

    const removeQuestion = (index) => {
         if (questions.length <= 1) {
            alert("An assessment must have at least one question.");
            return;
        }
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const updateQuestion = (index, updatedQuestion) => {
        const newQuestions = [...questions];
        newQuestions[index] = updatedQuestion;
        setQuestions(newQuestions);
    };

    const validateForm = () => {
         if (!title.trim()) return "Assessment title is required.";
         if (isNaN(timer) || timer < 1) return "Timer must be a positive number (minutes).";
         if (questions.length === 0) return "Assessment must have at least one question.";

         for (let i = 0; i < questions.length; i++) {
             const q = questions[i];
             if (!q.questionText.trim()) return `Question ${i + 1}: Text is required.`;
             if (!q.options || q.options.length < 2) return `Question ${i + 1}: Must have at least two options.`;
             if (q.options.some(opt => !opt.trim())) return `Question ${i + 1}: All options must have text.`;
             if (!q.correctAnswer) return `Question ${i + 1}: Correct answer must be selected.`;
              if (!q.options.includes(q.correctAnswer)) return `Question ${i + 1}: The selected correct answer must be one of the options provided.`;
               // Check for duplicate options within a question
                const uniqueOptions = new Set(q.options.map(opt => opt.trim()));
                if (uniqueOptions.size !== q.options.length) {
                    return `Question ${i + 1}: Options must be unique.`;
                }
         }
         return null; // No errors
     };


    const handleSubmit = (e) => {
        e.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            alert(`Validation Error: ${validationError}`); // Or display error more nicely
            return;
        }

        const assessmentData = {
            title: title.trim(),
            description: description.trim(),
            timer: Number(timer),
            questions: questions.map(q => ({ // Ensure data format matches backend model
                questionText: q.questionText.trim(),
                options: q.options.map(opt => opt.trim()),
                correctAnswer: q.correctAnswer // Already validated that it's one of the options
            }))
        };
        onSubmit(assessmentData); // Pass validated data to parent handler
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
             {error && <ErrorMessage message={error} />}

            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Assessment Title</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>

             <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>

             <div>
                <label htmlFor="timer" className="block text-sm font-medium text-gray-700">Timer (minutes)</label>
                <input
                    type="number"
                    id="timer"
                    value={timer}
                    onChange={(e) => setTimer(parseInt(e.target.value, 10) || 1)} // Ensure positive integer
                    min="1"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
            </div>

            <hr/>

            <h3 className="text-lg font-semibold">Questions</h3>
             {questions.map((q, index) => (
                <QuestionInput
                    key={index} // Consider using a more stable unique ID if questions can be reordered
                    index={index}
                    question={q}
                    updateQuestion={updateQuestion}
                    removeQuestion={removeQuestion}
                />
            ))}

             <button
                type="button"
                onClick={addQuestion}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
                + Add Another Question
            </button>

            <hr/>

            <button
                type="submit"
                disabled={loading}
                 className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${loading ? 'bg-indigo-300' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50`}
             >
                 {loading ? 'Saving...' : (isEditing ? 'Update Assessment' : 'Create Assessment')}
            </button>
        </form>
    );
}

export default AssessmentForm;