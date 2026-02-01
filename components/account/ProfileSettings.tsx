import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const ProfileSettings: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, phone: user.phone || '' });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    setSaveSuccess(false);

    const result = await updateUserProfile(user.uid, {
      name: formData.name,
      phone: formData.phone,
    });

    setIsSaving(false);
    if (result.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } else {
      alert('Failed to update profile. Please try again.');
    }
  };

  if (!user) {
    return null; // Should not happen if this component is rendered
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight text-center">
        Manage Your Profile
      </h3>
      
      <div className="max-w-lg mx-auto">
        <div className="flex flex-col items-center mb-8">
          <img 
            src={user.photo} 
            alt="Profile" 
            className="w-24 h-24 rounded-full mb-4 border-4 border-slate-50 shadow-lg"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Display Name</label>
            <input 
              required 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              type="text" 
              placeholder="Your Full Name" 
              className="w-full border-2 border-slate-50 bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white shadow-sm" 
            />
          </div>

          <div>
            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <input 
              disabled
              value={user.email} 
              type="email" 
              className="w-full border-2 border-slate-50 bg-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none shadow-sm text-slate-400 cursor-not-allowed" 
            />
          </div>
          
          <div>
            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
            <input 
              value={formData.phone} 
              onChange={e => setFormData({...formData, phone: e.target.value})} 
              type="tel" 
              placeholder="e.g., 03271452389" 
              className="w-full border-2 border-slate-50 bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white shadow-sm" 
            />
          </div>

          <div className="pt-4 flex items-center justify-end space-x-4">
            {saveSuccess && (
              <p className="text-emerald-600 text-[9px] font-black uppercase tracking-widest animate-in fade-in">
                Profile Saved!
              </p>
            )}
            <button 
              type="submit" 
              disabled={isSaving}
              className="bg-slate-900 text-white font-black py-3.5 px-8 rounded-xl shadow-lg active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-[10px]"
            >
              {isSaving ? 'Saving...' : 'Update Info'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
