import React, { useState } from 'react';
import { Button, Tooltip } from 'antd';
import { useAuthGuard } from '../../hooks/useAuthGuard';
import EnhancedLoginModal from './EnhancedLoginModal';

const AuthGuardButton = ({ 
  children,
  onClick,
  authType = 'general',
  authMessage,
  authFeature,
  tooltip,
  requireAuth = true,
  ...buttonProps 
}) => {
  const { 
    user, 
    requireAuth: guardRequireAuth,
    requireAuthForPost,
    requireAuthForComment,
    requireAuthForLike,
    requireAuthForMarketplace,
    requireAuthForChat,
    requireAuthForAI,
    requireAuthForProfile
  } = useAuthGuard();
  
  const [showModal, setShowModal] = useState(false);

  const getAuthFunction = () => {
    switch (authType) {
      case 'post': return requireAuthForPost;
      case 'comment': return requireAuthForComment;
      case 'like': return requireAuthForLike;
      case 'marketplace': return requireAuthForMarketplace;
      case 'chat': return requireAuthForChat;
      case 'ai': return requireAuthForAI;
      case 'profile': return requireAuthForProfile;
      default: return guardRequireAuth;
    }
  };

  const handleClick = (e) => {
    if (!requireAuth || user) {
      // User đã đăng nhập hoặc không cần auth, thực hiện action
      if (onClick) {
        onClick(e);
      }
      return;
    }

    // User chưa đăng nhập, hiển thị modal
    setShowModal(true);
  };

  const getDefaultMessage = () => {
    switch (authType) {
      case 'post': return 'Đăng nhập để tạo bài viết';
      case 'comment': return 'Đăng nhập để bình luận';
      case 'like': return 'Đăng nhập để thích bài viết';
      case 'marketplace': return 'Đăng nhập để sử dụng chợ';
      case 'chat': return 'Đăng nhập để nhắn tin';
      case 'ai': return 'Đăng nhập để sử dụng AI';
      case 'profile': return 'Đăng nhập để xem profile';
      default: return 'Đăng nhập để tiếp tục';
    }
  };

  const getDefaultFeature = () => {
    switch (authType) {
      case 'post': return 'tạo và chia sẻ bài viết';
      case 'comment': return 'bình luận bài viết';
      case 'like': return 'thích bài viết';
      case 'marketplace': return 'mua bán nông sản';
      case 'chat': return 'nhắn tin với nông dân khác';
      case 'ai': return 'sử dụng công cụ AI';
      case 'profile': return 'xem thông tin cá nhân';
      default: return 'sử dụng tính năng này';
    }
  };

  const buttonElement = (
    <Button
      {...buttonProps}
      onClick={handleClick}
    >
      {children}
    </Button>
  );

  // Nếu user chưa đăng nhập và có tooltip, hiển thị tooltip
  if (!user && requireAuth && tooltip) {
    return (
      <>
        <Tooltip title={tooltip || `Đăng nhập để ${getDefaultFeature()}`}>
          {buttonElement}
        </Tooltip>
        
        <EnhancedLoginModal
          open={showModal}
          onCancel={() => setShowModal(false)}
          message={authMessage || getDefaultMessage()}
          feature={authFeature || getDefaultFeature()}
        />
      </>
    );
  }

  return (
    <>
      {buttonElement}
      
      <EnhancedLoginModal
        open={showModal}
        onCancel={() => setShowModal(false)}
        message={authMessage || getDefaultMessage()}
        feature={authFeature || getDefaultFeature()}
      />
    </>
  );
};

export default AuthGuardButton;