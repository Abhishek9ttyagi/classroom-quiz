// src/pages/NotFoundPage.js
import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
            <h2 className="text-3xl font-semibold mb-3">Page Not Found</h2>
            <p className="text-gray-600 mb-8">
                Oops! The page you are looking for does not exist. It might have been moved or deleted.
            </p>
            <Link
                to="/" // Link back to the homepage
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow"
            >
                Go Back Home
            </Link>
        </div>
    );
}

export default NotFoundPage;