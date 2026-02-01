import React from 'react';

interface CategoryScrollProps {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}

const CategoryScroll: React.FC<CategoryScrollProps> = ({ categories, selectedCategory, onSelect }) => {
  return (
    <div className="flex overflow-x-auto pb-1 hide-scrollbar space-x-1.5">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={`whitespace-nowrap px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all duration-200 border ${
            selectedCategory === cat
              ? 'bg-slate-900 border-slate-900 text-white scale-105 z-10 shadow-md shadow-slate-900/10'
              : 'bg-white border-slate-100 text-slate-400 hover:text-slate-900'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};

export default CategoryScroll;