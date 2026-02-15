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
  const profileLocation = userProfile?.fullAddress
    || userProfile?.location
    || userProfile?.address
    || userProfile?.farmAddress
    || userProfile?.province
    || 'Việt Nam';
  const profileEmail = userProfile?.email || 'Chưa cập nhật';

  const handleStartChat = async () => {
    await startChat(userId, userProfile.displayName);
    navigate('/messages');
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-[#d8ead7] bg-gradient-to-br from-[#f5fbf4] via-white to-[#eef8ed] p-6 md:p-8 shadow-[0_20px_50px_-35px_rgba(34,84,35,0.55)]">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#86d889]/20 blur-2xl" />
      <div className="pointer-events-none absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-[#4CAF50]/10 blur-2xl" />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5 md:gap-6">
          <div className="h-24 w-24 md:h-32 md:w-32 shrink-0 rounded-[28px] border-4 border-white bg-[#4CAF50] shadow-lg shadow-[#4CAF50]/20" style={{
            backgroundImage: userProfile?.avatar ? `url(${userProfile.avatar})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            {!userProfile?.avatar && (
              <div className="flex h-full w-full items-center justify-center text-2xl font-black text-white md:text-3xl">
                {userProfileService.getInitials(userProfile?.displayName, userProfile?.email)}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center rounded-full border border-[#b8dcb8] bg-white/90 px-3 py-1 text-xs font-semibold text-[#2f6e37]">
              HỒ SƠ THÀNH VIÊN
            </div>
            <h1 className="truncate text-2xl font-black tracking-tight text-[#173b22] md:text-4xl">
              {userProfile?.displayName || 'Người dùng'}
            </h1>
            <p className="mt-1 text-sm font-medium text-[#2e7d32]">
              {userProfileService.getReputationLevel(userProfile?.reputation || 0)}
            </p>
            <p className="mt-1 truncate text-sm text-gray-600">{profileEmail}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-[#eaf6ea] px-3 py-1 text-xs font-semibold text-[#2e7d32]">
                Vị trí: {profileLocation}
              </span>
              <span className="rounded-full bg-[#173b22] px-3 py-1 text-xs font-semibold text-white">
                Uy tín: {userProfile?.reputation || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 md:justify-end">
          <FollowButton targetUserId={userId} />
          {user && user.uid !== userId && (
            <Button
              onClick={handleStartChat}
              className="rounded-xl bg-[#1f6f2f] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_-14px_rgba(31,111,47,0.9)] transition hover:-translate-y-0.5 hover:bg-[#1b5f29]"
            >
              Nhắn tin
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileHeader;
