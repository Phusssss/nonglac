import React from 'react';
import { Card, Empty, Spin, Space } from 'antd';
import PostSkeleton from '../../../components/PostSkeleton';

const SharedPostCard = ({ share }) => {
  const isProduct = share.type === 'product';

  if (isProduct) {
    return (
      <Card className="mb-4 hover:shadow-md transition-shadow">
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
            <h4 className="font-bold text-gray-900 mb-1">{share.originalProductName}</h4>
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
      </Card>
    );
  }

  // Post
  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <div className="mb-3">
        <h4 className="font-bold text-gray-900 mb-1">{share.originalTitle}</h4>
        <p className="text-sm text-gray-600 line-clamp-3">{share.originalContent}</p>
      </div>
      
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
    </Card>
  );
};

const SharedPostsContent = ({ sharedPosts, loading, loadingMore }) => {
  if (loading) {
    return (
      <div className="p-6 flex flex-col gap-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <PostSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (sharedPosts.length === 0) {
    return (
      <div className="p-6">
        <Empty
          description="Bạn chưa chia sẻ bài viết hoặc sản phẩm nào"
          style={{ marginTop: '48px', marginBottom: '48px' }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col gap-6">
      {sharedPosts.map((share, index) => (
        <div key={share.id} className="animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
          <SharedPostCard share={share} />
        </div>
      ))}
      
      {loadingMore && (
        <div className="flex justify-center py-4">
          <Space>
            <Spin size="small" />
            <span className="text-gray-500 text-sm">Đang tải thêm...</span>
          </Space>
        </div>
      )}
    </div>
  );
};

export default SharedPostsContent;
