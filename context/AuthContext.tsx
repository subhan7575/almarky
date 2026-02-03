import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { initializeApp, getApps, getApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged
} from 'firebase/auth';
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
import type { Firestore } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { FirebaseStorage } from 'firebase/storage';
import { Address } from '../types';

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

// Guaranteed Initialization
let firebaseApp: FirebaseApp;
export let auth: Auth;
export let db: Firestore;
export let storage: FirebaseStorage;

try {
  firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(firebaseApp);
  db = getFirestore(firebaseApp);
  storage = getStorage(firebaseApp);
} catch (error) {
  console.error("Firebase Critical Error:", error);
}

const googleProvider = new GoogleAuthProvider();

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('almarky_user_cache');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);

  const fetchAddresses = async (uid: string) => {
    if (!db) return;
    try {
      const addressesCol = collection(db, 'users', uid, 'addresses');
      const addressSnapshot = await getDocs(addressesCol);
      const userAddresses = addressSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Address));
      setAddresses(userAddresses.sort((a, b) => (b.isDefault ? 1 : -1) - (a.isDefault ? 1 : -1)));
    } catch (e) {}
  };
  
  const syncProfile = async (firebaseUser: FirebaseUser) => {
    if (!db) return;
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const dbData = userSnap.data();
        const updated = {
          uid: firebaseUser.uid,
          name: dbData.name || firebaseUser.displayName || "User",
          email: firebaseUser.email || "",
          photo: dbData.photo || firebaseUser.photoURL || "https://www.gravatar.com/avatar/?d=mp",
          isLoggedIn: true,
          phone: dbData.phone || ''
        };
        setUser(updated);
        localStorage.setItem('almarky_user_cache', JSON.stringify(updated));
        updateDoc(userRef, { lastLogin: serverTimestamp() }).catch(() => {});
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
      }
      fetchAddresses(firebaseUser.uid);
    } catch (error) {
      console.warn("Sync failed.");
    }
  };

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser) {
        const basic = {
          name: fbUser.displayName || "User",
          email: fbUser.email || "",
          photo: fbUser.photoURL || "https://www.gravatar.com/avatar/?d=mp",
          isLoggedIn: true,
          uid: fbUser.uid,
          phone: '',
        };
        setUser(prev => prev?.uid === basic.uid ? prev : basic);
        syncProfile(fbUser);
      } else {
        setUser(null);
        setAddresses([]);
        localStorage.removeItem('almarky_user_cache');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    if (!auth) return { success: false, error: "Auth offline" };
    try {
      await signInWithPopup(auth, googleProvider);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    if (auth) await signOut(auth);
  };

  const updateUserProfile = async (uid: string, data: any) => {
    if (!db) return { success: false };
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, data);
    setUser(p => p ? { ...p, ...data } : null);
    return { success: true };
  };

  const updateUserPhoto = async (uid: string, file: File) => {
    if (!storage || !db) return { success: false };
    const sRef = ref(storage, `profiles/${uid}/${file.name}`);
    await uploadBytes(sRef, file);
    const url = await getDownloadURL(sRef);
    await updateDoc(doc(db, 'users', uid), { photo: url });
    setUser(p => p ? { ...p, photo: url } : null);
    return { success: true };
  };

  const addAddress = async (uid: string, data: any) => {
    if (!db) return { success: false };
    const col = collection(db, 'users', uid, 'addresses');
    await addDoc(col, data);
    fetchAddresses(uid);
    return { success: true };
  };

  const updateAddress = async (uid: string, id: string, data: any) => {
    if (!db) return { success: false };
    await updateDoc(doc(db, 'users', uid, 'addresses', id), data);
    fetchAddresses(uid);
    return { success: true };
  };

  const deleteAddress = async (uid: string, id: string) => {
    if (!db) return { success: false };
    await deleteDoc(doc(db, 'users', uid, 'addresses', id));
    fetchAddresses(uid);
    return { success: true };
  };

  const setDefaultAddress = async (uid: string, id: string) => {
    if (!db) return { success: false };
    const batch = writeBatch(db);
    const col = collection(db, 'users', uid, 'addresses');
    const snaps = await getDocs(col);
    snaps.forEach(d => batch.update(d.ref, { isDefault: d.id === id }));
    await batch.commit();
    fetchAddresses(uid);
    return { success: true };
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
  if (!context) throw new Error("useAuth Error");
  return context;
};
