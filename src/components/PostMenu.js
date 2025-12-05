import React, { useState } from 'react';
import { Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, ListItemIcon, Typography } from '@mui/material';
import { Edit, Delete, Report } from '@mui/icons-material';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const PostMenu = ({ anchorEl, open, onClose, post, currentUser, onPostUpdated, onPostDeleted }) => {
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editData, setEditData] = useState({ title: post?.title || '', content: post?.content || '', category: post?.category || '' });
  const [loading, setLoading] = useState(false);

  const categories = ['Trồng trọt', 'Chăn nuôi', 'Thủy sản', 'Công nghệ nông nghiệp', 'Thị trường', 'Khác'];
  const isOwner = currentUser?.uid === post?.authorId;

  const handleEdit = () => {
    setEditDialog(true);
    onClose();
  };

  const handleDelete = () => {
    setDeleteDialog(true);
    onClose();
  };

  const handleUpdatePost = async () => {
    if (!editData.title.trim() || !editData.content.trim()) return;
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'posts', post.id), {
        title: editData.title.trim(),
        content: editData.content.trim(),
        category: editData.category,
        updatedAt: new Date()
      });
      
      onPostUpdated?.();
      setEditDialog(false);
    } catch (error) {
      console.error('Error updating post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'posts', post.id));
      onPostDeleted?.();
      setDeleteDialog(false);
    } catch (error) {
      console.error('Error deleting post:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
        {isOwner ? (
          [
            <MenuItem key="edit" onClick={handleEdit}>
              <ListItemIcon><Edit fontSize="small" /></ListItemIcon>
              Chỉnh sửa bài viết
            </MenuItem>,
            <MenuItem key="delete" onClick={handleDelete}>
              <ListItemIcon><Delete fontSize="small" /></ListItemIcon>
              Xóa bài viết
            </MenuItem>
          ]
        ) : (
          <MenuItem onClick={onClose}>
            <ListItemIcon><Report fontSize="small" /></ListItemIcon>
            Báo cáo bài viết
          </MenuItem>
        )}
      </Menu>

      <Dialog open={editDialog} onClose={() => setEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Chỉnh sửa bài viết</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Tiêu đề"
            value={editData.title}
            onChange={(e) => setEditData({...editData, title: e.target.value})}
            sx={{ mb: 2, mt: 1 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Danh mục</InputLabel>
            <Select
              value={editData.category}
              onChange={(e) => setEditData({...editData, category: e.target.value})}
            >
              {categories.map(cat => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Nội dung"
            value={editData.content}
            onChange={(e) => setEditData({...editData, content: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Hủy</Button>
          <Button onClick={handleUpdatePost} disabled={loading} variant="contained">
            {loading ? 'Đang cập nhật...' : 'Cập nhật'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Xác nhận xóa</DialogTitle>
        <DialogContent>
          <Typography>Bạn có chắc chắn muốn xóa bài viết này không?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Hủy</Button>
          <Button onClick={handleDeletePost} disabled={loading} color="error">
            {loading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PostMenu;