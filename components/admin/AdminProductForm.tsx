
import React, { useState, useEffect, useRef } from 'react';
import { Product } from '../../types';
import { useProducts } from '../../context/ProductContext';

interface AdminProductFormProps {
  onSubmit: (product: Product) => void;
  onCancel: () => void;
  initialData?: Partial<Product>;
  title: string;
}

const AdminProductForm: React.FC<AdminProductFormProps> = ({ onSubmit, onCancel, initialData, title }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addProduct, updateProduct, isSyncing, syncStatus } = useProducts();
  
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '', price: 0, originalPrice: 0, discountPercentage: 0, category: 'Electronics',
    description: '', images: [], stock: true, currency: 'PKR', features: [], colors: [],
    deliveryCharges: 150, ...initialData
  });

  useEffect(() => {
    const orig = Number(formData.originalPrice || 0);
    const disc = Number(formData.discountPercentage || 0);
    if (orig > 0 && disc > 0) {
      const final = Math.round(orig * (1 - disc / 100));
      if (final !== formData.price) setFormData(prev => ({ ...prev, price: final }));
    }
  }, [formData.originalPrice, formData.discountPercentage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const files = fileInputRef.current?.files;
    const finalProductData = {
      ...formData,
      id: formData.id || `p${Date.now()}`,
    } as Product;

    let result;
    if (initialData?.id) {
      result = await updateProduct(initialData.id, formData, files);
    } else {
      result = await addProduct(finalProductData, files);
    }

    if (result.success) {
      onSubmit(finalProductData);
    } else {
      alert(`Deployment Failed: ${result.error}`);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const previews = Array.from(files).map(f => URL.createObjectURL(f as Blob));
      setFormData(prev => ({ ...prev, images: [...(prev.images || []), ...previews] }));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-2xl" onClick={onCancel}></div>
      <div className="bg-white w-full max-w-5xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden animate-in zoom-in duration-500 flex flex-col max-h-[92vh]">
        {isSyncing && (
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl z-[110] flex flex-col items-center justify-center text-white text-center p-10">
            <div className="w-24 h-24 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-10"></div>
            <p className="text-xl font-black uppercase tracking-[0.3em]">{syncStatus}</p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-4">Do not close this window</p>
          </div>
        )}
        <header className="bg-slate-50 px-10 py-8 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">{title}</h3>
          <button onClick={onCancel} className="bg-white p-4 rounded-2xl text-slate-300 hover:text-rose-500 transition-all border border-slate-100 shadow-sm active:scale-90">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </header>
        <form onSubmit={handleSubmit} className="p-10 space-y-10 overflow-y-auto custom-scrollbar flex-grow bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Product Title</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Almarky Special Edition Watch" className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-6 py-4 outline-none focus:border-blue-600 focus:bg-white transition-all font-bold text-slate-900 shadow-sm" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Marketing Story (Urdu/English)</label>
                <textarea required rows={5} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Describe the item features..." className="w-full border-2 border-slate-50 bg-slate-50 rounded-2xl px-6 py-4 outline-none focus:border-blue-600 focus:bg-white transition-all text-sm font-medium" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Original Price (Rs.)</label>
                  <input type="number" value={formData.originalPrice} onChange={(e) => setFormData({...formData, originalPrice: Number(e.target.value)})} placeholder="5500" className="w-full border-2 border-slate-100 rounded-xl px-5 py-3 font-black text-slate-400 line-through shadow-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 ml-1">Discount %</label>
                  <input type="number" value={formData.discountPercentage} onChange={(e) => setFormData({...formData, discountPercentage: Number(e.target.value)})} placeholder="20" className="w-full border-2 border-emerald-100 bg-emerald-50 rounded-xl px-5 py-3 font-black text-emerald-600 shadow-sm" />
                </div>
              </div>
               <div>
                  <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3 ml-1">Final Price (Rs.)</label>
                  <input required type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} placeholder="3600" className="w-full border-2 border-blue-100 bg-blue-50 rounded-xl px-5 py-3 text-lg font-black text-blue-600 shadow-sm" />
                </div>
            </div>
            <div className="space-y-6">
              <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 p-12 rounded-[2.5rem] text-center cursor-pointer hover:bg-blue-50/50 hover:border-blue-300 transition-all group" onClick={() => fileInputRef.current?.click()}>
                <input type="file" ref={fileInputRef} onChange={handleImageChange} multiple accept="image/*" className="hidden" />
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform"><svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg></div>
                <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Select Cloud Assets</p>
                <p className="text-[8px] text-slate-400 font-bold uppercase mt-2">Cloudinary Media Hub Enabled</p>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {formData.images?.map((img, i) => (
                  <div key={i} className="aspect-square bg-slate-50 rounded-2xl overflow-hidden border-2 border-slate-100 relative group/img shadow-sm">
                    <img src={img} className="w-full h-full object-cover" alt="" />
                    <button type="button" onClick={() => setFormData(p => ({ ...p, images: p.images?.filter((_, idx) => idx !== i) }))} className="absolute top-1 right-1 bg-rose-500 text-white p-1.5 rounded-lg opacity-0 group-hover/img:opacity-100 transition-all shadow-lg active:scale-75"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white font-black py-8 rounded-[2rem] hover:bg-blue-600 transition-all uppercase tracking-[0.4em] text-sm shadow-2xl active:scale-[0.98] flex items-center justify-center space-x-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            <span>Deploy Global Sync</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProductForm;
