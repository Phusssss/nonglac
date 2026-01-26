import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserProfile } from '../hooks';
import {
  UserProfileHeader,
  UserProfileSidebar,
  UserProfileContent
} from '../components';

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { userProfile, userPosts, followers, following, loading } = useUserProfile(userId);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex space-x-1">
          <div className="w-3 h-3 bg-[#4CAF50] rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-[#4CAF50] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-3 h-3 bg-[#4CAF50] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Không tìm thấy người dùng</h2>
          <p className="text-gray-500 mb-6">Người dùng này có thể đã bị xóa hoặc không tồn tại.</p>
          <button 
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] font-medium"
          >
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          <UserProfileHeader userProfile={userProfile} userId={userId} />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <UserProfileSidebar 
              userProfile={userProfile}
              followers={followers}
              following={following}
              postsCount={userPosts.length}
            />

            <div className="lg:col-span-2">
              <UserProfileContent userPosts={userPosts} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;