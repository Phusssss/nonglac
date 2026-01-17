import React from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB } from 'web-vitals';
import { addBreadcrumb, reportError } from './sentry';

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.observers = [];
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized) return;
    
    this.initWebVitals();
    this.initResourceObserver();
    this.initNavigationObserver();
    this.initLongTaskObserver();
    
    this.isInitialized = true;
    console.log('Performance monitoring initialized');
  }

  // Initialize Web Vitals monitoring
  initWebVitals() {
    const sendToAnalytics = (metric) => {
      const { name, value, rating } = metric;
      
      // Store metric
      this.metrics[name] = { value, rating, timestamp: Date.now() };
      
      // Add breadcrumb
      addBreadcrumb(
        `Web Vital: ${name} = ${value}ms (${rating})`,
        'performance',
        rating === 'poor' ? 'warning' : 'info'
      );
      
      // Send to analytics
      this.sendMetric(name, value, rating);
      
      // Log poor performance
      if (rating === 'poor') {
        console.warn(`Poor ${name}: ${value}ms`);
        
        // Report critical performance issues
        if (name === 'LCP' && value > 5000) {
          reportError(new Error(`Critical LCP: ${value}ms`), {
            type: 'performance',
            metric: name,
            value,
            rating
          });
        }
      }
    };

    // Monitor Core Web Vitals
    onCLS(sendToAnalytics);
    onINP(sendToAnalytics); // Replaced FID with INP
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  }

  // Monitor resource loading
  initResourceObserver() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          this.analyzeResourceTiming(entry);
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
    this.observers.push(observer);
  }

  // Monitor navigation timing
  initNavigationObserver() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'navigation') {
          this.analyzeNavigationTiming(entry);
        }
      });
    });

    observer.observe({ entryTypes: ['navigation'] });
    this.observers.push(observer);
  }

  // Monitor long tasks (blocking main thread)
  initLongTaskObserver() {
    if (!('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'longtask') {
          this.analyzeLongTask(entry);
        }
      });
    });

    try {
      observer.observe({ entryTypes: ['longtask'] });
      this.observers.push(observer);
    } catch (e) {
      // Long task observer not supported
      console.warn('Long task observer not supported');
    }
  }

  // Analyze resource loading performance
  analyzeResourceTiming(entry) {
    const { name, duration, transferSize, encodedBodySize } = entry;
    
    // Check for slow resources
    if (duration > 1000) {
      addBreadcrumb(
        `Slow resource: ${name} (${duration.toFixed(2)}ms)`,
        'performance',
        'warning'
      );
    }

    // Check for large resources
    if (transferSize > 1024 * 1024) { // > 1MB
      addBreadcrumb(
        `Large resource: ${name} (${(transferSize / 1024 / 1024).toFixed(2)}MB)`,
        'performance',
        'warning'
      );
    }

    // Check compression efficiency
    if (encodedBodySize && transferSize) {
      const compressionRatio = encodedBodySize / transferSize;
      if (compressionRatio > 0.9 && transferSize > 10240) { // > 10KB and poorly compressed
        addBreadcrumb(
          `Poor compression: ${name} (${(compressionRatio * 100).toFixed(1)}%)`,
          'performance',
          'info'
        );
      }
    }
  }

  // Analyze navigation timing
  analyzeNavigationTiming(entry) {
    const {
      domContentLoadedEventEnd,
      domContentLoadedEventStart,
      loadEventEnd,
      loadEventStart,
      responseStart,
      requestStart
    } = entry;

    const metrics = {
      domContentLoaded: domContentLoadedEventEnd - domContentLoadedEventStart,
      loadEvent: loadEventEnd - loadEventStart,
      serverResponseTime: responseStart - requestStart
    };

    // Check for slow DOM processing
    if (metrics.domContentLoaded > 1000) {
      addBreadcrumb(
        `Slow DOM processing: ${metrics.domContentLoaded.toFixed(2)}ms`,
        'performance',
        'warning'
      );
    }

    // Check for slow server response
    if (metrics.serverResponseTime > 500) {
      addBreadcrumb(
        `Slow server response: ${metrics.serverResponseTime.toFixed(2)}ms`,
        'performance',
        'warning'
      );
    }

    this.sendMetric('navigation', metrics);
  }

  // Analyze long tasks (main thread blocking)
  analyzeLongTask(entry) {
    const { duration, startTime } = entry;
    
    addBreadcrumb(
      `Long task detected: ${duration.toFixed(2)}ms at ${startTime.toFixed(2)}ms`,
      'performance',
      'warning'
    );

    // Report critical long tasks
    if (duration > 500) {
      reportError(new Error(`Critical long task: ${duration}ms`), {
        type: 'performance',
        taskDuration: duration,
        taskStartTime: startTime
      });
    }

    this.sendMetric('longTask', { duration, startTime });
  }

  // Send metric to analytics
  sendMetric(name, value, rating = null) {
    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // Google Analytics 4
      if (window.gtag) {
        window.gtag('event', 'performance_metric', {
          metric_name: name,
          metric_value: typeof value === 'object' ? JSON.stringify(value) : value,
          metric_rating: rating,
          page_path: window.location.pathname
        });
      }

      // Custom analytics endpoint
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          metric: name,
          value,
          rating,
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        })
      }).catch(() => {
        // Fail silently
      });
    }
  }

  // Get current performance metrics
  getMetrics() {
    return {
      ...this.metrics,
      memoryUsage: this.getMemoryUsage(),
      connectionInfo: this.getConnectionInfo(),
      deviceInfo: this.getDeviceInfo()
    };
  }

  // Get memory usage (if available)
  getMemoryUsage() {
    if ('memory' in performance) {
      const memory = performance.memory;
      return {
        usedJSHeapSize: memory.usedJSHeapSize,
        totalJSHeapSize: memory.totalJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
        usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit * 100).toFixed(2)
      };
    }
    return null;
  }

  // Get connection information
  getConnectionInfo() {
    if ('connection' in navigator) {
      const connection = navigator.connection;
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
    return null;
  }

  // Get device information
  getDeviceInfo() {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory || null,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      colorDepth: window.screen.colorDepth,
      pixelRatio: window.devicePixelRatio
    };
  }

  // Performance budget checker
  checkPerformanceBudget() {
    const budget = {
      maxBundleSize: 1024 * 1024, // 1MB
      maxImageSize: 500 * 1024,   // 500KB
      maxLCP: 2500,               // 2.5s
      maxFID: 100,                // 100ms
      maxCLS: 0.1                 // 0.1
    };

    const violations = [];

    // Check Web Vitals against budget
    Object.keys(this.metrics).forEach(metric => {
      const value = this.metrics[metric].value;
      const threshold = budget[`max${metric.toUpperCase()}`];
      
      if (threshold && value > threshold) {
        violations.push({
          metric,
          value,
          threshold,
          severity: value > threshold * 1.5 ? 'high' : 'medium'
        });
      }
    });

    if (violations.length > 0) {
      addBreadcrumb(
        `Performance budget violations: ${violations.length}`,
        'performance',
        'warning'
      );
    }

    return violations;
  }

  // Cleanup observers
  disconnect() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    this.isInitialized = false;
  }
}

