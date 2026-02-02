
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
// Fix: Import types separately to resolve resolution issues in certain environments.
import type { FirebaseApp } from 'firebase/app';
import { getAnalytics } from "firebase/analytics";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
// Fix: Use import type for Firebase interfaces.
import type { User as FirebaseUser, Auth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp, 
  updateDoc, 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  writeBatch, 
  query, 
  where 
} from 'firebase/firestore';
// Fix: Use import type for Firestore interface.
import type { Firestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// Fix: Correct type name from Storage to FirebaseStorage to avoid conflict with global browser Storage.
import type { FirebaseStorage } from 'firebase/storage';
import { Address } from '../types';

// Using environment variables provided by the user in the hosting environment
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
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
  updateUserPhoto: (uid: string, file: File) => Promise<{ success: boolean; error?: string }>;
  addresses: Address[];
  addAddress: (uid: string, addressData: Omit<Address, 'id'>) => Promise<{ success: boolean; error?: string }>;
  updateAddress: (uid: string, addressId: string, addressData: Partial<Omit<Address, 'id'>>) => Promise<{ success: boolean; error?: string }>;
  deleteAddress: (uid: string, addressId: string) => Promise<{ success: boolean; error?: string }>;
  setDefaultAddress: (uid: string, addressId: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize Firebase only if config is present
let firebaseApp: FirebaseApp;
let firebaseAuth: Auth;
let db: Firestore;
let storage: FirebaseStorage;

try {
  firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  firebaseAuth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);
} catch (error) {
  console.error("Firebase Initialization Error: Ensure all FIREBASE_ environment variables are set.", error);
}

const googleProvider = new GoogleAuthProvider();

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);

  const fetchAddresses = async (uid: string) => {
    try {
      const addressesCol = collection(db, 'users', uid, 'addresses');
      const addressSnapshot = await getDocs(addressesCol);
      const userAddresses = addressSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Address));
      setAddresses(userAddresses.sort((a, b) => (b.isDefault ? 1 : -1) - (a.isDefault ? 1 : -1)));
    } catch (e) {
      console.error("Failed to fetch addresses:", e);
      setAddresses([]);
    }
  };
  
  const syncAndFetchFullProfile = async (firebaseUser: FirebaseUser) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const dbUser = userSnap.data();
        setUser(prevUser => ({
          ...(prevUser as User),
          ...dbUser,
          isLoggedIn: true
        }));
        await updateDoc(userRef, { lastLogin: serverTimestamp() });
      } else {
        const newUserProfile = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || "Almarky User",
          email: firebaseUser.email || "",
          photo: firebaseUser.photoURL || "https://www.gravatar.com/avatar/?d=mp",
          lastLogin: serverTimestamp(),
          createdAt: serverTimestamp(),
          role: 'customer',
          phone: ''
        };
        await setDoc(userRef, newUserProfile);
        setUser({ ...newUserProfile, isLoggedIn: true } as unknown as User);
      }
      await fetchAddresses(firebaseUser.uid);
    } catch (error) {
      console.error("Firestore sync failed:", error);
    }
  };

  useEffect(() => {
    if (!firebaseAuth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          name: firebaseUser.displayName || "Almarky User",
          email: firebaseUser.email || "",
          photo: firebaseUser.photoURL || "https://www.gravatar.com/avatar/?d=mp",
          isLoggedIn: true,
          uid: firebaseUser.uid,
          phone: '',
        });
        await syncAndFetchFullProfile(firebaseUser);
      } else {
        setUser(null);
        setAddresses([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (!firebaseAuth) return { success: false, error: "Firebase not initialized." };
    setLoading(true);
    try {
      await signInWithPopup(firebaseAuth, googleProvider);
      return { success: true };
    } catch (error: any) {
      console.error("Login Error:", error);
      return { success: false, error: error.message || "An unknown error occurred." };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!firebaseAuth) return;
    try {
      await signOut(firebaseAuth);
      setUser(null);
      setAddresses([]);
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
      return { success: false, error: error.message };
    }
  };

  const updateUserPhoto = async (uid: string, file: File) => {
    try {
      const storageRef = ref(storage, `profile_pictures/${uid}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const photoURL = await getDownloadURL(storageRef);

      const userDocRef = doc(db, 'users', uid);
      await updateDoc(userDocRef, { photo: photoURL });

      setUser(prevUser => prevUser ? { ...prevUser, photo: photoURL } : null);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };
  
  const setDefaultAddress = async (uid: string, newDefaultId: string) => {
    try {
      const batch = writeBatch(db);
      const addressesRef = collection(db, 'users', uid, 'addresses');
      const q = query(addressesRef, where("isDefault", "==", true));
      const querySnapshot = await getDocs(q);
      
      querySnapshot.forEach((doc) => {
        if (doc.id !== newDefaultId) batch.update(doc.ref, { isDefault: false });
      });
      
      if (newDefaultId) {
        const newDefaultRef = doc(addressesRef, newDefaultId);
        batch.update(newDefaultRef, { isDefault: true });
      }

      await batch.commit();
      await fetchAddresses(uid);
      return { success: true };
    } catch (e: any) { return { success: false, error: e.message }; }
  };

  const addAddress = async (uid: string, addressData: Omit<Address, 'id'>) => {
    try {
      if (addressData.isDefault && addresses.some(a => a.isDefault)) {
        await setDefaultAddress(uid, '');
      }
      const addressesCol = collection(db, 'users', uid, 'addresses');
      const newDocRef = await addDoc(addressesCol, addressData);
      if (addressData.isDefault) { await setDefaultAddress(uid, newDocRef.id); }
      await fetchAddresses(uid);
      return { success: true };
    } catch (e: any) { return { success: false, error: e.message }; }
  };

  const updateAddress = async (uid: string, addressId: string, addressData: Partial<Omit<Address, 'id'>>) => {
    try {
      if (addressData.isDefault) { await setDefaultAddress(uid, addressId); }
      const addressRef = doc(db, 'users', uid, 'addresses', addressId);
      await updateDoc(addressRef, addressData);
      await fetchAddresses(uid);
      return { success: true };
    } catch (e: any) { return { success: false, error: e.message }; }
  };

  const deleteAddress = async (uid: string, addressId: string) => {
    try {
      await deleteDoc(doc(db, 'users', uid, 'addresses', addressId));
      await fetchAddresses(uid);
      return { success: true };
    } catch (e: any) { return { success: false, error: e.message }; }
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, loading, loginWithGoogle, logout, updateUserProfile, updateUserPhoto,
      addresses, addAddress, updateAddress, deleteAddress, setDefaultAddress
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
