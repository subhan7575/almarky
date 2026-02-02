import React, { useState } from 'react';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!/^03\d{9}$/.test(formData.phone)) {
      setError('Please enter a valid 11-digit Pakistani phone number (e.g., 0312345678)');
      return;
    }

    setLoading(true);
    
    // Generate a clean, unique Order ID
    const orderId = `ALM-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const orderData = {
      orderId, 
      timestamp: Date.now(), 
      items: cart.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor || null,
        image: item.images[0]
      })), 
      totalAmount: totalPayable, 
      status: 'Pending' as const,
      customerDetails: { 
        customerName: formData.name, 
        phoneNumber: formData.phone, 
        address: formData.address, 
        city: formData.city,
        notes: formData.notes
      }
    };

    try {
      // 1. SAVE LOCALLY & SYNC TO FIRESTORE (Non-blocking)
      // This function handles both local storage for the user and background sync to Firebase.
      await saveOrder(orderData as any);

      // 2. INSTANT SUCCESS REDIRECT
      // We don't wait for the network to finish. Success is assumed once local storage is locked.
      clearCart();
      navigate(`/success?id=${orderId}`);
    } catch (err: any) {
      console.error("Critical Order Failure:", err);
      setError("We encountered a small system glitch. Please contact support on WhatsApp with your details.");
      setLoading(false);
      window.scrollTo(0, 0);
    }
  };

  if (cart.length === 0) { 
    navigate('/cart'); 
    return null; 
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-16 bg-white min-h-[60vh]">
      <div className="mb-8 border-b border-slate-50 pb-4">
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Checkout <span className="text-blue-600">Securely</span></h1>
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Cash on Delivery • Nationwide Support</p>
      </div>

      <div className="space-y-8">
        <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex justify-between items-center">
           <div>
             <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Total Payable</span>
             <span className="text-xl font-black text-slate-900 tracking-tighter">Rs. {totalPayable.toLocaleString()}</span>
           </div>
           <div className="text-right">
             <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest block mb-1">Method</span>
             <span className="text-[10px] font-black text-slate-900 uppercase">Cash on Delivery</span>
           </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-rose-600 text-[10px] font-black uppercase tracking-widest animate-in fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Consignee Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" placeholder="Full Name" className="w-full border-2 border-slate-50 bg-slate-50 rounded-xl px-4 py-3.5 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all text-slate-900 shadow-sm" />
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Active Mobile No.</label>
              <input required value={formData.phone} onChange={e => {setFormData({...formData, phone: e.target.value}); setError('');}} type="tel" placeholder="03XXXXXXXXX" className="w-full border-2 border-slate-50 bg-slate-50 rounded-xl px-4 py-3.5 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all text-slate-900 shadow-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">City Selection</label>
              <select value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full border-2 border-slate-50 bg-slate-50 rounded-xl px-4 py-3.5 text-xs font-bold outline-none focus:border-blue-600 shadow-sm appearance-none cursor-pointer">
                {["Karachi", "Lahore", "Islamabad", "Faisalabad", "Multan", "Peshawar", "Sialkot", "Gujranwala", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Shipping Address</label>
              <input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} type="text" placeholder="House/Street/Building/Area..." className="w-full border-2 border-slate-50 bg-slate-50 rounded-xl px-4 py-3.5 text-xs font-bold outline-none focus:border-blue-600 shadow-sm" />
            </div>
          </div>

          <div>
             <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Instructions (Optional)</label>
             <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Any specific instructions for the delivery rider?" className="w-full border-2 border-slate-50 bg-slate-50 rounded-xl px-4 py-3.5 text-xs font-bold outline-none focus:border-blue-600 shadow-sm h-28 resize-none" />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl shadow-xl active-press disabled:opacity-50 uppercase tracking-[0.3em] text-[10px] mt-6 flex items-center justify-center space-x-3 transition-all hover:bg-blue-600"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
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
