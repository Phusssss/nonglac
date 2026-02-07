import React from 'react';
import { Typography, Row, Col, Card, Space, Tag, Progress, Table, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { BarChart3, History, PieChart } from 'lucide-react';

const { Title, Text } = Typography;

const SystemAnalytics = ({ analytics, totalPosts }) => {
  return (
    <div className="space-y-6">
      <Title level={2} className="m-0 text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-3">
        <BarChart3 className="text-agri-600 w-8 h-8" />
        Thống kê & Phân tích
      </Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} xl={14}>
          <Card 
            title={<div className="flex items-center gap-2"><UserOutlined /> Top 10 người dùng uy tín</div>}
            className="shadow-sm border-none rounded-2xl h-full"
            styles={{ body: { padding: '12px' } }}
          >
            <div className="space-y-2">
              {analytics.topUsers.map((u, idx) => (
                <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-agri-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                      idx < 3 ? 'bg-agri-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      #{idx + 1}
                    </div>
                    <Avatar src={u.photoURL} icon={<UserOutlined />} className="bg-agri-200" />
                    <div className="min-w-0">
                      <div className="font-bold text-gray-800 truncate">{u.displayName}</div>
                      <div className="text-[10px] text-gray-400 truncate">{u.phoneNumber || u.email}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-agri-600 text-lg leading-none">{u.reputation || 0}</div>
                    <div className="text-[9px] text-gray-400 uppercase font-bold tracking-tighter">Điểm uy tín</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <div className="space-y-6 h-full flex flex-col">
            <Card 
              title={<div className="flex items-center gap-2"><PieChart className="w-4 h-4" /> Danh mục bài viết</div>}
              className="shadow-sm border-none rounded-2xl flex-1"
            >
              <div className="space-y-4">
                {analytics.postsByCategory.map(cat => (
                  <div key={cat.name}>
                    <div className="flex justify-between items-center mb-1">
                      <Text strong className="text-sm">{cat.name}</Text>
                      <Tag color="green" className="m-0 font-bold">{cat.count}</Tag>
                    </div>
                    <Progress 
                      percent={totalPosts > 0 ? Math.round((cat.count / totalPosts) * 100) : 0} 
                      strokeColor={{
                        '0%': '#86efac',
                        '100%': '#22c55e',
                      }}
                      showInfo={false} 
                    />
                  </div>
                ))}
              </div>
            </Card>

            <Card 
              title={<div className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Phân loại hành động</div>}
              className="shadow-sm border-none rounded-2xl flex-1"
            >
              <div className="flex flex-wrap gap-2">
                {analytics.actionStats.map(stat => (
                  <div key={stat.action} className="bg-blue-50 border border-blue-100 px-3 py-2 rounded-xl flex items-center gap-2">
                    <Text className="text-blue-700 font-medium text-xs">{stat.action}</Text>
                    <div className="bg-blue-600 text-white px-2 py-0.5 rounded-lg font-bold text-[10px]">
                      {stat.count}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </Col>
      </Row>

      <Card 
        title={<div className="flex items-center gap-2"><History className="w-5 h-5" /> Nhật ký hệ thống (100 thao tác gần nhất)</div>}
        className="shadow-sm border-none rounded-2xl overflow-hidden"
        styles={{ body: { padding: 0 } }}
      >
        <Table
          columns={[
            { 
              title: 'Thời gian', 
              dataIndex: 'timestamp', 
              width: 180,
              render: (t) => <span className="text-xs text-gray-500">{t?.toDate?.()?.toLocaleString('vi-VN') || 'N/A'}</span> 
            },
            { 
              title: 'Quản trị viên/User', 
              dataIndex: 'userName',
              width: 180,
              render: (name) => <span className="font-bold text-gray-700">{name}</span>
            },
            { 
              title: 'Hành động', 
              dataIndex: 'action', 
              width: 150,
              render: (a) => (
                <Tag color={a.includes('DELETE') ? 'red' : 'blue'} className="m-0 font-bold text-[10px] px-2 rounded-full uppercase">
                  {a}
                </Tag>
              ) 
            },
            { 
              title: 'Chi tiết kỹ thuật', 
              dataIndex: 'details', 
              render: (d) => (
                <div className="font-mono text-[10px] text-gray-400 max-w-md truncate" title={JSON.stringify(d)}>
                  {JSON.stringify(d)}
                </div>
              ),
            },
          ]}
          dataSource={analytics.recentActivity}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            size: 'small'
          }}
          scroll={{ x: 1000 }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default SystemAnalytics;