import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
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

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQpivPdkecOb-xMmegwtT0ioEEBbzRXOA",
  authDomain: "almarky-official.firebaseapp.com",
  projectId: "almarky-official",
  storageBucket: "almarky-official.appspot.com",
  messagingSenderId: "344943496520",
  appId: "1:344943496520:web:d77c828a619f3ca882b77d",
  measurementId: "G-RTW87LBFP4"
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
const analytics = getAnalytics(firebaseApp);
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
