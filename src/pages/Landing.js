import React from 'react';
import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <span className="text-2xl font-bold text-blue-600">🎯 GoalForge</span>
            <div className="space-x-4">
              <Link
                to="/login"
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Forge Your Path to
            <span className="text-blue-600"> Success</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            A complete productivity platform to manage goals, track tasks, and achieve more.
            Simple, powerful, and designed for your success.
          </p>
          <Link
            to="/signup"
            className="inline-block px-8 py-4 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 transition transform hover:scale-105 shadow-lg"
          >
            Start Your Journey →
          </Link>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold mb-2">Goal Management</h3>
            <p className="text-gray-600">
              Set, track, and achieve your goals with powerful progress tracking and categories.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-bold mb-2">Smart Tasks</h3>
            <p className="text-gray-600">
              Natural language input, subtasks, and intelligent reminders keep you organized.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">Analytics</h3>
            <p className="text-gray-600">
              Visualize your progress with charts, streaks, and detailed productivity insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;
