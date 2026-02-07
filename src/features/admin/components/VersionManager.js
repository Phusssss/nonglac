import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, Tag, List, message, Divider } from 'antd';
import { RefreshCw, Trash2, ShieldCheck, History } from 'lucide-react';
import versionService from '../../../services/versionService';

const { Title, Text } = Typography;

const VersionManager = () => {
  const [currentVersion, setCurrentVersion] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setCurrentVersion(versionService.getCurrentVersion());
    // Giả lập lịch sử cập nhật
    setHistory([
      { date: '27/01/2026', version: '2.0.4', note: 'Refactor Admin Feature' },
      { date: '25/01/2026', version: '2.0.3', note: 'Fix responsive layout' },
      { date: '20/01/2026', version: '2.0.1', note: 'Release AgriTrust Score' }
    ]);
  }, []);

  const handleClearCache = async () => {
    setLoading(true);
    try {
      versionService.forceUpdate();
      message.success('Đang xóa cache và khởi động lại ứng dụng...');
    } catch (e) {
      message.error('Lỗi khi xóa cache');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card 
        bordered={false} 
        className="shadow-sm rounded-2xl"
        title={
          <div className="flex items-center gap-3 py-2">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-blue-600 w-6 h-6" />
            </div>
            <div>
              <Title level={4} className="m-0">Quản lý phiên bản</Title>
              <Text type="secondary" className="text-xs">Kiểm soát cache và cập nhật hệ thống</Text>
            </div>
          </div>
        }
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-4 bg-gray-50 rounded-2xl">
          <div>
            <Text type="secondary" className="text-[10px] uppercase font-bold tracking-widest block mb-1">Phiên bản hiện tại</Text>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-black text-gray-800">{currentVersion || '2.0.4'}</span>
              <Tag color="blue" className="rounded-full px-3">Stable</Tag>
            </div>
          </div>
          
          <Space direction="vertical" className="w-full md:w-auto">
            <Button 
              type="primary" 
              danger 
              icon={<Trash2 className="w-4 h-4" />}
              onClick={handleClearCache}
              loading={loading}
              className="w-full md:w-auto h-12 px-6 rounded-xl font-bold flex items-center gap-2"
            >
              Xóa Cache & Buộc cập nhật
            </Button>
            <Text className="text-[10px] text-gray-400 text-center block">
              Lưu ý: Hành động này sẽ khiến tất cả người dùng phải load lại ứng dụng.
            </Text>
          </Space>
        </div>

        <Divider />

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-5 h-5 text-gray-400" />
            <Text strong>Lịch sử cập nhật</Text>
          </div>
          <List
            dataSource={history}
            renderItem={item => (
              <List.Item className="px-4 hover:bg-gray-50 rounded-xl transition-colors border-none mb-1">
                <div className="flex justify-between w-full items-center">
                  <div>
                    <Text strong className="block">{item.note}</Text>
                    <Text type="secondary" className="text-xs">{item.date}</Text>
                  </div>
                  <Tag className="m-0 font-mono">v{item.version}</Tag>
                </div>
              </List.Item>
            )}
          />
        </div>
      </Card>

      <Card bordered={false} className="bg-orange-50 border border-orange-100 rounded-2xl">
        <div className="flex gap-4">
          <div className="p-3 bg-white rounded-xl shadow-sm h-fit">
            <RefreshCw className="text-orange-500 w-6 h-6" />
          </div>
          <div>
            <Title level={5} className="text-orange-800 m-0 mb-1">Kiểm tra cập nhật tự động</Title>
            <Text className="text-orange-700 text-sm">
              Hệ thống NôngLạc tự động kiểm tra phiên bản mới mỗi khi người dùng truy cập. 
              Bạn có thể tăng số phiên bản trong file `public/version.json` để kích hoạt cập nhật toàn hệ thống.
            </Text>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VersionManager;