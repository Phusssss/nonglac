import React from 'react';
import { Card, Table, Tag, Popconfirm, Button, Typography } from 'antd';

const PostManagement = ({ posts, deletePost }) => {
  const columns = [
    {
      title: 'Tiêu đề bài viết',
      dataIndex: 'title',
      key: 'title',
      width: 300,
      render: (title) => (
        <div className="font-medium text-gray-800 line-clamp-2" title={title}>
          {title || 'Không có tiêu đề'}
        </div>
      ),
    },
    {
      title: 'Tác giả',
      dataIndex: 'authorName',
      key: 'authorName',
      width: 150,
      render: (name) => <span className="text-gray-600">{name}</span>
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      width: 130,
      render: (category) => <Tag color="blue" className="m-0 uppercase text-[10px]">{category}</Tag>,
    },
    {
      title: 'Tương tác',
      key: 'engagement',
      width: 100,
      sorter: (a, b) => (a.likes || 0) - (b.likes || 0),
      render: (_, record) => (
        <div className="text-xs text-gray-500">
          <b>{record.likes || 0}</b> Likes
        </div>
      ),
    },
    {
      title: 'Ngày đăng',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (date) => <span className="text-xs text-gray-400">{date?.toDate?.()?.toLocaleDateString() || 'N/A'}</span>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 80,
      render: (_, record) => (
        <Popconfirm
          title="Xác nhận xóa bài viết?"
          onConfirm={() => deletePost(record.id)}
          okText="Xóa"
          cancelText="Hủy"
          okButtonProps={{ danger: true }}
        >
          <Button size="small" danger type="text">Xóa</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Typography.Title level={3} className="m-0 text-xl md:text-2xl">Quản lý bài viết</Typography.Title>
        <Tag color="cyan">Số lượng: {posts.length}</Tag>
      </div>

      <Card bordered={false} className="shadow-sm overflow-hidden" bodyStyle={{ padding: 0 }}>
        <Table
          columns={columns}
          dataSource={posts}
          rowKey="id"
          pagination={{
            pageSize: 10,
            size: 'small',
            showSizeChanger: true,
          }}
          scroll={{ x: 800 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default PostManagement;