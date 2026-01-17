import React from 'react';
import { message, notification } from 'antd';
import { reportError, addBreadcrumb } from './sentry';

// Error types
export const ERROR_TYPES = {
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  NETWORK: 'network',
  FIREBASE: 'firebase',
  AI_SERVICE: 'ai_service',
  UNKNOWN: 'unknown'
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Error logging service
class ErrorLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
  }

  log(error, context = {}) {
    const errorLog = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      message: error.message || 'Unknown error',
      stack: error.stack,
      type: this.determineErrorType(error),
      severity: this.determineSeverity(error),
      context: {
        url: window.location.href,
        userAgent: navigator.userAgent,
        userId: context.userId || 'anonymous',
        component: context.component || 'unknown',
        action: context.action || 'unknown',
        ...context
      },
      resolved: false
    };

    // Add to local logs
    this.logs.unshift(errorLog);
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Add breadcrumb for Sentry
    addBreadcrumb(
      `Error: ${errorLog.message}`,
      'error',
      errorLog.severity === ERROR_SEVERITY.CRITICAL ? 'error' : 'warning'
    );

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorLog);
    }

    // Send to Sentry
    reportError(error, errorLog.context);

    // Send to external service
    this.sendToExternalService(errorLog);

    return errorLog;
  }

  determineErrorType(error) {
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('validation') || message.includes('invalid')) {
      return ERROR_TYPES.VALIDATION;
    }
    if (message.includes('auth') || message.includes('permission')) {
      return ERROR_TYPES.AUTHENTICATION;
    }
    if (message.includes('network') || message.includes('fetch')) {
      return ERROR_TYPES.NETWORK;
    }
    if (message.includes('firebase') || message.includes('firestore')) {
      return ERROR_TYPES.FIREBASE;
    }
    if (message.includes('ai') || message.includes('gemini')) {
      return ERROR_TYPES.AI_SERVICE;
    }
    
    return ERROR_TYPES.UNKNOWN;
  }

  determineSeverity(error) {
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('critical') || message.includes('fatal')) {
      return ERROR_SEVERITY.CRITICAL;
    }
    if (message.includes('security') || message.includes('unauthorized')) {
      return ERROR_SEVERITY.HIGH;
    }
    if (message.includes('validation') || message.includes('network')) {
      return ERROR_SEVERITY.MEDIUM;
    }
    
    return ERROR_SEVERITY.LOW;
  }

  async sendToExternalService(errorLog) {
    try {
      // In production, send to Sentry or similar service
      if (process.env.NODE_ENV === 'production' && process.env.REACT_APP_SENTRY_DSN) {
        // Sentry integration would go here
        console.log('Would send to Sentry:', errorLog);
      }

      // Send to backend for storage
      if (errorLog.severity === ERROR_SEVERITY.HIGH || errorLog.severity === ERROR_SEVERITY.CRITICAL) {
        await fetch('/api/errors/log', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(errorLog)
        }).catch(() => {
          // Fail silently to avoid infinite error loops
        });
      }
    } catch (err) {
      // Fail silently to avoid infinite error loops
      console.warn('Failed to send error to external service:', err);
    }
  }

  getLogs(filters = {}) {
    let filteredLogs = [...this.logs];

    if (filters.type) {
      filteredLogs = filteredLogs.filter(log => log.type === filters.type);
    }

    if (filters.severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === filters.severity);
    }

    if (filters.component) {
      filteredLogs = filteredLogs.filter(log => 
        log.context.component?.includes(filters.component)
      );
    }

    if (filters.since) {
      const sinceDate = new Date(filters.since);
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= sinceDate
      );
    }

    return filteredLogs;
  }

  clearLogs() {
    this.logs = [];
  }
}

// Global error logger instance
export const errorLogger = new ErrorLogger();

