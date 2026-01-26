import React from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { profileService } from '../services';

const EditProfileDialog = ({ 
  isOpen, 
  onClose, 
  editData, 
  setEditData, 
  avatarFile, 
  onAvatarChange, 
  onSave, 
  uploading 
}) => {
  const { user, userProfile } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h3 className="text-lg font-bold mb-4">Chỉnh sửa hồ sơ</h3>
        <div className="text-center mb-4">
          <div className="w-20 h-20 bg-[#4CAF50] rounded-full mx-auto mb-3" style={{
            backgroundImage: avatarFile ? `url(${URL.createObjectURL(avatarFile)})` : userProfile?.avatar ? `url(${userProfile.avatar})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}>
            {!avatarFile && !userProfile?.avatar && (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                {profileService.getInitials(userProfile?.displayName, user?.email)}
              </div>
            )}
          </div>
          <label className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
            Chọn ảnh
            <input type="file" hidden accept="image/*" onChange={onAvatarChange} />
          </label>
        </div>
        <input
          type="text"
          placeholder="Tên hiển thị"
          value={editData.displayName}
          onChange={(e) => setEditData({...editData, displayName: e.target.value})}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
        />
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Hủy
          </button>
          <button 
            onClick={onSave}
            disabled={uploading}
            className="flex-1 px-4 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] disabled:opacity-50"
          >
            {uploading ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileDialog;