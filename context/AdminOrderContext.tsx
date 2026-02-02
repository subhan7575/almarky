import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order } from '../types';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  orderBy 
} from 'firebase/firestore';

export interface AdminOrder extends Order {}

interface AdminOrderContextType {
  orders: AdminOrder[];
  loading: boolean;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<{ success: boolean; error?: string }>;
  getSummary: () => { totalRevenue: number; activeOrders: number; };
  refreshOrders: () => Promise<void>;
}

const AdminOrderContext = createContext<AdminOrderContextType | undefined>(undefined);

export const AdminOrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const db = getFirestore();

  const fetchAllOrders = async () => {
    setLoading(true);
    try {
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const fetched = querySnapshot.docs.map(doc => doc.data() as AdminOrder);
      setOrders(fetched);
    } catch (e) {
      console.error("Admin Fetch Error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status });
      
      // Update local state for immediate UI response
      setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status } : o));
      return { success: true };
    } catch (e: any) {
      console.error("Status Update Failed:", e);
      return { success: false, error: e.message };
    }
  };

  const getSummary = () => {
    const totalRevenue = orders
      .filter(o => o.status === 'Delivered')
      .reduce((acc, o) => acc + o.totalAmount, 0);
    const activeOrders = orders.filter(o => ['Pending', 'Confirmed', 'Dispatched'].includes(o.status)).length;
    return { totalRevenue, activeOrders };
  };

  return (
    <AdminOrderContext.Provider value={{ orders, loading, updateOrderStatus, getSummary, refreshOrders: fetchAllOrders }}>
      {children}
    </AdminOrderContext.Provider>
  );
};

export const useAdminOrders = () => {
  const context = useContext(AdminOrderContext);
  if (!context) throw new Error("useAdminOrders must be used within an AdminOrderProvider");
  return context;
};
