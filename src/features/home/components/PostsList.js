import React from 'react';
import { Card, Button, Empty, Spin, Space } from 'antd';
import { ReloadOutlined, LoadingOutlined } from '@ant-design/icons';
import PostCard from '../../../components/PostCard';

const PostsList = ({ 
  posts, 
  loading, 
  loadingMore, 
  hasMore, 
  searchTerm,
  onLoadMore, 
  onRefresh 
}) => {
  if (loading) {
    return (
      <div className="text-center py-12">
        <Spin size="large" indicator={<LoadingOutlined spin />} />
        <div className="mt-4 text-gray-500">Đang tải bài viết...</div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="text-center py-12">
        <Empty
          description={
            searchTerm 
              ? `Không tìm thấy bài viết nào cho "${searchTerm}"`
              : "Chưa có bài viết nào"
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          {!searchTerm && (
            <Button 
              type="primary" 
              onClick={onRefresh}
              className="bg-[#4CAF50] hover:bg-[#45a049] border-[#4CAF50]"
            >
              Tải lại
            </Button>
          )}
        </Empty>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {searchTerm ? (
            <>Tìm thấy <span className="font-medium">{posts.length}</span> kết quả cho "{searchTerm}"</>
          ) : (
            <>Hiển thị <span className="font-medium">{posts.length}</span> bài viết</>
          )}
        </div>
        <Button
          type="text"
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          className="text-gray-500 hover:text-[#4CAF50]"
          size="small"
        >
          Làm mới
        </Button>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {posts.map((post, index) => (
          <PostCard 
            key={`${post.id}-${index}`} 
            post={post}
            className="shadow-sm hover:shadow-md transition-shadow duration-200"
          />
        ))}
      </div>

      {/* Load More Button */}
      {!searchTerm && hasMore && (
        <div className="text-center py-6">
          <Button
            type="default"
            onClick={onLoadMore}
            loading={loadingMore}
            size="large"
            className="px-8 hover:border-[#4CAF50] hover:text-[#4CAF50]"
          >
            {loadingMore ? 'Đang tải...' : 'Xem thêm bài viết'}
          </Button>
        </div>
      )}

      {/* End of Posts Message */}
      {!searchTerm && !hasMore && posts.length > 0 && (
        <div className="text-center py-6 text-gray-500 text-sm">
          <div className="border-t border-gray-200 pt-4">
            🎉 Bạn đã xem hết tất cả bài viết
          </div>
        </div>
      )}

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="text-center py-4">
          <Space>
            <Spin size="small" />
            <span className="text-gray-500 text-sm">Đang tải thêm bài viết...</span>
          </Space>
        </div>
      )}
    </div>
  );
};

export default PostsList;