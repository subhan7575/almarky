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

  // This function runs in the background to sync/fetch full profile data from Firestore
  // without blocking the UI.
  const syncAndFetchFullProfile = async (firebaseUser: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const dbUser = userSnap.data();
        // We have the full profile, let's update the state with any extra info like phone number
        setUser(prevUser => ({
          // Base the update on the latest auth state, but enrich with DB data
          ...(prevUser || {
            name: firebaseUser.displayName || "Almarky User",
            email: firebaseUser.email || "",
            photo: firebaseUser.photoURL || "https://www.gravatar.com/avatar/?d=mp",
            isLoggedIn: true,
            uid: firebaseUser.uid
          }),
          phone: dbUser.phone || '',
          name: dbUser.name || firebaseUser.displayName || "Almarky User", // DB name is source of truth if exists
        }));
        // Update last login time in the background
        await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });

      } else {
        // Profile doesn't exist, create it in Firestore
        const newUserProfile = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photo: firebaseUser.photoURL,
          lastLogin: serverTimestamp(),
          createdAt: serverTimestamp(),
          role: 'customer',
          phone: ''
        };
        await setDoc(userRef, newUserProfile);
      }
    } catch (e) {
      console.error("Firestore Sync Failed:", e);
      // The user is already logged in on the UI, so we just log the error.
      // The app remains functional.
    }
  };


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (firebaseUser) => {
      if (firebaseUser) {
        // Optimistic UI update: Log the user in immediately with Google data
        setUser({
          name: firebaseUser.displayName || "Almarky User",
          email: firebaseUser.email || "",
          photo: firebaseUser.photoURL || "https://www.gravatar.com/avatar/?d=mp",
          isLoggedIn: true,
          uid: firebaseUser.uid,
          phone: '', // Default phone until DB sync
        });
        // Then, sync with Firestore in the background
        syncAndFetchFullProfile(firebaseUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    setLoading(true);
    try {
      const result = await signInWithPopup(firebaseAuth, googleProvider);
      const firebaseUser = result.user;

      if (firebaseUser) {
        // Optimistic UI update: Set user state immediately for a fast experience
        setUser({
          name: firebaseUser.displayName || "Almarky User",
          email: firebaseUser.email || "",
          photo: firebaseUser.photoURL || "https://www.gravatar.com/avatar/?d=mp",
          isLoggedIn: true,
          uid: firebaseUser.uid,
          phone: ''
        });
        // Sync to Firestore in the background, don't await it here
        syncAndFetchFullProfile(firebaseUser);
      }
      return { success: true };
    } catch (error: any) {
      console.error("Login Error:", error);
      // Provide a more specific error message if Firestore is the issue
      if (error.message.includes('offline')) {
        return { success: false, error: "Could not connect to the profile server. Please check your internet connection." };
      }
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
