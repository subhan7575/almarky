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
  orderBy
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
    // 1. Immediate local load
    const saved = localStorage.getItem('almarky_user_orders');
    if (saved) setOrders(JSON.parse(saved));

    // 2. Background sync from Firestore
    if (!user?.email || !db) return;
    
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(
        ordersRef, 
        where("customerDetails.customerEmail", "==", user.email),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      const fetchedOrders = querySnapshot.docs.map(doc => doc.data() as Order);
      if (fetchedOrders.length > 0) {
        setOrders(fetchedOrders);
        localStorage.setItem('almarky_user_orders', JSON.stringify(fetchedOrders));
      }
    } catch (e) {
      console.warn("Firestore sync skipped, using local vault.");
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [user]);

  const saveOrder = async (order: Order) => {
    // STEP 1: Save to local storage immediately (Zero Latency)
    const local = JSON.parse(localStorage.getItem('almarky_user_orders') || '[]');
    const updated = [order, ...local];
    localStorage.setItem('almarky_user_orders', JSON.stringify(updated));
    setOrders(updated);
    
    // STEP 2: Save to Firestore (Background - NO AWAIT)
    if (db) {
      // Fire and forget - do not await here so the UI doesn't hang
      setDoc(doc(db, 'orders', order.orderId), order)
        .catch(err => console.error("Firestore Background Write Error:", err));
    }
    
    // Resolve immediately
    return { success: true };
  };

  const getOrderById = async (id: string) => {
    // Check local state first
    const local = orders.find(o => o.orderId === id);
    if (local) return local;

    // Fallback to localStorage if state is lost
    const saved = localStorage.getItem('almarky_user_orders');
    if (saved) {
      const parsed = JSON.parse(saved) as Order[];
      const found = parsed.find(o => o.orderId === id);
      if (found) return found;
    }

    // Finally try Firestore
    if (db) {
      try {
        const snap = await getDoc(doc(db, 'orders', id));
        if (snap.exists()) return snap.data() as Order;
      } catch (e) {}
    }
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
  if (!context) throw new Error("useOrders Error");
  return context;
};
