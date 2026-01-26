import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { profileService } from '../services';
import { IconButton } from '../../../components/ui';

const ProfileHeader = ({ onEditClick }) => {
  const { user, userProfile } = useAuth();

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex gap-6 items-center">
          <div className="relative">
            <div className="w-24 h-24 md:w-32 md:h-32 bg-[#4CAF50] rounded-full" style={{
              backgroundImage: userProfile?.avatar ? `url(${userProfile.avatar})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}>
              {!userProfile?.avatar && (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
                  {profileService.getInitials(userProfile?.displayName, user?.email)}
                </div>
              )}
            </div>
            <IconButton 
              onClick={onEditClick}
              className="absolute bottom-0 right-0"
              size="sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </IconButton>
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{userProfile?.displayName || 'Người dùng'}</h1>
            <p className="text-[#4CAF50]">{profileService.getReputationLevel(userProfile?.reputation || 0)}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={onEditClick}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            Chỉnh sửa
          </button>
          <button className="px-4 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] font-medium">
            Chia sẻ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;