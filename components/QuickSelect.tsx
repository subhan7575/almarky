import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';


interface QuickSelectProps {
  product: Product;
  onClose: () => void;
}

const QuickSelect: React.FC<QuickSelectProps> = ({ product, onClose }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedColor, setSelectedColor] = useState<string | undefined>(product.colors?.[0]);
  const [quantity, setQuantity] = useState(1);

  const handleAction = (type: 'cart' | 'buy') => {
    if (!user?.isLoggedIn) {
      onClose();
      return navigate('/account');
    }
    addToCart(product, quantity, selectedColor);
    if (type === 'buy') {
      onClose();
      navigate('/checkout');
    } else {
      onClose();
    }
  };

  return (
    <Modal isOpen={true} onClose={onClose} position="bottom-sheet">
        <div className="w-full max-w-lg bg-white p-6 pb-8">
            <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex-shrink-0">
                <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
                <h3 className="text-[11px] font-black uppercase tracking-tight text-slate-900 line-clamp-1">{product.name}</h3>
                <p className="text-blue-600 font-black text-base tracking-tighter">Rs. {product.price}</p>
            </div>
            </div>

            {product.colors && product.colors.length > 0 && (
            <div className="mb-6">
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-400 mb-3">Available Styles</p>
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

            <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl mb-6">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Quantity</span>
            <div className="flex items-center space-x-4">
                <button onClick={() => quantity > 1 && setQuantity(quantity - 1)} className="w-8 h-8 bg-white border border-slate-100 rounded-lg shadow-sm flex items-center justify-center font-black text-slate-400 active-press">-</button>
                <span className="text-xs font-black w-4 text-center">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-8 h-8 bg-white border border-slate-100 rounded-lg shadow-sm flex items-center justify-center font-black text-slate-400 active-press">+</button>
            </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleAction('cart')} className="bg-slate-900 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest active-press">Add to Cart</button>
            <button onClick={() => handleAction('buy')} className="bg-orange-500 text-white font-black py-4 rounded-xl text-[10px] uppercase tracking-widest active-press shadow-xl shadow-orange-500/10">Order Now</button>
            </div>
        </div>
    </Modal>
  );
};

export default QuickSelect;
