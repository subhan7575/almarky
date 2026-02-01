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
  getDoc,
  serverTimestamp, 
  Firestore,
  updateDoc
} from 'firebase/firestore';

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
  uid: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUserProfile: (uid: string, data: { name?: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const firebaseApp: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const analytics = getAnalytics(firebaseApp);
const firebaseAuth: Auth = getAuth(firebaseApp);
const db: Firestore = getFirestore(firebaseApp);
const googleProvider = new GoogleAuthProvider();

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (firebaseUser: FirebaseUser): Promise<User> => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const dbUser = userSnap.data();
      return {
        uid: firebaseUser.uid,
        name: dbUser.name || firebaseUser.displayName || "Almarky User",
        email: dbUser.email || firebaseUser.email || "",
        photo: dbUser.photo || firebaseUser.photoURL || "https://www.gravatar.com/avatar/?d=mp",
        isLoggedIn: true,
        phone: dbUser.phone || ''
      };
    } else {
      // Create profile if it doesn't exist
      const newUser = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        photo: firebaseUser.photoURL,
        lastLogin: serverTimestamp(),
        createdAt: serverTimestamp(),
        role: 'customer',
        phone: ''
      };
      await setDoc(userRef, newUser, { merge: true });
      return {
        ...newUser,
        name: newUser.name || "Almarky User",
        email: newUser.email || "",
        photo: newUser.photo || "https://www.gravatar.com/avatar/?d=mp",
        isLoggedIn: true,
      };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        const fullUserProfile = await fetchUserProfile(firebaseUser);
        setUser(fullUserProfile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setLoading(true);
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const firebaseUser = result.user;
      if (firebaseUser) {
        const fullUserProfile = await fetchUserProfile(firebaseUser);
        setUser(fullUserProfile);
      }
      return { success: true };
    } catch (error: any) {
      console.error("Login Error:", error);
      return { success: false, error: error.message || "An unknown error occurred." };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(firebaseAuth);
      setUser(null);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const updateUserProfile = async (uid: string, data: { name?: string; phone?: string }) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, data);
      setUser(prevUser => prevUser ? { ...prevUser, ...data } : null);
      return { success: true };
    } catch (error: any) {
      console.error("Profile Update Error:", error);
      return { success: false, error: error.message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
