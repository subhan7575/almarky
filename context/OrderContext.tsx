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
    if (!user?.uid || !db) {
      setOrders([]);
      return;
    }
    try {
      const ordersRef = collection(db, 'orders');
      // Note: This query usually requires a Firestore composite index.
      // If index is missing, it fails, which is handled here.
      const q = query(
        ordersRef, 
        where("customerDetails.phoneNumber", "==", user.phone || ""),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      const fetchedOrders = querySnapshot.docs.map(doc => doc.data() as Order);
      setOrders(fetchedOrders);
    } catch (e) {
      console.warn("Order Sync Note: Firestore index might be needed or user phone is empty.", e);
      // Fallback to local storage for persistence
      const saved = localStorage.getItem('almarky_user_orders');
      if (saved) setOrders(JSON.parse(saved));
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [user]);

  const saveOrder = async (order: Order) => {
    try {
      if (db) {
        const orderRef = doc(db, 'orders', order.orderId);
        await setDoc(orderRef, order);
      }
      
      // Update local state and storage immediately
      const updatedOrders = [order, ...orders];
      setOrders(updatedOrders);
      localStorage.setItem('almarky_user_orders', JSON.stringify(updatedOrders));
      
      return { success: true };
    } catch (e: any) {
      console.error("Order Save Error:", e);
      // Still save locally so user doesn't lose progress if offline
      const updatedOrders = [order, ...orders];
      setOrders(updatedOrders);
      localStorage.setItem('almarky_user_orders', JSON.stringify(updatedOrders));
      return { success: false, error: e.message };
    }
  };

  const getOrderById = async (id: string) => {
    try {
      if (db) {
        const orderRef = doc(db, 'orders', id);
        const docSnap = await getDoc(orderRef);
        if (docSnap.exists()) {
          return docSnap.data() as Order;
        }
      }
      return orders.find(o => o.orderId === id);
    } catch (e) {
      return orders.find(o => o.orderId === id);
    }
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
