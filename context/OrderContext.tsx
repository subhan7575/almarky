import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order } from '../types';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { useAuth, db } from './AuthContext';

interface OrderContextType {
  orders: Order[];
  saveOrder: (order: Order) => Promise<{ success: boolean; error?: string }>;
  getOrderById: (id: string) => Promise<Order | undefined>;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { user } = useAuth();

  const fetchUserOrders = async () => {
    // 1. Instant local load
    const saved = localStorage.getItem('almarky_user_orders');
    if (saved) setOrders(JSON.parse(saved));

    if (!user?.uid || !db) return;
    
    try {
      const ordersRef = collection(db, 'orders');
      // Link orders by the phone number used during checkout or the user's logged-in UID
      const q = query(
        ordersRef, 
        where("customerDetails.phoneNumber", "==", user.phone || user.email),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      const fetchedOrders = querySnapshot.docs.map(doc => doc.data() as Order);
      
      if (fetchedOrders.length > 0) {
        setOrders(fetchedOrders);
        localStorage.setItem('almarky_user_orders', JSON.stringify(fetchedOrders));
      }
    } catch (e) {
      console.warn("Firestore order sync skipped - using local cache.");
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [user]);

  const saveOrder = async (order: Order) => {
    // 1. UPDATE LOCAL STORAGE IMMEDIATELY (Zero Latency)
    const currentOrders = JSON.parse(localStorage.getItem('almarky_user_orders') || '[]');
    const updatedOrders = [order, ...currentOrders];
    localStorage.setItem('almarky_user_orders', JSON.stringify(updatedOrders));
    setOrders(updatedOrders);
    
    // 2. BACKGROUND FIRESTORE SYNC (Clean & Structured)
    if (db) {
      const orderRef = doc(db, 'orders', order.orderId);
      // We don't "await" this in the UI thread to keep the checkout lightning fast
      setDoc(orderRef, {
        ...order,
        serverTime: serverTimestamp(), // Add server-side timestamp for reliability
        customerUid: user?.uid || 'guest'
      }).catch(err => {
        console.error("Firestore order logging failed, order preserved locally:", err);
      });
    }
    
    return { success: true };
  };

  const getOrderById = async (id: string) => {
    const local = orders.find(o => o.orderId === id);
    if (local) return local;

    try {
      if (db) {
        const orderRef = doc(db, 'orders', id);
        const docSnap = await getDoc(orderRef);
        if (docSnap.exists()) return docSnap.data() as Order;
      }
    } catch (e) {}
    return undefined;
  };

  return (
    <OrderContext.Provider value={{ orders, saveOrder, getOrderById, refreshOrders: fetchUserOrders }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrders must be used within an OrderProvider");
  return context;
};
