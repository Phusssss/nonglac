/**
 * Video Call Error Messages and Handlers
 * 
 * Comprehensive error handling for AI Video Call feature
 */

// Video Call Specific Error Messages
export const VIDEO_CALL_ERRORS = {
  // Permission Errors
  'permission/camera-denied': 'Không có quyền truy cập camera. Vui lòng cho phép truy cập camera trong cài đặt trình duyệt.',
  'permission/microphone-denied': 'Không có quyền truy cập microphone. Vui lòng cho phép truy cập microphone trong cài đặt trình duyệt.',
  'permission/media-denied': 'Không có quyền truy cập camera và microphone. Vui lòng cho phép truy cập trong cài đặt trình duyệt.',
  'permission/not-allowed': 'Quyền truy cập bị từ chối. Vui lòng kiểm tra cài đặt quyền trong trình duyệt.',
  'permission/not-found': 'Không tìm thấy thiết bị camera hoặc microphone. Vui lòng kiểm tra kết nối thiết bị.',
  'permission/not-readable': 'Không thể đọc dữ liệu từ thiết bị. Thiết bị có thể đang được sử dụng bởi ứng dụng khác.',
  'permission/overconstrained': 'Thiết bị không hỗ trợ các yêu cầu đã chỉ định. Vui lòng thử với cài đặt khác.',
  'permission/type-error': 'Lỗi cấu hình thiết bị. Vui lòng thử lại.',
  'permission/abort-error': 'Quá trình truy cập thiết bị bị hủy. Vui lòng thử lại.',
  
  // API Connection Errors
  'api/invalid-key': 'API key không hợp lệ. Vui lòng kiểm tra cấu hình.',
  'api/connection-failed': 'Không thể kết nối đến Gemini Live API. Vui lòng kiểm tra kết nối mạng.',
  'api/authentication-failed': 'Xác thực API thất bại. Vui lòng kiểm tra API key.',
  'api/quota-exceeded': 'Đã vượt quá giới hạn sử dụng API. Vui lòng thử lại sau.',
  'api/rate-limit': 'Quá nhiều yêu cầu. Vui lòng đợi một lúc rồi thử lại.',
  'api/service-unavailable': 'Dịch vụ AI tạm thời không khả dụng. Vui lòng thử lại sau.',
  'api/timeout': 'Kết nối đến API bị timeout. Vui lòng thử lại.',
  'api/network-error': 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.',
  'api/server-error': 'Lỗi máy chủ API. Vui lòng thử lại sau.',
  'api/bad-request': 'Yêu cầu không hợp lệ. Vui lòng thử lại.',
  'api/not-connected': 'Chưa kết nối đến Gemini Live. Vui lòng khởi động lại phiên.',
  
  // Audio Processing Errors
  'audio/context-failed': 'Không thể khởi tạo audio context. Vui lòng thử lại.',
  'audio/processing-failed': 'Lỗi xử lý âm thanh. Vui lòng thử lại.',
  'audio/decode-failed': 'Không thể giải mã dữ liệu âm thanh. Vui lòng thử lại.',
  'audio/playback-failed': 'Không thể phát âm thanh. Vui lòng kiểm tra thiết bị âm thanh.',
  'audio/stream-failed': 'Không thể tạo audio stream. Vui lòng thử lại.',
  'audio/not-supported': 'Trình duyệt không hỗ trợ xử lý âm thanh. Vui lòng sử dụng trình duyệt khác.',
  
  // Video Processing Errors
  'video/capture-failed': 'Không thể chụp ảnh từ video. Vui lòng thử lại.',
  'video/stream-failed': 'Không thể tạo video stream. Vui lòng thử lại.',
  'video/constraints-failed': 'Không thể áp dụng cài đặt camera. Vui lòng thử với cài đặt khác.',
  'video/switch-failed': 'Không thể chuyển đổi camera. Vui lòng thử lại.',
  'video/not-supported': 'Trình duyệt không hỗ trợ video. Vui lòng sử dụng trình duyệt khác.',
  
  // Session Errors
  'session/start-failed': 'Không thể khởi động phiên video call. Vui lòng thử lại.',
  'session/already-active': 'Phiên video call đã đang hoạt động.',
  'session/not-active': 'Phiên video call chưa được khởi động.',
  'session/stop-failed': 'Lỗi khi dừng phiên video call.',
  'session/initialization-failed': 'Không thể khởi tạo phiên. Vui lòng thử lại.',
  
  // Tool Call Errors
  'tool/execution-failed': 'Không thể thực hiện công cụ. Vui lòng thử lại.',
  'tool/invalid-params': 'Tham số công cụ không hợp lệ.',
  'tool/timeout': 'Thực hiện công cụ bị timeout.',
  'tool/unknown': 'Công cụ không được hỗ trợ.',
  
  // Browser Compatibility Errors
  'browser/not-supported': 'Trình duyệt không hỗ trợ video call. Vui lòng sử dụng Chrome, Safari, hoặc Edge phiên bản mới nhất.',
  'browser/media-not-supported': 'Trình duyệt không hỗ trợ getUserMedia API.',
  'browser/audio-not-supported': 'Trình duyệt không hỗ trợ Web Audio API.',
  
  // Generic Errors
  'unknown': 'Có lỗi không xác định xảy ra. Vui lòng thử lại.',
  'generic': 'Có lỗi xảy ra trong video call. Vui lòng thử lại.',
};

