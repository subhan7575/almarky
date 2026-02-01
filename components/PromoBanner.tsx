import React from 'react';

const PromoBanner: React.FC = () => {
  return (
    <div className="w-full bg-slate-900 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-2xl">
      <div className="relative z-10 flex flex-col items-center justify-center text-center">
        <span className="inline-block bg-white/10 text-white text-[7px] font-black px-2 py-0.5 rounded-full uppercase tracking-[0.3em] mb-4 border border-white/5">
          Weekend Special
        </span>
        <h2 className="text-xl md:text-3xl font-black uppercase tracking-tighter leading-tight mb-2">
          Mega <span className="text-orange-500">Savings</span> <br/> Hub Pakistan.
        </h2>
        <p className="text-slate-400 text-[8px] font-bold uppercase tracking-widest mb-6 opacity-60">Verified Premium Items Only</p>
        <button className="bg-blue-600 text-white font-black px-10 py-3 rounded-xl text-[9px] uppercase tracking-widest active-press transition-transform shadow-xl shadow-blue-600/20">
          Shop Deals
        </button>
      </div>
      
      {/* Dynamic Background */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-orange-600/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-blue-600/20 rounded-full blur-3xl"></div>
    </div>
  );
};

export default PromoBanner;