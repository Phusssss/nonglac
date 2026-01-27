import React from 'react';
import { Typography, Row, Col, Card, Space, Tag, Progress, Table } from 'antd';

const SystemAnalytics = ({ analytics, totalPosts }) => {
  return (
    <div>
      <Typography.Title level={2} className="text-[#795548] mb-6">Thống kê & Phân tích</Typography.Title>
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Top 10 người dùng uy tín">
            <div className="space-y-3">
              {analytics.topUsers.map((u, idx) => (
                <Card key={u.id} size="small" className="bg-gray-50">
                  <Row justify="space-between" align="middle">
                    <Col><Space><Tag color="green">#{idx + 1}</Tag><div><Typography.Text strong>{u.displayName}</Typography.Text><br/><Typography.Text type="secondary" size="small">{u.email}</Typography.Text></div></Space></Col>
                    <Col><Typography.Text strong className="text-[#4CAF50]">{u.reputation || 0}</Typography.Text></Col>
                  </Row>
                </Card>
              ))}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Thao tác người dùng">
            <div className="space-y-3">
              {analytics.actionStats.map(stat => (
                <Card key={stat.action} size="small" className="bg-gray-50">
                  <Row justify="space-between" align="middle">
                    <Col><Typography.Text strong>{stat.action}</Typography.Text></Col>
                    <Col><Tag color="green">{stat.count}</Tag></Col>
                  </Row>
                </Card>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
      <Card title="Bài viết theo danh mục" className="mb-6">
        {analytics.postsByCategory.map(cat => (
          <div key={cat.name} className="mb-3">
            <div className="flex justify-between mb-1"><Typography.Text strong>{cat.name}</Typography.Text><Typography.Text>{cat.count}</Typography.Text></div>
            <Progress percent={Math.round((cat.count / totalPosts) * 100)} strokeColor="#4CAF50" showInfo={false} />
          </div>
        ))}
      </Card>
      <Card title="Lịch sử thao tác gần đây">
        <Table
          columns={[
            { title: 'Thời gian', dataIndex: 'timestamp', render: (t) => t?.toDate?.()?.toLocaleString() || 'N/A' },
            { title: 'Người dùng', dataIndex: 'userName' },
            { title: 'Hành động', dataIndex: 'action', render: (a) => <Tag color="green">{a}</Tag> },
            { title: 'Chi tiết', dataIndex: 'details', render: (d) => JSON.stringify(d), ellipsis: true },
          ]}
          dataSource={analytics.recentActivity}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 600 }}
        />
      </Card>
    </div>
  );
};

export default SystemAnalytics;