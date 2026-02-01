import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';

const ProfileSettings: React.FC = () => {
  const { user, updateUserProfile, updateUserPhoto } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState('');

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
    setError('');

    const result = await updateUserProfile(user.uid, {
      name: formData.name,
      phone: formData.phone,
    });

    setIsSaving(false);
    if (result.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } else {
      setError(result.error || 'Update failed. Please try again.');
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      setIsUploading(true);
      setError('');
      const result = await updateUserPhoto(user.uid, file);
      if (!result.success) {
        setError(result.error || 'Photo upload failed.');
      }
      setIsUploading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight text-center">
        Manage Your Profile
      </h3>
      
      <div className="max-w-lg mx-auto">
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <input type="file" ref={fileInputRef} onChange={handlePhotoChange} className="hidden" accept="image/png, image/jpeg, image/webp" />
            <img 
              src={user.photo} 
              alt="Profile" 
              className="w-24 h-24 rounded-full mb-4 border-4 border-slate-50 shadow-lg"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-slate-900/50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {isUploading ? (
                <div className="w-6 h-6 border-2 border-white/50 border-t-white rounded-full animate-spin"></div>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              )}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Display Name</label>
            <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" placeholder="Your Full Name" className="w-full border-2 border-slate-50 bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white shadow-sm" />
          </div>
          <div>
            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Email Address</label>
            <input disabled value={user.email} type="email" className="w-full border-2 border-slate-50 bg-slate-100 rounded-xl px-4 py-3 text-xs font-bold outline-none shadow-sm text-slate-400 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
            <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} type="tel" placeholder="e.g., 03271452389" className="w-full border-2 border-slate-50 bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-blue-600 focus:bg-white shadow-sm" />
          </div>

          <div className="pt-4 flex items-center justify-end space-x-4">
            {error && <p className="text-rose-600 text-[9px] font-black uppercase">{error}</p>}
            {saveSuccess && <p className="text-emerald-600 text-[9px] font-black uppercase tracking-widest">Profile Saved!</p>}
            <button type="submit" disabled={isSaving || isUploading} className="bg-slate-900 text-white font-black py-3.5 px-8 rounded-xl shadow-lg active:scale-95 disabled:opacity-50 uppercase tracking-[0.2em] text-[10px]">{isSaving ? 'Saving...' : 'Update Info'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
