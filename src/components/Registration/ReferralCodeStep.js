import React from 'react';
import { Form, Input, Button, Typography, Alert, Row, Col } from 'antd';
import { GiftOutlined } from '@ant-design/icons';
import registrationService from '../../services/registrationService';

const { Title, Text } = Typography;

const ReferralCodeStep = ({ 
  onNext, 
  onBack, 
  setLoading, 
  setError, 
  loading, 
  error,
  initialCode = ''
}) => {
  const onFinish = async (values) => {
    setLoading(true);
    setError('');

    try {
      const result = registrationService.saveReferralCode(
        values.referralCode?.trim() || null
      );

      if (result.success) {
        onNext();
      } else {
        setError(result.message);
      }
    } catch (_error) {
      setError('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={4}>Mã Giới Thiệu (Tùy Chọn)</Title>
        <Text type="secondary">
          Nếu bạn được giới thiệu bởi ai đó, hãy nhập mã giới thiệu của họ
        </Text>
      </div>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        name="referral-code"
        onFinish={onFinish}
        layout="vertical"
        size="large"
        initialValues={{
          referralCode: initialCode
        }}
      >
        <Form.Item
          name="referralCode"
          label="Mã Giới Thiệu"
          rules={[
            {
              validator: async (_, value) => {
                if (!value || value.trim() === '') {
                  return Promise.resolve();
                }
                // Chỉ kiểm tra xem mã có tồn tại trong database không
                const referrerUser = await registrationService.findUserByReferralCode(value.trim());
                if (!referrerUser) {
                  return Promise.reject(
                    new Error('Mã giới thiệu không tồn tại')
                  );
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <Input
            prefix={<GiftOutlined />}
            placeholder="VD: STU_NGU_A7K9M2"
            disabled={loading}
            maxLength={20}
          />
        </Form.Item>

        <div style={{ 
          background: '#f0f9f0', 
          padding: '12px 16px', 
          borderRadius: '6px',
          marginBottom: '16px',
          borderLeft: '4px solid #4CAF50'
        }}>
          <Text style={{ color: '#2E7D32', fontSize: '13px' }}>
            💡 <strong>Mẹo:</strong> Nếu bạn được giới thiệu qua link, mã sẽ tự động điền vào. 
            Bạn có thể bỏ qua bước này nếu không có mã giới thiệu.
          </Text>
        </div>

        <Form.Item>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button onClick={onBack} disabled={loading} size="large">
              Quay lại
            </Button>

            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
              className="bg-[#4CAF50] hover:bg-[#45a049] border-[#4CAF50] hover:border-[#45a049]"
            >
              {loading ? 'Đang lưu...' : 'Tiếp tục'}
            </Button>
          </div>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ReferralCodeStep;
