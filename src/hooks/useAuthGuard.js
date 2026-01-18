import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';
import { useState, useCallback, useMemo } from 'react';

export const useAuthGuard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Kiểm tra auth và redirect hoặc hiển thị modal
  const requireAuth = useCallback((action, options = {}) => {
    if (user) {
      // User đã đăng nhập, thực hiện action
      if (typeof action === 'function') {
        return action();
      }
      return true;
    }

    // User chưa đăng nhập
    const { 
      showModal = true, 
      redirectTo = '/phone-login',
      message = 'Vui lòng đăng nhập để tiếp tục',
      feature = 'sử dụng tính năng này'
    } = options;

    if (showModal) {
      // Hiển thị modal login
      setShowLoginModal(true);
      return false;
    } else {
      // Redirect trực tiếp
      if (message) {
        // Lưu message vào localStorage để hiển thị ở trang login
        localStorage.setItem('loginMessage', `${message} - ${feature}`);
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
      }
      navigate(redirectTo);
      return false;
    }
  }, [user, navigate, setShowLoginModal]);

  // Sử dụng useMemo để tránh re-creation của các helper functions
  const authHelpers = useMemo(() => ({
    requireAuthForPost: (action) => {
      return requireAuth(action, {
        message: 'Đăng nhập để tạo bài viết',
        feature: 'đăng bài viết'
      });
    },

    requireAuthForComment: (action) => {
      return requireAuth(action, {
        message: 'Đăng nhập để bình luận',
        feature: 'bình luận bài viết'
      });
    },

    requireAuthForLike: (action) => {
      return requireAuth(action, {
        message: 'Đăng nhập để thích bài viết',
        feature: 'thích bài viết'
      });
    },

    requireAuthForMarketplace: (action) => {
      return requireAuth(action, {
        message: 'Đăng nhập để sử dụng chợ',
        feature: 'đăng sản phẩm hoặc liên hệ người bán'
      });
    },

    requireAuthForChat: (action) => {
      return requireAuth(action, {
        message: 'Đăng nhập để nhắn tin',
        feature: 'gửi tin nhắn'
      });
    },

    requireAuthForAI: (action) => {
      return requireAuth(action, {
        message: 'Đăng nhập để sử dụng AI',
        feature: 'sử dụng các công cụ AI'
      });
    },

    requireAuthForProfile: (action) => {
      return requireAuth(action, {
        showModal: false, // Profile thường redirect trực tiếp
        message: 'Đăng nhập để xem profile',
        feature: 'xem thông tin cá nhân'
      });
    }
  }), [requireAuth]);

  return {
    user,
    isAuthenticated: !!user,
    requireAuth,
    ...authHelpers,
    showLoginModal,
    setShowLoginModal
  };
};