/**
 * Map native browser errors to our error codes
 */
export const ERROR_CODE_MAP = {
  // getUserMedia errors
  'NotAllowedError': 'permission/not-allowed',
  'NotFoundError': 'permission/not-found',
  'NotReadableError': 'permission/not-readable',
  'OverconstrainedError': 'permission/overconstrained',
  'TypeError': 'permission/type-error',
  'AbortError': 'permission/abort-error',
  
  // Network errors
  'NetworkError': 'api/network-error',
  'TimeoutError': 'api/timeout',
  
  // API errors
  'INVALID_ARGUMENT': 'api/bad-request',
  'UNAUTHENTICATED': 'api/authentication-failed',
  'PERMISSION_DENIED': 'api/authentication-failed',
  'RESOURCE_EXHAUSTED': 'api/quota-exceeded',
  'UNAVAILABLE': 'api/service-unavailable',
  'INTERNAL': 'api/server-error',
};

/**
 * Get user-friendly error message from error object
 * 
 * @param {Error|string} error - Error object or error code
 * @returns {string} User-friendly error message
 */
export const getVideoCallErrorMessage = (error) => {
  // If error is a string (error code)
  if (typeof error === 'string') {
    return VIDEO_CALL_ERRORS[error] || VIDEO_CALL_ERRORS.unknown;
  }
  
  // If error is an Error object
  if (error && typeof error === 'object') {
    // Check for our custom error codes
    if (error.code && VIDEO_CALL_ERRORS[error.code]) {
      return VIDEO_CALL_ERRORS[error.code];
    }
    
    // Map native error names to our codes
    if (error.name && ERROR_CODE_MAP[error.name]) {
      const mappedCode = ERROR_CODE_MAP[error.name];
      return VIDEO_CALL_ERRORS[mappedCode];
    }
    
    // Check error message for keywords
    const message = (error.message || '').toLowerCase();
    
    if (message.includes('camera') || message.includes('video')) {
      if (message.includes('denied') || message.includes('permission')) {
        return VIDEO_CALL_ERRORS['permission/camera-denied'];
      }
      return VIDEO_CALL_ERRORS['video/stream-failed'];
    }
    
    if (message.includes('microphone') || message.includes('audio')) {
      if (message.includes('denied') || message.includes('permission')) {
        return VIDEO_CALL_ERRORS['permission/microphone-denied'];
      }
      return VIDEO_CALL_ERRORS['audio/stream-failed'];
    }
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return VIDEO_CALL_ERRORS['api/network-error'];
    }
    
    if (message.includes('timeout')) {
      return VIDEO_CALL_ERRORS['api/timeout'];
    }
    
    if (message.includes('api') || message.includes('gemini')) {
      return VIDEO_CALL_ERRORS['api/connection-failed'];
    }
    
    // Return original message if it's user-friendly (Vietnamese)
    if (error.message && /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(error.message)) {
      return error.message;
    }
  }
  
  return VIDEO_CALL_ERRORS.unknown;
};

