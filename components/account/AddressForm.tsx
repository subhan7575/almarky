import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Address } from '../../types';
import Modal from '../ui/Modal.tsx';

interface AddressFormProps {
  initialData?: Address | null;
  onCancel: () => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ initialData, onCancel }) => {
  const { user, addAddress, updateAddress } = useAuth();
  const [formData, setFormData] = useState({
    tag: initialData?.tag || 'Home',
    fullName: initialData?.fullName || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    city: initialData?.city || 'Karachi',
    isDefault: initialData?.isDefault || false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!/^03\d{9}$/.test(formData.phone)) {
      setError('Invalid phone number (e.g. 03271452389)');
      return;
    }

    setIsSaving(true);
    setError('');
    
    const dataToSave: Omit<Address, 'id'> = { ...formData };
    
    let result;
    if (initialData?.id) {
      result = await updateAddress(user.uid, initialData.id, dataToSave);
    } else {
      result = await addAddress(user.uid, dataToSave);
    }

    if (result.success) {
      onCancel();
    } else {
      setError(result.error || 'An error occurred.');
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onCancel}>
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl flex flex-col max-h-[90vh]">
        <header className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">{initialData ? 'Edit Address' : 'Add New Address'}</h3>
          <button onClick={onCancel} className="p-2 text-slate-300 hover:text-rose-500 transition-all active:scale-90">&times;</button>
        </header>
        <form onSubmit={handleSubmit} className="p-8 space-y-5 overflow-y-auto">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Full Name</label>
              <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} type="text" placeholder="e.g., Ali Raza" className="w-full border-2 border-slate-50 bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-600 shadow-sm" />
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone</label>
              <input required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} type="tel" placeholder="03XXXXXXXXX" className="w-full border-2 border-slate-50 bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-600 shadow-sm" />
            </div>
          </div>
          <div>
            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Detailed Address</label>
            <input required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} type="text" placeholder="House/Street/Area..." className="w-full border-2 border-slate-50 bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-600 shadow-sm" />
          </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">City</label>
              <select value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full border-2 border-slate-50 bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-600 shadow-sm appearance-none">
                {["Karachi", "Lahore", "Islamabad", "Faisalabad", "Multan", "Peshawar", "Other"].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Address Label</label>
              <select value={formData.tag} onChange={e => setFormData({...formData, tag: e.target.value as 'Home' | 'Office' | 'Other'})} className="w-full border-2 border-slate-50 bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-600 shadow-sm appearance-none">
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="pt-2">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input type="checkbox" checked={formData.isDefault} onChange={e => setFormData({...formData, isDefault: e.target.checked})} className="w-5 h-5 rounded-md accent-blue-600" />
              <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Set as default shipping address</span>
            </label>
          </div>
          {error && <p className="text-xs text-rose-500 font-bold text-center pt-2">{error}</p>}
          <div className="pt-4 flex items-center justify-end space-x-4">
            <button type="button" onClick={onCancel} className="bg-slate-50 text-slate-500 font-black py-3 px-6 rounded-xl text-[9px] uppercase tracking-widest">Cancel</button>
            <button type="submit" disabled={isSaving} className="bg-slate-900 text-white font-black py-3 px-6 rounded-xl shadow-lg active:scale-95 disabled:opacity-50 uppercase tracking-widest text-[9px]">
              {isSaving ? 'Saving...' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default AddressForm;
