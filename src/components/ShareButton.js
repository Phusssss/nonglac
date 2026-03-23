import React, { useState } from 'react';
import { Button, Dropdown, Space } from 'antd';
import { Share2 } from 'lucide-react';
import ShareMenu from './ShareMenu';

const ShareButton = ({ post, size = 'middle', variant = 'text' }) => {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (newOpen) => {
    setOpen(newOpen);
  };

  return (
    <Dropdown
      menu={{ items: [] }}
      open={open}
      onOpenChange={handleOpenChange}
      dropdownRender={() => <ShareMenu post={post} onClose={() => setOpen(false)} />}
      trigger={['click']}
      placement="bottomRight"
    >
      <Button
        type={variant}
        size={size}
        icon={<Share2 className="w-4 h-4" />}
        className="flex items-center gap-1 text-gray-500 hover:text-green-500 transition-colors text-sm font-medium"
      >
        Chia sẻ
      </Button>
    </Dropdown>
  );
};

export default ShareButton;