// Create singleton instance
const performanceMonitor = new PerformanceMonitor();

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  // Initialize after page load
  if (document.readyState === 'complete') {
    performanceMonitor.init();
  } else {
    window.addEventListener('load', () => {
      performanceMonitor.init();
    });
  }
}

// Export utilities
export const initPerformanceMonitoring = () => performanceMonitor.init();
export const getPerformanceMetrics = () => performanceMonitor.getMetrics();
export const checkPerformanceBudget = () => performanceMonitor.checkPerformanceBudget();
export const disconnectPerformanceMonitoring = () => performanceMonitor.disconnect();

// Performance measurement helpers
export const measureFunction = async (name, fn) => {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    addBreadcrumb(
      `Function ${name}: ${duration.toFixed(2)}ms`,
      'performance',
      duration > 100 ? 'warning' : 'info'
    );
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    reportError(error, { function: name, duration });
    throw error;
  }
};

export const measureComponent = (WrappedComponent, componentName) => {
  return React.forwardRef((props, ref) => {
    const renderStart = performance.now();
    
    React.useEffect(() => {
      const renderTime = performance.now() - renderStart;
      
      if (renderTime > 16) { // > 1 frame at 60fps
        addBreadcrumb(
          `Slow component render: ${componentName} (${renderTime.toFixed(2)}ms)`,
          'performance',
          renderTime > 100 ? 'warning' : 'info'
        );
      }
    });
    
    return <WrappedComponent {...props} ref={ref} />;
  });
};

export default performanceMonitor;