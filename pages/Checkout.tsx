import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { getGoogleScriptUrl } from '../utils/security';

const Checkout: React.FC = () => {
  const { cart, totalProductPrice, totalDeliveryPrice, totalPayable, clearCart } = useCart();
  const { saveOrder } = useOrders();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({ name: '', phone: '', address: '', city: 'Karachi', notes: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^03\d{9}$/.test(formData.phone)) {
      setError('Invalid phone number (e.g. 03271452389)');
      return;
    }

    setLoading(true);
    const orderId = `ALM-${Math.floor(10000 + Math.random() * 90000)}`;
    const scriptUrl = getGoogleScriptUrl();
    const payload = {
      orderId,
      timestamp: new Date().toLocaleString('en-PK', { timeZone: 'Asia/Karachi' }),
      customerName: formData.name, phone: formData.phone, city: formData.city, address: formData.address,
      totalAmount: totalPayable, itemSummary: cart.map(item => `${item.name} (${item.quantity}x)`).join(', ')
    };

    try {
      await fetch(scriptUrl, { method: 'POST', mode: 'no-cors', body: JSON.stringify(payload) });
      saveOrder({
        orderId, timestamp: Date.now(), items: [...cart], totalAmount: totalPayable, status: 'Pending',
        customerDetails: { customerName: formData.name, phoneNumber: formData.phone, address: formData.address, city: formData.city }
      });
      clearCart();
      setTimeout(() => navigate('/success'), 800);
    } catch (err) {
      navigate('/success');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) { navigate('/cart'); return null; }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-16 bg-white">
      <div className="mb-8 border-b border-slate-50 pb-4">
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Shipping <span className="text-blue-600">Info</span></h1>
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Direct Cash on Delivery Checkout</p>
      </div>

      <div className="space-y-8">
        {/* Order Preview Mini */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
           <div className="flex justify-between items-center mb-2">
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Order Total</span>
             <span className="text-sm font-black text-blue-600 tracking-tighter">Rs.{totalPayable}</span>
           </div>
           <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest italic">{cart.length} item(s) selected</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Your Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" placeholder="Full Name" className="w-full border-2 border-slate-50 bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white shadow-sm" />
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
              <input required value={formData.phone} onChange={e => {setFormData({...formData, phone: e.target.value}); setError('');}} type="tel" placeholder="03XXXXXXXXX" className={`w-full border-2 rounded-xl px-4 py-3 text-xs font-bold outline-none shadow-sm ${error ? 'border-rose-200 bg-rose-50' : 'border-slate-50 bg-slate-50 focus:border-blue-600'}`} />
              {error && <p className="text-[7px] text-rose-500 font-black uppercase mt-1.5 ml-1">{error}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">City</label>
              <select value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full border-2 border-slate-50 bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-600 shadow-sm appearance-none">
                {["Karachi", "Lahore", "Islamabad", "Faisalabad", "Multan", "Peshawar", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Detailed Address</label>
              <input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} type="text" placeholder="House/Street/Area..." className="w-full border-2 border-slate-50 bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-600 shadow-sm" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl active-press disabled:opacity-50 uppercase tracking-[0.3em] text-[10px] mt-4"
          >
            {loading ? "Processing Order..." : "Confirm My Order (COD)"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Checkout;