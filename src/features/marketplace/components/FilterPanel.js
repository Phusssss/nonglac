import React, { useState } from 'react';
import { MARKETPLACE_CONSTANTS } from '../constants';

const FilterPanel = ({ onFiltersChange, horizontal = false }) => {
  const [filters, setFilters] = useState({});

  const handleFilterChange = (key, value) => {
    if (typeof onFiltersChange !== 'function') {
      console.warn('FilterPanel: onFiltersChange prop must be a function');
      return;
    }
    
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const containerClass = horizontal 
    ? "flex flex-wrap gap-4 items-center"
    : "flex flex-col gap-4";

  return (
    <div className={containerClass}>
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">{MARKETPLACE_CONSTANTS.MESSAGES.LABELS.CATEGORY}</label>
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
          onChange={(e) => handleFilterChange('category', e.target.value)}
          value={filters.category || ''}
        >
          <option value="">{MARKETPLACE_CONSTANTS.MESSAGES.LABELS.ALL_CATEGORIES}</option>
          {(MARKETPLACE_CONSTANTS.PRODUCT_CATEGORIES || []).map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">{MARKETPLACE_CONSTANTS.MESSAGES.LABELS.CONDITION}</label>
        <select
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
          onChange={(e) => handleFilterChange('condition', e.target.value)}
          value={filters.condition || ''}
        >
          <option value="">{MARKETPLACE_CONSTANTS.MESSAGES.LABELS.ALL_CONDITIONS}</option>
          {(MARKETPLACE_CONSTANTS.PRODUCT_CONDITIONS || []).map(condition => (
            <option key={condition} value={condition}>{condition}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700">{MARKETPLACE_CONSTANTS.MESSAGES.LABELS.REGION}</label>
        <input
          type="text"
          placeholder="Nhập khu vực..."
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent"
          onChange={(e) => handleFilterChange('location', e.target.value)}
          value={filters.location || ''}
        />
      </div>

      {Object.keys(filters).length > 0 && (
        <button
          onClick={() => {
            setFilters({});
            onFiltersChange({});
          }}
          className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
        >
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
};

export default FilterPanel;