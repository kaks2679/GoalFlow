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

console.log('📁 Tasks Service loaded');

// Get all tasks for a user
export async function getUserTasks(userId) {
  try {
    console.log('📥 Fetching tasks for user:', userId);
    
    const tasksRef = collection(db, 'users', userId, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const tasks = [];
    
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`✅ Fetched ${tasks.length} tasks`);
    return tasks;
  } catch (error) {
    console.error('❌ Error fetching tasks:', error);
    throw error;
  }
}

// Subscribe to real-time tasks updates
export function subscribeToUserTasks(userId, callback) {
  console.log('👂 Subscribing to tasks for user:', userId);
  
  const tasksRef = collection(db, 'users', userId, 'tasks');
  const q = query(tasksRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const tasks = [];
    snapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`🔄 Real-time update: ${tasks.length} tasks`);
    callback(tasks);
  }, (error) => {
    console.error('❌ Error in tasks subscription:', error);
  });
}

// Create a new task
export async function createTask(userId, taskData) {
  try {
    console.log('➕ Creating task for user:', userId);
    
    const tasksRef = collection(db, 'users', userId, 'tasks');
    
    const newTask = {
      userId,
      goalId: taskData.goalId || null,
      title: taskData.title,
      description: taskData.description || '',
      dueDate: taskData.dueDate || null,
      status: 'todo',
      priority: taskData.priority || 'medium',
      subtasks: taskData.subtasks || [],
      tags: taskData.tags || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(tasksRef, newTask);
    console.log('✅ Task created with ID:', docRef.id);
    
    return { id: docRef.id, ...newTask };
  } catch (error) {
    console.error('❌ Error creating task:', error);
    throw error;
  }
}

// Update a task
export async function updateTask(userId, taskId, updates) {
  try {
    console.log('✏️ Updating task:', taskId);
    
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Task updated successfully');
  } catch (error) {
    console.error('❌ Error updating task:', error);
    throw error;
  }
}

// Delete a task
export async function deleteTask(userId, taskId) {
  try {
    console.log('🗑️ Deleting task:', taskId);
    
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    await deleteDoc(taskRef);
    
    console.log('✅ Task deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting task:', error);
    throw error;
  }
}

// Get task by ID
export async function getTaskById(userId, taskId) {
  try {
    console.log('📄 Fetching task:', taskId);
    
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);
    
    if (taskDoc.exists()) {
      console.log('✅ Task found');
      return { id: taskDoc.id, ...taskDoc.data() };
    }
    
    console.log('❌ Task not found');
    return null;
  } catch (error) {
    console.error('❌ Error fetching task:', error);
    throw error;
  }
}

// Get tasks by goal ID
export async function getTasksByGoalId(userId, goalId) {
  try {
    console.log('📂 Fetching tasks for goal:', goalId);
    
    const tasksRef = collection(db, 'users', userId, 'tasks');
    const q = query(
      tasksRef,
      where('goalId', '==', goalId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const tasks = [];
    
    querySnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`✅ Found ${tasks.length} tasks for goal`);
    return tasks;
  } catch (error) {
    console.error('❌ Error fetching tasks by goal:', error);
    throw error;
  }
}

// Update task status
export async function updateTaskStatus(userId, taskId, status) {
  try {
    console.log('🔄 Updating task status:', taskId, '→', status);
    
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
    await updateDoc(taskRef, {
      status,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Task status updated');
  } catch (error) {
    console.error('❌ Error updating task status:', error);
    throw error;
  }
}

// Add subtask
export async function addSubtask(userId, taskId, subtaskTitle) {
  try {
    console.log('➕ Adding subtask to task:', taskId);
    
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
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
      
      console.log('✅ Subtask added');
    }
  } catch (error) {
    console.error('❌ Error adding subtask:', error);
    throw error;
  }
}

// Update subtask
export async function updateSubtask(userId, taskId, subtaskId, completed) {
  try {
    console.log('✏️ Updating subtask:', subtaskId);
    
    const taskRef = doc(db, 'users', userId, 'tasks', taskId);
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
      
      console.log('✅ Subtask updated');
    }
  } catch (error) {
    console.error('❌ Error updating subtask:', error);
    throw error;
  }
}

// Get tasks due today
export async function getTasksDueToday(userId) {
  try {
    console.log('📅 Fetching tasks due today');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const tasksRef = collection(db, 'users', userId, 'tasks');
    const q = query(tasksRef, where('status', '!=', 'done'));
    
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
    
    console.log(`✅ Found ${tasks.length} tasks due today`);
    return tasks;
  } catch (error) {
    console.error('❌ Error fetching tasks due today:', error);
    throw error;
  }
}
