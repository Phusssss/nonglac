/**
 * Performance Optimizer - Tối ưu hóa tốc độ load trang
 * Áp dụng các kỹ thuật: Code splitting, Preloading, Caching, Compression
 */

// 1. Preload critical resources
export const preloadCriticalResources = () => {
  const criticalResources = [
    { href: '/static/css/main.css', as: 'style' },
    { href: '/static/js/main.js', as: 'script' },
  ];

  criticalResources.forEach(({ href, as }) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  });
};

// 2. Defer non-critical scripts
export const deferNonCriticalScripts = () => {
  const scripts = document.querySelectorAll('script[data-defer="true"]');
  scripts.forEach(script => {
    script.defer = true;
  });
};

// 3. Lazy load images with Intersection Observer
export const setupLazyImages = () => {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.getAttribute('data-src');
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });

  return imageObserver;
};

// 4. Optimize font loading
export const optimizeFontLoading = () => {
  if ('fonts' in document) {
    // Preload critical fonts
    const fontPromises = [
      document.fonts.load('400 1em Inter'),
      document.fonts.load('600 1em Inter'),
    ];

    Promise.all(fontPromises).then(() => {
      document.documentElement.classList.add('fonts-loaded');
    });
  }
};

// 5. Service Worker for caching
export const registerServiceWorkerOptimized = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });
      
      // Check for updates every 1 hour
      setInterval(() => {
        registration.update();
      }, 3600000);
      
      return registration;
    } catch (error) {
      console.error('SW registration failed:', error);
    }
  }
};

// 6. Prefetch next page resources
export const prefetchNextPage = (url) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = url;
  document.head.appendChild(link);
};

// 7. Resource hints
export const addResourceHints = () => {
  const hints = [
    { rel: 'dns-prefetch', href: '//fonts.googleapis.com' },
    { rel: 'dns-prefetch', href: '//www.google-analytics.com' },
    { rel: 'preconnect', href: 'https://firebasestorage.googleapis.com' },
  ];

  hints.forEach(({ rel, href }) => {
    const link = document.createElement('link');
    link.rel = rel;
    link.href = href;
    document.head.appendChild(link);
  });
};

// 8. Optimize third-party scripts
export const optimizeThirdPartyScripts = () => {
  // Delay loading of non-critical third-party scripts
  const delayedScripts = [
    { src: 'https://www.googletagmanager.com/gtag/js', delay: 3000 },
  ];

  delayedScripts.forEach(({ src, delay }) => {
    setTimeout(() => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.body.appendChild(script);
    }, delay);
  });
};

// 9. Critical CSS inline
export const inlineCriticalCSS = (css) => {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
};

// 10. Reduce main thread work
export const scheduleIdleTask = (task) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(task, { timeout: 2000 });
  } else {
    setTimeout(task, 1);
  }
};

// 11. Bundle size optimization
export const checkBundleSize = () => {
  if (process.env.NODE_ENV === 'development') {
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;

    scripts.forEach(script => {
      fetch(script.src, { method: 'HEAD' })
        .then(response => {
          const size = parseInt(response.headers.get('content-length'), 10);
          totalSize += size;
          console.log(`Script: ${script.src.split('/').pop()} - ${(size / 1024).toFixed(2)}KB`);
        })
        .catch(() => {});
    });

    setTimeout(() => {
      console.log(`Total bundle size: ${(totalSize / 1024).toFixed(2)}KB`);
    }, 2000);
  }
};

// 12. Memory management
export const cleanupMemory = () => {
  // Clear unused caches
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (name.includes('old') || name.includes('v1')) {
          caches.delete(name);
        }
      });
    });
  }

  // Clear old localStorage items
  const now = Date.now();
  Object.keys(localStorage).forEach(key => {
    try {
      const item = JSON.parse(localStorage.getItem(key));
      if (item.expiry && item.expiry < now) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      // Not a JSON item, skip
    }
  });
};

// 13. Network-aware loading
export const getConnectionSpeed = () => {
  if ('connection' in navigator) {
    const connection = navigator.connection;
    return {
      effectiveType: connection.effectiveType, // '4g', '3g', '2g', 'slow-2g'
      downlink: connection.downlink, // Mbps
      rtt: connection.rtt, // ms
      saveData: connection.saveData
    };
  }
  return null;
};

export const shouldLoadHighQuality = () => {
  const connection = getConnectionSpeed();
  if (!connection) return true;
  
  // Don't load high quality on slow connections or save-data mode
  if (connection.saveData) return false;
  if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') return false;
  
  return true;
};

// 14. Initialize all optimizations
export const initPerformanceOptimizer = () => {
  // Run immediately
  addResourceHints();
  optimizeFontLoading();
  
  // Run after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupLazyImages();
      deferNonCriticalScripts();
    });
  } else {
    setupLazyImages();
    deferNonCriticalScripts();
  }
  
  // Run after page load
  window.addEventListener('load', () => {
    scheduleIdleTask(() => {
      registerServiceWorkerOptimized();
      optimizeThirdPartyScripts();
      cleanupMemory();
      checkBundleSize();
    });
  });
};

// 15. Performance budget checker
export const checkPerformanceBudget = () => {
  const budget = {
    maxJSSize: 500 * 1024, // 500KB
    maxCSSSize: 100 * 1024, // 100KB
    maxImageSize: 200 * 1024, // 200KB per image
    maxTotalSize: 2 * 1024 * 1024, // 2MB total
  };

  const resources = performance.getEntriesByType('resource');
  const violations = [];

  resources.forEach(resource => {
    const size = resource.transferSize;
    const type = resource.initiatorType;

    if (type === 'script' && size > budget.maxJSSize) {
      violations.push({ type: 'JS', name: resource.name, size });
    }
    if (type === 'css' && size > budget.maxCSSSize) {
      violations.push({ type: 'CSS', name: resource.name, size });
    }
    if (type === 'img' && size > budget.maxImageSize) {
      violations.push({ type: 'Image', name: resource.name, size });
    }
  });

  if (violations.length > 0) {
    console.warn('Performance budget violations:', violations);
  }

  return violations;
};

export default {
  init: initPerformanceOptimizer,
  preloadCriticalResources,
  setupLazyImages,
  optimizeFontLoading,
  prefetchNextPage,
  shouldLoadHighQuality,
  checkPerformanceBudget,
  scheduleIdleTask,
  cleanupMemory
};
