import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import AlmarkyFullLogo from './AlmarkyFullLogo';

// Official brand logo component using the new FULL vector logo
export const AlmarkyLogo: React.FC<{ className?: string }> = ({ className = "h-10 w-auto" }) => (
  <div className="select-none">
    <AlmarkyFullLogo className={className} />
  </div>
);

const Navbar: React.FC = () => {
  const { totalItems } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b border-slate-50 sticky top-0 z-50 h-16 flex items-center shadow-sm">
      <div className="max-w-7xl mx-auto w-full px-4 flex justify-between items-center">
        {/* Left Side: Logo & Desktop Nav */}
        <div className="flex items-center space-x-10">
          <div className="flex items-center active-press flex-shrink-0">
            <Link to="/" className="cursor-pointer">
              <AlmarkyLogo />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/shop" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">All Products</Link>
            <Link to="/track-order" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Track Parcel</Link>
            <Link to="/contact" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">Contact Us</Link>
            <Link to="/account" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors">My Profile</Link>
          </div>
        </div>

        {/* Right Side: Cart & Hamburger */}
        <div className="flex items-center space-x-1">
          <Link to="/cart" className="relative p-2 text-slate-900 active-press">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 bg-blue-600 text-white text-[7px] font-black h-3.5 w-3.5 flex items-center justify-center rounded-full border-2 border-white">
                {totalItems}
              </span>
            )}
          </Link>
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 active-press text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={isOpen ? "M6 18L18 6" : "M4 6h16M4 12h16"} /></svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-b border-slate-100 shadow-2xl p-6 flex flex-col space-y-5 md:hidden animate-in fade-in slide-in-from-top-2">
          <Link to="/" onClick={() => setIsOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-900 border-b border-slate-50 pb-2">Home</Link>
          <Link to="/shop" onClick={() => setIsOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-900 border-b border-slate-50 pb-2">All Products</Link>
          <Link to="/track-order" onClick={() => setIsOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-900 border-b border-slate-50 pb-2">Track Parcel</Link>
          <Link to="/account" onClick={() => setIsOpen(false)} className="text-[10px] font-black uppercase tracking-widest text-slate-900 border-b border-slate-50 pb-2">My Profile</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
