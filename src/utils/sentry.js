import * as Sentry from '@sentry/react';

// Initialize Sentry
export const initSentry = () => {
  if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      environment: process.env.NODE_ENV,
      integrations: [
        Sentry.browserTracingIntegration({
          // Set tracing origins to connect sentry for performance monitoring
          tracingOrigins: [
            'localhost',
            process.env.REACT_APP_API_URL || 'http://localhost:3001',
            /^\//,
          ],
        }),
      ],
      
      // Performance Monitoring
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      
      // Session Replay
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
      
      // Release tracking
      release: process.env.REACT_APP_VERSION || '1.0.0',
      
      // User context
      beforeSend(event, hint) {
        // Filter out non-critical errors in development
        if (process.env.NODE_ENV === 'development') {
          const error = hint.originalException;
          if (error && error.message) {
            // Skip React DevTools errors
            if (error.message.includes('ResizeObserver loop limit exceeded')) {
              return null;
            }
            // Skip network errors in development
            if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
              return null;
            }
          }
        }
        
        return event;
      },
      
      // Custom tags
      initialScope: {
        tags: {
          component: 'frontend',
          platform: 'web'
        }
      }
    });
    
    console.log('Sentry initialized for production');
  } else {
    console.log('Sentry not initialized (development mode or missing DSN)');
  }
};

// Custom error boundary with Sentry
export const SentryErrorBoundary = Sentry.withErrorBoundary;

// Performance monitoring helpers
export const startTransaction = (name, op = 'navigation') => {
  return Sentry.startSpan({ name, op }, () => {});
};

export const addBreadcrumb = (message, category = 'custom', level = 'info') => {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    timestamp: Date.now() / 1000,
  });
};

// User context
export const setUserContext = (user) => {
  Sentry.setUser({
    id: user.uid,
    email: user.email,
    username: user.displayName,
  });
};

export const clearUserContext = () => {
  Sentry.setUser(null);
};

// Custom error reporting
export const reportError = (error, context = {}) => {
  Sentry.withScope((scope) => {
    // Add context
    Object.keys(context).forEach(key => {
      scope.setTag(key, context[key]);
    });
    
    // Add extra data
    scope.setContext('errorContext', context);
    
    // Capture exception
    Sentry.captureException(error);
  });
};

// Performance monitoring
export const measurePerformance = (name, fn) => {
  return Sentry.startSpan({ name }, async () => {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      
      // Log slow operations
      if (duration > 1000) {
        addBreadcrumb(`Slow operation: ${name} (${duration.toFixed(2)}ms)`, 'performance', 'warning');
      }
      
      return result;
    } catch (error) {
      reportError(error, { operation: name, duration: performance.now() - start });
      throw error;
    }
  });
};

// Network monitoring
export const monitorNetworkRequest = (url, method = 'GET') => {
  const span = Sentry.getActiveSpan();
  if (span) {
    const childSpan = Sentry.startInactiveSpan({
      op: 'http.client',
      name: `${method} ${url}`,
    });
    
    return {
      finish: (status) => {
        childSpan.setTag('http.status_code', status);
        childSpan.end();
      },
      error: (error) => {
        childSpan.setTag('error', true);
        childSpan.setData('error', error.message);
        childSpan.end();
      }
    };
  }
  
  return { finish: () => {}, error: () => {} };
};

export default {
  initSentry,
  SentryErrorBoundary,
  startTransaction,
  addBreadcrumb,
  setUserContext,
  clearUserContext,
  reportError,
  measurePerformance,
  monitorNetworkRequest
};