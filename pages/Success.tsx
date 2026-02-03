import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { Order } from '../types';


const Success: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get('id');
  const { getOrderById } = useOrders();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (orderId) {
        const data = await getOrderById(orderId);
        if (data) setOrder(data);
      }
      setLoading(false);
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white">
        <Spinner />
        <p className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Finalizing Your Receipt...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 text-center bg-white min-h-[80vh]">
      <div className="mb-12 flex flex-col items-center">
        <div className="bg-emerald-500 p-8 rounded-full text-white animate-in zoom-in duration-700 shadow-2xl shadow-emerald-500/20 mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-2 tracking-tighter uppercase">Thank You!</h1>
        <p className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.5em] mb-6">Your order is officially locked in.</p>
      </div>

      <div className="bg-slate-50 rounded-[3.5rem] border border-slate-100 p-8 md:p-16 text-left mb-12 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] -mr-32 -mt-32"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-200 pb-10">
           <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Receipt Number</p>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">#{orderId}</h2>
           </div>
           <div className="md:text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
              <span className="bg-blue-600 text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-widest shadow-xl shadow-blue-500/20">Pending Verification</span>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
           {/* Customer Details Column */}
           <div className="space-y-8">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-l-4 border-emerald-500 pl-4">Delivery Profile</h3>
              <div className="space-y-6">
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Recipient Name</p>
                    <p className="text-base font-bold text-slate-900">{order?.customerDetails.customerName}</p>
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                    <p className="text-base font-bold text-slate-900">{order?.customerDetails.phoneNumber}</p>
                 </div>
                 <div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Shipping Address</p>
                    <p className="text-base font-bold text-slate-900 leading-relaxed uppercase">{order?.customerDetails.address}, {order?.customerDetails.city}</p>
                 </div>
                 {order?.customerDetails.notes && (
                   <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Notes for Rider</p>
                      <p className="text-xs font-medium text-slate-600 italic">"{order?.customerDetails.notes}"</p>
                   </div>
                 )}
              </div>
           </div>

           {/* Summary Column */}
           <div className="space-y-8">
              <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-widest border-l-4 border-orange-500 pl-4">Items Summary</h3>
              <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl space-y-6">
                 {order?.items.map((item, idx) => (
                   <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex flex-col">
                         <span className="font-black text-slate-900 uppercase tracking-tight">{item.name}</span>
                         <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Qty: {item.quantity} {item.selectedColor ? `• ${item.selectedColor}` : ''}</span>
                      </div>
                      <span className="font-black text-slate-900">Rs.{(item.price * item.quantity).toLocaleString()}</span>
                   </div>
                 ))}
                 
                 <div className="pt-6 border-t border-slate-100 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                       <span>Shipping Fee</span>
                       <span>Rs. {order?.items.reduce((acc, i) => acc + (i.deliveryCharges * i.quantity), 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-end pt-4">
                       <div className="flex flex-col">
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Total (COD)</span>
                          <span className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Rs. {order?.totalAmount.toLocaleString()}</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 max-w-xl mx-auto">
        <Link 
          to={`/track-order?id=${orderId}`} 
          className="flex-1 bg-slate-900 text-white font-black py-6 rounded-3xl hover:bg-blue-600 transition shadow-2xl uppercase tracking-[0.2em] text-[10px] active-press"
        >
          Track Live Status
        </Link>
        <Link 
          to="/shop" 
          className="flex-1 bg-slate-50 text-slate-900 font-black py-6 rounded-3xl hover:bg-slate-200 transition uppercase tracking-[0.2em] text-[10px] active-press border border-slate-100"
        >
          Return to Shop
        </Link>
      </div>

      <div className="mt-16 bg-blue-50/50 inline-flex items-center space-x-3 px-8 py-3 rounded-full border border-blue-100">
        <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
        <span className="text-[10px] font-black uppercase text-blue-900 tracking-[0.2em]">Team Almarky will call for verification shortly</span>
      </div>
    </div>
  );
};

export default Success;
