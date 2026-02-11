/**
 * Real-Time Price Service
 * 
 * Fetches real agricultural product prices from internet sources
 * Uses web search to get current market prices
 */

import { reportError, addBreadcrumb } from '../utils/sentry';

/**
 * Get real-time price for agricultural product
 * 
 * @param {string} product - Product name (e.g., "lúa", "cà phê", "tiêu")
 * @param {string} region - Region name (e.g., "Đồng bằng sông Cửu Long", "Tây Nguyên")
 * @returns {Promise<Object>} Price data with source and timestamp
 */
export async function getRealTimePrice(product, region = 'Việt Nam') {
  try {
    addBreadcrumb(`Fetching real-time price for ${product} in ${region}`, 'service', 'info');
    
    // Build search query for Vietnamese agricultural prices
    const searchQuery = `giá ${product} hôm nay ${region} nông sản`;
    
    // Use backend API to search for prices
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/prices/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: searchQuery,
        product,
        region
      })
    });
    
    if (!response.ok) {
      throw new Error(`Price API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success && data.price) {
      return {
        success: true,
        product: data.product,
        price: data.price,
        unit: data.unit || 'đồng/kg',
        trend: data.trend,
        source: data.source || 'Thị trường',
        lastUpdated: data.lastUpdated || 'vừa xong',
        region: data.region || region
      };
    }
    
    // If backend doesn't have data, return null to trigger fallback
    return null;
  } catch (error) {
    console.error('Error fetching real-time price:', error);
    reportError(error, {
      component: 'RealTimePriceService',
      action: 'getRealTimePrice',
      product,
      region
    });
    return null;
  }
}

/**
 * Get price trend for product
 * 
 * @param {string} product - Product name
 * @param {string} timeframe - Timeframe (e.g., "7days", "1month")
 * @returns {Promise<Object>} Trend data
 */
export async function getPriceTrend(product, timeframe = '7days') {
  try {
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/prices/trend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        product,
        timeframe
      })
    });
    
    if (!response.ok) {
      throw new Error(`Trend API returned ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching price trend:', error);
    reportError(error, {
      component: 'RealTimePriceService',
      action: 'getPriceTrend',
      product,
      timeframe
    });
    return null;
  }
}

/**
 * Search for agricultural product prices using web search
 * This is a client-side fallback when backend is unavailable
 * 
 * @param {string} product - Product name
 * @param {string} region - Region name
 * @returns {Promise<Object>} Price data
 */
export async function searchPriceOnline(product, region = 'Việt Nam') {
  try {
    // This would use a web search API or scraping service
    // For now, return null to indicate feature needs backend support
    console.warn('Client-side price search not implemented - requires backend');
    return null;
  } catch (error) {
    console.error('Error searching price online:', error);
    return null;
  }
}

export default {
  getRealTimePrice,
  getPriceTrend,
  searchPriceOnline
};
