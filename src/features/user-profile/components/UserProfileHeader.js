import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useChat } from '../../../contexts/ChatContext';
import { userProfileService } from '../services';
import { FollowButton } from '../../profile/components';
import { Button } from '../../../components/ui';

const UserProfileHeader = ({ userProfile, userId }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startChat } = useChat();

  const handleStartChat = async () => {
    await startChat(userId, userProfile.displayName);
    navigate('/messages');
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex gap-6 items-center">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-[#4CAF50] rounded-full" style={{
            backgroundImage: userProfile?.avatar ? `url(${userProfile.avatar})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            {!userProfile?.avatar && (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
                {userProfileService.getInitials(userProfile?.displayName, userProfile?.email)}
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{userProfile?.displayName || 'Người dùng'}</h1>
            <p className="text-[#4CAF50]">{userProfileService.getReputationLevel(userProfile?.reputation || 0)}</p>
            <p className="text-gray-500 text-sm">{userProfile?.email}</p>
            <div className="flex gap-4 mt-2 text-sm text-gray-500">
              <span>📍 {userProfile?.location || 'Việt Nam'}</span>
              <span>⭐ {userProfile?.reputation || 0} điểm uy tín</span>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <FollowButton targetUserId={userId} />
          {user && user.uid !== userId && (
            <Button onClick={handleStartChat}>
              💬 Nhắn tin
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileHeader;