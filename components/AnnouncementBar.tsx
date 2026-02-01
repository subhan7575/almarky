import React from 'react';

const AnnouncementBar: React.FC = () => {
  return (
    <div className="bg-slate-900 text-white text-[7px] md:text-[9px] py-1 font-black overflow-hidden border-b border-orange-500/20 uppercase tracking-[0.2em]">
      <div className="flex animate-marquee space-x-8 md:space-x-12 items-center whitespace-nowrap">
        <span>🔥 Best Online Store Pakistan</span>
        <span>⚡ COD Available Nationwide</span>
        <span>✔ Premium Quality Guaranteed</span>
        <span>⭐ 7-Day Replacement Warranty</span>
        <span>🔥 Best Online Store Pakistan</span>
        <span>⚡ COD Available Nationwide</span>
        <span>✔ Premium Quality Guaranteed</span>
        <span>⭐ 7-Day Replacement Warranty</span>
      </div>
    </div>
  );
};

export default AnnouncementBar;