
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import WhatsAppFloating from '../components/WhatsAppFloating';
import ProductCard from '../components/ProductCard';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products } = useProducts();
  const product = products.find(p => p.id === id);
  const { addToCart } = useCart();
  const { user } = useAuth();
  
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (product?.colors?.length) setSelectedColor(product.colors[0]);
    window.scrollTo(0, 0);
  }, [product]);

  if (!product) return <div className="p-20 text-center uppercase font-black text-[10px] text-slate-400">Loading Product...</div>;

  const handleAction = (type: 'cart' | 'buy') => {
    if (!user?.isLoggedIn) return navigate('/account');
    addToCart(product, quantity, selectedColor);
    if (type === 'buy') navigate('/checkout');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-16 pb-24 bg-white">
      <WhatsAppFloating />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
        <div className="space-y-3">
          <div className="rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 aspect-square shadow-sm">
            <img src={product.images[activeImage]} className="w-full h-full object-cover" alt="" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto hide-scrollbar">
              {product.images.map((img, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveImage(i)}
                  className={`w-14 h-14 flex-shrink-0 rounded-xl border-2 overflow-hidden transition-all ${activeImage === i ? 'border-blue-600 scale-105' : 'border-transparent opacity-60'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1.5">{product.category}</p>
          <h1 className="text-2xl md:text-5xl font-black text-slate-900 mb-4 tracking-tighter uppercase leading-tight">{product.name}</h1>
          
          <div className="flex items-center space-x-3 mb-6 border-b border-slate-50 pb-6">
            <span className="text-2xl font-black text-slate-900 tracking-tighter">Rs.{product.price}</span>
            {product.originalPrice > product.price && (
              <span className="text-lg font-bold text-slate-400 line-through">Rs.{product.originalPrice}</span>
            )}
            <span className="bg-emerald-50 text-emerald-600 text-[7px] font-black px-2 py-0.5 rounded uppercase tracking-widest ml-auto">Stock Ready</span>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
            <p className="text-slate-600 text-[11px] leading-relaxed font-medium uppercase tracking-tighter">
              {product.description}
            </p>
          </div>

          {product.colors && (
            <div className="mb-8">
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Styles Available</p>
              <div className="flex flex-wrap gap-3">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-xl border-2 transition-all active-press ${selectedColor === color ? 'border-blue-600 ring-4 ring-blue-50' : 'border-slate-50'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-10">
             <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                <button onClick={() => quantity > 1 && setQuantity(quantity - 1)} className="w-9 h-9 font-black text-slate-400 active-press">-</button>
                <span className="w-9 text-center font-black text-xs text-slate-900">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-9 h-9 font-black text-slate-400 active-press">+</button>
             </div>
             <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 ml-4">FREE Inspection Policy Included</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
             <button onClick={() => handleAction('buy')} className="w-full bg-orange-500 text-white font-black py-4.5 rounded-2xl shadow-xl shadow-orange-500/10 uppercase tracking-widest text-[11px] active-press">Order Now (COD)</button>
             <button onClick={() => handleAction('cart')} className="w-full bg-slate-900 text-white font-black py-4.5 rounded-2xl uppercase tracking-widest text-[11px] active-press">Add to Bag</button>
          </div>
        </div>
      </div>

      <section className="mt-20 pt-10 border-t border-slate-50">
        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-8">Related <span className="text-blue-600">Style</span></h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {products.filter(p => p.id !== product.id).slice(0, 4).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
};

export default ProductDetail;
