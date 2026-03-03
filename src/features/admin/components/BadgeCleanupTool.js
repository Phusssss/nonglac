import React, { useState } from 'react';
import { Card, Button, Typography, Space, Alert, Table, Tag } from 'antd';
import { ToolOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import {
  cleanupAllUsersProfessionBadges,
  reportDuplicateProfessionBadges,
  migrateSelectedDisplayBadgeForLegacyUsers
} from '../utils/cleanupProfessionBadges';

const { Title, Text } = Typography;

/**
 * Component admin để cleanup badge profession thừa + migration selectedDisplayBadge
 */
const BadgeCleanupTool = () => {
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [cleanupResult, setCleanupResult] = useState(null);
  const [migrationResult, setMigrationResult] = useState(null);

  const handleReport = async () => {
    setLoading(true);
    setCleanupResult(null);
    setMigrationResult(null);
    try {
      const duplicates = await reportDuplicateProfessionBadges();
      setReportData(duplicates);
    } catch (error) {
      console.error('Error generating report:', error);
    }
    setLoading(false);
  };

  const handleCleanup = async () => {
    if (!window.confirm('Bạn có chắc muốn cleanup tất cả user có nhiều badge profession? Hành động này không thể hoàn tác!')) {
      return;
    }

    setLoading(true);
    setReportData(null);
    setMigrationResult(null);
    try {
      const result = await cleanupAllUsersProfessionBadges();
      setCleanupResult(result);
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
    setLoading(false);
  };

  const handleMigrateDisplayBadge = async () => {
    if (!window.confirm('Bạn có chắc muốn chạy migration selectedDisplayBadge cho tài khoản cũ?')) {
      return;
    }

    setLoading(true);
    setReportData(null);
    setCleanupResult(null);
    try {
      const result = await migrateSelectedDisplayBadgeForLegacyUsers();
      setMigrationResult(result);
    } catch (error) {
      console.error('Error during selectedDisplayBadge migration:', error);
    }
    setLoading(false);
  };

  const reportColumns = [
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
      render: (text) => <Text code>{text.substring(0, 8)}...</Text>
    },
    {
      title: 'Badges',
      dataIndex: 'badges',
      key: 'badges',
      render: (badges) => (
        <Space>
          {badges.map((badge) => (
            <Tag color="orange" key={badge}>{badge}</Tag>
          ))}
        </Space>
      )
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      render: (score) => <Text strong>{score}</Text>
    }
  ];

  const cleanupColumns = [
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
      render: (text) => <Text code>{text.substring(0, 8)}...</Text>
    },
    {
      title: 'Kept Badge',
      dataIndex: 'keptBadge',
      key: 'keptBadge',
      render: (badge) => badge ? <Tag color="green">{badge}</Tag> : '-'
    },
    {
      title: 'Removed Badges',
      dataIndex: 'removedBadges',
      key: 'removedBadges',
      render: (badges) => badges ? (
        <Space>
          {badges.map((badge) => (
            <Tag color="red" key={badge}>{badge}</Tag>
          ))}
        </Space>
      ) : '-'
    },
    {
      title: 'Status',
      dataIndex: 'success',
      key: 'success',
      render: (success) => (
        <Tag color={success ? 'success' : 'error'}>
          {success ? 'Success' : 'Failed'}
        </Tag>
      )
    }
  ];

  return (
    <Card>
      <Title level={4}>
        <ToolOutlined /> Badge Cleanup Tool
      </Title>

      <Alert
        message="Công cụ cleanup và migration badge"
        description="Dùng để cleanup badge profession bị trùng và chạy migration selectedDisplayBadge cho các tài khoản cũ."
        type="info"
        showIcon
        className="mb-4"
      />

      <Space className="mb-4" wrap>
        <Button
          icon={<SearchOutlined />}
          onClick={handleReport}
          loading={loading}
        >
          Kiểm tra User có Badge thừa
        </Button>

        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={handleCleanup}
          loading={loading}
        >
          Cleanup Tất cả
        </Button>

        <Button
          type="primary"
          onClick={handleMigrateDisplayBadge}
          loading={loading}
        >
          Migrate selectedDisplayBadge
        </Button>
      </Space>

      {reportData && (
        <div className="mt-4">
          <Title level={5}>
            Báo cáo: Tìm thấy {reportData.length} user có badge thừa
          </Title>
          <Table
            dataSource={reportData}
            columns={reportColumns}
            rowKey="userId"
            pagination={{ pageSize: 10 }}
            size="small"
          />
        </div>
      )}

      {cleanupResult && (
        <div className="mt-4">
          <Alert
            message="Cleanup hoàn tất"
            description={
              <div>
                <p>Tổng số user đã kiểm tra: {cleanupResult.totalUsers}</p>
                <p>Số user đã cleanup: {cleanupResult.cleanedUsers}</p>
                <p>Số lỗi: {cleanupResult.errors}</p>
              </div>
            }
            type="success"
            showIcon
            className="mb-4"
          />

          {cleanupResult.results.length > 0 && (
            <>
              <Title level={5}>Chi tiết cleanup</Title>
              <Table
                dataSource={cleanupResult.results}
                columns={cleanupColumns}
                rowKey="userId"
                pagination={{ pageSize: 10 }}
                size="small"
              />
            </>
          )}
        </div>
      )}

      {migrationResult && (
        <div className="mt-4">
          <Alert
            message="Migration selectedDisplayBadge hoàn tất"
            description={
              <div>
                <p>Tổng số user đã kiểm tra: {migrationResult.totalUsers}</p>
                <p>Số user đã migrate: {migrationResult.migratedUsers}</p>
                <p>Số user bỏ qua: {migrationResult.skippedUsers}</p>
                <p>Số lỗi: {migrationResult.errorUsers}</p>
              </div>
            }
            type="success"
            showIcon
          />
        </div>
      )}
    </Card>
  );
};

export default BadgeCleanupTool;
