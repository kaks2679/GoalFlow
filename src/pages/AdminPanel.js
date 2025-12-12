import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../services/firebase';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

// Admin email list - CONFIGURE THIS WITH YOUR EMAIL
const ADMIN_EMAILS = [
  'yourEmail@example.com', // Replace with your actual email
  // Add more admin emails here
];

function AdminPanel() {
  const { currentUser, userProfile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check if current user is admin
    if (currentUser && ADMIN_EMAILS.includes(currentUser.email)) {
      setIsAdmin(true);
      loadUsers();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [currentUser]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('👤 Admin: Loading all users...');

      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);

      const usersData = [];

      for (const userDoc of querySnapshot.docs) {
        const userData = { id: userDoc.id, ...userDoc.data() };

        // Get user's goals count
        const goalsRef = collection(db, 'users', userDoc.id, 'goals');
        const goalsSnapshot = await getDocs(goalsRef);
        userData.goalsCount = goalsSnapshot.size;

        // Get user's tasks count
        const tasksRef = collection(db, 'users', userDoc.id, 'tasks');
        const tasksSnapshot = await getDocs(tasksRef);
        userData.tasksCount = tasksSnapshot.size;

        // Get user's events count
        const eventsRef = collection(db, 'users', userDoc.id, 'events');
        const eventsSnapshot = await getDocs(eventsRef);
        userData.eventsCount = eventsSnapshot.size;

        usersData.push(userData);
      }

      setUsers(usersData);
      console.log(`✅ Loaded ${usersData.length} users`);
      toast.success(`Loaded ${usersData.length} users`);
    } catch (error) {
      console.error('❌ Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM d, yyyy h:mm a');
    } catch (error) {
      return 'N/A';
    }
  };

  if (!isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <svg className="w-16 h-16 text-red-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700">You do not have admin privileges to access this page.</p>
          <p className="text-sm text-red-600 mt-4">
            If you need admin access, add your email to the ADMIN_EMAILS array in AdminPanel.js
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">👨‍💼 Admin Panel</h1>
        <p className="text-gray-600">
          Viewing all users and their statistics
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 rounded-lg p-6">
          <p className="text-sm text-blue-600 font-medium mb-1">Total Users</p>
          <p className="text-3xl font-bold text-blue-900">{users.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-6">
          <p className="text-sm text-green-600 font-medium mb-1">Total Goals</p>
          <p className="text-3xl font-bold text-green-900">
            {users.reduce((sum, user) => sum + (user.goalsCount || 0), 0)}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-6">
          <p className="text-sm text-purple-600 font-medium mb-1">Total Tasks</p>
          <p className="text-3xl font-bold text-purple-900">
            {users.reduce((sum, user) => sum + (user.tasksCount || 0), 0)}
          </p>
        </div>
        <div className="bg-orange-50 rounded-lg p-6">
          <p className="text-sm text-orange-600 font-medium mb-1">Total Events</p>
          <p className="text-3xl font-bold text-orange-900">
            {users.reduce((sum, user) => sum + (user.eventsCount || 0), 0)}
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">All Users</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Goals
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tasks
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Events
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {(user.username || user.email)?.[0]?.toUpperCase()}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.username || user.fullName || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.country || 'No country'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(user.createdAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {user.goalsCount || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      {user.tasksCount || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                      {user.eventsCount || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(user.updatedAt)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="mt-6 text-center">
        <button
          onClick={loadUsers}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          🔄 Refresh Data
        </button>
      </div>
    </div>
  );
}

export default AdminPanel;
