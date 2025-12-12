import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';

// Notification types
export const NOTIFICATION_TYPES = {
  GOAL_CREATED: 'goal_created',
  GOAL_COMPLETED: 'goal_completed',
  TASK_DUE_SOON: 'task_due_soon',
  TASK_OVERDUE: 'task_overdue',
  TASK_COMPLETED: 'task_completed',
  EVENT_STARTING: 'event_starting',
  DAILY_REMINDER: 'daily_reminder',
  WELCOME: 'welcome'
};

// Create a notification
export async function createNotification(userId, notificationData) {
  try {
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const notification = {
      type: notificationData.type,
      title: notificationData.title,
      message: notificationData.message,
      read: false,
      relatedId: notificationData.relatedId || null,
      relatedType: notificationData.relatedType || null, // 'goal', 'task', 'event'
      createdAt: serverTimestamp()
    };

    const docRef = await addDoc(notificationsRef, notification);
    console.log('✅ Notification created:', docRef.id);
    return { id: docRef.id, ...notification };
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
}

// Get all notifications for a user
export async function getUserNotifications(userId, limitCount = 50) {
  try {
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const q = query(
      notificationsRef,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const notifications = [];

    querySnapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });

    console.log(`✅ Fetched ${notifications.length} notifications for user`);
    return notifications;
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    throw error;
  }
}

// Get unread notifications count
export async function getUnreadCount(userId) {
  try {
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const q = query(
      notificationsRef,
      where('read', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const count = querySnapshot.size;
    
    console.log(`✅ Unread notifications: ${count}`);
    return count;
  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    return 0;
  }
}

// Mark notification as read
export async function markAsRead(userId, notificationId) {
  try {
    const notificationRef = doc(db, 'users', userId, 'notifications', notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp()
    });
    console.log('✅ Notification marked as read:', notificationId);
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    throw error;
  }
}

// Mark all notifications as read
export async function markAllAsRead(userId) {
  try {
    const notificationsRef = collection(db, 'users', userId, 'notifications');
    const q = query(notificationsRef, where('read', '==', false));
    const querySnapshot = await getDocs(q);

    const updatePromises = [];
    querySnapshot.forEach((document) => {
      const notificationRef = doc(db, 'users', userId, 'notifications', document.id);
      updatePromises.push(
        updateDoc(notificationRef, {
          read: true,
          readAt: serverTimestamp()
        })
      );
    });

    await Promise.all(updatePromises);
    console.log(`✅ Marked ${updatePromises.length} notifications as read`);
  } catch (error) {
    console.error('❌ Error marking all as read:', error);
    throw error;
  }
}

// Delete a notification
export async function deleteNotification(userId, notificationId) {
  try {
    const notificationRef = doc(db, 'users', userId, 'notifications', notificationId);
    await deleteDoc(notificationRef);
    console.log('✅ Notification deleted:', notificationId);
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    throw error;
  }
}

// Subscribe to real-time notifications
export function subscribeToNotifications(userId, callback) {
  const notificationsRef = collection(db, 'users', userId, 'notifications');
  const q = query(
    notificationsRef,
    orderBy('createdAt', 'desc'),
    limit(50)
  );

  console.log('👂 Subscribing to notifications for user:', userId);

  return onSnapshot(q, (snapshot) => {
    const notifications = [];
    snapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`🔔 Real-time update: ${notifications.length} notifications`);
    callback(notifications);
  }, (error) => {
    console.error('❌ Error in notifications subscription:', error);
  });
}

// Check for tasks due soon and create notifications
export async function checkTaskDeadlines(userId, tasks) {
  try {
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    for (const task of tasks) {
      if (task.dueDate && task.status !== 'done') {
        const dueDate = new Date(task.dueDate);
        
        // Task is overdue
        if (dueDate < now) {
          await createNotification(userId, {
            type: NOTIFICATION_TYPES.TASK_OVERDUE,
            title: '⚠️ Task Overdue',
            message: `"${task.title}" is overdue!`,
            relatedId: task.id,
            relatedType: 'task'
          });
        }
        // Task due within 24 hours
        else if (dueDate < tomorrow) {
          await createNotification(userId, {
            type: NOTIFICATION_TYPES.TASK_DUE_SOON,
            title: '🔔 Task Due Soon',
            message: `"${task.title}" is due soon!`,
            relatedId: task.id,
            relatedType: 'task'
          });
        }
      }
    }
  } catch (error) {
    console.error('❌ Error checking task deadlines:', error);
  }
}

// Send welcome notification to new users
export async function sendWelcomeNotification(userId, username) {
  try {
    await createNotification(userId, {
      type: NOTIFICATION_TYPES.WELCOME,
      title: '🎉 Welcome to GoalForge!',
      message: `Hi ${username}! Start by creating your first goal or task.`,
      relatedId: null,
      relatedType: null
    });
    console.log('✅ Welcome notification sent');
  } catch (error) {
    console.error('❌ Error sending welcome notification:', error);
  }
}
