import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import { useAuth } from '../../../hooks/useAuth';
import { useAuthGuard } from '../../../hooks/useAuthGuard';
import { useProfile, useProfileEdit, useProfileBadgeSelection } from '../hooks';
import { profileService } from '../services';
import { PROFILE_CONSTANTS } from '../constants';
import {
  ProfileHeader,
  ProfileSidebar,
  ProfileTabs,
  ProfileContent,
  EditProfileDialog,
  StudentReferralSection,
  ReferredUsersList
} from '../components';
import EnhancedLoginModal from '../../../components/enhanced/EnhancedLoginModal';
import '../styles/profile.css';

const Profile = () => {
  const { user, userProfile } = useAuth();
  const { showLoginModal, setShowLoginModal } = useAuthGuard();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(PROFILE_CONSTANTS.TABS.POSTS);

  const {
    userPosts,
    loading,
    loadingMore,
    hasMore,
    followers,
    following,
    missionScore,
    loadMorePosts
  } = useProfile();

  const {
    editDialog,
    editData,
    setEditData,
    avatarFile,
    uploading,
    handleUpdateProfile,
    handleAvatarChange,
    openEditDialog,
    closeEditDialog
  } = useProfileEdit();

  const {
    loading: badgeLoading,
    saving: badgeSaving,
    selectedBadgeId,
    selectedBadge,
    availableBadges,
    updateSelectedBadge
  } = useProfileBadgeSelection();

  const handleBadgeChange = async (badgeId) => {
    const result = await updateSelectedBadge(badgeId);
    if (result.success) {
      notification.success({
        message: 'Da cap nhat danh hieu',
        description: badgeId
          ? 'Danh hieu hien thi: ' + (result.badge?.label || 'Da cap nhat')
          : 'Da tat hien thi danh hieu'
      });
      return true;
    }

    notification.error({
      message: 'Khong the cap nhat danh hieu',
      description: result.error || 'Vui long thu lai'
    });
    return false;
  };

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      localStorage.setItem('loginMessage', 'Đăng nhập để xem profile - xem thông tin cá nhân');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      navigate('/phone-login');
    }
  }, [user, navigate]);

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore) return;
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      
      if (scrollHeight - scrollTop <= clientHeight + 100) {
        loadMorePosts();
      }
    };
    
    const throttledScroll = profileService.throttle(handleScroll, 200);
    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [loadMorePosts, loadingMore, hasMore]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          <ProfileHeader
            onEditClick={openEditDialog}
            selectedBadgeId={selectedBadgeId}
            selectedBadge={selectedBadge}
            availableBadges={availableBadges}
            badgeLoading={badgeLoading}
            badgeSaving={badgeSaving}
            missionScore={missionScore}
            onBadgeChange={handleBadgeChange}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <ProfileSidebar 
              followers={followers}
              following={following}
              postsCount={userPosts.length}
            />

          <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-white rounded-xl shadow-sm">
                <ProfileTabs 
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />
                <ProfileContent 
                  userPosts={userPosts}
                  loading={loading}
                  loadingMore={loadingMore}
                  activeTab={activeTab}
                />
              </div>

              {/* Hiển thị phần giới thiệu sinh viên nếu là tài khoản sinh viên */}
              {userProfile?.userType === 'student' && (
                <>
                  <StudentReferralSection />
                  {userProfile?.referralCode && (
                    <ReferredUsersList referralCode={userProfile.referralCode} />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <EditProfileDialog
        isOpen={editDialog}
        onClose={closeEditDialog}
        editData={editData}
        setEditData={setEditData}
        avatarFile={avatarFile}
        onAvatarChange={handleAvatarChange}
        onSave={handleUpdateProfile}
        uploading={uploading}
      />

      <EnhancedLoginModal
        open={showLoginModal}
        onCancel={() => setShowLoginModal(false)}
        title="Đăng nhập để xem profile"
        message="Đăng nhập để xem và chỉnh sửa thông tin cá nhân"
        feature="sử dụng trang cá nhân"
      />
    </div>
  );
};

export default Profile;


