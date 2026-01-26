import React from 'react';
import FilterPanel from './FilterPanel';

const MarketplaceFilters = ({ onFiltersChange, userRole, transactionIntent }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <FilterPanel
        onFiltersChange={onFiltersChange}
        userRole={userRole}
        transactionIntent={transactionIntent}
        horizontal={true}
      />
    </div>
  );
};

export default MarketplaceFilters;