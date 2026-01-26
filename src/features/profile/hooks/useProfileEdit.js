import { useState } from 'react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { githubStorage } from '../../../services/githubStorage';
import { useAuth } from '../../../hooks/useAuth';
import { useAuthGuard } from '../../../hooks/useAuthGuard';

export const useProfileEdit = () => {
  const { user, userProfile } = useAuth();
  const { requireAuth } = useAuthGuard();
  const [editDialog, setEditDialog] = useState(false);
  const [editData, setEditData] = useState({ 
    displayName: userProfile?.displayName || '' 
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpdateProfile = async () => {
    return requireAuth(async () => {
      setUploading(true);
      try {
        let updateData = { displayName: editData.displayName };
        
        if (avatarFile) {
          const avatarUrl = await githubStorage.uploadImage(avatarFile, 'avatars');
          updateData.avatar = avatarUrl;
        }
        
        await updateDoc(doc(db, 'users', user.uid), updateData);
        setEditDialog(false);
        setAvatarFile(null);
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Lỗi cập nhật hồ sơ: ' + error.message);
      } finally {
        setUploading(false);
      }
    }, {
      message: 'Đăng nhập để cập nhật profile',
      feature: 'chỉnh sửa thông tin cá nhân'
    });
  };
  
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setAvatarFile(file);
    }
  };

  const openEditDialog = () => {
    setEditData({ displayName: userProfile?.displayName || '' });
    setEditDialog(true);
  };

  const closeEditDialog = () => {
    setEditDialog(false);
    setAvatarFile(null);
  };

  return {
    editDialog,
    editData,
    setEditData,
    avatarFile,
    uploading,
    handleUpdateProfile,
    handleAvatarChange,
    openEditDialog,
    closeEditDialog
  };
};