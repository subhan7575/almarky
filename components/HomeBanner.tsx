
import React from 'react';
import { Link } from 'react-router-dom';
import AlmarkyFullLogo from './AlmarkyFullLogo';

const HomeBanner: React.FC = () => {
  // Define unique IDs for gradients to avoid SVG conflicts
  const uniqueId = Math.random().toString(36).substring(2);

  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 aspect-[5/4] md:aspect-[21/9] shadow-2xl border border-slate-800 group p-8 md:p-16 flex items-center">
          
          {/* Dynamic SVG Background matching logo colors */}
          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <defs>
              <radialGradient id={`grad1-${uniqueId}`} cx="20%" cy="30%" r="60%" fx="20%" fy="30%">
                <stop offset="0%" stopColor="#1e88e5" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
              <radialGradient id={`grad2-${uniqueId}`} cx="85%" cy="65%" r="55%" fx="85%" fy="65%">
                <stop offset="0%" stopColor="#f57c00" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="100%" height="100%" fill="#0f172a" />
            <rect width="100%" height="100%" fill={`url(#grad1-${uniqueId})`} />
            <rect width="100%" height="100%" fill={`url(#grad2-${uniqueId})`} />
          </svg>

          {/* Content */}
          <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center w-full">
            {/* Text Section */}
            <div className="text-center md:text-left">
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter uppercase leading-none drop-shadow-lg">
                Shop Smart.
                <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400">
                  Live Better.
                </span>
              </h1>
              <p className="mt-6 text-xs md:text-sm text-slate-300 font-bold uppercase tracking-widest max-w-md mx-auto md:mx-0">
                Pakistan's Verified Hub for Premium Gadgets & Lifestyle Essentials.
              </p>
              <Link 
                to="/shop" 
                className="mt-10 inline-block bg-white text-slate-900 font-black px-12 py-4 rounded-2xl text-[10px] md:text-xs uppercase tracking-[0.3em] shadow-2xl active-press hover:bg-blue-500 hover:text-white transition-all transform hover:-translate-y-1"
              >
                Explore Now
              </Link>
            </div>

            {/* Logo Section - The new Hero Element */}
            <div className="hidden md:flex items-center justify-center">
               <div className="relative w-full max-w-md h-auto group-hover:scale-105 transition-transform duration-700">
                  <AlmarkyFullLogo className="w-full h-auto drop-shadow-2xl" />
                  <div className="absolute -inset-8 bg-gradient-to-tr from-blue-500/20 via-transparent to-orange-500/20 rounded-full blur-3xl animate-pulse" aria-hidden="true"></div>
               </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HomeBanner;
