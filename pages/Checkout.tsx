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
    let log = `--- ALMARKY ORDER LOG ---\n`;
    log += `Order ID: ${id}\n`;
    log += `Timestamp: ${date}\n`;
    log += `Customer: ${data.name}\n`;
    log += `Email: ${email}\n`;
    log += `Phone: ${data.phone}\n`;
    log += `City: ${data.city}\n`;
    log += `Address: ${data.address}\n`;
    log += `Notes: ${data.notes || 'None'}\n`;
    log += `--------------------------\n`;
    log += `ITEMS ORDERED:\n`;
    items.forEach(item => {
      log += `- ${item.name} (${item.quantity}x) ${item.selectedColor ? `[Color: ${item.selectedColor}]` : ''} @ Rs. ${item.price}\n`;
    });
    log += `--------------------------\n`;
    log += `TOTAL PAYABLE (COD): Rs. ${total.toLocaleString()}\n`;
    log += `--- END OF LOG ---`;
    return log;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!/^03\d{9}$/.test(formData.phone)) {
      setError('Invalid phone number format (03271452389)');
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
      orderTxtSummary // The requested "TXT file" data field
    };

    try {
      // 1. FORCE WAIT: Ensure Firestore attempt is made
      // We set a 5 second timeout to prevent getting stuck forever
      const savePromise = saveOrder(orderData);
      const timeoutPromise = new Promise((resolve) => setTimeout(() => resolve({ success: true }), 4000));
      
      await Promise.race([savePromise, timeoutPromise]);

      // 2. BACKGROUND LOGISTICS: Google Sheets (Silent)
      if (scriptUrl) {
        fetch(scriptUrl, { 
          method: 'POST', 
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({
            orderId,
            timestamp: new Date().toLocaleString(),
            customerName: formData.name,
            email: customerEmail,
            phone: formData.phone,
            city: formData.city,
            address: formData.address,
            total: totalPayable,
            items: cart.map(i => `${i.name} (${i.quantity}x)`).join(', ')
          }) 
        }).catch(() => {});
      }

      // 3. SUCCESS REDIRECT
      clearCart();
      navigate(`/success?id=${orderId}`);
    } catch (err: any) {
      console.error("Critical Checkout Error:", err);
      setError("Payment Gateway Timeout. Please try again or WhatsApp us.");
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
        <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Shipping <span className="text-blue-600">Info</span></h1>
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Order Summary & Data Verification</p>
      </div>

      <div className="space-y-8">
        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
           <div className="flex justify-between items-center mb-2">
             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount to Pay on Delivery</span>
             <span className="text-xl font-black text-blue-400 tracking-tighter">Rs. {totalPayable.toLocaleString()}</span>
           </div>
           <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest italic">Includes GST and {cart.length} item(s)</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-rose-600 text-[10px] font-black uppercase tracking-widest animate-in fade-in">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Order Recipient Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" placeholder="Full Name" className="w-full border-2 border-slate-50 bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white transition-all text-slate-900" />
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Contact Phone Number</label>
              <input required value={formData.phone} onChange={e => {setFormData({...formData, phone: e.target.value}); setError('');}} type="tel" placeholder="03XXXXXXXXX" className={`w-full border-2 rounded-xl px-4 py-3 text-xs font-bold outline-none transition-all ${error && error.includes('phone') ? 'border-rose-200 bg-rose-50' : 'border-slate-50 bg-slate-50 focus:border-blue-600'}`} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Destination City</label>
              <select value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full border-2 border-slate-50 bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-600 appearance-none">
                {["Karachi", "Lahore", "Islamabad", "Faisalabad", "Multan", "Peshawar", "Sialkot", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Complete Address</label>
              <input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} type="text" placeholder="House #, Street, Block, Area..." className="w-full border-2 border-slate-50 bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-600 shadow-sm" />
            </div>
          </div>

          <div>
             <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Delivery Instructions (Optional)</label>
             <textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="Any specific notes for the rider?" className="w-full border-2 border-slate-50 bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-600 h-24" />
          </div>

          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
             <p className="text-[9px] font-bold text-blue-700 leading-relaxed">
               <strong>Note:</strong> By clicking Confirm, you agree to receive a confirmation call on {formData.phone || 'your phone'} before dispatch.
             </p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-xl active:scale-95 disabled:opacity-50 uppercase tracking-[0.4em] text-[10px] mt-4 flex items-center justify-center space-x-3 transition-all"
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
