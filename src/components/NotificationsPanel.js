import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  subscribeToNotifications
} from '../services/notificationService';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

function NotificationsPanel({ isOpen, onClose }) {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || !isOpen) return;

    console.log('📥 Loading notifications...');
    setLoading(true);

    // Subscribe to real-time notifications
    const unsubscribe = subscribeToNotifications(currentUser.uid, (notifs) => {
      setNotifications(notifs);
      setLoading(false);
    });

    return () => {
      console.log('👋 Unsubscribing from notifications');
      unsubscribe();
    };
  }, [currentUser, isOpen]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markAsRead(currentUser.uid, notificationId);
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(currentUser.uid);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await deleteNotification(currentUser.uid, notificationId);
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'goal_created':
      case 'goal_completed':
        return '🎯';
      case 'task_due_soon':
      case 'task_overdue':
        return '⏰';
      case 'task_completed':
        return '✅';
      case 'event_starting':
        return '📅';
      case 'daily_reminder':
        return '🔔';
      case 'welcome':
        return '🎉';
      default:
        return '📬';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return format(date, 'MMM d, h:mm a');
    } catch (error) {
      return '';
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold">🔔 Notifications</h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {notifications.length > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-white bg-white bg-opacity-20 hover:bg-opacity-30 px-3 py-1 rounded-full transition"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-500">Loading notifications...</p>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center h-full text-center p-8">
              <div>
                <div className="text-6xl mb-4">🔔</div>
                <p className="text-gray-500 text-lg font-medium">No notifications</p>
                <p className="text-gray-400 text-sm mt-2">You're all caught up!</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 transition ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                        <h3
                          className={`font-semibold ${
                            !notification.read ? 'text-gray-900' : 'text-gray-600'
                          }`}
                        >
                          {notification.title}
                        </h3>
                      </div>
                      <p className="text-sm text-gray-600 ml-9">{notification.message}</p>
                      <p className="text-xs text-gray-400 mt-2 ml-9">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>

                    <div className="flex flex-col space-y-1 ml-2">
                      {!notification.read && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="text-blue-600 hover:bg-blue-100 p-1 rounded transition"
                          title="Mark as read"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="text-red-600 hover:bg-red-100 p-1 rounded transition"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default NotificationsPanel;
