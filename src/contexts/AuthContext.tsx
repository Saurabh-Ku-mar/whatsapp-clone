'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider, signInWithPopup, signOut, onAuthStateChanged, doc, getDoc, setDoc, updateDoc, serverTimestamp } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  online: boolean;
  lastSeen: any;
  createdAt: any;
  phoneNumber?: string;
  bio?: string;
}

interface AuthContextType {
  user: any | null;
  userData: UserData | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserData>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          setUserData(userSnap.data() as UserData);
          await updateDoc(userRef, { online: true, lastSeen: serverTimestamp() });
        } else {
          const newUser: UserData = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
            photoURL: firebaseUser.photoURL || `https://ui-avatars.com/api/?background=25D366&color=fff&name=${(firebaseUser.displayName || 'User').substring(0, 2)}`,
            online: true,
            lastSeen: serverTimestamp(),
            createdAt: serverTimestamp(),
            bio: '',
          };
          await setDoc(userRef, newUser);
          setUserData(newUser);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      toast.success(`Welcome ${result.user.displayName || 'to WhatsApp Clone'}!`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to sign in');
    }
  };

  const logout = async () => {
    try {
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), { online: false, lastSeen: serverTimestamp() });
      }
      await signOut(auth);
      toast.success('Logged out');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const updateUserProfile = async (data: Partial<UserData>) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), data);
      setUserData(prev => prev ? { ...prev, ...data } : null);
      toast.success('Profile updated!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, signInWithGoogle, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
