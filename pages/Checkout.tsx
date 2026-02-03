import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';


const Checkout: React.FC = () => {
  const { cart, totalPayable, clearCart } = useCart();
  const { saveOrder } = useOrders();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ 
    name: user?.name || '', 
    phone: user?.phone || '', 
    address: '', 
    city: 'Karachi', 
    notes: '' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, name: user.name, phone: user.phone || '' }));
    }
  }, [user]);

  const generateOrderTxt = (id: string, email: string, data: any, items: any[], total: number) => {
    const date = new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' });
    let log = `--- ALMARKY OFFICIAL ORDER LOG ---\n`;
    log += `ORDER ID    : ${id}\n`;
    log += `DATE        : ${date}\n`;
    log += `\nCUSTOMER INFO:\n`;
    log += `Name        : ${data.name}\n`;
    log += `Email       : ${email}\n`;
    log += `Phone       : ${data.phone}\n`;
    log += `City        : ${data.city}\n`;
    log += `Address     : ${data.address}\n`;
    log += `Notes       : ${data.notes || 'No special instructions'}\n`;
    log += `\nPRODUCT SUMMARY:\n`;
    items.forEach((item, i) => {
      log += `${i+1}. ${item.name} | Qty: ${item.quantity} | ${item.selectedColor ? `Color: ${item.selectedColor}` : 'Standard'} | Rs. ${item.price}\n`;
    });
    log += `\n----------------------------------\n`;
    log += `TOTAL PAYABLE (COD): Rs. ${total.toLocaleString()}\n`;
    log += `--- END OF LOG ---`;
    return log;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!/^03\d{9}$/.test(formData.phone)) {
      setError('Invalid phone number format (03XXXXXXXXX)');
      return;
    }

    setLoading(true);
    const orderId = `ALM-${Math.floor(10000 + Math.random() * 90000)}`;
    const scriptUrl = getGoogleScriptUrl();
    const customerEmail = user?.email || "guest@almarky.shop";

    const orderTxtSummary = generateOrderTxt(orderId, customerEmail, formData, cart, totalPayable);

    const orderData = {
      orderId, 
      timestamp: Date.now(), 
      items: [...cart], 
      totalAmount: totalPayable, 
      status: 'Pending' as const,
      customerDetails: { 
        customerName: formData.name, 
        customerEmail: customerEmail,
        phoneNumber: formData.phone, 
        address: formData.address, 
        city: formData.city,
        notes: formData.notes
      },
      orderTxtSummary 
    };

    // IMMEDIATE SAVE & REDIRECT
    try {
      // 1. We don't await firestore inside the context anymore, but we call saveOrder
      await saveOrder(orderData);

      // 2. Background logic for Google Sheets
      if (scriptUrl) {
        fetch(scriptUrl, { 
          method: 'POST', 
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ orderId, log: orderTxtSummary }) 
        }).catch(() => {});
      }

      // 3. Short wait for user feeling of "processing" before redirecting
      setTimeout(() => {
        clearCart();
        navigate(`/success?id=${orderId}`);
      }, 600);

    } catch (err: any) {
      console.error("Submission Error:", err);
      setError("System temporary busy. Please try again.");
      setLoading(false);
    }
  };

  if (cart.length === 0) { navigate('/cart'); return null; }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-16 bg-white min-h-[60vh]">
      <div className="mb-8 border-b border-slate-50 pb-4 text-center md:text-left">
        <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Secure <span className="text-blue-600">Checkout</span></h1>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Cash on Delivery across Pakistan</p>
      </div>

      <div className="space-y-8">
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
           <div className="relative z-10">
             <div className="flex justify-between items-center mb-2">
               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payable to Rider</span>
               <span className="text-2xl font-black text-blue-400 tracking-tighter">Rs. {totalPayable.toLocaleString()}</span>
             </div>
             <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest italic">{cart.length} item(s) in your parcel</p>
           </div>
           <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl"></div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl text-rose-600 text-[10px] font-black uppercase tracking-widest animate-in fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Order Recipient</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" placeholder="e.g., Ali Raza" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-6 py-4.5 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all shadow-sm" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Active Phone</label>
              <input required value={formData.phone} onChange={e => {setFormData({...formData, phone: e.target.value}); setError('');}} type="tel" placeholder="03XXXXXXXXX" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-6 py-4.5 text-xs font-bold outline-none focus:border-blue-600 shadow-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Destination City</label>
              <select value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-6 py-4.5 text-xs font-bold outline-none focus:border-blue-600 appearance-none shadow-sm">
                {["Karachi", "Lahore", "Islamabad", "Faisalabad", "Multan", "Peshawar", "Sialkot", "Quetta", "Gujranwala", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Shipping Address</label>
              <input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} type="text" placeholder="House/Flat #, Street, Block, Area..." className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-6 py-4.5 text-xs font-bold outline-none focus:border-blue-600 shadow-sm" />
            </div>
          </div>

          <div className="space-y-2">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rider Instructions (Optional)</label>
             <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="e.g., Leave at gate if not home" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-6 py-4 text-xs font-bold outline-none focus:border-blue-600 h-28 shadow-sm" />
          </div>

          <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 flex items-start space-x-4">
             <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <p className="text-[10px] font-bold text-blue-900 leading-relaxed">
               <strong>Safety Protocol:</strong> Our representative will call you on <strong>{formData.phone || 'your provided number'}</strong> for final verification before dispatch. Please keep your phone active.
             </p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-7 rounded-[2rem] shadow-2xl active:scale-95 disabled:opacity-50 uppercase tracking-[0.4em] text-xs mt-6 flex items-center justify-center space-x-3 transition-all"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                <span>Securing Order...</span>
              </>
            ) : "Confirm My Order (COD)"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
