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
import chrono from 'chrono-node';

// Parse natural language date/time
function parseNaturalLanguage(text) {
  const parsed = chrono.parse(text);
  if (parsed.length > 0) {
    return parsed[0].start.date();
  }
  return null;
}

// Get all tasks for a user
export async function getUserTasks(userId) {
  try {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const tasks = [];
    
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
}

// Subscribe to real-time tasks updates
export function subscribeToUserTasks(userId, callback) {
  const tasksRef = collection(db, 'tasks');
  const q = query(
    tasksRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const tasks = [];
    snapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    callback(tasks);
  });
}

// Create a new task
export async function createTask(userId, taskData) {
  try {
    const tasksRef = collection(db, 'tasks');
    
    // Try to parse natural language if provided
    let dueDate = taskData.dueDate;
    if (typeof taskData.dueDate === 'string') {
      const parsedDate = parseNaturalLanguage(taskData.dueDate);
      if (parsedDate) {
        dueDate = parsedDate.toISOString();
      }
    }
    
    const newTask = {
      userId,
      goalId: taskData.goalId || null,
      title: taskData.title,
      description: taskData.description || '',
      dueDate: dueDate || null,
      status: 'todo',
      priority: taskData.priority || 'medium',
      subtasks: taskData.subtasks || [],
      tags: taskData.tags || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(tasksRef, newTask);
    return { id: docRef.id, ...newTask };
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
}

// Update a task
export async function updateTask(taskId, updates) {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
}

// Delete a task
export async function deleteTask(taskId) {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
}

// Get task by ID
export async function getTaskById(taskId) {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);
    
    if (taskDoc.exists()) {
      return { id: taskDoc.id, ...taskDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching task:', error);
    throw error;
  }
}

// Get tasks by goal ID
export async function getTasksByGoalId(userId, goalId) {
  try {
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', userId),
      where('goalId', '==', goalId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const tasks = [];
    
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks by goal:', error);
    throw error;
  }
}

// Update task status
export async function updateTaskStatus(taskId, status) {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    throw error;
  }
}

// Add subtask
export async function addSubtask(taskId, subtaskTitle) {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);
    
    if (taskDoc.exists()) {
      const currentSubtasks = taskDoc.data().subtasks || [];
      const newSubtask = {
        id: Date.now().toString(),
        title: subtaskTitle,
        completed: false
      };
      
      await updateDoc(taskRef, {
        subtasks: [...currentSubtasks, newSubtask],
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error adding subtask:', error);
    throw error;
  }
}

// Update subtask
export async function updateSubtask(taskId, subtaskId, completed) {
  try {
    const taskRef = doc(db, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);
    
    if (taskDoc.exists()) {
      const subtasks = taskDoc.data().subtasks || [];
      const updatedSubtasks = subtasks.map(st => 
        st.id === subtaskId ? { ...st, completed } : st
      );
      
      await updateDoc(taskRef, {
        subtasks: updatedSubtasks,
        updatedAt: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating subtask:', error);
    throw error;
  }
}

// Get tasks due today
export async function getTasksDueToday(userId) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', userId),
      where('status', '!=', 'done')
    );
    
    const querySnapshot = await getDocs(q);
    const tasks = [];
    
    querySnapshot.forEach((doc) => {
      const task = { id: doc.id, ...doc.data() };
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        if (dueDate >= today && dueDate < tomorrow) {
          tasks.push(task);
        }
      }
    });
    
    return tasks;
  } catch (error) {
    console.error('Error fetching tasks due today:', error);
    throw error;
  }
}
