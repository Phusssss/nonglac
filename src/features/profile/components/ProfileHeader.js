import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { profileService } from '../services';
import { IconButton } from '../../../components/ui';

const isImageIcon = (icon) => (
  typeof icon === 'string' &&
  (icon.endsWith('.svg') || icon.endsWith('.png') || icon.startsWith('http') || icon.startsWith('data:'))
);

const renderBadgeIcon = (badge, className = 'h-10 w-10') => {
  if (!badge) return null;
  if (isImageIcon(badge.icon)) {
    return <img src={badge.icon} alt={badge.label} className={`${className} object-contain`} />;
  }
  return <span className="text-xl">{badge.icon}</span>;
};

const ProfileHeader = ({
  onEditClick,
  selectedBadgeId,
  selectedBadge,
  availableBadges = [],
  badgeLoading = false,
  badgeSaving = false,
  missionScore,
  onBadgeChange
}) => {
  const { user, userProfile } = useAuth();
  const [isBadgeModalOpen, setIsBadgeModalOpen] = useState(false);
  const [isBadgeModalVisible, setIsBadgeModalVisible] = useState(false);
  const [draftBadgeId, setDraftBadgeId] = useState(selectedBadgeId || '');
  const [focusedBadgeId, setFocusedBadgeId] = useState(selectedBadgeId || '');
  const [savingDraft, setSavingDraft] = useState(false);
  const closeTimerRef = useRef(null);
  const pickerListRef = useRef(null);

  useEffect(() => {
    setDraftBadgeId(selectedBadgeId || '');
    setFocusedBadgeId(selectedBadgeId || '');
  }, [selectedBadgeId]);

  const badgeOptions = [
    { badgeKey: '', label: 'Ẩn danh hiệu', isHiddenOption: true },
    ...availableBadges
  ];

  useEffect(() => {
    if (!isBadgeModalOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleCloseBadgeModal();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isBadgeModalOpen]);

  useEffect(() => () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
  }, []);

  const profileLocation = userProfile?.fullAddress
    || userProfile?.location
    || userProfile?.address
    || userProfile?.farmAddress
    || userProfile?.province
    || 'Việt Nam';
  
  const profileEmail = userProfile?.email || user?.email || 'Chưa cập nhật';
  const displayScore = typeof missionScore === 'number' ? missionScore : (userProfile?.reputation || 0);

  const pickerDisabled = badgeLoading || badgeSaving || savingDraft || availableBadges.length === 0;

  const handleOpenBadgeModal = () => {
    if (pickerDisabled) return;
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setIsBadgeModalOpen(true);
    requestAnimationFrame(() => setIsBadgeModalVisible(true));
  };

  const handleCloseBadgeModal = () => {
    setIsBadgeModalVisible(false);
    closeTimerRef.current = setTimeout(() => {
      setIsBadgeModalOpen(false);
    }, 220);
  };

  const handleSaveBadge = async () => {
    if (!onBadgeChange) return;
    setSavingDraft(true);
    const success = await onBadgeChange(draftBadgeId || null);
    setSavingDraft(false);
    if (success) {
      handleCloseBadgeModal();
    }
  };

  const focusNearestBadgeByScroll = () => {
    const container = pickerListRef.current;
    if (!container) return;

    const centerY = container.scrollTop + (container.clientHeight / 2);
    let nearestBadgeKey = draftBadgeId || '';
    let nearestDistance = Number.POSITIVE_INFINITY;

    const items = container.querySelectorAll('[data-badge-key]');
    items.forEach((item) => {
      const itemTop = item.offsetTop;
      const itemCenterY = itemTop + (item.clientHeight / 2);
      const distance = Math.abs(itemCenterY - centerY);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestBadgeKey = item.getAttribute('data-badge-key') || '';
      }
    });

    setFocusedBadgeId(nearestBadgeKey);
  };

  const centerBadgeItem = (badgeKey) => {
    const container = pickerListRef.current;
    if (!container) return;

    const target = container.querySelector(`[data-badge-key="${badgeKey}"]`);
    if (!target) return;

    const targetTop = target.offsetTop - ((container.clientHeight - target.clientHeight) / 2);
    container.scrollTo({
      top: Math.max(0, targetTop),
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    if (!isBadgeModalOpen || !isBadgeModalVisible) return;
    const targetBadgeKey = draftBadgeId || '';
    setFocusedBadgeId(targetBadgeKey);
    setTimeout(() => {
      centerBadgeItem(targetBadgeKey);
      setTimeout(() => focusNearestBadgeByScroll(), 120);
    }, 20);
  }, [isBadgeModalOpen, isBadgeModalVisible]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="relative overflow-hidden rounded-3xl border border-[#d8ead7] bg-gradient-to-br from-[#f5fbf4] via-white to-[#eef8ed] p-6 md:p-8 shadow-[0_20px_50px_-35px_rgba(34,84,35,0.55)]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#86d889]/20 blur-2xl" />
        <div className="pointer-events-none absolute -left-12 bottom-0 h-32 w-32 rounded-full bg-[#4CAF50]/10 blur-2xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5 md:gap-6">
            <div className="relative shrink-0">
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-[28px] border-4 border-white bg-[#4CAF50] shadow-lg shadow-[#4CAF50]/20" style={{
                backgroundImage: userProfile?.avatar ? `url(${userProfile.avatar})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                {!userProfile?.avatar && (
                  <div className="flex h-full w-full items-center justify-center text-2xl font-black text-white md:text-3xl">
                    {profileService.getInitials(userProfile?.displayName, user?.email)}
                  </div>
                )}
              </div>
              <IconButton
                onClick={onEditClick}
                className="absolute -bottom-2 -right-2 border border-white bg-[#1f6f2f] text-white shadow-md"
                size="sm"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </IconButton>
            </div>

            <div className="min-w-0">
              <div className="mb-2 inline-flex items-center rounded-full border border-[#b8dcb8] bg-white/90 px-3 py-1 text-xs font-semibold text-[#2f6e37]">
                HỒ SƠ CÁ NHÂN
              </div>
              <h1 className="truncate text-2xl font-black tracking-tight text-[#173b22] md:text-4xl">
                {userProfile?.displayName || 'Người dùng'}
              </h1>
              <p className="mt-1 text-sm font-medium text-[#2e7d32]">
                {profileService.getReputationLevel(displayScore)}
              </p>
              <p className="mt-1 truncate text-sm text-gray-600">{profileEmail}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-[#eaf6ea] px-3 py-1 text-xs font-semibold text-[#2e7d32]">
                  Vị trí: {profileLocation}
                </span>
                <span className="rounded-full bg-[#173b22] px-3 py-1 text-xs font-semibold text-white">
                  Uy tín: {displayScore}
                </span>
              </div>
            </div>
          </div>

          <div className="flex min-w-[280px] max-w-[340px] flex-col gap-3 md:items-end">
            <div className="w-full rounded-xl border border-[#d0e4d1] bg-white p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#2f6e37]">
                Danh hiệu profile
              </p>

              <button
                onClick={handleOpenBadgeModal}
                disabled={pickerDisabled}
                className="group flex w-full items-center justify-between rounded-xl border border-[#d6e8d7] bg-[#f8fcf8] px-3 py-2 text-left transition hover:-translate-y-0.5 hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-sm transition group-hover:shadow-md">
                    {selectedBadge ? renderBadgeIcon(selectedBadge, 'h-10 w-10') : <span className="text-gray-400">-</span>}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#173b22]">
                      {selectedBadge ? selectedBadge.label : 'Đang ẩn danh hiệu'}
                    </p>
                  </div>
                </div>
                <svg className="h-4 w-4 text-[#2f6e37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>

            <div className="flex w-full flex-wrap gap-3 md:justify-end">
              <button
                onClick={onEditClick}
                className="rounded-xl border border-[#d0e4d1] bg-white px-4 py-2 text-sm font-semibold text-[#1f4e28] transition hover:-translate-y-0.5 hover:bg-[#f3faf3]"
              >
                Chỉnh sửa hồ sơ
              </button>
              <button className="rounded-xl bg-[#1f6f2f] px-4 py-2 text-sm font-semibold text-white shadow-[0_12px_24px_-14px_rgba(31,111,47,0.9)] transition hover:-translate-y-0.5 hover:bg-[#1b5f29]">
                Chia sẻ profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {isBadgeModalOpen && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4">
          <button
            aria-label="Đóng modal"
            className={`absolute inset-0 bg-[#0f1f12]/45 backdrop-blur-[2px] transition-opacity duration-200 ${isBadgeModalVisible ? 'opacity-100' : 'opacity-0'}`}
            onClick={handleCloseBadgeModal}
          />

          <div className={`relative z-10 w-full max-w-md rounded-2xl border border-[#d7ebd7] bg-white shadow-[0_30px_80px_-35px_rgba(0,0,0,0.55)] transition-all duration-200 ${isBadgeModalVisible ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-4 scale-95 opacity-0'}`}>
            <div className="border-b border-[#e7f2e7] px-5 py-4">
              <p className="text-sm font-bold uppercase tracking-wide text-[#2f6e37]">Chọn huy hiệu hiển thị</p>
              <p className="mt-1 text-xs text-gray-500">Cuộn dọc để chọn, sau đó bấm lưu.</p>
            </div>

            <div className="relative px-4 py-3">
              <div className="pointer-events-none absolute left-4 right-4 top-3 z-10 h-10 bg-gradient-to-b from-white to-transparent" />
              <div className="pointer-events-none absolute left-4 right-4 bottom-3 z-10 h-10 bg-gradient-to-t from-white to-transparent" />
              <style>
                {`.badge-picker-scroll::-webkit-scrollbar{display:none;}`}
              </style>

              <div
                ref={pickerListRef}
                className="badge-picker-scroll max-h-72 snap-y snap-mandatory space-y-2 overflow-y-auto px-1 py-8"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                onScroll={focusNearestBadgeByScroll}
              >
                {badgeOptions.map((badge) => (
                  <button
                    key={badge.badgeKey}
                    data-badge-key={badge.badgeKey}
                    onClick={() => {
                      setDraftBadgeId(badge.badgeKey);
                      setFocusedBadgeId(badge.badgeKey);
                      centerBadgeItem(badge.badgeKey);
                    }}
                    className={`snap-center flex w-full items-center justify-between rounded-xl border px-3 py-3 text-sm transition-all duration-200 ${
                      draftBadgeId === badge.badgeKey
                        ? 'border-[#8ac98f] bg-[#ecfaee] text-[#155c26] shadow-sm'
                        : 'border-[#e5efe5] bg-white text-[#173b22] hover:border-[#cde1ce] hover:bg-[#f8fcf8]'
                    } ${
                      focusedBadgeId === badge.badgeKey
                        ? 'scale-100 opacity-100'
                        : 'scale-95 opacity-45'
                    }`}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      {!badge.isHiddenOption && (
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-sm shrink-0">
                          {renderBadgeIcon(badge, 'h-7 w-7')}
                        </span>
                      )}
                      <span className="font-semibold truncate">{badge.label}</span>
                    </span>
                    {draftBadgeId === badge.badgeKey && <span className="text-xs">OK</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#e7f2e7] px-5 py-4">
              <button
                onClick={() => {
                  setDraftBadgeId(selectedBadgeId || '');
                  handleCloseBadgeModal();
                }}
                className="rounded-lg border border-[#d4e6d5] px-3 py-2 text-xs font-semibold text-[#2a6133] hover:bg-[#f4faf4]"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveBadge}
                disabled={pickerDisabled}
                className="rounded-lg bg-[#1f6f2f] px-3 py-2 text-xs font-semibold text-white hover:bg-[#1b5f29] disabled:opacity-60"
              >
                {savingDraft || badgeSaving ? 'Đang lưu...' : 'Lưu danh hiệu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileHeader;

