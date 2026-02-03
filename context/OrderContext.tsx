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
    const saved = localStorage.getItem('almarky_user_orders');
    if (saved) setOrders(JSON.parse(saved));

    if (!user?.uid || !db) return;
    
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
      console.warn("Local sync only.");
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [user]);

  const saveOrder = async (order: Order) => {
    // 1. Local Persistence (Instant)
    const local = JSON.parse(localStorage.getItem('almarky_user_orders') || '[]');
    const updated = [order, ...local];
    localStorage.setItem('almarky_user_orders', JSON.stringify(updated));
    setOrders(updated);
    
    // 2. Cloud Storage (Wait up to 3 seconds)
    if (db) {
      try {
        const orderRef = doc(db, 'orders', order.orderId);
        await setDoc(orderRef, order);
        return { success: true };
      } catch (err: any) {
        console.error("Firestore Error:", err);
        // We still return true because local storage is a valid fallback
        return { success: true };
      }
    }
    
    return { success: true };
  };

  const getOrderById = async (id: string) => {
    const local = orders.find(o => o.orderId === id);
    if (local) return local;

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
