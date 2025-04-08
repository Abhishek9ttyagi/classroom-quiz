import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

function Navbar() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login'); // Redirect to login after logout
  };

  return (
    <nav className="bg-gray-800 text-white p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-xl font-bold hover:text-gray-300">
           MERN Quiz App
        </Link>
        <div>
          {loading ? (
             <span className="text-sm">Loading...</span>
          ) : user ? (
            <div className="flex items-center space-x-4">
               {user.role === 'teacher' && (
                 <Link to="/teacher/dashboard" className="hover:text-gray-300">Teacher Dashboard</Link>
               )}
               {user.role === 'student' && (
                 <Link to="/student/dashboard" className="hover:text-gray-300">Student Dashboard</Link>
               )}
              <span className="text-sm">Welcome, {user.displayName}!</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-700 text-white text-sm font-bold py-1 px-3 rounded"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="hover:text-gray-300">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;