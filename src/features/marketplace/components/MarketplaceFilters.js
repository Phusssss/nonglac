import React from 'react';
import FilterPanel from './FilterPanel';

const MarketplaceFilters = ({ onFiltersChange, userRole, transactionIntent }) => {
  return (
    <FilterPanel
      onFiltersChange={onFiltersChange}
      userRole={userRole}
      transactionIntent={transactionIntent}
      horizontal={true}
    />
  );
};

export default MarketplaceFilters;