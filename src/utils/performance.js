// Performance optimization utilities
export const preloadRoute = (routeImport) => {
  const componentImport = typeof routeImport === 'function' ? routeImport() : routeImport;
  return componentImport;
};

export const prefetchDNS = (domains) => {
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
};

export const preconnect = (urls) => {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    document.head.appendChild(link);
  });
};

// Initialize performance optimizations
export const initPerformanceOptimizations = () => {
  // Preconnect to external services
  preconnect([
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://nonglac-2025.firebaseapp.com',
    'https://www.googleapis.com',
    'https://apis.google.com',
    'https://ui-avatars.com',
    'https://raw.githubusercontent.com'
  ]);

  // Prefetch DNS for external domains
  prefetchDNS([
    'https://www.google-analytics.com',
    'https://code.responsivevoice.org'
  ]);
};