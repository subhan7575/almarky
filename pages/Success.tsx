import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Success: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const orderId = queryParams.get('id');

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center bg-white min-h-[70vh]">
      <div className="mb-8 flex justify-center">
        <div className="bg-emerald-100 p-6 rounded-full text-emerald-600 animate-in zoom-in duration-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
      
      <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tighter uppercase">Order Placed!</h1>
      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mb-8">Verified & Secured</p>

      {orderId && (
        <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 mb-8 inline-block px-12">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Tracking ID</p>
          <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">#{orderId}</h2>
        </div>
      )}

      <p className="text-sm text-slate-500 mb-10 font-medium max-w-sm mx-auto leading-relaxed">
        Thank you for choosing Almarky. We have received your request. Our team will contact you for confirmation before dispatching.
      </p>

      <div className="space-y-4 max-w-xs mx-auto">
        {orderId && (
          <Link 
            to={`/track-order?id=${orderId}`} 
            className="block w-full bg-slate-900 text-white font-black py-5 rounded-2xl hover:bg-blue-600 transition shadow-2xl uppercase tracking-widest text-[10px]"
          >
            Track Live Status
          </Link>
        )}
        <Link 
          to="/shop" 
          className="block w-full bg-slate-50 text-slate-900 font-black py-5 rounded-2xl hover:bg-slate-200 transition uppercase tracking-widest text-[10px]"
        >
          Continue Shopping
        </Link>
      </div>

      <div className="mt-16 pt-8 border-t border-slate-50">
        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em]">
          Support: 0327-1452389 (WhatsApp)
        </p>
      </div>
    </div>
  );
};

export default Success;
