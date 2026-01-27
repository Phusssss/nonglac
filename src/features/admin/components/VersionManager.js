import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Typography, Space, Tag, Divider, message, Row, Col } from 'antd';
import { CloudUploadOutlined, ReloadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import versionService from '../../../services/versionService';

const { Title, Text } = Typography;

const VersionManager = () => {
  const [loading, setLoading] = useState(false);
  const [remoteVersion, setRemoteVersion] = useState('');
  const [newVersion, setNewVersion] = useState('');
  const [versionInfo, setVersionInfo] = useState({});

  useEffect(() => { loadVersionInfo(); }, []);

  const loadVersionInfo = async () => {
    try {
      const remote = await versionService.getRemoteVersion();
      const info = versionService.getCurrentVersionInfo();
      setRemoteVersion(remote || 'Chưa có');
      setVersionInfo(info);
      setNewVersion(remote || '');
    } catch (error) { message.error('Lỗi tải version: ' + error.message); }
  };

  const handleUpdateVersion = async () => {
    if (!newVersion.trim()) return message.error('Nhập version mới');
    setLoading(true);
    try {
      if (await versionService.updateRemoteVersion(newVersion.trim())) {
        message.success('Đã cập nhật!');
        await loadVersionInfo();
      } else message.error('Lỗi cập nhật');
    } catch (error) { message.error('Lỗi: ' + error.message); } finally { setLoading(false); }
  };

  return (
    <div>
      <Title level={2} className="text-[#795548] mb-6">Quản lý Version & Cache</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Thông tin Version">
            <Space direction="vertical" className="w-full">
              <div className="flex justify-between"><span>Version hiện tại:</span> <Tag color="blue">{versionInfo.current || 'N/A'}</Tag></div>
              <div className="flex justify-between"><span>Version Firebase:</span> <Tag color="green">{remoteVersion}</Tag></div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Cập nhật Version">
            <Input value={newVersion} onChange={(e) => setNewVersion(e.target.value)} className="mb-4" />
            <Button type="primary" icon={<CloudUploadOutlined />} onClick={handleUpdateVersion} loading={loading} block className="bg-[#52c41a]">Cập nhật</Button>
          </Card>
        </Col>
      </Row>
      <Card title="Thao tác" className="mt-4">
        <Row gutter={16}>
          <Col span={8}><Button icon={<ReloadOutlined />} onClick={async () => { setLoading(true); await versionService.checkAndUpdateVersion(); setLoading(false); }} block>Kiểm tra</Button></Col>
          <Col span={8}><Button danger onClick={async () => { await versionService.clearAllCache(); window.location.reload(); }} block>Xóa Cache</Button></Col>
          <Col span={8}><Button onClick={() => window.location.reload()} block>Reload</Button></Col>
        </Row>
      </Card>
    </div>
  );
};

export default VersionManager;