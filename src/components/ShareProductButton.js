import React, { useState } from 'react';
import { Button, Dropdown, message } from 'antd';
import { Share2 } from 'lucide-react';
import shareService from '../services/shareService';
import { useAuth } from '../hooks/useAuth';

const ShareProductButton = ({ product, size = 'middle', variant = 'text' }) => {
  const { user, userProfile } = useAuth();
  const [open, setOpen] = useState(false);

  const shareUrl = shareService.generateProductShareUrl(product.id);
  const shareTitle = product.name || 'Sản phẩm từ NôngLạc';
  const shareDescription = product.description?.substring(0, 100) || '';

  const handleCopyLink = async () => {
    await shareService.copyToClipboard(shareUrl);
    setOpen(false);
  };

  const handleShareFacebook = () => {
    shareService.shareToFacebook(shareUrl, shareTitle);
    setOpen(false);
  };

  const handleShareTwitter = () => {
    shareService.shareToTwitter(shareUrl, shareTitle);
    setOpen(false);
  };

  const handleShareWhatsApp = () => {
    shareService.shareToWhatsApp(shareUrl, shareTitle);
    setOpen(false);
  };

  const handleShareTelegram = () => {
    shareService.shareToTelegram(shareUrl, shareTitle);
    setOpen(false);
  };

  const handleShareEmail = () => {
    shareService.shareToEmail(shareUrl, shareTitle, shareDescription);
    setOpen(false);
  };

  const handleShareToProfile = () => {
    if (!user) {
      message.error('Vui lòng đăng nhập để chia sẻ lên hồ sơ');
      return;
    }

    shareService.shareProductToProfile(
      product,
      user.uid,
      userProfile?.displayName || user.email
    );
    setOpen(false);
  };

  const menuItems = [
    {
      key: 'profile-share',
      label: '👤 Chia sẻ lên hồ sơ',
      onClick: handleShareToProfile
    },
    {
      type: 'divider'
    },
    {
      key: 'copy-link',
      label: '📋 Sao chép liên kết',
      onClick: handleCopyLink
    },
    {
      type: 'divider'
    },
    {
      key: 'facebook',
      label: '👍 Chia sẻ Facebook',
      onClick: handleShareFacebook
    },
    {
      key: 'twitter',
      label: '𝕏 Chia sẻ Twitter/X',
      onClick: handleShareTwitter
    },
    {
      key: 'whatsapp',
      label: '💬 Chia sẻ WhatsApp',
      onClick: handleShareWhatsApp
    },
    {
      key: 'telegram',
      label: '✈️ Chia sẻ Telegram',
      onClick: handleShareTelegram
    },
    {
      key: 'email',
      label: '✉️ Chia sẻ Email',
      onClick: handleShareEmail
    }
  ];

  return (
    <Dropdown
      menu={{ items: menuItems }}
      open={open}
      onOpenChange={setOpen}
      trigger={['click']}
      placement="bottomRight"
    >
      <Button
        type={variant}
        size={size}
        icon={<Share2 className="w-4 h-4" />}
        onClick={(e) => e.stopPropagation()}
        className="flex items-center gap-1 text-gray-500 hover:text-green-500 transition-colors text-sm font-medium"
      >
        Chia sẻ
      </Button>
    </Dropdown>
  );
};

export default ShareProductButton;
