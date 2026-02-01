
import React from 'react';
import { Link } from 'react-router-dom';
import ProductSection from '../components/ProductSection';
import PromoBanner from '../components/PromoBanner';
import TrustSignals from '../components/TrustSignals';
import CustomerReviews from '../components/CustomerReviews';
import WhatsAppFloating from '../components/WhatsAppFloating';
import AnnouncementBar from '../components/AnnouncementBar';
import HomeBanner from '../components/HomeBanner';

const Home: React.FC = () => {
  return (
    <div className="flex flex-col space-y-0 pb-20 bg-white">
      <WhatsAppFloating />
      <AnnouncementBar />

      {/* New, High-Fidelity Vector Banner */}
      <HomeBanner />

      {/* Trust Signals - Slim & Compact */}
      <div className="max-w-7xl mx-auto w-full px-4 py-2">
        <TrustSignals />
      </div>

      {/* Trending Header */}
      <div className="max-w-7xl mx-auto w-full px-4 pt-8">
        <div className="flex items-center justify-between mb-6 border-b border-slate-50 pb-3">
           <div>
             <h2 className="text-sm font-black text-slate-900 uppercase tracking-tighter">New <span className="text-blue-600">Arrivals</span></h2>
             <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest">Premium Quality Guaranteed</p>
           </div>
           <Link to="/shop" className="text-[8px] font-black uppercase tracking-widest text-blue-600 active-press bg-blue-50 px-3 py-1.5 rounded-lg">View All</Link>
        </div>
        <ProductSection />
      </div>

      {/* Reviews & Promo */}
      <div className="max-w-7xl mx-auto w-full px-4 space-y-10 py-12">
        <PromoBanner />
        <CustomerReviews />
      </div>
    </div>
  );
};

export default Home;
