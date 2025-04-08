import React from 'react';
import { Link } from 'react-router-dom';

function ResultList({ submissions }) {
    if (!submissions || submissions.length === 0) {
        return <p>You haven't attempted any assessments yet.</p>;
    }

    return (
        <div className="space-y-4">
            {submissions.map((sub) => (
                <div key={sub._id} className="border p-4 rounded shadow-md bg-white">
                    <h3 className="text-xl font-semibold mb-1">{sub.assessment?.title || 'Assessment Title Missing'}</h3>
                    {sub.assessment?.description && <p className="text-gray-600 mb-2 text-sm">{sub.assessment.description}</p>}
                    <p className="text-gray-800 mb-1">
                        Score: <span className="font-bold">{sub.score} / {sub.totalQuestions}</span>
                        <span className={`ml-2 font-semibold ${sub.score / sub.totalQuestions >= 0.5 ? 'text-green-600' : 'text-red-600'}`}>
                             ({((sub.score / sub.totalQuestions) * 100).toFixed(1)}%)
                         </span>
                    </p>
                    <p className="text-gray-500 text-xs mb-3">
                        Attempted: {new Date(sub.submittedAt).toLocaleString()}
                    </p>
                    <Link
                        to={`/results/${sub._id}`}
                        className="bg-blue-500 hover:bg-blue-700 text-white text-sm font-bold py-1 px-3 rounded"
                    >
                        View Details
                    </Link>
                </div>
            ))}
        </div>
    );
}

export default ResultList;