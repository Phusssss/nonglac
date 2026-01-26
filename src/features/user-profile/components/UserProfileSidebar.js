import React from 'react';
import { USER_PROFILE_CONSTANTS } from '../constants';

const UserProfileSidebar = ({ userProfile, followers, following, postsCount }) => {
  return (
    <aside className="lg:col-span-1 flex flex-col gap-6">
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-bold mb-3">Giới thiệu</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {userProfile?.about || 'Chưa có thông tin giới thiệu.'}
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-lg font-bold mb-4">Chuyên môn</h3>
        <div className="flex gap-2 flex-wrap">
          {USER_PROFILE_CONSTANTS.DEFAULT_SKILLS.map((skill) => (
            <span key={skill} className="px-3 py-1 bg-[#4CAF50]/10 text-[#4CAF50] rounded-full text-sm">
              {skill}
            </span>
          ))}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <div className="flex justify-around text-center">
          <div>
            <p className="text-xl font-bold">{followers}</p>
            <p className="text-sm text-gray-500">Người theo dõi</p>
          </div>
          <div>
            <p className="text-xl font-bold">{following}</p>
            <p className="text-sm text-gray-500">Đang theo dõi</p>
          </div>
          <div>
            <p className="text-xl font-bold">{postsCount}</p>
            <p className="text-sm text-gray-500">Bài viết</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default UserProfileSidebar;