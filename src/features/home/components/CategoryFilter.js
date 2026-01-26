import React from 'react';
import { FilterOutlined } from '@ant-design/icons';
import { POST_CATEGORIES } from '../constants';

const CategoryFilter = ({ selectedCategory, onCategoryChange, postCounts = {} }) => {

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 bg-green-50/50">
        <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
          <FilterOutlined className="text-[#4CAF50]" />
          Danh mục thảo luận
        </h3>
      </div>
      
      <div className="p-2">
        {POST_CATEGORIES.map(category => {
          const isSelected = selectedCategory === category.value;
          const count = postCounts[category.value] || 0;
          
          return (
            <button
              key={category.key}
              onClick={() => onCategoryChange(category.value)}
              className={`flex items-center gap-4 p-3 rounded-xl w-full transition-colors group ${
                isSelected 
                  ? 'bg-green-50 text-[#4CAF50]' 
                  : 'hover:bg-green-50 text-gray-700'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                {React.createElement(category.icon, { 
                  size: category.icon.name?.includes('Outlined') ? 16 : 14,
                  className: category.icon.name?.includes('Outlined') ? 'text-gray-600' : 'text-gray-600'
                })}
              </div>
              <span className="font-medium group-hover:text-[#4CAF50] transition-colors flex-1 text-left">
                {category.label}
              </span>
              {count > 0 && (
                <span className="bg-[#4CAF50] text-white text-xs px-2 py-1 rounded-full">
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