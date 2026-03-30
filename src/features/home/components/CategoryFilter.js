import React from 'react';
import { ListFilter } from 'lucide-react';
import { POST_CATEGORIES } from '../constants';

const CategoryFilter = ({ selectedCategory, onCategoryChange, postCounts = {} }) => {

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50/80 to-teal-50/50">
          <h3 className="font-bold text-[15px] text-slate-800 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-100/80 flex items-center justify-center text-emerald-600">
              <ListFilter size={16} strokeWidth={2.5} />
            </div>
            Danh mục
          </h3>
        </div>
      
      <div className="p-3 grid grid-cols-1 gap-1.5 bg-white">
        {POST_CATEGORIES.map(category => {
          const isSelected = selectedCategory === category.value;
          const count = postCounts[category.value] || 0;
          
          return (
            <button
              key={category.key}
              onClick={() => onCategoryChange(category.value)}
              className={`flex items-center gap-3 p-2.5 w-full rounded-xl transition-all border ${
                isSelected 
                  ? 'bg-emerald-50 text-emerald-700 font-semibold border-emerald-100 shadow-sm' 
                  : 'bg-white hover:bg-slate-50 text-slate-600 font-medium border-transparent'
              }`}
            >
              <div className={`flex items-center justify-center transition-colors ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`}>
                {React.createElement(category.icon, { 
                  size: 16,
                  strokeWidth: isSelected ? 2.5 : 2
                })}
              </div>
              <span className={`flex-1 text-[13px] text-left transition-colors ${isSelected ? 'text-emerald-700 font-bold' : 'text-slate-700 font-medium'}`}>
                {category.label}
              </span>
              {count > 0 && (
                <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold transition-colors ${
                  isSelected ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;