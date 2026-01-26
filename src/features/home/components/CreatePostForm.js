import React, { useState } from 'react';
import { Card, Button, Input, Select, message } from 'antd';
import { PictureOutlined, VideoCameraOutlined, SmileOutlined, SendOutlined } from '@ant-design/icons';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../hooks/useAuth';
import { useAuthGuard } from '../../../hooks/useAuthGuard';
import { logUserAction, ACTIONS } from '../../../utils/analytics';
import GitHubImageUpload from '../../../components/GitHubImageUpload';
import { POST_CATEGORIES } from '../constants';

const { TextArea } = Input;
const { Option } = Select;

const CreatePostForm = ({ onPostCreated, setShowLoginModal }) => {
  const { user, userProfile } = useAuth();
  const { requireAuthForPost } = useAuthGuard();
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newPost, setNewPost] = useState({ 
    title: '', 
    content: '', 
    category: '', 
    images: [] 
  });

  const categories = POST_CATEGORIES.filter(cat => cat.key !== 'all'); // Exclude 'all' for post creation

  const handleSubmit = async () => {
    if (!requireAuthForPost()) return;

    if (!newPost.title.trim() || !newPost.content.trim()) {
      message.error('Vui lòng nhập đầy đủ tiêu đề và nội dung');
      return;
    }

    setSubmitting(true);
    try {
      const postData = {
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        category: newPost.category || 'Khác',
        images: newPost.images || [],
        authorId: user.uid,
        authorName: userProfile?.displayName || user.displayName || 'Người dùng',
        authorAvatar: userProfile?.photoURL || user.photoURL || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likes: 0,
        comments: 0,
        shares: 0,
        isPublic: true
      };

      await addDoc(collection(db, 'posts'), postData);
      
      // Reset form
      setNewPost({ title: '', content: '', category: '', images: [] });
      setOpen(false);
      
      // Log analytics
      logUserAction(ACTIONS.CREATE_POST, { category: postData.category });
      
      message.success('Đã đăng bài viết thành công!');
      
      // Callback to refresh posts
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (error) {
      console.error('Error creating post:', error);
      message.error('Có lỗi xảy ra khi đăng bài viết');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (urls) => {
    setNewPost(prev => ({
      ...prev,
      images: [...(prev.images || []), ...urls]
    }));
  };

  if (!open) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold shadow-md flex-shrink-0">
            {user ? (userProfile?.displayName?.charAt(0) || 'U') : 'G'}
          </div>
          <div className="flex-1">
            <input 
              className="w-full bg-gray-50 border-none rounded-full px-5 py-2.5 text-sm focus:ring-2 focus:ring-[#4CAF50]/50 transition-shadow mb-3 cursor-pointer" 
              placeholder="Chia sẻ kinh nghiệm nông nghiệp của bạn..." 
              type="text"
              onClick={() => {
                if (user) {
                  setOpen(true);
                } else {
                  setShowLoginModal(true);
                }
              }}
              readOnly
            />
            <div className="flex justify-between items-center border-t border-gray-100 pt-3">
              <div className="flex gap-2">
                <button 
                  className="p-2 rounded-full hover:bg-green-50 text-green-600 transition-all duration-200 hover:scale-105 active:scale-95" 
                  title="Thêm ảnh"
                  onClick={() => {
                    if (user) {
                      setOpen(true);
                    } else {
                      setShowLoginModal(true);
                    }
                  }}
                >
                  <PictureOutlined className="text-xl" />
                </button>
                <button 
                  className="p-2 rounded-full hover:bg-blue-50 text-blue-500 transition-all duration-200 hover:scale-105 active:scale-95" 
                  title="Thêm video"
                  onClick={() => {
                    if (user) {
                      setOpen(true);
                    } else {
                      setShowLoginModal(true);
                    }
                  }}
                >
                  <VideoCameraOutlined className="text-xl" />
                </button>
                <button 
                  className="p-2 rounded-full hover:bg-orange-50 text-orange-500 transition-all duration-200 hover:scale-105 active:scale-95" 
                  title="Thêm cảm xúc"
                  onClick={() => {
                    if (user) {
                      setOpen(true);
                    } else {
                      setShowLoginModal(true);
                    }
                  }}
                >
                  <SmileOutlined className="text-xl" />
                </button>
              </div>
              <Button
                type="primary"
                onClick={() => {
                  if (user) {
                    setOpen(true);
                  } else {
                    setShowLoginModal(true);
                  }
                }}
                className="bg-[#4CAF50] hover:bg-[#388E3C] border-[#4CAF50] hover:border-[#388E3C] shadow-sm hover:shadow-md transition-all duration-200 opacity-90 hover:opacity-100 hover:scale-105 active:scale-95"
              >
                Đăng bài
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className="mb-6 shadow-sm border border-gray-100">
      <div className="space-y-4">
        <Input
          placeholder="Tiêu đề bài viết..."
          value={newPost.title}
          onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
          className="text-lg font-medium"
          maxLength={200}
        />

        <Select
          placeholder="Chọn danh mục"
          value={newPost.category}
          onChange={(value) => setNewPost(prev => ({ ...prev, category: value }))}
          className="w-full"
        >
          {categories.map(cat => (
            <Option key={cat.key} value={cat.label}>
              <span className="flex items-center gap-2">
                {React.createElement(cat.icon, { 
                  size: cat.icon.name?.includes('Outlined') ? undefined : 14,
                  className: cat.icon.name?.includes('Outlined') ? 'text-sm' : undefined
                })}
                {cat.label}
              </span>
            </Option>
          ))}
        </Select>

        <TextArea
          placeholder="Chia sẻ kinh nghiệm, kỹ thuật, hoặc câu hỏi về nông nghiệp..."
          value={newPost.content}
          onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
          rows={4}
          maxLength={2000}
          showCount
        />

        <GitHubImageUpload
          onUploadSuccess={handleImageUpload}
          maxFiles={5}
          folder="posts"
        />

        <div className="flex justify-between items-center pt-2">
          <Button
            onClick={() => {
              setOpen(false);
              setNewPost({ title: '', content: '', category: '', images: [] });
            }}
          >
            Hủy
          </Button>
          
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSubmit}
            loading={submitting}
            className="bg-[#4CAF50] hover:bg-[#45a049] border-[#4CAF50]"
          >
            Đăng bài
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CreatePostForm;