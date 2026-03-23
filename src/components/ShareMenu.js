import React, { useState } from 'react';
import { Menu, Button, Divider, Space, message } from 'antd';
import {
  FacebookOutlined,
  TwitterOutlined,
  LinkOutlined,
  MailOutlined,
  ShareAltOutlined,
  UserOutlined
} from '@ant-design/icons';
import shareService from '../services/shareService';
import { useAuth } from '../hooks/useAuth';

const ShareMenu = ({ post, onClose }) => {
  const { user, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);

  const shareUrl = shareService.generatePostShareUrl(post.id);
  const shareTitle = post.title || 'Bài viết từ NôngLạc';
  const shareDescription = post.content?.substring(0, 100) || '';

  const handleCopyLink = async () => {
    setLoading(true);
    await shareService.copyToClipboard(shareUrl);
    setLoading(false);
    onClose?.();
  };

  const handleShareFacebook = () => {
    setLoading(true);
    shareService.shareToFacebook(shareUrl, shareTitle);
    setLoading(false);
    onClose?.();
  };

  const handleShareTwitter = () => {
    setLoading(true);
    shareService.shareToTwitter(shareUrl, shareTitle);
    setLoading(false);
    onClose?.();
  };

  const handleShareWhatsApp = () => {
    setLoading(true);
    shareService.shareToWhatsApp(shareUrl, shareTitle);
    setLoading(false);
    onClose?.();
  };

  const handleShareTelegram = () => {
    setLoading(true);
    shareService.shareToTelegram(shareUrl, shareTitle);
    setLoading(false);
    onClose?.();
  };

  const handleShareEmail = () => {
    setLoading(true);
    shareService.shareToEmail(shareUrl, shareTitle, shareDescription);
    setLoading(false);
    onClose?.();
  };

  const handleNativeShare = async () => {
    setLoading(true);
    const result = await shareService.useNativeShare(shareTitle, shareDescription, shareUrl);
    setLoading(false);
    if (result.success) {
      onClose?.();
    }
  };

  const handleShareToProfile = async () => {
    if (!user) {
      message.error('Vui lòng đăng nhập để chia sẻ lên hồ sơ');
      return;
    }

    setLoading(true);
    const result = await shareService.shareToProfile(
      post,
      user.uid,
      userProfile?.displayName || user.email
    );
    setLoading(false);
    if (result.success) {
      onClose?.();
    }
  };

  const menuItems = [
    {
      key: 'profile-share',
      icon: <UserOutlined />,
      label: 'Chia sẻ lên hồ sơ',
      onClick: handleShareToProfile
    },
    {
      type: 'divider'
    },
    {
      key: 'copy-link',
      icon: <LinkOutlined />,
      label: 'Sao chép liên kết',
      onClick: handleCopyLink
    },
    {
      type: 'divider'
    },
    {
      key: 'facebook',
      icon: <FacebookOutlined style={{ color: '#1877F2' }} />,
      label: 'Chia sẻ Facebook',
      onClick: handleShareFacebook
    },
    {
      key: 'twitter',
      icon: <TwitterOutlined style={{ color: '#000' }} />,
      label: 'Chia sẻ Twitter/X',
      onClick: handleShareTwitter
    },
    {
      key: 'whatsapp',
      icon: <span style={{ fontSize: '16px' }}>💬</span>,
      label: 'Chia sẻ WhatsApp',
      onClick: handleShareWhatsApp
    },
    {
      key: 'telegram',
      icon: <span style={{ fontSize: '16px' }}>✈️</span>,
      label: 'Chia sẻ Telegram',
      onClick: handleShareTelegram
    },
    {
      key: 'email',
      icon: <MailOutlined />,
      label: 'Chia sẻ Email',
      onClick: handleShareEmail
    }
  ];

  // Thêm native share nếu trình duyệt hỗ trợ
  if (shareService.canUseNativeShare()) {
    menuItems.push({
      type: 'divider'
    });
    menuItems.push({
      key: 'native-share',
      icon: <ShareAltOutlined />,
      label: 'Chia sẻ khác',
      onClick: handleNativeShare
    });
  }

  return (
    <Menu
      items={menuItems}
      style={{ border: 'none' }}
    />
  );
};

export default ShareMenu;
