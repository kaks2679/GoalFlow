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

// Get all goals for a user
export async function getUserGoals(userId) {
  try {
    const goalsRef = collection(db, 'goals');
    const q = query(
      goalsRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const goals = [];
    
    querySnapshot.forEach((doc) => {
      goals.push({ id: doc.id, ...doc.data() });
    });
    
    return goals;
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }
}

// Subscribe to real-time goals updates
export function subscribeToUserGoals(userId, callback) {
  const goalsRef = collection(db, 'goals');
  const q = query(
    goalsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const goals = [];
    snapshot.forEach((doc) => {
      goals.push({ id: doc.id, ...doc.data() });
    });
    callback(goals);
  });
}

// Create a new goal
export async function createGoal(userId, goalData) {
  try {
    const goalsRef = collection(db, 'goals');
    const newGoal = {
      userId,
      title: goalData.title,
      description: goalData.description || '',
      category: goalData.category || 'personal',
      deadline: goalData.deadline || null,
      progress: 0,
      priority: goalData.priority || 'medium',
      tags: goalData.tags || [],
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(goalsRef, newGoal);
    return { id: docRef.id, ...newGoal };
  } catch (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
}

// Update a goal
export async function updateGoal(goalId, updates) {
  try {
    const goalRef = doc(db, 'goals', goalId);
    await updateDoc(goalRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
}

// Delete a goal
export async function deleteGoal(goalId) {
  try {
    const goalRef = doc(db, 'goals', goalId);
    await deleteDoc(goalRef);
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
}

// Get goal by ID
export async function getGoalById(goalId) {
  try {
    const goalRef = doc(db, 'goals', goalId);
    const goalDoc = await getDoc(goalRef);
    
    if (goalDoc.exists()) {
      return { id: goalDoc.id, ...goalDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching goal:', error);
    throw error;
  }
}

// Update goal progress
export async function updateGoalProgress(goalId, progress) {
  try {
    const goalRef = doc(db, 'goals', goalId);
    await updateDoc(goalRef, {
      progress: Math.min(100, Math.max(0, progress)),
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating goal progress:', error);
    throw error;
  }
}

// Get goals by category
export async function getGoalsByCategory(userId, category) {
  try {
    const goalsRef = collection(db, 'goals');
    const q = query(
      goalsRef,
      where('userId', '==', userId),
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const goals = [];
    
    querySnapshot.forEach((doc) => {
      goals.push({ id: doc.id, ...doc.data() });
    });
    
    return goals;
  } catch (error) {
    console.error('Error fetching goals by category:', error);
    throw error;
  }
}

// Get active goals (not completed)
export async function getActiveGoals(userId) {
  try {
    const goalsRef = collection(db, 'goals');
    const q = query(
      goalsRef,
      where('userId', '==', userId),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const goals = [];
    
    querySnapshot.forEach((doc) => {
      goals.push({ id: doc.id, ...doc.data() });
    });
    
    return goals;
  } catch (error) {
    console.error('Error fetching active goals:', error);
    throw error;
  }
}
