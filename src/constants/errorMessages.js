// Firebase Authentication Error Messages
export const FIREBASE_AUTH_ERRORS = {
  // Authentication errors
  'auth/invalid-login-credentials': 'Số điện thoại hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.',
  'auth/user-not-found': 'Tài khoản không tồn tại. Vui lòng đăng ký tài khoản mới.',
  'auth/wrong-password': 'Mật khẩu không đúng. Vui lòng thử lại.',
  'auth/invalid-credential': 'Thông tin đăng nhập không hợp lệ. Vui lòng kiểm tra lại.',
  'auth/invalid-email': 'Địa chỉ email không hợp lệ.',
  'auth/user-disabled': 'Tài khoản đã bị vô hiệu hóa. Liên hệ hỗ trợ để được giúp đỡ.',
  'auth/email-already-in-use': 'Email này đã được sử dụng cho tài khoản khác.',
  'auth/weak-password': 'Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn (tối thiểu 6 ký tự).',

  // Phone authentication errors
  'auth/invalid-phone-number': 'Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng.',
  'auth/missing-phone-number': 'Vui lòng nhập số điện thoại.',
  'auth/quota-exceeded': 'Đã vượt quá giới hạn gửi SMS. Vui lòng thử lại sau.',
  'auth/captcha-check-failed': 'Xác thực reCAPTCHA thất bại. Vui lòng thử lại.',
  'auth/invalid-verification-code': 'Mã OTP không đúng. Vui lòng kiểm tra lại.',
  'auth/invalid-verification-id': 'Phiên xác thực không hợp lệ. Vui lòng gửi lại mã OTP.',
  'auth/code-expired': 'Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.',
  'auth/session-expired': 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',

  // Network and server errors
  'auth/network-request-failed': 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.',
  'auth/timeout': 'Kết nối bị timeout. Vui lòng thử lại.',
  'auth/too-many-requests': 'Quá nhiều yêu cầu. Vui lòng đợi một lúc rồi thử lại.',
  'auth/internal-error': 'Lỗi hệ thống. Vui lòng thử lại sau.',
  'auth/operation-not-allowed': 'Phương thức đăng nhập này chưa được kích hoạt.',

  // Account management errors
  'auth/requires-recent-login': 'Thao tác này yêu cầu đăng nhập gần đây. Vui lòng đăng nhập lại.',
  'auth/credential-already-in-use': 'Thông tin xác thực đã được sử dụng cho tài khoản khác.',
  'auth/account-exists-with-different-credential': 'Tài khoản đã tồn tại với phương thức đăng nhập khác.',

  // Custom application errors
  'app/phone-not-registered': 'Số điện thoại chưa được đăng ký. Vui lòng tạo tài khoản mới.',
  'app/phone-already-registered': 'Số điện thoại đã được đăng ký. Vui lòng đăng nhập.',
  'app/invalid-phone-format': 'Định dạng số điện thoại không đúng. Vui lòng nhập số điện thoại Việt Nam hợp lệ.',
  'app/otp-not-sent': 'Không thể gửi mã OTP. Vui lòng thử lại.',
  'app/registration-incomplete': 'Quá trình đăng ký chưa hoàn tất. Vui lòng thử lại từ đầu.'
};

// Firestore Database Error Messages
export const FIRESTORE_ERRORS = {
  'firestore/permission-denied': 'Không có quyền truy cập dữ liệu này.',
  'firestore/not-found': 'Dữ liệu không tồn tại.',
  'firestore/already-exists': 'Dữ liệu đã tồn tại.',
  'firestore/resource-exhausted': 'Đã vượt quá giới hạn sử dụng. Vui lòng thử lại sau.',
  'firestore/failed-precondition': 'Điều kiện thực hiện không được đáp ứng.',
  'firestore/aborted': 'Thao tác bị hủy bỏ. Vui lòng thử lại.',
  'firestore/out-of-range': 'Giá trị nằm ngoài phạm vi cho phép.',
  'firestore/unimplemented': 'Tính năng chưa được hỗ trợ.',
  'firestore/internal': 'Lỗi hệ thống cơ sở dữ liệu.',
  'firestore/unavailable': 'Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.',
  'firestore/data-loss': 'Mất dữ liệu không thể khôi phục.'
};

// Storage Error Messages
export const STORAGE_ERRORS = {
  'storage/object-not-found': 'File không tồn tại.',
  'storage/bucket-not-found': 'Bucket lưu trữ không tồn tại.',
  'storage/project-not-found': 'Project không tồn tại.',
  'storage/quota-exceeded': 'Đã vượt quá dung lượng lưu trữ cho phép.',
  'storage/unauthenticated': 'Chưa đăng nhập. Vui lòng đăng nhập để tải file.',
  'storage/unauthorized': 'Không có quyền truy cập file này.',
  'storage/retry-limit-exceeded': 'Đã vượt quá số lần thử. Vui lòng thử lại sau.',
  'storage/invalid-checksum': 'File bị lỗi trong quá trình tải lên.',
  'storage/canceled': 'Quá trình tải lên đã bị hủy.',
  'storage/invalid-event-name': 'Tên sự kiện không hợp lệ.',
  'storage/invalid-url': 'URL không hợp lệ.',
  'storage/invalid-argument': 'Tham số không hợp lệ.',
  'storage/no-default-bucket': 'Chưa cấu hình bucket mặc định.',
  'storage/cannot-slice-blob': 'Không thể xử lý file này.',
  'storage/server-file-wrong-size': 'Kích thước file không đúng.'
};

