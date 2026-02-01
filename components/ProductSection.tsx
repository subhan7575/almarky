import React, { useState, useMemo } from 'react';
import { useProducts } from '../context/ProductContext';
import ProductCard from './ProductCard';
import CategoryScroll from './CategoryScroll';

const ProductSection: React.FC = () => {
  const { products } = useProducts();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = useMemo(() => ['All', ...new Set(products.map(p => p.category))], [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory, products]);

  return (
    <section className="w-full" id="shop">
      <div className="mb-6 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Find items..." 
                className="w-full border border-slate-100 rounded-xl px-9 py-2.5 focus:border-blue-400 outline-none text-[11px] font-bold transition-all bg-slate-50/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex-grow">
            <CategoryScroll 
              categories={categories} 
              selectedCategory={selectedCategory} 
              onSelect={setSelectedCategory} 
            />
          </div>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5 md:gap-4">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <h2 className="text-sm font-black text-slate-900 mb-1 uppercase">No results</h2>
            <button 
              onClick={() => {setSearch(''); setSelectedCategory('All');}}
              className="text-[8px] font-black text-blue-600 uppercase tracking-widest mt-2"
            >
              Reset Filters
            </button>
        </div>
      )}
    </section>
  );
};

export default ProductSection;