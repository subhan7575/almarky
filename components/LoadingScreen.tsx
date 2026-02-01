import React from 'react';
import { AlmarkyLogo } from './Navbar';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-white z-[999] flex flex-col items-center justify-center p-6">
      <div className="relative mb-12 animate-in zoom-in duration-700">
        {/* Using the updated AlmarkyLogo component with larger scale */}
        <AlmarkyLogo className="h-28 md:h-40" />
        <div className="absolute -inset-10 border-4 border-blue-50 rounded-full animate-ping opacity-30"></div>
      </div>
      
      <div className="flex flex-col items-center w-full max-w-[220px]">
        <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden relative shadow-inner">
          <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600 via-orange-500 to-emerald-500 w-1/2 animate-[loading_1.5s_infinite_ease-in-out]"></div>
        </div>
        <div className="mt-6 flex flex-col items-center">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 animate-pulse text-center">
            Establishing Secure Sync
          </p>
          <div className="mt-2 flex items-center space-x-2">
            <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Almarky Internal v2026</span>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-10 text-[9px] font-black text-slate-200 uppercase tracking-[0.3em]">
        Verified Premium Logistics Hub • Pakistan
      </div>

      <style>{`
        @keyframes loading {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;