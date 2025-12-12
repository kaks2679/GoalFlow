import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  orderBy,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

// Get all calendar events for a user
export async function getUserEvents(userId) {
  try {
    const eventsRef = collection(db, 'events');
    const q = query(
      eventsRef,
      where('userId', '==', userId),
      orderBy('start', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const events = [];
    
    querySnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });
    
    return events;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

// Subscribe to real-time events updates
export function subscribeToUserEvents(userId, callback) {
  const eventsRef = collection(db, 'events');
  const q = query(
    eventsRef,
    where('userId', '==', userId),
    orderBy('start', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const events = [];
    snapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });
    callback(events);
  });
}

// Create a new event
export async function createEvent(userId, eventData) {
  try {
    const eventsRef = collection(db, 'events');
    const newEvent = {
      userId,
      title: eventData.title,
      description: eventData.description || '',
      start: eventData.start,
      end: eventData.end,
      allDay: eventData.allDay || false,
      color: eventData.color || '#3b82f6',
      type: eventData.type || 'event', // event, task, goal
      relatedId: eventData.relatedId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(eventsRef, newEvent);
    return { id: docRef.id, ...newEvent };
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
}

// Update an event
export async function updateEvent(eventId, updates) {
  try {
    const eventRef = doc(db, 'events', eventId);
    await updateDoc(eventRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
}

// Delete an event
export async function deleteEvent(eventId) {
  try {
    const eventRef = doc(db, 'events', eventId);
    await deleteDoc(eventRef);
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
}

// Get event by ID
export async function getEventById(eventId) {
  try {
    const eventRef = doc(db, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (eventDoc.exists()) {
      return { id: eventDoc.id, ...eventDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
}

// Get events for a date range
export async function getEventsInRange(userId, startDate, endDate) {
  try {
    const eventsRef = collection(db, 'events');
    const q = query(
      eventsRef,
      where('userId', '==', userId),
      where('start', '>=', startDate),
      where('start', '<=', endDate),
      orderBy('start', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const events = [];
    
    querySnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });
    
    return events;
  } catch (error) {
    console.error('Error fetching events in range:', error);
    throw error;
  }
}

// Get events for today
export async function getTodayEvents(userId) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return await getEventsInRange(
      userId,
      today.toISOString(),
      tomorrow.toISOString()
    );
  } catch (error) {
    console.error('Error fetching today\'s events:', error);
    throw error;
  }
}

// Convert task to calendar event
export async function createEventFromTask(userId, task) {
  try {
    if (!task.dueDate) return null;
    
    const eventData = {
      title: task.title,
      description: task.description,
      start: task.dueDate,
      end: task.dueDate,
      allDay: true,
      color: '#f59e0b',
      type: 'task',
      relatedId: task.id
    };
    
    return await createEvent(userId, eventData);
  } catch (error) {
    console.error('Error creating event from task:', error);
    throw error;
  }
}

// Convert goal deadline to calendar event
export async function createEventFromGoal(userId, goal) {
  try {
    if (!goal.deadline) return null;
    
    const eventData = {
      title: `Goal: ${goal.title}`,
      description: goal.description,
      start: goal.deadline,
      end: goal.deadline,
      allDay: true,
      color: '#8b5cf6',
      type: 'goal',
      relatedId: goal.id
    };
    
    return await createEvent(userId, eventData);
  } catch (error) {
    console.error('Error creating event from goal:', error);
    throw error;
  }
}
