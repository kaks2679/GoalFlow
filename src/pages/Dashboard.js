import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserGoals } from '../services/goalsService';
import { getUserTasks, getTasksDueToday } from '../services/tasksService';
import { getTodayEvents } from '../services/calendarService';
import { format } from 'date-fns';
import { toast } from 'react-toastify';

function Dashboard() {
  const { currentUser, userProfile } = useAuth();
  const [goals, setGoals] = useState([]);
  const [todayTasks, setTodayTasks] = useState([]);
  const [todayEvents, setTodayEvents] = useState([]);
  const [stats, setStats] = useState({
    totalGoals: 0,
    activeGoals: 0,
    completedTasks: 0,
    totalTasks: 0,
    streak: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      loadDashboardData();
    }
  }, [currentUser]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch goals
      const goalsData = await getUserGoals(currentUser.uid);
      setGoals(goalsData.slice(0, 5));
      
      // Fetch today's tasks
      const tasksData = await getTasksDueToday(currentUser.uid);
      setTodayTasks(tasksData);
      
      // Fetch today's events
      const eventsData = await getTodayEvents(currentUser.uid);
      setTodayEvents(eventsData);
      
      // Calculate stats
      const activeGoals = goalsData.filter(g => g.status === 'active');
      const allTasks = await getUserTasks(currentUser.uid);
      const completedTasks = allTasks.filter(t => t.status === 'done');
      
      setStats({
        totalGoals: goalsData.length,
        activeGoals: activeGoals.length,
        completedTasks: completedTasks.length,
        totalTasks: allTasks.length,
        streak: calculateStreak(allTasks)
      });
      
    } catch (error) {
      console.error('Error loading dashboard:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (tasks) => {
    // Simple streak calculation based on consecutive days with completed tasks
    const completedDates = tasks
      .filter(t => t.status === 'done' && t.updatedAt)
      .map(t => {
        const date = t.updatedAt.toDate ? t.updatedAt.toDate() : new Date(t.updatedAt);
        return format(date, 'yyyy-MM-dd');
      })
      .sort()
      .reverse();
    
    if (completedDates.length === 0) return 0;
    
    let streak = 1;
    const today = format(new Date(), 'yyyy-MM-dd');
    
    if (completedDates[0] !== today && completedDates[0] !== format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')) {
      return 0;
    }
    
    for (let i = 1; i < completedDates.length; i++) {
      const prevDate = new Date(completedDates[i - 1]);
      const currDate = new Date(completedDates[i]);
      const diff = Math.floor((prevDate - currDate) / 86400000);
      
      if (diff === 1) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const getProgressColor = (progress) => {
    if (progress < 30) return 'text-red-600';
    if (progress < 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {userProfile?.username || currentUser?.email}! 👋
        </h1>
        <p className="mt-2 text-gray-600">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Goals</p>
              <p className="text-3xl font-bold text-blue-600">{stats.activeGoals}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tasks Completed</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.completedTasks}/{stats.totalTasks}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Current Streak</p>
              <p className="text-3xl font-bold text-orange-600">{stats.streak} days</p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Events</p>
              <p className="text-3xl font-bold text-purple-600">{todayEvents.length}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Tasks */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Today's Tasks</h2>
            <span className="text-sm text-gray-600">{todayTasks.length} tasks</span>
          </div>
          
          {todayTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No tasks due today</p>
              <p className="text-sm mt-2">You're all caught up! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <div key={task.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <input
                    type="checkbox"
                    checked={task.status === 'done'}
                    className="h-5 w-5 text-blue-600 rounded border-gray-300"
                    readOnly
                  />
                  <div className="ml-3 flex-1">
                    <p className={`font-medium ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </p>
                    {task.dueDate && (
                      <p className="text-sm text-gray-600">
                        Due: {format(new Date(task.dueDate), 'h:mm a')}
                      </p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-700' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Goals */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Active Goals</h2>
            <span className="text-sm text-gray-600">{goals.length} goals</span>
          </div>
          
          {goals.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No active goals</p>
              <p className="text-sm mt-2">Create your first goal to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => (
                <div key={goal.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                    <span className={`text-sm font-bold ${getProgressColor(goal.progress)}`}>
                      {goal.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span className="capitalize">{goal.category}</span>
                    {goal.deadline && (
                      <span>Due: {format(new Date(goal.deadline), 'MMM d')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-lg p-6 text-white">
        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="text-sm font-medium">New Goal</span>
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-sm font-medium">New Task</span>
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">Add Event</span>
          </button>
          <button className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg p-4 transition text-center">
            <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-medium">View Analytics</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
