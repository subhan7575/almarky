import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleAdminTrigger = () => {
    navigate('/almarky-internal-v2026');
  };

  return (
    <footer className="bg-slate-50 border-t border-slate-100 py-12 px-5 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-sm font-black tracking-tighter uppercase mb-4">ALMARKY<span className="text-orange-600">.</span></h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
            Premium online shopping in Pakistan. High quality gadgets and fashion at unbeatable prices.
          </p>
        </div>
        
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-4">Support</h4>
          <ul className="space-y-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            <li><Link to="/faq">Help Center</Link></li>
            <li><Link to="/track-order">Track Parcel</Link></li>
            <li><Link to="/terms">Terms of Service</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-4">Contact</h4>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">0327 1452389</p>
          <p className="text-[10px] font-bold text-slate-500 lowercase tracking-widest mt-1">almarkyhelpcentre@gmail.com</p>
        </div>
      </div>
      
      <div className="mt-12 pt-8 border-t border-slate-200 text-center">
        <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em] select-none">
          © <span onDoubleClick={handleAdminTrigger} className="cursor-default">2026</span> ALMARKY PAKISTAN. ALL RIGHTS RESERVED.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
