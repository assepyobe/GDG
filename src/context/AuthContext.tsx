import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, updateProfile as updateFirebaseProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleAuthProvider, signInWithPopup, signOut, db, handleFirestoreError, OperationType } from '../lib/firebase.ts';
import { UserProfile } from '../types.ts';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(userDocRef);
          if (snap.exists()) {
            setUserProfile(snap.data() as UserProfile);
          } else {
            // Create initial profile in Firestore
            const initialProfile: UserProfile = {
              uid: currentUser.uid,
              displayName: currentUser.displayName || 'Club Runner',
              email: currentUser.email || '',
              photoURL: currentUser.photoURL || '',
              bio: 'Loves group runs, morning fresh air, and post-run coffee.',
              preferredPace: '5:30 min/km',
              favoriteDistance: '10K',
              shoes: 'Daily Trainers',
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, initialProfile);
            setUserProfile(initialProfile);
          }
        } catch (error) {
          console.warn('Could not sync user profile to Firestore:', error);
          // Fallback to local profile object if offline or rules warming
          setUserProfile({
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'Club Runner',
            email: currentUser.email || '',
            photoURL: currentUser.photoURL || '',
            bio: 'Loves group runs, morning fresh air, and post-run coffee.',
            preferredPace: '5:30 min/km',
            favoriteDistance: '10K',
            shoes: 'Daily Trainers',
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error) {
      console.error('Sign-in error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      const updated: UserProfile = {
        ...(userProfile || {
          uid: user.uid,
          displayName: user.displayName || 'Runner',
          email: user.email || '',
        }),
        ...data,
      };
      await setDoc(doc(db, 'users', user.uid), updated, { merge: true });
      setUserProfile(updated);
      if (data.displayName && auth.currentUser) {
        await updateFirebaseProfile(auth.currentUser, { displayName: data.displayName });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        signInWithGoogle,
        logout,
        updateUserProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
