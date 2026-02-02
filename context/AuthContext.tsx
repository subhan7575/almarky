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
    } catch (e) {
      setAddresses([]);
    }
  };
  
  const syncProfileInBackground = async (firebaseUser: FirebaseUser) => {
    if (!db) return;
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const dbData = userSnap.data();
        const updatedUser = {
          uid: firebaseUser.uid,
          name: dbData.name || firebaseUser.displayName || "User",
          email: firebaseUser.email || "",
          photo: dbData.photo || firebaseUser.photoURL || "https://www.gravatar.com/avatar/?d=mp",
          isLoggedIn: true,
          phone: dbData.phone || ''
        };
        setUser(updatedUser);
        localStorage.setItem('almarky_user_cache', JSON.stringify(updatedUser));
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
      console.warn("Silent profile sync failed.");
    }
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const basicUser = {
          name: firebaseUser.displayName || "User",
          email: firebaseUser.email || "",
          photo: firebaseUser.photoURL || "https://www.gravatar.com/avatar/?d=mp",
          isLoggedIn: true,
          uid: firebaseUser.uid,
          phone: '',
        };
        setUser(prev => prev?.uid === basicUser.uid ? prev : basicUser);
        syncProfileInBackground(firebaseUser);
      } else {
        setUser(null);
        setAddresses([]);
        localStorage.removeItem('almarky_user_cache');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (!auth) return { success: false, error: "Firebase offline." };
    try {
      await signInWithPopup(auth, googleProvider);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setUser(null);
      setAddresses([]);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const updateUserProfile = async (uid: string, data: { name?: string; phone?: string }) => {
    if (!db) return { success: false, error: "Database offline" };
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
    if (!db || !storage) return { success: false, error: "Storage offline" };
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
    if (!db) return { success: false, error: "DB offline" };
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
      fetchAddresses(uid);
      return { success: true };
    } catch (e: any) { return { success: false, error: e.message }; }
  };

  const addAddress = async (uid: string, addressData: Omit<Address, 'id'>) => {
    if (!db) return { success: false, error: "DB offline" };
    try {
      if (addressData.isDefault) await setDefaultAddress(uid, '');
      const addressesCol = collection(db, 'users', uid, 'addresses');
      const newDocRef = await addDoc(addressesCol, addressData);
      if (addressData.isDefault) await setDefaultAddress(uid, newDocRef.id);
      fetchAddresses(uid);
      return { success: true };
    } catch (e: any) { return { success: false, error: e.message }; }
  };

  const updateAddress = async (uid: string, addressId: string, addressData: Partial<Omit<Address, 'id'>>) => {
    if (!db) return { success: false, error: "DB offline" };
    try {
      if (addressData.isDefault) await setDefaultAddress(uid, addressId);
      const addressRef = doc(db, 'users', uid, 'addresses', addressId);
      await updateDoc(addressRef, addressData);
      fetchAddresses(uid);
      return { success: true };
    } catch (e: any) { return { success: false, error: e.message }; }
  };

  const deleteAddress = async (uid: string, addressId: string) => {
    if (!db) return { success: false, error: "DB offline" };
    try {
      await deleteDoc(doc(db, 'users', uid, 'addresses', addressId));
      fetchAddresses(uid);
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
