import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { getUserDoc } from '../lib/firestore';
import type { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });
    const userData: Omit<User, 'id'> = {
      name,
      email,
      role,
      createdAt: new Date().toISOString().split('T')[0],
    };
    await setDoc(doc(db, 'users', user.uid), { ...userData, createdAt: serverTimestamp() });
    setCurrentUser({ id: user.uid, ...userData });
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setFirebaseUser(null);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const userData = await getUserDoc(fbUser.uid);
        setCurrentUser(userData);
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, firebaseUser, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
