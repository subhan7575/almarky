
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order, CartItem } from '../types';

// Extended Order type for more detailed admin view
export interface AdminOrder extends Order {}

interface AdminOrderContextType {
  orders: AdminOrder[];
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  getSummary: () => { totalRevenue: number; activeOrders: number; };
}

const AdminOrderContext = createContext<AdminOrderContextType | undefined>(undefined);

const initialOrders: AdminOrder[] = [
    { orderId: 'ALM-9912', timestamp: Date.now() - 86400000, items: [], totalAmount: 4500, status: 'Dispatched', customerDetails: { customerName: 'Zeeshan Ahmed', phoneNumber: '03001234567', address: '123 ABC Society', city: 'Karachi' } },
    { orderId: 'ALM-9911', timestamp: Date.now() - 172800000, items: [], totalAmount: 3800, status: 'Pending', customerDetails: { customerName: 'Fatima Khan', phoneNumber: '03217654321', address: '456 XYZ Town', city: 'Lahore' } },
    { orderId: 'ALM-9910', timestamp: Date.now() - 259200000, items: [], totalAmount: 2200, status: 'Confirmed', customerDetails: { customerName: 'Imran Hashmi', phoneNumber: '03459876543', address: '789 JKL Road', city: 'Islamabad' } },
    { orderId: 'ALM-9909', timestamp: Date.now() - 345600000, items: [], totalAmount: 3500, status: 'Delivered', customerDetails: { customerName: 'Sana Wazir', phoneNumber: '03332221110', address: '101 PQR Lane', city: 'Faisalabad' } },
    { orderId: 'ALM-9908', timestamp: Date.now() - 432000000, items: [], totalAmount: 7200, status: 'Cancelled', customerDetails: { customerName: 'Babar Ali', phoneNumber: '03120001112', address: '222 EFG Street', city: 'Multan' } },
];

export const AdminOrderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<AdminOrder[]>(() => {
    const saved = localStorage.getItem('almarky_admin_orders');
    return saved ? JSON.parse(saved) : initialOrders;
  });

  useEffect(() => {
    localStorage.setItem('almarky_admin_orders', JSON.stringify(orders));
  }, [orders]);

  const updateOrderStatus = (orderId: string, status: Order['status']) => {
    setOrders(prev => prev.map(o => o.orderId === orderId ? { ...o, status } : o));
  };

  const getSummary = () => {
    const totalRevenue = orders
      .filter(o => o.status === 'Delivered')
      .reduce((acc, o) => acc + o.totalAmount, 0);
    const activeOrders = orders.filter(o => ['Pending', 'Confirmed', 'Dispatched'].includes(o.status)).length;
    return { totalRevenue, activeOrders };
  };

  return (
    <AdminOrderContext.Provider value={{ orders, updateOrderStatus, getSummary }}>
      {children}
    </AdminOrderContext.Provider>
  );
};

export const useAdminOrders = () => {
  const context = useContext(AdminOrderContext);
  if (!context) throw new Error("useAdminOrders must be used within an AdminOrderProvider");
  return context;
};
