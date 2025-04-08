// src/components/Common/LoadingSpinner.js
import React from 'react';
import '../../styles.css'; // Import your CSS file for spinner styles

function LoadingSpinner() {
    return (
        <div className="flex justify-center items-center p-4">
            {/* Simple text spinner */}
            {/* <p className="text-lg font-medium text-gray-600 animate-pulse">Loading...</p> */}

            {/* Basic CSS Spinner (requires CSS for animation) */}
            <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12"></div>
            {/* Add corresponding CSS, e.g., in index.css:
               .loader {
                 border-top-color: #3498db; // Example color
                 animation: spinner 1.5s linear infinite;
               }
               @keyframes spinner {
                 0% { transform: rotate(0deg); }
                 100% { transform: rotate(360deg); }
               }
            */}

             {/* Tailwind CSS Spinner Example */}
             <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>

             <span className="ml-3 text-gray-700">Loading...</span>

        </div>
    );
}

export default LoadingSpinner;