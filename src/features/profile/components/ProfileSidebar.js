import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { PROFILE_CONSTANTS } from '../constants';

const ProfileSidebar = ({ followers, following, postsCount }) => {
  const { userProfile } = useAuth();
  const intro = userProfile?.bio
    || userProfile?.about
    || userProfile?.farmDescription
    || 'Chưa có thông tin giới thiệu. Hãy cập nhật hồ sơ để cộng đồng biết thêm về bạn.';
  const profileLocation = userProfile?.fullAddress
    || userProfile?.location
    || userProfile?.address
    || userProfile?.province;
  const farmFields = [
    { label: 'Địa chỉ canh tác', value: userProfile?.farmAddress },
    { label: 'Loại hình', value: userProfile?.farmType },
    { label: 'Diện tích', value: userProfile?.farmArea ? `${userProfile.farmArea} Ha` : '' },
    { label: 'Cây trồng chính', value: userProfile?.cropType },
    { label: 'Phương pháp', value: userProfile?.farmingMethod }
  ].filter((item) => item.value);

  return (
    <aside className="lg:col-span-1 flex flex-col gap-5">
      <div className="rounded-2xl border border-[#e3efe1] bg-white p-6 shadow-sm">
        <div className="mb-3 inline-flex rounded-lg bg-[#edf7ec] px-2 py-1 text-[11px] font-bold tracking-wide text-[#2d6d34]">
          GIỚI THIỆU
        </div>
        <p className="text-sm leading-relaxed text-gray-700">{intro}</p>
        {profileLocation && (
          <p className="mt-3 rounded-lg bg-[#f6faf5] px-3 py-2 text-sm text-[#365b3e]">
            Vị trí: {profileLocation}
          </p>
        )}
      </div>

      {farmFields.length > 0 && (
        <div className="rounded-2xl border border-[#e3efe1] bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-base font-extrabold text-[#193c23]">Thông tin canh tác</h3>
          <div className="space-y-3">
            {farmFields.map((field) => (
              <div key={field.label} className="rounded-xl border border-[#eef4ec] bg-[#fcfefc] px-3 py-2 text-sm">
                <span className="block text-[11px] font-bold uppercase tracking-wide text-[#6b8f72]">{field.label}</span>
                <span className="block text-[#1f3f28]">{field.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-[#e3efe1] bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-base font-extrabold text-[#193c23]">Chuyên môn</h3>
        <div className="flex flex-wrap gap-2">
          {PROFILE_CONSTANTS.DEFAULT_SKILLS.map((skill) => (
            <span key={skill} className="rounded-full border border-[#d3e8d4] bg-[#f1f9f0] px-3 py-1 text-xs font-semibold text-[#2e7d32]">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-[#1f6f2f] to-[#2f8d3d] p-6 text-white shadow-[0_20px_45px_-30px_rgba(31,111,47,0.8)]">
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="rounded-xl bg-white/10 px-2 py-3">
            <p className="text-xl font-black">{followers}</p>
            <p className="text-[11px] uppercase tracking-wide text-white/80">Theo dõi</p>
          </div>
          <div className="rounded-xl bg-white/10 px-2 py-3">
            <p className="text-xl font-black">{following}</p>
            <p className="text-[11px] uppercase tracking-wide text-white/80">Đang theo</p>
          </div>
          <div className="rounded-xl bg-white/10 px-2 py-3">
            <p className="text-xl font-black">{postsCount}</p>
            <p className="text-[11px] uppercase tracking-wide text-white/80">Bài viết</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default ProfileSidebar;
