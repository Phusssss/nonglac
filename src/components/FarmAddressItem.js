import React, { useState } from 'react';
import { Form, Input, Button, Row, Col, Card } from 'antd';
import { DeleteOutlined, EnvironmentOutlined } from '@ant-design/icons';
import LocationPickerModal from './LocationPickerModal';

const { TextArea } = Input;

const FarmAddressItem = ({ 
  index, 
  address, 
  onUpdate, 
  onDelete,
  form 
}) => {
  const [locationPickerOpen, setLocationPickerOpen] = useState(false);

  const handleLocationConfirm = (lat, lng) => {
    const coordinates = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    onUpdate(index, { ...address, coordinates });
    setLocationPickerOpen(false);
  };

  const handleOpenLocationPicker = () => {
    setLocationPickerOpen(true);
  };

  const handleAddressChange = (field, value) => {
    onUpdate(index, { ...address, [field]: value });
  };

  // Parse coordinates
  let initialLat = null;
  let initialLng = null;
  if (address.coordinates) {
    const [lat, lng] = address.coordinates.split(',').map(v => parseFloat(v.trim()));
    initialLat = lat;
    initialLng = lng;
  }

  return (
    <>
      <Card
        size="small"
        style={{ marginBottom: '16px' }}
        title={`Địa chỉ ${index + 1}`}
        extra={
          <Button
            type="text"
            danger
            size="small"
            icon={<DeleteOutlined />}
            onClick={() => onDelete(index)}
          >
            Xóa
          </Button>
        }
      >
        <div className="space-y-4">
          {/* Address */}
          <Form.Item
            label="Địa chỉ canh tác"
            required
            help="Địa chỉ cụ thể nơi bạn canh tác hoặc kinh doanh"
          >
            <Input
              placeholder="Nhập địa chỉ khu vực canh tác của bạn"
              value={address.address || ''}
              onChange={(e) => handleAddressChange('address', e.target.value)}
            />
          </Form.Item>

          {/* Farm Type */}
          <Form.Item
            label="Loại hình canh tác"
            required
          >
            <Input
              placeholder="VD: Trồng lúa, chăn nuôi, thủy sản..."
              value={address.farmType || ''}
              onChange={(e) => handleAddressChange('farmType', e.target.value)}
            />
          </Form.Item>

          {/* Coordinates */}
          <Form.Item
            label="Vị trí canh tác"
            required
            help="Bấm nút để chọn vị trí, hệ thống sẽ tự động lấy kinh độ và vĩ độ"
          >
            <div style={{ display: 'flex', gap: '8px' }}>
              <Input
                placeholder="Bấm nút để chọn vị trí trên bản đồ"
                value={address.coordinates || ''}
                readOnly
                style={{ backgroundColor: '#f5f5f5', flex: 1 }}
              />
              <Button
                type="primary"
                icon={<EnvironmentOutlined />}
                onClick={handleOpenLocationPicker}
              >
                Chọn vị trí
              </Button>
            </div>
          </Form.Item>

          {/* Coordinates Display */}
          {address.coordinates && (
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <div>
                  <label className="block text-sm font-medium mb-2">Vĩ độ</label>
                  <Input
                    value={address.coordinates.split(',')[0].trim()}
                    readOnly
                    className="bg-gray-50"
                    size="small"
                  />
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div>
                  <label className="block text-sm font-medium mb-2">Kinh độ</label>
                  <Input
                    value={address.coordinates.split(',')[1].trim()}
                    readOnly
                    className="bg-gray-50"
                    size="small"
                  />
                </div>
              </Col>
            </Row>
          )}

          {/* Description */}
          <Form.Item
            label="Mô tả thêm"
          >
            <TextArea
              placeholder="Mô tả thêm về hoạt động canh tác của bạn"
              rows={3}
              value={address.description || ''}
              onChange={(e) => handleAddressChange('description', e.target.value)}
            />
          </Form.Item>
        </div>
      </Card>

      {/* Location Picker Modal */}
      <LocationPickerModal
        open={locationPickerOpen}
        onClose={() => setLocationPickerOpen(false)}
        onConfirm={handleLocationConfirm}
        initialLat={initialLat}
        initialLng={initialLng}
      />
    </>
  );
};

export default FarmAddressItem;
