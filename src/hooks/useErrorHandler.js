import { useState, useCallback } from 'react';
import { message } from 'antd';
import { getErrorMessage, isNetworkError, shouldRetry } from '../constants/errorMessages';

/**
 * Custom hook để quản lý error state và hiển thị thông báo lỗi
 * @param {Object} options - Tùy chọn cấu hình
 * @param {boolean} options.showMessage - Hiển thị message toast khi có lỗi
 * @param {boolean} options.logError - Log lỗi ra console
 * @returns {Object} Error handler utilities
 */
export const useErrorHandler = (options = {}) => {
  const {
    showMessage = false,
    logError = true
  } = options;

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Xử lý lỗi
  const handleError = useCallback((error, context = '') => {
    if (logError) {
      console.error(`Error ${context}:`, error);
    }

    const errorMessage = getErrorMessage(error);
    setError(error);

    if (showMessage) {
      if (isNetworkError(error)) {
        message.warning(errorMessage);
      } else {
        message.error(errorMessage);
      }
    }

    return errorMessage;
  }, [showMessage, logError]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Wrapper cho async operations
  const executeAsync = useCallback(async (asyncFn, context = '') => {
    setIsLoading(true);
    clearError();

    try {
      const result = await asyncFn();
      return result;
    } catch (error) {
      handleError(error, context);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, clearError]);

  // Wrapper cho async operations với retry
  const executeWithRetry = useCallback(async (asyncFn, maxRetries = 3, context = '') => {
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        setIsLoading(true);
        clearError();
        
        const result = await asyncFn();
        return result;
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries || !shouldRetry(error)) {
          handleError(error, `${context} (attempt ${attempt}/${maxRetries})`);
          throw error;
        }
        
        // Đợi trước khi retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      } finally {
        setIsLoading(false);
      }
    }
    
    throw lastError;
  }, [handleError, clearError]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    executeAsync,
    executeWithRetry,
    // Utility functions
    getErrorMessage: (err) => getErrorMessage(err || error),
    isNetworkError: (err) => isNetworkError(err || error),
    shouldRetry: (err) => shouldRetry(err || error)
  };
};

export default useErrorHandler;