
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, truncateText } from '../utils/formatters';
import QuickSelect from './QuickSelect';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showQuickSelect, setShowQuickSelect] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user?.isLoggedIn) return navigate('/account');
    if (product.colors?.length) setShowQuickSelect(true);
    else addToCart(product);
  };

  return (
    <>
      <div className="group bg-white rounded-2xl border border-slate-50 flex flex-col relative overflow-hidden h-full shadow-sm active-press transition-all duration-300 hover:border-blue-100">
        {/* Wishlist Button - Shrinked */}
        <button 
          onClick={() => toggleWishlist(product)}
          className={`absolute top-1.5 right-1.5 z-10 p-1.5 rounded-lg backdrop-blur-md transition-all ${
            isInWishlist(product.id) ? 'bg-orange-500 text-white shadow-lg' : 'bg-white/80 text-slate-300'
          }`}
        >
          <svg className="h-2.5 w-2.5" fill={isInWishlist(product.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        <Link to={`/product/${product.id}`} className="block relative aspect-square bg-slate-50 overflow-hidden">
          <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          {product.discountPercentage > 0 && (
            <div className="absolute bottom-1.5 left-1.5 bg-rose-600 text-white text-[5px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest shadow-lg">
              -{product.discountPercentage}%
            </div>
          )}
        </Link>

        <div className="p-2 flex flex-col flex-grow">
          <p className="text-[6px] text-blue-600 font-black uppercase tracking-[0.2em] mb-0.5 opacity-60">{product.category}</p>
          
          <Link to={`/product/${product.id}`} className="flex-grow">
            <h3 className="text-slate-900 text-[9px] font-black mb-2 line-clamp-2 leading-[1.2] uppercase tracking-tighter">
              {truncateText(product.name, 45)}
            </h3>
          </Link>
          
          <div className="flex items-end justify-between mt-auto">
            <div className="flex flex-col">
              {product.originalPrice > product.price && (
                <span className="text-[7px] font-bold text-slate-400 line-through leading-none mb-0.5">{formatCurrency(product.originalPrice)}</span>
              )}
              <span className="text-[11px] font-black text-slate-900 tracking-tighter leading-none">{formatCurrency(product.price)}</span>
            </div>
            <button 
              onClick={handleAddToCart}
              className="h-7 w-7 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all active-press border border-slate-100 group-hover:border-slate-900 shadow-sm"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            </button>
          </div>
        </div>
      </div>

      {showQuickSelect && <QuickSelect product={product} onClose={() => setShowQuickSelect(false)} />}
    </>
  );
};

export default ProductCard;
