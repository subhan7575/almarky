
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order } from '../types';
// Fix: Use standard modular imports for Firestore functions.
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy
} from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { useAuth } from './AuthContext';

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
  const db = getFirestore();

  const fetchUserOrders = async () => {
    if (!user?.uid) {
      setOrders([]);
      return;
    }
    try {
      const ordersRef = collection(db, 'orders');
      // Query orders where the phone number matches or a specific userId field if you add one later
      // For now, let's filter by phone number provided in the order details as a common identifier
      const q = query(
        ordersRef, 
        where("customerDetails.phoneNumber", "==", user.phone || ""),
        orderBy("timestamp", "desc")
      );
      const querySnapshot = await getDocs(q);
      const fetchedOrders = querySnapshot.docs.map(doc => doc.data() as Order);
      setOrders(fetchedOrders);
    } catch (e) {
      console.error("Order Fetch Error:", e);
      // Fallback to local storage for guest orders or if offline
      const saved = localStorage.getItem('almarky_user_orders');
      if (saved) setOrders(JSON.parse(saved));
    }
  };

  useEffect(() => {
    fetchUserOrders();
  }, [user]);

  const saveOrder = async (order: Order) => {
    try {
      const orderRef = doc(db, 'orders', order.orderId);
      await setDoc(orderRef, order);
      
      // Update local state
      const updatedOrders = [order, ...orders];
      setOrders(updatedOrders);
      localStorage.setItem('almarky_user_orders', JSON.stringify(updatedOrders));
      
      return { success: true };
    } catch (e: any) {
      console.error("Cloud Save Error:", e);
      // Still save locally so user doesn't lose data
      const updatedOrders = [order, ...orders];
      setOrders(updatedOrders);
      localStorage.setItem('almarky_user_orders', JSON.stringify(updatedOrders));
      return { success: false, error: e.message };
    }
  };

  const getOrderById = async (id: string) => {
    try {
      const orderRef = doc(db, 'orders', id);
      const docSnap = await getDoc(orderRef);
      if (docSnap.exists()) {
        return docSnap.data() as Order;
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
