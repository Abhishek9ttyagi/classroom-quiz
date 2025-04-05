import React from 'react';

function QuestionCard({ question, questionIndex, totalQuestions, selectedOption, onOptionSelect }) {

     if (!question) return null; // Handle case where question might be loading or undefined

    return (
        <div className="border p-6 rounded shadow-lg bg-white mb-6">
            <p className="text-sm text-gray-500 mb-2">Question {questionIndex + 1} of {totalQuestions}</p>
            <h3 className="text-xl font-medium mb-4">{question.questionText}</h3>
            <div className="space-y-3">
                {question.options.map((option, index) => (
                    <label key={index} className="flex items-center p-3 border rounded hover:bg-gray-100 cursor-pointer">
                        <input
                            type="radio"
                            name={`question_${questionIndex}`} // Unique name per question
                            value={option}
                            checked={selectedOption === option}
                            onChange={() => onOptionSelect(option)}
                            className="mr-3 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-gray-800">{option}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

export default QuestionCard;