/**
 * Check if error is a permission error
 * 
 * @param {Error} error - Error object
 * @returns {boolean} True if permission error
 */
export const isPermissionError = (error) => {
  if (!error) return false;
  
  const permissionErrors = [
    'NotAllowedError',
    'NotFoundError',
    'NotReadableError',
    'OverconstrainedError'
  ];
  
  if (error.name && permissionErrors.includes(error.name)) {
    return true;
  }
  
  const errorString = (error.code || error.message || '').toLowerCase();
  return errorString.includes('permission') || 
         errorString.includes('denied') || 
         errorString.includes('not-allowed');
};

/**
 * Check if error is a network error
 * 
 * @param {Error} error - Error object
 * @returns {boolean} True if network error
 */
export const isNetworkError = (error) => {
  if (!error) return false;
  
  const networkIndicators = [
    'network',
    'timeout',
    'offline',
    'connection',
    'internet',
    'fetch',
    'NetworkError',
    'TimeoutError'
  ];
  
  if (error.name && networkIndicators.includes(error.name)) {
    return true;
  }
  
  const errorString = (error.code || error.message || '').toLowerCase();
  return networkIndicators.some(indicator => errorString.includes(indicator));
};

/**
 * Check if error is an API error
 * 
 * @param {Error} error - Error object
 * @returns {boolean} True if API error
 */
export const isAPIError = (error) => {
  if (!error) return false;
  
  const apiIndicators = [
    'api',
    'gemini',
    'authentication',
    'quota',
    'rate-limit',
    'UNAUTHENTICATED',
    'PERMISSION_DENIED',
    'RESOURCE_EXHAUSTED',
    'UNAVAILABLE'
  ];
  
  const errorString = (error.code || error.message || error.name || '').toLowerCase();
  return apiIndicators.some(indicator => errorString.includes(indicator.toLowerCase()));
};

/**
 * Check if error should trigger simulation mode fallback
 * 
 * @param {Error} error - Error object
 * @returns {boolean} True if should fallback to simulation
 */
export const shouldFallbackToSimulation = (error) => {
  if (!error) return false;
  
  // Fallback for API errors but not permission errors
  return isAPIError(error) || isNetworkError(error);
};

/**
 * Check if error is retryable
 * 
 * @param {Error} error - Error object
 * @returns {boolean} True if should retry
 */
export const isRetryableError = (error) => {
  if (!error) return false;
  
  // Don't retry permission errors
  if (isPermissionError(error)) {
    return false;
  }
  
  // Retry network and temporary API errors
  const retryableIndicators = [
    'network',
    'timeout',
    'unavailable',
    'internal',
    'server-error',
    'UNAVAILABLE',
    'INTERNAL'
  ];
  
  const errorString = (error.code || error.message || error.name || '').toLowerCase();
  return retryableIndicators.some(indicator => errorString.includes(indicator.toLowerCase()));
};

/**
 * Get error severity level
 * 
 * @param {Error} error - Error object
 * @returns {string} Severity level: 'critical', 'error', 'warning', 'info'
 */
export const getErrorSeverity = (error) => {
  if (!error) return 'info';
  
  // Critical errors that prevent core functionality
  if (isPermissionError(error)) {
    return 'critical';
  }
  
  // Errors that can be recovered with simulation mode
  if (shouldFallbackToSimulation(error)) {
    return 'warning';
  }
  
  // Retryable errors
  if (isRetryableError(error)) {
    return 'warning';
  }
  
  // Default to error
  return 'error';
};

/**
 * Create a standardized error object
 * 
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {Object} context - Additional context
 * @returns {Error} Standardized error object
 */
export const createVideoCallError = (code, message, context = {}) => {
  const error = new Error(message || getVideoCallErrorMessage(code));
  error.code = code;
  error.context = context;
  error.timestamp = new Date().toISOString();
  return error;
};

export default {
  VIDEO_CALL_ERRORS,
  ERROR_CODE_MAP,
  getVideoCallErrorMessage,
  isPermissionError,
  isNetworkError,
  isAPIError,
  shouldFallbackToSimulation,
  isRetryableError,
  getErrorSeverity,
  createVideoCallError
};
