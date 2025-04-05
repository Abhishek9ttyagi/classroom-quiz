// src/components/Teacher/QuestionInput.js
import React from 'react';

function QuestionInput({ index, question, updateQuestion, removeQuestion }) {

    // --- Input Handlers ---
    const handleInputChange = (e) => {
        updateQuestion(index, { ...question, [e.target.name]: e.target.value });
    };

    const handleOptionChange = (optionIndex, value) => {
        const newOptions = [...question.options];
        newOptions[optionIndex] = value;
        // If the updated option was the correct answer, update correctAnswer too
        // But only if the old correctAnswer *was* the option being changed
        const oldOptionValue = question.options[optionIndex];
        const newCorrectAnswer = question.correctAnswer === oldOptionValue ? value : question.correctAnswer;
        updateQuestion(index, { ...question, options: newOptions, correctAnswer: newCorrectAnswer });
    };

    const handleCorrectAnswerChange = (e) => {
        updateQuestion(index, { ...question, correctAnswer: e.target.value });
    };

    // --- Option Management ---
    const addOption = () => {
        // Add an empty option. Consider adding checks for maximum options if needed.
        updateQuestion(index, { ...question, options: [...question.options, ''] });
    };

    const removeOption = (optionIndex) => {
        // Prevent removing if only two options left
        if (question.options.length <= 2) {
            alert("Each question must have at least two options.");
            return;
        }
        const removedOptionValue = question.options[optionIndex];
        const newOptions = question.options.filter((_, i) => i !== optionIndex);

        // Check if removed option was the correct answer & update if necessary
        let newCorrectAnswer = question.correctAnswer;
        if (question.correctAnswer === removedOptionValue) {
            // If the correct answer was removed, default to the first remaining option or empty
            newCorrectAnswer = newOptions[0] || '';
        }
        updateQuestion(index, { ...question, options: newOptions, correctAnswer: newCorrectAnswer });
    };

    // --- Validation Check (for rendering warnings) ---
    const isCorrectAnswerValid = question.options.includes(question.correctAnswer);

    // --- Rendering ---
    return (
        <div className="border p-4 mb-4 rounded shadow bg-gray-50">
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-lg">Question {index + 1}</h4>
                <button
                    type="button"
                    onClick={() => removeQuestion(index)}
                    className="bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold py-1 px-2 rounded"
                    title="Remove this question"
                >
                    Remove Question
                </button>
            </div>

            {/* Question Text Input */}
            <div className="mb-3">
                <label htmlFor={`questionText_${index}`} className="block text-sm font-medium text-gray-700 mb-1">Question Text:</label>
                <textarea
                    id={`questionText_${index}`}
                    name="questionText"
                    value={question.questionText}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    rows="2"
                    placeholder="Enter the question here"
                />
            </div>

            {/* Options Input */}
            <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">Options:</label>
                {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center mb-1">
                        <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(optIndex, e.target.value)}
                            required
                            placeholder={`Option ${optIndex + 1}`}
                            className="mt-1 flex-grow px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                        <button
                            type="button"
                            onClick={() => removeOption(optIndex)}
                            disabled={question.options.length <= 2}
                            className={`ml-2 text-red-500 hover:text-red-700 text-xl ${question.options.length <= 2 ? 'opacity-30 cursor-not-allowed' : ''}`}
                            title="Remove Option"
                        >
                            × {/* Multiplication sign for 'x' */}
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addOption}
                    className="mt-1 text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                    + Add Option
                </button>
            </div>

            {/* Correct Answer Selection */}
            <div className="mb-2">
                <label htmlFor={`correctAnswer_${index}`} className="block text-sm font-medium text-gray-700">Correct Answer:</label>
                <select
                    id={`correctAnswer_${index}`}
                    name="correctAnswer"
                    value={question.correctAnswer}
                    onChange={handleCorrectAnswerChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    <option value="" disabled>-- Select the correct option --</option>
                    {question.options.map((option, optIndex) => (
                        // Only render valid, non-empty options
                        option.trim() && <option key={optIndex} value={option}>{option}</option>
                    ))}
                </select>
                {/* Warning if selected correct answer isn't among the current options */}
                {!isCorrectAnswerValid && question.correctAnswer !== '' && (
                    <p className="text-xs text-red-500 mt-1">
                        Warning: The selected correct answer ('{question.correctAnswer}') is no longer listed in the options above or is empty. Please update the selection.
                    </p>
                )}
                 {/* Warning if no correct answer is selected */}
                {question.correctAnswer === '' && (
                     <p className="text-xs text-yellow-600 mt-1">
                         Please select the correct answer for this question.
                     </p>
                )}
            </div>
        </div>
    );
}

export default QuestionInput;