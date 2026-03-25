import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Select, Space, Button, Popconfirm, Typography, Tooltip, Spin } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const UserManagement = ({ users, updateUserRole, verifyUser, unverifyUser, deleteUser }) => {
  // Helper để lấy ngày đồng ý điều khoản hoặc ngày tạo một cách an toàn
  const getAgreedAt = (user) => {
    const agreedAt = user.termsAgreement?.agreedAt;
    if (!agreedAt) return user.createdAt?.toDate?.() || (user.createdAt ? new Date(user.createdAt) : new Date(0));
    if (agreedAt.toDate && typeof agreedAt.toDate === 'function') return agreedAt.toDate();
    if (agreedAt.seconds) return new Date(agreedAt.seconds * 1000);
    return new Date(agreedAt);
  };

  // Sắp xếp users theo ngày đồng ý điều khoản từ mới đến cũ
  const sortedUsers = [...users].sort((a, b) => getAgreedAt(b) - getAgreedAt(a));

  const columns = [
    {
      title: 'Người dùng',
      key: 'user_info',
      fixed: 'left',
      width: 200,
      render: (text, record) => (
        <div>
          <div className="font-bold text-gray-800">{record.displayName}</div>
          <div className="text-xs text-gray-500 truncate">{record.phoneNumber || record.email}</div>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'verificationStatus',
      key: 'verificationStatus',
      width: 150,
      render: (status) => (
        status === 'pending' ? (
          <Tag color="orange" className="m-0">🕒 Chờ xác thực</Tag>
        ) : (
          <Tag color="green" className="m-0">✅ Đã xác thực</Tag>
        )
      ),
    },
    {
      title: 'Người giới thiệu',
      dataIndex: 'referredBy',
      key: 'referredBy',
      width: 150,
      render: (referredBy) => (
        <span className="text-gray-600 text-sm">{referredBy || '-'}</span>
      ),
    },
    {
      title: 'Uy tín',
      dataIndex: 'reputation',
      key: 'reputation',
      width: 100,
      sorter: (a, b) => (a.reputation || 0) - (b.reputation || 0),
      render: (reputation) => <span className="font-bold text-agri-600">{reputation || 0}</span>,
    },
    {
      title: 'Quyền hạn',
      dataIndex: 'role',
      key: 'role',
      width: 150,
      render: (role, record) => (
        <Select
          value={role || 'user'}
          onChange={(value) => updateUserRole(record.id, value)}
          style={{ width: '100%' }}
          className="min-w-[110px]"
        >
          <Select.Option value="user">User</Select.Option>
          <Select.Option value="moderator">Moderator</Select.Option>
          <Select.Option value="admin">Admin</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Ngày tạo',
      key: 'termsDate',
      width: 110,
      sorter: (a, b) => getAgreedAt(a) - getAgreedAt(b),
      defaultSortOrder: 'descend',
      render: (text, record) => {
        const timestamp = getAgreedAt(record);
        if (timestamp.getTime() === 0) return '-';
        return <span className="text-gray-600 text-xs">{timestamp.toLocaleDateString('vi-VN')}</span>;
      },
    },
    {
      title: 'Giờ tạo',
      key: 'termsTime',
      width: 110,
      render: (text, record) => {
        const timestamp = getAgreedAt(record);
        if (timestamp.getTime() === 0) return '-';
        return <span className="text-[#52c41a] font-bold text-xs">{timestamp.toLocaleTimeString('vi-VN')}</span>;
      },
    },
    {
      title: 'IP Address',
      key: 'termsIp',
      width: 130,
      render: (text, record) => {
        const agreement = record.termsAgreement;
        if (!agreement) return '-';
        
        const ip = agreement.ipAddress || 'N/A';
        return (
          <Tooltip title={ip}>
            <span className="text-gray-600 text-xs cursor-help font-mono">
              {ip.length > 15 ? ip.substring(0, 15) + '...' : ip}
            </span>
          </Tooltip>
        );
      },
    },
    {
      title: 'Version',
      key: 'termsVersion',
      width: 100,
      render: (text, record) => {
        const agreement = record.termsAgreement;
        if (!agreement || !agreement.version) return '-';
        return (
          <Tag color="blue" className="m-0 text-xs">
            v{agreement.version}
          </Tag>
        );
      },
    },
    {
      title: 'Thao tác',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (text, record) => (
        <Space size="small">
          {record.verificationStatus === 'pending' ? (
            <Button
              type="primary"
              size="small"
              onClick={() => verifyUser(record.id)}
              className="bg-[#52c41a] border-none text-xs h-7"
            >
              Duyệt
            </Button>
          ) : (
            <Popconfirm
              title="Hủy xác thực?"
              description="Chuyển user về trạng thái chờ xác thực"
              onConfirm={() => unverifyUser(record.id)}
              okText="Hủy xác thực"
              cancelText="Không"
              okButtonProps={{ danger: true }}
            >
              <Button
                size="small"
                className="text-xs h-7"
              >
                Hủy duyệt
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="Xóa người dùng này?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => deleteUser(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button size="small" danger type="text" className="text-xs h-7">Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <Typography.Title level={3} className="m-0 text-xl md:text-2xl">Quản lý người dùng</Typography.Title>
        <Tag color="blue" className="w-fit">Tổng cộng: {sortedUsers.length}</Tag>
      </div>

      <Card bordered={false} className="shadow-sm overflow-hidden" styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={sortedUsers}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            size: 'small',
            showTotal: (total) => `Tổng ${total} người dùng`,
          }}
          scroll={{ x: 1100 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default UserManagement;
