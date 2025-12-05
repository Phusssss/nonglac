export const handleFirebaseError = (error) => {
  switch (error.code) {
    case 'auth/user-not-found':
      return 'Không tìm thấy tài khoản';
    case 'auth/wrong-password':
      return 'Mật khẩu không đúng';
    case 'auth/email-already-in-use':
      return 'Email đã được sử dụng';
    case 'auth/weak-password':
      return 'Mật khẩu quá yếu';
    case 'auth/invalid-email':
      return 'Email không hợp lệ';
    case 'permission-denied':
      return 'Không có quyền truy cập';
    case 'unavailable':
      return 'Dịch vụ tạm thời không khả dụng';
    default:
      return error.message || 'Có lỗi xảy ra';
  }
};

export const withErrorHandling = (asyncFn) => {
  return async (...args) => {
    try {
      return await asyncFn(...args);
    } catch (error) {
      console.error('Service error:', error);
      throw new Error(handleFirebaseError(error));
    }
  };
};

export const retryOperation = async (operation, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};