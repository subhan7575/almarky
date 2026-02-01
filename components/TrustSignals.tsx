import React from 'react';

const TrustSignals: React.FC = () => {
  const signals = [
    { title: "COD Support", desc: "Pay at doorstep", color: "orange", icon: <path d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /> },
    { title: "Fast Delivery", desc: "Across Pakistan", color: "blue", icon: <path d="M13 10V3L4 14h7v7l9-11h-7z" /> },
    { title: "Verified", desc: "100% Original", color: "emerald", icon: <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /> },
    { title: "Replacement", desc: "7-Day Warranty", color: "indigo", icon: <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /> }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {signals.map((sig, i) => (
        <div key={i} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
          <div className={`w-10 h-10 bg-${sig.color}-50 text-${sig.color}-600 rounded-xl flex items-center justify-center mb-4`}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{sig.icon}</svg>
          </div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-1">{sig.title}</h4>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">{sig.desc}</p>
        </div>
      ))}
    </div>
  );
};

export default TrustSignals;