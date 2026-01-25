import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Typography, Space, Tag, Divider, message, Row, Col } from 'antd';
import { CloudUploadOutlined, ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import versionService from '../services/versionService';

const { Title, Text } = Typography;

const VersionManager = () => {
  const [loading, setLoading] = useState(false);
  const [remoteVersion, setRemoteVersion] = useState('');
  const [newVersion, setNewVersion] = useState('');
  const [versionInfo, setVersionInfo] = useState({});
  const [lastUpdate, setLastUpdate] = useState('');

  useEffect(() => {
    loadVersionInfo();
  }, []);

  const loadVersionInfo = async () => {
    try {
      const remote = await versionService.getRemoteVersion();
      const info = versionService.getCurrentVersionInfo();
      
      setRemoteVersion(remote || 'Chưa có');
      setVersionInfo(info);
      setNewVersion(remote || '');
    } catch (error) {
      message.error('Lỗi tải thông tin version: ' + error.message);
    }
  };

  const handleUpdateVersion = async () => {
    if (!newVersion.trim()) {
      message.error('Vui lòng nhập version mới');
      return;
    }

    setLoading(true);
    try {
      const success = await versionService.updateRemoteVersion(newVersion.trim());
      if (success) {
        message.success('Đã cập nhật version thành công!');
        setLastUpdate(new Date().toLocaleString());
        await loadVersionInfo();
      } else {
        message.error('Lỗi cập nhật version');
      }
    } catch (error) {
      message.error('Lỗi: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForceCheck = async () => {
    setLoading(true);
    try {
      const updated = await versionService.checkAndUpdateVersion();
      if (updated) {
        message.info('Đã phát hiện version mới, đang reload...');
      } else {
        message.success('Version hiện tại là mới nhất');
        await loadVersionInfo();
      }
    } catch (error) {
      message.error('Lỗi kiểm tra version: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = async () => {
    setLoading(true);
    try {
      await versionService.clearAllCache();
      message.success('Đã xóa cache thành công!');
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      message.error('Lỗi xóa cache: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Title level={2} className="text-[#795548] mb-6">
        Quản lý Version & Cache
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Thông tin Version" className="mb-4">
            <Space direction="vertical" className="w-full">
              <div className="flex justify-between items-center">
                <Text strong>Version hiện tại (Build):</Text>
                <Tag color="blue">{versionInfo.current || 'N/A'}</Tag>
              </div>
              
              <div className="flex justify-between items-center">
                <Text strong>Version trên Firebase:</Text>
                <Tag color="green">{remoteVersion}</Tag>
              </div>
              
              <div className="flex justify-between items-center">
                <Text strong>Version local cache:</Text>
                <Tag color="orange">{versionInfo.local || 'Chưa có'}</Tag>
              </div>
              
              <div className="flex justify-between items-center">
                <Text strong>Lần check cuối:</Text>
                <Text type="secondary">{versionInfo.lastCheck || 'Chưa có'}</Text>
              </div>

              {lastUpdate && (
                <div className="flex justify-between items-center">
                  <Text strong>Cập nhật cuối:</Text>
                  <Text type="secondary">{lastUpdate}</Text>
                </div>
              )}
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Cập nhật Version" className="mb-4">
            <Space direction="vertical" className="w-full">
              <div>
                <Text strong className="block mb-2">Version mới:</Text>
                <Input
                  placeholder="Ví dụ: 1.2.3"
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                  onPressEnter={handleUpdateVersion}
                />
              </div>
              
              <Button
                type="primary"
                icon={<CloudUploadOutlined />}
                onClick={handleUpdateVersion}
                loading={loading}
                block
                className="bg-[#52c41a]"
              >
                Cập nhật Version
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="Thao tác Cache & Version">
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleForceCheck}
              loading={loading}
              block
            >
              Kiểm tra Version
            </Button>
          </Col>
          
          <Col xs={24} sm={8}>
            <Button
              danger
              onClick={handleClearCache}
              loading={loading}
              block
            >
              Xóa Cache
            </Button>
          </Col>
          
          <Col xs={24} sm={8}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => window.location.reload()}
              block
            >
              Reload Trang
            </Button>
          </Col>
        </Row>

        <Divider />

        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <InfoCircleOutlined className="text-blue-500 mt-1" />
            <div>
              <Title level={5} className="text-blue-800 mb-2">
                Cách hoạt động:
              </Title>
              <ul className="text-blue-700 text-sm space-y-1 mb-0">
                <li>• Khi deploy version mới, cập nhật version trên Firebase</li>
                <li>• User sẽ tự động check version mỗi 5 phút</li>
                <li>• Nếu version khác nhau, cache sẽ được xóa và trang reload</li>
                <li>• Thông tin đăng nhập sẽ được giữ lại</li>
                <li>• Check version khi user focus vào tab</li>
              </ul>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VersionManager;