// Network Error Messages
export const NETWORK_ERRORS = {
  'network/request-failed': 'Yêu cầu thất bại. Vui lòng kiểm tra kết nối mạng.',
  'network/timeout': 'Kết nối bị timeout. Vui lòng thử lại.',
  'network/offline': 'Không có kết nối internet. Vui lòng kiểm tra mạng.',
  'network/server-error': 'Lỗi máy chủ. Vui lòng thử lại sau.',
  'network/bad-request': 'Yêu cầu không hợp lệ.',
  'network/unauthorized': 'Không có quyền truy cập.',
  'network/forbidden': 'Truy cập bị từ chối.',
  'network/not-found': 'Không tìm thấy tài nguyên.',
  'network/conflict': 'Xung đột dữ liệu.',
  'network/too-many-requests': 'Quá nhiều yêu cầu. Vui lòng đợi một lúc.'
};

// Default fallback messages
export const DEFAULT_MESSAGES = {
  unknown: 'Có lỗi không xác định xảy ra. Vui lòng thử lại.',
  generic: 'Có lỗi xảy ra. Vui lòng thử lại sau.',
  maintenance: 'Hệ thống đang bảo trì. Vui lòng thử lại sau.',
  contact_support: 'Nếu lỗi vẫn tiếp tục, vui lòng liên hệ hỗ trợ.'
};

const MOJIBAKE_PATTERN = /(Ã.|Ä.|Â.|â.|ðŸ|�)/;
const RAW_ERROR_CODE_PATTERN = /^(auth|firestore|storage|network|app)\//;

/**
 * Cố gắng chuẩn hóa chuỗi tiếng Việt bị lỗi encoding (mojibake).
 * Hàm này chỉ decode khi chuỗi có dấu hiệu bị lỗi để tránh làm hỏng chuỗi đúng.
 */
export const normalizeVietnameseText = (text) => {
  if (typeof text !== 'string' || !text) return text;

  let normalized = text;

  for (let i = 0; i < 2; i += 1) {
    if (!MOJIBAKE_PATTERN.test(normalized)) break;
    try {
      const decoded = decodeURIComponent(escape(normalized));
      if (!decoded || decoded === normalized) break;
      normalized = decoded;
    } catch (error) {
      break;
    }
  }

  return normalized.replace(/\uFFFD/g, '').trim();
};

/**
 * Get all error messages combined
 * @returns {Object} All error messages
 */
export const getAllErrorMessages = () => ({
  ...FIREBASE_AUTH_ERRORS,
  ...FIRESTORE_ERRORS,
  ...STORAGE_ERRORS,
  ...NETWORK_ERRORS
});

/**
 * Get user-friendly error message from Firebase error
 * @param {Error|string} error - Firebase error object or error code
 * @returns {string} User-friendly error message
 */
export const getErrorMessage = (error) => {
  const allMessages = getAllErrorMessages();

  // If error is a string (error code or message)
  if (typeof error === 'string') {
    const mapped = allMessages[error];
    if (mapped) return normalizeVietnameseText(mapped);
    if (!RAW_ERROR_CODE_PATTERN.test(error)) return normalizeVietnameseText(error);
    return DEFAULT_MESSAGES.unknown;
  }

  // If error is an Error-like object
  if (error && typeof error === 'object') {
    const errorCode = error.code;
    const mappedByCode = errorCode ? allMessages[errorCode] : null;
    if (mappedByCode) return normalizeVietnameseText(mappedByCode);

    const rawMessage = normalizeVietnameseText(error.message || '');
    if (rawMessage && !RAW_ERROR_CODE_PATTERN.test(rawMessage)) {
      // Ưu tiên hiển thị thông điệp đã được chuẩn hóa nếu đây là câu mô tả
      return rawMessage;
    }

    if (rawMessage.toLowerCase().includes('network')) {
      return NETWORK_ERRORS['network/request-failed'];
    }
  }

  return DEFAULT_MESSAGES.unknown;
};

/**
 * Check if error is a network-related error
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
    'fetch'
  ];

  const errorString = (error.code || error.message || '').toLowerCase();
  return networkIndicators.some((indicator) => errorString.includes(indicator));
};

/**
 * Check if error requires user to retry
 * @param {Error} error - Error object
 * @returns {boolean} True if should retry
 */
export const shouldRetry = (error) => {
  if (!error) return false;

  const retryableCodes = [
    'auth/network-request-failed',
    'auth/timeout',
    'auth/internal-error',
    'firestore/unavailable',
    'firestore/aborted',
    'storage/retry-limit-exceeded',
    'network/timeout',
    'network/server-error'
  ];

  return retryableCodes.includes(error.code);
};

export default {
  getErrorMessage,
  getAllErrorMessages,
  isNetworkError,
  shouldRetry,
  normalizeVietnameseText,
  FIREBASE_AUTH_ERRORS,
  FIRESTORE_ERRORS,
  STORAGE_ERRORS,
  NETWORK_ERRORS,
  DEFAULT_MESSAGES
};
