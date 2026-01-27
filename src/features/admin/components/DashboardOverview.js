import React from 'react';
import { Typography, Row, Col, Card, Statistic, Button } from 'antd';
import { Users, FileText, ShoppingBag, RefreshCw } from 'lucide-react';

const DashboardOverview = ({ stats, handleResetApprenticeQuotas, resetLoading, resetMessage }) => {
  return (
    <div className="space-y-6">
      <Typography.Title level={2} className="text-[#795548] m-0 text-2xl md:text-3xl">
        Tổng quan hệ thống
      </Typography.Title>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Người dùng"
              value={stats.totalUsers}
              valueStyle={{ color: '#4CAF50' }}
              prefix={<Users className="w-6 h-6 mr-2" />}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Bài viết"
              value={stats.totalPosts}
              valueStyle={{ color: '#1890ff' }}
              prefix={<FileText className="w-6 h-6 mr-2" />}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={8}>
          <Card bordered={false} className="shadow-sm">
            <Statistic
              title="Sản phẩm"
              value={stats.totalProducts}
              valueStyle={{ color: '#fa8c16' }}
              prefix={<ShoppingBag className="w-6 h-6 mr-2" />}
            />
          </Card>
        </Col>
      </Row>
      
      <Card title="Quản lý Quota" bordered={false} className="shadow-sm">
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <Typography.Title level={4} className="text-green-800 mb-2 mt-0">
                Reset Quota Gói TẬP SỰ
              </Typography.Title>
              <Typography.Text className="text-green-700 block">
                Reset lại hạn mức về mặc định cho tất cả người dùng đang sử dụng gói Tập sự. 
                (Bao gồm: AI, Bác sĩ AI, Bản đồ và Thị trường)
              </Typography.Text>
            </div>
            <div className="flex-shrink-0">
              <Button
                type="primary"
                size="large"
                loading={resetLoading}
                onClick={handleResetApprenticeQuotas}
                icon={<RefreshCw className={`w-5 h-5 ${resetLoading ? 'animate-spin' : ''}`} />}
                className="bg-green-600 hover:bg-green-700 border-none h-auto py-3 px-6 rounded-lg w-full md:w-auto"
              >
                {resetLoading ? 'Đang xử lý...' : 'Reset Quota Ngay'}
              </Button>
            </div>
          </div>
        </div>

        {resetMessage && (
          <div 
            className={`mt-4 p-4 rounded-lg border ${
              resetMessage.includes('✅') 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            <span className="flex items-center gap-2 font-medium">
              {resetMessage}
            </span>
          </div>
        )}
      </Card>
    </div>
  );
};

export default DashboardOverview;