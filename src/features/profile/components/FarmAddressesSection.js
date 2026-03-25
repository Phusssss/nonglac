import React, { useState, useEffect } from 'react';
import { Card, Empty, Spin, Tag, Row, Col, Button, Modal, Divider } from 'antd';
import { EnvironmentOutlined, EyeOutlined } from '@ant-design/icons';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../hooks/useAuth';
import LocationPickerModal from '../../../components/LocationPickerModal';

const FarmAddressesSection = () => {
  const { user } = useAuth();
  const [farmAddresses, setFarmAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setFarmAddresses(data.farmAddresses || []);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const handleViewMap = (address) => {
    setSelectedAddress(address);
    setMapModalOpen(true);
  };

  const handleMapClose = () => {
    setMapModalOpen(false);
    setSelectedAddress(null);
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <div className="flex justify-center py-8">
          <Spin />
        </div>
      </Card>
    );
  }

  if (!farmAddresses || farmAddresses.length === 0) {
    return (
      <Card className="mb-6">
        <Empty
          description="Chưa có địa chỉ canh tác nào"
          style={{ marginTop: '24px', marginBottom: '24px' }}
        />
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <EnvironmentOutlined style={{ color: '#52c41a' }} />
            Địa chỉ canh tác
          </h3>
        </div>

        <div className="space-y-4">
          {farmAddresses.map((address, index) => {
            let lat = null;
            let lng = null;
            if (address.coordinates) {
              const [latitude, longitude] = address.coordinates.split(',').map(v => parseFloat(v.trim()));
              lat = latitude;
              lng = longitude;
            }

            return (
              <div key={address.id || index}>
                <div className="bg-gray-50 rounded-lg p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-900">
                      Địa chỉ {index + 1}
                    </h4>
                    <Tag color="green">Đã xác minh</Tag>
                  </div>

                  {/* Address */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 font-medium mb-1">Địa chỉ canh tác</p>
                    <p className="text-sm text-gray-800">{address.address}</p>
                  </div>

                  {/* Farm Type */}
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 font-medium mb-1">Loại hình canh tác</p>
                    <p className="text-sm text-gray-800">{address.farmType}</p>
                  </div>

                  {/* Coordinates */}
                  {address.coordinates && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 font-medium mb-2">Vị trí</p>
                      <Row gutter={16}>
                        <Col xs={12}>
                          <div className="bg-white rounded p-2 border border-gray-200">
                            <p className="text-xs text-gray-500">Vĩ độ</p>
                            <p className="text-sm font-medium text-gray-800">{lat?.toFixed(6)}</p>
                          </div>
                        </Col>
                        <Col xs={12}>
                          <div className="bg-white rounded p-2 border border-gray-200">
                            <p className="text-xs text-gray-500">Kinh độ</p>
                            <p className="text-sm font-medium text-gray-800">{lng?.toFixed(6)}</p>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  )}

                  {/* Description */}
                  {address.description && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 font-medium mb-1">Mô tả</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{address.description}</p>
                    </div>
                  )}

                  {/* View Map Button */}
                  {address.coordinates && (
                    <Button
                      type="primary"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewMap(address)}
                    >
                      Xem trên bản đồ
                    </Button>
                  )}
                </div>

                {index < farmAddresses.length - 1 && <Divider style={{ margin: '16px 0' }} />}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Map Modal */}
      {selectedAddress && (
        <Modal
          title={`Bản đồ - ${selectedAddress.address}`}
          open={mapModalOpen}
          onCancel={handleMapClose}
          width="90%"
          style={{ maxWidth: '900px' }}
          footer={[
            <Button key="close" onClick={handleMapClose}>
              Đóng
            </Button>
          ]}
        >
          <div style={{ height: '500px', marginBottom: '16px' }}>
            <LocationPickerModal
              open={mapModalOpen}
              onClose={handleMapClose}
              onConfirm={() => {}}
              initialLat={
                selectedAddress.coordinates
                  ? parseFloat(selectedAddress.coordinates.split(',')[0].trim())
                  : null
              }
              initialLng={
                selectedAddress.coordinates
                  ? parseFloat(selectedAddress.coordinates.split(',')[1].trim())
                  : null
              }
              readOnly={true}
            />
          </div>
        </Modal>
      )}
    </>
  );
};

export default FarmAddressesSection;
