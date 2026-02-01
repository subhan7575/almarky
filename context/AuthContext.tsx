import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  serverTimestamp, 
  Firestore 
} from 'firebase/firestore';

import { getFirebaseKey } from '../utils/security';

// Firebase configuration using secure environment variables
const firebaseConfig = {
  apiKey: getFirebaseKey(), 
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "almarky-pk.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "almarky-pk",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "almarky-pk.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "1234567890",
  appId: process.env.FIREBASE_APP_ID || "1:1234567890:web:abcdef123456"
};

interface User {
  name: string;
  email: string;
  photo: string;
  isLoggedIn: boolean;
  uid?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Core Firebase Instances (v9+ Modular API)
const firebaseApp: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const firebaseAuth: Auth = getAuth(firebaseApp);
const db: Firestore = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to sync user data to Firestore
  const syncUserToFirestore = async (fUser: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', fUser.uid);
      await setDoc(userRef, {
        uid: fUser.uid,
        name: fUser.displayName,
        email: fUser.email,
        photo: fUser.photoURL,
        lastLogin: serverTimestamp(),
        role: 'customer' // Default role
      }, { merge: true });
    } catch (e) {
      console.error("Firestore Sync Failed:", e);
    }
  };

  useEffect(() => {
    try {
      const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          const userData = {
            name: firebaseUser.displayName || "Almarky User",
            email: firebaseUser.email || "",
            photo: firebaseUser.photoURL || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
            isLoggedIn: true,
            uid: firebaseUser.uid
          };
          setUser(userData);
          // Sync profile to database whenever state changes to logged in
          await syncUserToFirestore(firebaseUser);
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } catch (e) {
      console.error("Firebase Initialization Error:", e);
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      if (result.user) {
        await syncUserToFirestore(result.user);
      }
      return { success: true };
    } catch (error: any) {
      console.error("Login Error:", error);
      const errorMessage = error.message || "An unknown error occurred during sign-in.";
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(firebaseAuth);
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
