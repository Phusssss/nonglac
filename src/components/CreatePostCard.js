import React from 'react';
import { Card, Avatar, Input, Button, Divider } from 'antd';
import { PictureOutlined, SmileOutlined } from '@ant-design/icons';
import { useAuth } from '../hooks/useAuth';

const CreatePostCard = ({ onCreatePost }) => {
  const { user, userProfile } = useAuth();

  if (!user) return null;

  return (
    <Card 
      className="mb-4 shadow-sm"
      style={{ 
        borderRadius: '8px',
        backgroundColor: '#ffffff'
      }}
    >
      <div className="flex gap-4 items-center mb-4">
        <Avatar 
          size={40}
          src={userProfile?.avatar}
        >
          {!userProfile?.avatar && (userProfile?.displayName?.charAt(0) || user.email?.charAt(0))}
        </Avatar>
        <Input
          placeholder={`${userProfile?.displayName || 'Bạn'} ơi, bạn đang nghĩ gì?`}
          onClick={onCreatePost}
          style={{
            borderRadius: '20px',
            backgroundColor: '#F0F2F5',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            color: '#65676B'
          }}
          className="hover:bg-gray-200"
        />
      </div>
      
      <Divider className="mb-2" />
      
      <div className="flex justify-around">
        <Button
          type="text"
          icon={<PictureOutlined style={{ color: '#45BD62' }} />}
          onClick={onCreatePost}
          className="text-gray-600 font-semibold px-6 py-2 rounded-lg hover:bg-gray-100"
        >
          Ảnh/Video
        </Button>
        <Button
          type="text"
          icon={<SmileOutlined style={{ color: '#F7B928' }} />}
          onClick={onCreatePost}
          className="text-gray-600 font-semibold px-6 py-2 rounded-lg hover:bg-gray-100"
        >
          Cảm xúc
        </Button>
      </div>
    </Card>
  );
};

export default CreatePostCard;