// Error handling utilities
export const handleError = (error, context = {}) => {
  const errorLog = errorLogger.log(error, context);
  
  // Show user-friendly message based on error type
  switch (errorLog.type) {
    case ERROR_TYPES.VALIDATION:
      message.error(error.message || 'Dữ liệu không hợp lệ');
      break;
      
    case ERROR_TYPES.AUTHENTICATION:
      message.error('Vui lòng đăng nhập để tiếp tục');
      break;
      
    case ERROR_TYPES.AUTHORIZATION:
      message.error('Bạn không có quyền thực hiện hành động này');
      break;
      
    case ERROR_TYPES.NETWORK:
      message.error('Lỗi kết nối mạng. Vui lòng thử lại');
      break;
      
    case ERROR_TYPES.FIREBASE:
      message.error('Lỗi hệ thống. Vui lòng thử lại sau');
      break;
      
    case ERROR_TYPES.AI_SERVICE:
      message.error('Dịch vụ AI tạm thời không khả dụng');
      break;
      
    default:
      message.error('Đã xảy ra lỗi không mong muốn');
  }

  // Show notification for critical errors
  if (errorLog.severity === ERROR_SEVERITY.CRITICAL) {
    notification.error({
      message: 'Lỗi nghiêm trọng',
      description: 'Hệ thống đã ghi nhận lỗi nghiêm trọng. Chúng tôi sẽ khắc phục sớm nhất.',
      duration: 10
    });
  }

  return errorLog;
};

// Async error handler
export const handleAsyncError = async (asyncFn, context = {}) => {
  try {
    return await asyncFn();
  } catch (error) {
    handleError(error, context);
    throw error; // Re-throw for component handling
  }
};

// React Error Boundary Component
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    const errorLog = errorLogger.log(error, {
      component: 'ErrorBoundary',
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    });

    this.setState({
      error,
      errorInfo,
      errorLog
    });

    // Report to external service
    if (process.env.NODE_ENV === 'production') {
      console.error('Error Boundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container" style={{
          padding: '40px 20px',
          textAlign: 'center',
          backgroundColor: '#fff2f0',
          border: '1px solid #ffccc7',
          borderRadius: '8px',
          margin: '20px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>😵</div>
          <h2 style={{ color: '#cf1322', marginBottom: '16px' }}>
            Oops! Đã xảy ra lỗi
          </h2>
          <p style={{ color: '#666', marginBottom: '24px' }}>
            Chúng tôi xin lỗi vì sự bất tiện này. Lỗi đã được ghi nhận và sẽ được khắc phục sớm.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details style={{ 
              textAlign: 'left', 
              backgroundColor: '#f5f5f5', 
              padding: '16px', 
              borderRadius: '4px',
              marginBottom: '16px'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                Chi tiết lỗi (Development)
              </summary>
              <pre style={{ 
                fontSize: '12px', 
                overflow: 'auto',
                marginTop: '8px'
              }}>
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          
          <div>
            <button 
              onClick={this.handleRetry}
              style={{
                backgroundColor: '#1890ff',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '8px'
              }}
            >
              Thử lại
            </button>
            <button 
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: '#52c41a',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for error handling in functional components
export const useErrorHandler = () => {
  const handleError = React.useCallback((error, context = {}) => {
    return handleError(error, context);
  }, []);

  const handleAsyncError = React.useCallback(async (asyncFn, context = {}) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, context);
      return null;
    }
  }, [handleError]);

  return { handleError, handleAsyncError };
};

// Performance monitoring
export const performanceMonitor = {
  marks: new Map(),
  
  start(name) {
    this.marks.set(name, performance.now());
  },
  
  end(name) {
    const startTime = this.marks.get(name);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.marks.delete(name);
      
      // Log slow operations
      if (duration > 1000) { // > 1 second
        errorLogger.log(new Error(`Slow operation: ${name}`), {
          type: 'performance',
          duration,
          operation: name
        });
      }
      
      return duration;
    }
    return null;
  }
};

// Network error handler
export const handleNetworkError = (error, url, method = 'GET') => {
  const networkError = new Error(`Network error: ${method} ${url}`);
  networkError.originalError = error;
  networkError.url = url;
  networkError.method = method;
  
  return handleError(networkError, {
    type: ERROR_TYPES.NETWORK,
    url,
    method,
    status: error.status || 'unknown'
  });
};

// Firebase error handler
export const handleFirebaseError = (error, operation) => {
  const firebaseError = new Error(`Firebase error: ${operation}`);
  firebaseError.originalError = error;
  firebaseError.code = error.code;
  firebaseError.operation = operation;
  
  return handleError(firebaseError, {
    type: ERROR_TYPES.FIREBASE,
    operation,
    code: error.code
  });
};

export default {
  handleError,
  handleAsyncError,
  ErrorBoundary,
  useErrorHandler,
  errorLogger,
  performanceMonitor,
  handleNetworkError,
  handleFirebaseError
};