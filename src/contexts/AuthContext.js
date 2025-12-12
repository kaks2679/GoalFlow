import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile,
  sendEmailVerification,
  updatePassword as firebaseUpdatePassword
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up with email and password
  async function signup(email, password, userData) {
    try {
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Send email verification
      await sendEmailVerification(user);

      // Update display name
      if (userData.username) {
        await updateProfile(user, {
          displayName: userData.username
        });
      }

      // Create user profile in Firestore
      const userProfileData = {
        email: user.email,
        username: userData.username || '',
        fullName: userData.fullName || '',
        age: userData.age || null,
        gender: userData.gender || '',
        maritalStatus: userData.maritalStatus || '',
        educationLevel: userData.educationLevel || '',
        country: userData.country || '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        preferences: {
          theme: 'light',
          language: 'en',
          notificationSettings: {
            email: true,
            push: true,
            reminders: true
          },
          firstDayOfWeek: 0 // Sunday
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      await setDoc(doc(db, 'users', user.uid), userProfileData);

      toast.success('Account created! Please verify your email.');
      return user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  // Login with email and password
  async function login(email, password, rememberMe = false) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberMe');
      }

      toast.success('Welcome back!');
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Login with Google
  async function loginWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;

      // Check if user profile exists
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        // Create new user profile for Google sign-in
        const userProfileData = {
          email: user.email,
          username: user.displayName || '',
          fullName: user.displayName || '',
          age: null,
          gender: '',
          maritalStatus: '',
          educationLevel: '',
          country: '',
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          preferences: {
            theme: 'light',
            language: 'en',
            notificationSettings: {
              email: true,
              push: true,
              reminders: true
            },
            firstDayOfWeek: 0
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        await setDoc(userDocRef, userProfileData);
      }

      toast.success('Signed in with Google!');
      return user;
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  }

  // Logout
  async function logout() {
    try {
      await signOut(auth);
      setUserProfile(null);
      localStorage.removeItem('rememberMe');
      toast.info('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Reset password
  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent!');
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  // Update user profile
  async function updateUserProfile(updates) {
    try {
      if (!currentUser) throw new Error('No user logged in');

      const userDocRef = doc(db, 'users', currentUser.uid);
      
      await updateDoc(userDocRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      // Refresh user profile
      await fetchUserProfile(currentUser.uid);
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  // Update password
  async function updatePassword(newPassword) {
    try {
      if (!currentUser) throw new Error('No user logged in');
      await firebaseUpdatePassword(currentUser, newPassword);
      toast.success('Password updated successfully!');
    } catch (error) {
      console.error('Password update error:', error);
      throw error;
    }
  }

  // Fetch user profile from Firestore
  async function fetchUserProfile(uid) {
    try {
      const userDocRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        setUserProfile({ id: userDoc.id, ...userDoc.data() });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }

  // Listen to auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    updatePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
