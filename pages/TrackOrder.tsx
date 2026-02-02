import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useOrders } from '../context/OrderContext';
import { Order } from '../types';


const TrackOrder: React.FC = () => {
  const { getOrderById } = useOrders();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialId = queryParams.get('id') || '';

  const [query, setQuery] = useState(initialId);
  const [trackingResult, setTrackingResult] = useState<Order | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'not_found' | 'found'>('idle');

  useEffect(() => {
    if (initialId) {
      handleTrack(null, initialId);
    }
  }, [initialId]);

  const handleTrack = async (e: React.FormEvent | null, overrideId?: string) => {
    if (e) e.preventDefault();
    const orderId = (overrideId || query).trim();
    if (!orderId) return;
    
    setStatus('loading');
    setTrackingResult(null);
    
    try {
      const found = await getOrderById(orderId);
      if (found) {
        setTrackingResult(found);
        setStatus('found');
      } else {
        setStatus('not_found');
      }
    } catch (err) {
      setStatus('not_found');
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'Delivered': return 'bg-emerald-600';
      case 'Cancelled': return 'bg-rose-600';
      case 'Pending': return 'bg-amber-500';
      default: return 'bg-blue-600';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 bg-white min-h-[70vh]">
      <header className="text-center mb-12">
        <h1 className="text-3xl md:text-6xl font-black text-slate-900 tracking-tighter uppercase mb-4 leading-none">
          Track <span className="text-blue-600">Order</span>
        </h1>
        <p className="text-slate-400 text-[10px] md:text-sm font-bold uppercase tracking-widest max-w-xs mx-auto">
          Enter your unique Almarky Order ID
        </p>
      </header>

      <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 max-w-lg mx-auto mb-12">
        <form onSubmit={(e) => handleTrack(e)} className="space-y-4">
          <input 
            type="text" 
            placeholder="e.g., ALM-12345" 
            className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-6 py-4 outline-none focus:border-blue-600 focus:bg-white transition-all font-black text-xs text-slate-900"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-xl hover:bg-blue-600 transition-all uppercase tracking-widest text-[10px] active-press">
            Search Tracking
          </button>
        </form>
      </div>

      {status === 'loading' && (
        <div className="flex flex-col items-center py-12">
           <Spinner size="md" />
           <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[8px] mt-4">Connecting to Logistics Engine...</p>
        </div>
      )}

      {status === 'not_found' && (
        <div className="bg-rose-50 border border-rose-100 rounded-[2rem] p-8 text-center animate-in zoom-in duration-300 max-w-md mx-auto">
          <h3 className="text-sm font-black text-rose-900 uppercase tracking-tight mb-2">Order Not Located</h3>
          <p className="text-rose-700 text-[9px] font-bold uppercase tracking-widest mb-6 leading-relaxed">
            We couldn't find an order with ID "{query}". Please verify the ID from your confirmation message.
          </p>
          <a href="https://wa.me/923271452389" className="inline-block bg-rose-600 text-white px-6 py-2.5 rounded-lg font-black text-[9px] uppercase tracking-widest active-press">Verify on WhatsApp</a>
        </div>
      )}

      {status === 'found' && trackingResult && (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl p-6 md:p-10 animate-in slide-in-from-bottom-8 duration-500 max-w-2xl mx-auto">
           <div className="flex justify-between items-center mb-8 pb-6 border-b border-slate-50">
              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase">#{trackingResult.orderId}</h3>
                <p className="text-slate-400 text-[9px] font-black uppercase mt-1">{trackingResult.customerDetails.customerName}</p>
              </div>
              <div className="text-right">
                <p className="text-[7px] font-black text-slate-300 uppercase mb-1">Current Status</p>
                <span className={`${getStatusColor(trackingResult.status)} text-white text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/20`}>
                  {trackingResult.status}
                </span>
              </div>
           </div>

           <div className="space-y-8 relative">
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-100"></div>
              {[
                { label: 'Order Placed', time: new Date(trackingResult.timestamp).toLocaleDateString(), done: true },
                { label: 'Confirmed', time: 'Verification Complete', done: ['Confirmed', 'Dispatched', 'Delivered'].includes(trackingResult.status) },
                { label: 'Dispatched', time: 'In Transit', done: ['Dispatched', 'Delivered'].includes(trackingResult.status) },
                { label: 'Delivered', time: 'At Destination', done: trackingResult.status === 'Delivered' },
              ].map((step, i) => (
                <div key={i} className="flex items-start relative z-10">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-6 transition-colors duration-500 ${step.done ? getStatusColor(trackingResult.status) + ' text-white' : 'bg-slate-100 text-slate-300'}`}>
                    {step.done ? <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>}
                  </div>
                  <div>
                    <h4 className={`text-[11px] font-black uppercase tracking-tight ${step.done ? 'text-slate-900' : 'text-slate-300'}`}>{step.label}</h4>
                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">{step.time}</p>
                  </div>
                </div>
              ))}
           </div>
           
           <div className="mt-10 bg-slate-900 rounded-2xl p-6 text-center text-white">
              <p className="text-[7px] font-black uppercase tracking-[0.3em] text-slate-500 mb-2">Total Amount to Pay (COD)</p>
              <h4 className="text-xl font-black tracking-tighter">Rs. {trackingResult.totalAmount.toLocaleString()}</h4>
              <p className="text-[8px] text-blue-400 font-black uppercase mt-3 tracking-widest">Expected Delivery: 2-4 Working Days</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrder;
