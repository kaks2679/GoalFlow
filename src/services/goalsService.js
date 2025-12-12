import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  getDocs,
  getDoc,
  orderBy,
  serverTimestamp,
  onSnapshot,
  where
} from 'firebase/firestore';
import { db } from './firebase';

console.log('📁 Goals Service loaded');

// Get all goals for a user (from subcollection)
export async function getUserGoals(userId) {
  try {
    console.log('📥 Fetching goals for user:', userId);
    const goalsRef = collection(db, 'users', userId, 'goals');
    const q = query(goalsRef, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const goals = [];
    
    querySnapshot.forEach((doc) => {
      goals.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`✅ Fetched ${goals.length} goals`);
    return goals;
  } catch (error) {
    console.error('❌ Error fetching goals:', error);
    throw error;
  }
}

// Subscribe to real-time goals updates
export function subscribeToUserGoals(userId, callback) {
  console.log('👂 Subscribing to goals for user:', userId);
  
  const goalsRef = collection(db, 'users', userId, 'goals');
  const q = query(goalsRef, orderBy('createdAt', 'desc'));
  
  return onSnapshot(q, (snapshot) => {
    const goals = [];
    snapshot.forEach((doc) => {
      goals.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`🔄 Real-time update: ${goals.length} goals`);
    callback(goals);
  }, (error) => {
    console.error('❌ Error in goals subscription:', error);
  });
}

// Create a new goal
export async function createGoal(userId, goalData) {
  try {
    console.log('➕ Creating goal for user:', userId);
    
    const goalsRef = collection(db, 'users', userId, 'goals');
    const newGoal = {
      userId, // Keep userId for reference
      title: goalData.title,
      description: goalData.description || '',
      category: goalData.category || 'personal',
      deadline: goalData.deadline || null,
      progress: goalData.progress || 0,
      priority: goalData.priority || 'medium',
      tags: goalData.tags || [],
      status: 'active',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(goalsRef, newGoal);
    console.log('✅ Goal created with ID:', docRef.id);
    
    return { id: docRef.id, ...newGoal };
  } catch (error) {
    console.error('❌ Error creating goal:', error);
    throw error;
  }
}

// Update a goal
export async function updateGoal(userId, goalId, updates) {
  try {
    console.log('✏️ Updating goal:', goalId);
    
    const goalRef = doc(db, 'users', userId, 'goals', goalId);
    await updateDoc(goalRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Goal updated successfully');
  } catch (error) {
    console.error('❌ Error updating goal:', error);
    throw error;
  }
}

// Delete a goal
export async function deleteGoal(userId, goalId) {
  try {
    console.log('🗑️ Deleting goal:', goalId);
    
    const goalRef = doc(db, 'users', userId, 'goals', goalId);
    await deleteDoc(goalRef);
    
    console.log('✅ Goal deleted successfully');
  } catch (error) {
    console.error('❌ Error deleting goal:', error);
    throw error;
  }
}

// Get goal by ID
export async function getGoalById(userId, goalId) {
  try {
    console.log('📄 Fetching goal:', goalId);
    
    const goalRef = doc(db, 'users', userId, 'goals', goalId);
    const goalDoc = await getDoc(goalRef);
    
    if (goalDoc.exists()) {
      console.log('✅ Goal found');
      return { id: goalDoc.id, ...goalDoc.data() };
    }
    
    console.log('❌ Goal not found');
    return null;
  } catch (error) {
    console.error('❌ Error fetching goal:', error);
    throw error;
  }
}

// Update goal progress
export async function updateGoalProgress(userId, goalId, progress) {
  try {
    console.log('📊 Updating goal progress:', goalId, progress);
    
    const goalRef = doc(db, 'users', userId, 'goals', goalId);
    const validProgress = Math.min(100, Math.max(0, progress));
    
    await updateDoc(goalRef, {
      progress: validProgress,
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ Goal progress updated to:', validProgress);
  } catch (error) {
    console.error('❌ Error updating goal progress:', error);
    throw error;
  }
}

// Get goals by category
export async function getGoalsByCategory(userId, category) {
  try {
    console.log('📂 Fetching goals by category:', category);
    
    const goalsRef = collection(db, 'users', userId, 'goals');
    const q = query(
      goalsRef,
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const goals = [];
    
    querySnapshot.forEach((doc) => {
      goals.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`✅ Found ${goals.length} goals in category ${category}`);
    return goals;
  } catch (error) {
    console.error('❌ Error fetching goals by category:', error);
    throw error;
  }
}

// Get active goals (not completed)
export async function getActiveGoals(userId) {
  try {
    console.log('🎯 Fetching active goals');
    
    const goalsRef = collection(db, 'users', userId, 'goals');
    const q = query(
      goalsRef,
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const goals = [];
    
    querySnapshot.forEach((doc) => {
      goals.push({ id: doc.id, ...doc.data() });
    });
    
    console.log(`✅ Found ${goals.length} active goals`);
    return goals;
  } catch (error) {
    console.error('❌ Error fetching active goals:', error);
    throw error;
  }
}
