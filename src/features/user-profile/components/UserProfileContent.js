import React from 'react';
import PostCard from '../../../components/PostCard';

const UserProfileContent = ({ userPosts }) => {
  if (userPosts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center py-8">
          <p className="text-gray-500">Người dùng chưa có bài viết nào.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="border-b border-gray-200 px-6 py-4">
        <h3 className="text-lg font-bold">Bài viết gần đây</h3>
      </div>
      <div className="p-6 flex flex-col gap-6">
        {userPosts.map((post, index) => (
          <div key={post.id} className="animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
            <PostCard post={post} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserProfileContent;