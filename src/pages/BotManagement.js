import React, { useState } from 'react';
import { Card, Button, Typography, Space, Divider, message, Spin, Alert, Statistic, Row, Col } from 'antd';
import { 
  RobotOutlined, 
  SendOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import botService from '../services/botService';

const { Title, Text, Paragraph } = Typography;

const BotManagement = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSendDailyReport = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      message.loading('Đang gửi báo giá hàng ngày...', 0);
      const result = await botService.sendDailyPriceReport();
      
      message.destroy();
      message.success(`Gửi thành công cho ${result.success} người dùng!`);
      setResult(result);
    } catch (error) {
      message.destroy();
      message.error('Có lỗi xảy ra: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeBot = async () => {
    setLoading(true);
    
    try {
      message.loading('Đang khởi tạo bot...', 0);
      await botService.initializeBotUser();
      
      message.destroy();
      message.success('Khởi tạo bot thành công!');
    } catch (error) {
      message.destroy();
      message.error('Có lỗi xảy ra: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendWelcomeMessage = async () => {
    setLoading(true);
    
    try {
      message.loading('Đang gửi tin nhắn chào mừng...', 0);
      // Test với user hiện tại (cần implement)
      message.destroy();
      message.success('Gửi tin nhắn chào mừng thành công!');
    } catch (error) {
      message.destroy();
      message.error('Có lỗi xảy ra: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" style={{ marginTop: '64px' }}>
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <Space direction="vertical" size="large" className="w-full">
            <div className="text-center">
              <RobotOutlined style={{ fontSize: '48px', color: '#52c41a' }} />
              <Title level={2} className="mt-4">
                🤖 Quản lý Bot NôngLạc
              </Title>
              <Paragraph className="text-gray-600">
                Quản lý và điều khiển bot tự động gửi tin nhắn cho người dùng
              </Paragraph>
            </div>

            <Divider />

            <Alert
              message="Thông tin Bot"
              description={
                <div>
                  <p><strong>Bot ID:</strong> system_bot_nonglac</p>
                  <p><strong>Bot Name:</strong> 🤖 NôngLạc Bot</p>
                  <p><strong>Chức năng:</strong> Gửi báo giá nông sản hàng ngày lúc 7:00 sáng</p>
                </div>
              }
              type="info"
              showIcon
            />

            {result && (
              <Row gutter={16}>
                <Col span={12}>
                  <Card>
                    <Statistic
                      title="Gửi thành công"
                      value={result.success}
                      prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card>
                    <Statistic
                      title="Gửi thất bại"
                      value={result.failed}
                      prefix={<CloseCircleOutlined style={{ color: '#ff4d4f' }} />}
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  </Card>
                </Col>
              </Row>
            )}

            <Divider>Thao tác</Divider>

            <Space direction="vertical" size="middle" className="w-full">
              <Button
                type="primary"
                size="large"
                icon={<SendOutlined />}
                onClick={handleSendDailyReport}
                loading={loading}
                block
                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
              >
                Gửi báo giá hàng ngày ngay bây giờ
              </Button>

              <Button
                size="large"
                icon={<ReloadOutlined />}
                onClick={handleInitializeBot}
                loading={loading}
                block
              >
                Khởi tạo Bot User
              </Button>

              <Button
                size="large"
                icon={<SendOutlined />}
                onClick={handleSendWelcomeMessage}
                loading={loading}
                block
              >
                Gửi tin nhắn chào mừng (Test)
              </Button>
            </Space>

            <Divider />

            <Alert
              message="Lưu ý"
              description={
                <ul className="list-disc pl-5 space-y-2">
                  <li>Bot sẽ tự động gửi báo giá mỗi ngày lúc 7:00 sáng</li>
                  <li>Tin nhắn sẽ được gửi đến tất cả người dùng đã đăng ký</li>
                  <li>Dữ liệu giá được lấy từ collection "prices" trong Firestore</li>
                  <li>Mỗi user sẽ có 1 conversation riêng với bot</li>
                  <li>User mới sẽ nhận tin nhắn chào mừng khi đăng ký</li>
                </ul>
              }
              type="warning"
              showIcon
            />
          </Space>
        </Card>

        <Card title="📊 Mẫu tin nhắn báo giá">
          <div className="bg-gray-50 p-4 rounded-lg">
            <pre className="whitespace-pre-wrap text-sm">
{`📊 **BÁO GIÁ CHỢ NÔNG SẢN - THỨ HAI, 15 THÁNG 1, 2026**

Xin chào! Đây là bản tin giá từ chợ NôngLạc hôm nay:

📈 **Tổng quan thị trường:**
- Số danh mục: 8
- Tổng sản phẩm: 45

---

1. **Rau củ quả** (12 sản phẩm)
   💰 Giá trung bình: 25,000 đ/kg
   📊 Khoảng giá: 15,000 - 35,000 đ/kg
   📦 Sản phẩm nổi bật:
      • Cà chua Đà Lạt: 30,000 đ
      • Rau muống: 15,000 đ

2. **Cà phê** (8 sản phẩm)
   💰 Giá trung bình: 45,000 đ/kg
   📊 Khoảng giá: 42,000 - 48,000 đ/kg
   📦 Sản phẩm nổi bật:
      • Cà phê Robusta: 45,000 đ
      • Cà phê Arabica: 65,000 đ

3. **Lúa gạo** (10 sản phẩm)
   💰 Giá trung bình: 8,500 đ/kg
   📊 Khoảng giá: 7,000 - 10,000 đ/kg
   📦 Sản phẩm nổi bật:
      • Gạo ST25: 10,000 đ
      • Gạo thường: 7,500 đ

💡 **Lời khuyên:**
- So sánh giá từ nhiều người bán để có giá tốt nhất
- Liên hệ trực tiếp với người bán qua tin nhắn
- Kiểm tra uy tín của người bán trước khi giao dịch
- Đăng sản phẩm của bạn để tiếp cận nhiều khách hàng

🛒 Truy cập /marketplace để mua bán ngay!

Chúc bạn có giao dịch thành công! 🌾✨`}
            </pre>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BotManagement;
