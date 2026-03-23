import React from 'react';
import PostCard from '../../../components/PostCard';
import PostSkeleton from '../../../components/PostSkeleton';
import { useNavigate } from 'react-router-dom';
import { Tag } from 'antd';

const SharedPostCard = ({ share, onNavigate }) => {
  const isProduct = share.type === 'product';

  if (isProduct) {
    return (
      <div 
        onClick={() => onNavigate(`/product/${share.originalProductId}`)}
        className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden font-sans cursor-pointer hover:shadow-md transition-shadow p-4"
      >
        <div className="flex gap-4">
          <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            {share.originalProductImages && share.originalProductImages.length > 0 ? (
              <img
                src={share.originalProductImages[0]}
                alt={share.originalProductName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">🌿</div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-gray-900">{share.originalProductName}</h4>
              <Tag color="blue">Share</Tag>
            </div>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{share.originalProductDescription}</p>
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-[#2f8f3a]">
                {share.originalProductPrice?.toLocaleString('vi-VN')} đ/{share.originalProductUnit || 'kg'}
              </span>
              <span className="text-xs text-gray-500">
                {share.originalProductAddress || 'Việt Nam'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Post
  return (
    <div 
      onClick={() => onNavigate(`/post/${share.originalPostId}`)}
      className="w-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden font-sans cursor-pointer hover:shadow-md transition-shadow p-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <h4 className="font-bold text-gray-900">{share.originalTitle}</h4>
        <Tag color="blue">Share</Tag>
      </div>
      <p className="text-sm text-gray-600 line-clamp-3 mb-3">{share.originalContent}</p>
      
      {share.originalImages && share.originalImages.length > 0 && (
        <div className="mb-3 rounded-lg overflow-hidden bg-gray-100 max-h-64">
          <img
            src={share.originalImages[0]}
            alt={share.originalTitle}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>Từ: {share.originalAuthorName}</span>
        <span>{share.originalCategory && `#${share.originalCategory}`}</span>
      </div>
    </div>
  );
};

const ProfileContent = ({ userPosts, loading, loadingMore, activeTab, sharedPosts = [], sharedLoading = false, sharedLoadingMore = false }) => {
  const navigate = useNavigate();

  if (loading || sharedLoading) {
    return (
      <div className="p-6 flex flex-col gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <PostSkeleton key={index} />
        ))}
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'posts':
        // Gộp bài viết gốc và bài viết được chia sẻ
        const allPosts = [
          ...userPosts.map(post => ({ ...post, isShared: false })),
          ...sharedPosts.map(share => ({ ...share, isShared: true }))
        ];

        // Sắp xếp theo thời gian (mới nhất trước)
        allPosts.sort((a, b) => {
          const timeA = a.createdAt?.toDate?.() || a.createdAt || new Date(0);
          const timeB = b.createdAt?.toDate?.() || b.sharedAt?.toDate?.() || b.sharedAt || new Date(0);
          return timeB - timeA;
        });

        if (allPosts.length === 0) {
          return (
            <div className="text-center py-8">
              <p className="text-gray-500">Bạn chưa có bài viết nào. Hãy đăng bài viết đầu tiên!</p>
            </div>
          );
        }

        return allPosts.map((item, index) => (
          <div key={item.id} className="animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
            {item.isShared ? (
              <SharedPostCard share={item} onNavigate={navigate} />
            ) : (
              <PostCard post={item} />
            )}
          </div>
        ));
      
      default:
        return null;
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      {renderTabContent()}
      {(loadingMore || sharedLoadingMore) && (
        <div className="flex justify-center py-4">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileContent;