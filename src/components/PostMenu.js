// Temporarily disabled MUI imports - will be migrated to Ant Design
// import { Menu, MenuItem, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, ListItemIcon, Typography } from '@mui/material';
// import { Edit, Delete, Report } from '@mui/icons-material';
import React, { useState } from 'react';
import { Dropdown, Modal, Input, Select, Typography, Space } from 'antd';
import { EditOutlined, DeleteOutlined, FlagOutlined } from '@ant-design/icons';
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

  const menuItems = isOwner ? [
    {
      key: 'edit',
      label: (
        <Space>
          <EditOutlined />
          Chỉnh sửa bài viết
        </Space>
      ),
      onClick: handleEdit
    },
    {
      key: 'delete',
      label: (
        <Space>
          <DeleteOutlined />
          Xóa bài viết
        </Space>
      ),
      onClick: handleDelete
    }
  ] : [
    {
      key: 'report',
      label: (
        <Space>
          <FlagOutlined />
          Báo cáo bài viết
        </Space>
      ),
      onClick: onClose
    }
  ];

  return (
    <>
      <Dropdown
        menu={{ items: menuItems }}
        open={open}
        onOpenChange={(flag) => !flag && onClose()}
        trigger={[]}
        placement="bottomRight"
      >
        <div />
      </Dropdown>

      <Modal
        title="Chỉnh sửa bài viết"
        open={editDialog}
        onCancel={() => setEditDialog(false)}
        onOk={handleUpdatePost}
        confirmLoading={loading}
        okText={loading ? 'Đang cập nhật...' : 'Cập nhật'}
        cancelText="Hủy"
        width={600}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Typography.Text strong>Tiêu đề</Typography.Text>
            <Input
              value={editData.title}
              onChange={(e) => setEditData({...editData, title: e.target.value})}
              placeholder="Nhập tiêu đề bài viết"
              style={{ marginTop: '8px' }}
            />
          </div>
          
          <div>
            <Typography.Text strong>Danh mục</Typography.Text>
            <Select
              style={{ width: '100%', marginTop: '8px' }}
              value={editData.category}
              onChange={(value) => setEditData({...editData, category: value})}
              placeholder="Chọn danh mục"
            >
              {categories.map(cat => (
                <Select.Option key={cat} value={cat}>{cat}</Select.Option>
              ))}
            </Select>
          </div>
          
          <div>
            <Typography.Text strong>Nội dung</Typography.Text>
            <Input.TextArea
              rows={4}
              value={editData.content}
              onChange={(e) => setEditData({...editData, content: e.target.value})}
              placeholder="Nhập nội dung bài viết"
              style={{ marginTop: '8px' }}
            />
          </div>
        </Space>
      </Modal>

      <Modal
        title="Xác nhận xóa"
        open={deleteDialog}
        onCancel={() => setDeleteDialog(false)}
        onOk={handleDeletePost}
        confirmLoading={loading}
        okText={loading ? 'Đang xóa...' : 'Xóa'}
        cancelText="Hủy"
        okType="danger"
      >
        <Typography.Text>Bạn có chắc chắn muốn xóa bài viết này không?</Typography.Text>
      </Modal>
    </>
  );
};

export default PostMenu;