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

console.log('📁 Calendar Service loaded');

// Get all calendar events for a user
export async function getUserEvents(userId) {
  try {
    console.log('📥 Fetching events for user:', userId);
    
    const eventsRef = collection(db, 'users', userId, 'events');
    const q = query(eventsRef, orderBy('start', 'asc'));
    
    const querySnapshot = await getDocs(q);
    const events = [];
    
    querySnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`✅ Fetched ${events.length} events`);
    return events;
  } catch (error) {
    console.error('❌ Error fetching events:', error);
    throw error;
  }
}

// Subscribe to real-time events updates
export function subscribeToUserEvents(userId, callback) {
  console.log('👂 Subscribing to events for user:', userId);
  
  const eventsRef = collection(db, 'users', userId, 'events');
  const q = query(eventsRef, orderBy('start', 'asc'));
  
  return onSnapshot(q, (snapshot) => {
    const events = [];
    snapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`🔄 Real-time update: ${events.length} events`);
    callback(events);
  }, (error) => {
    console.error('❌ Error in events subscription:', error);
  });
}

// Create a new event
export async function createEvent(userId, eventData) {
  try {
    console.log('➕ Creating event for user:', userId);
    
    const eventsRef = collection(db, 'users', userId, 'events');
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
    console.log('✅ Event created with ID:', docRef.id);
    
    return { id: docRef.id, ...newEvent };
  } catch (error) {
    console.error('❌ Error creating event:', error);
    throw error;
  }
}

// Update an event
export async function updateEvent(userId, eventId, updates) {
  try {
    console.log('✏️ Updating event:', eventId);
    
    const eventRef = doc(db, 'users', userId, 'events', eventId);
    await updateDoc(eventRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Event updated successfully');
  } catch (error) {
    console.error('❌ Error updating event:', error);
    throw error;
  }
}

// Delete an event
export async function deleteEvent(userId, eventId) {
  try {
    console.log('🗑️ Deleting event:', eventId);
    
    const eventRef = doc(db, 'users', userId, 'events', eventId);
    await deleteDoc(eventRef);
    
    console.log('✅ Event deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting event:', error);
    throw error;
  }
}

// Get event by ID
export async function getEventById(userId, eventId) {
  try {
    console.log('📄 Fetching event:', eventId);
    
    const eventRef = doc(db, 'users', userId, 'events', eventId);
    const eventDoc = await getDoc(eventRef);
    
    if (eventDoc.exists()) {
      console.log('✅ Event found');
      return { id: eventDoc.id, ...eventDoc.data() };
    }
    
    console.log('❌ Event not found');
    return null;
  } catch (error) {
    console.error('❌ Error fetching event:', error);
    throw error;
  }
}

// Get events for a date range
export async function getEventsInRange(userId, startDate, endDate) {
  try {
    console.log('📅 Fetching events in range:', startDate, '-', endDate);
    
    const eventsRef = collection(db, 'users', userId, 'events');
    const q = query(
      eventsRef,
      where('start', '>=', startDate),
      where('start', '<=', endDate),
      orderBy('start', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const events = [];
    
    querySnapshot.forEach((doc) => {
      events.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`✅ Found ${events.length} events in range`);
    return events;
  } catch (error) {
    console.error('❌ Error fetching events in range:', error);
    throw error;
  }
}

// Get events for today
export async function getTodayEvents(userId) {
  try {
    console.log('📅 Fetching today\'s events');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const events = await getEventsInRange(
      userId,
      today.toISOString(),
      tomorrow.toISOString()
    );
    
    console.log(`✅ Found ${events.length} events today`);
    return events;
  } catch (error) {
    console.error('❌ Error fetching today\'s events:', error);
    throw error;
  }
}

// Convert task to calendar event
export async function createEventFromTask(userId, task) {
  try {
    if (!task.dueDate) {
      console.log('⚠️ Task has no due date, skipping event creation');
      return null;
    }
    
    console.log('📅 Creating event from task:', task.id);
    
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
    
    const event = await createEvent(userId, eventData);
    console.log('✅ Event created from task');
    
    return event;
  } catch (error) {
    console.error('❌ Error creating event from task:', error);
    throw error;
  }
}

// Convert goal deadline to calendar event
export async function createEventFromGoal(userId, goal) {
  try {
    if (!goal.deadline) {
      console.log('⚠️ Goal has no deadline, skipping event creation');
      return null;
    }
    
    console.log('📅 Creating event from goal:', goal.id);
    
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
    
    const event = await createEvent(userId, eventData);
    console.log('✅ Event created from goal');
    
    return event;
  } catch (error) {
    console.error('❌ Error creating event from goal:', error);
    throw error;
  }
}
