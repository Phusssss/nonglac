import React from 'react';
import PostCard from '../../../components/PostCard';
import PostSkeleton from '../../../components/PostSkeleton';

const ProfileContent = ({ userPosts, loading, loadingMore, activeTab }) => {
  if (loading) {
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
        if (userPosts.length === 0) {
          return (
            <div className="text-center py-8">
              <p className="text-gray-500">Bạn chưa có bài viết nào. Hãy đăng bài viết đầu tiên!</p>
            </div>
          );
        }
        return userPosts.map((post, index) => (
          <div key={post.id} className="animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
            <PostCard post={post} />
          </div>
        ));
      
      case 'articles':
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Chưa có bài báo nào. Tính năng đang phát triển!</p>
          </div>
        );
      
      case 'qa':
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Chưa có câu hỏi nào. Tính năng đang phát triển!</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="p-6 flex flex-col gap-6">
      {renderTabContent()}
      {activeTab === 'posts' && loadingMore && (
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