import React, { useState, useEffect } from 'react';
import { Spin, Modal, Button } from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../hooks/useAuth';
import LocationPickerModal from '../../../components/LocationPickerModal';
import ProfileInfoModal from '../../../components/ProfileInfoModal';
import { MISSIONS_CONSTANTS } from '../../missions/constants';

const FarmAddressesCompact = () => {
  const { user } = useAuth();
  const [farmAddresses, setFarmAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [mapModalOpen, setMapModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editLoading, setEditLoading] = useState(false);

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

  const handleEditAddresses = () => {
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
  };

  const handleEditSubmit = async (formData) => {
    setEditLoading(true);
    try {
      if (formData.farmAddresses && Array.isArray(formData.farmAddresses)) {
        await updateDoc(doc(db, 'users', user.uid), {
          farmAddresses: formData.farmAddresses,
          updatedAt: new Date()
        });
      }
      setEditModalOpen(false);
    } catch (error) {
      console.error('Error updating farm addresses:', error);
    } finally {
      setEditLoading(false);
    }
  };

  // Tạo fields config với dữ liệu cũ
  const getEditFields = () => {
    const baseField = MISSIONS_CONSTANTS.MODAL_CONFIGS.FARM_ADDRESS.fields[0];
    return [{
      ...baseField,
      initialValue: farmAddresses
    }];
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Spin size="small" />
      </div>
    );
  }

  if (!farmAddresses || farmAddresses.length === 0) {
    return (
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">Chưa có địa chỉ canh tác</p>
        <button
          onClick={handleEditAddresses}
          className="shrink-0 rounded-md bg-white px-2 py-1 text-[#2f6e37] hover:bg-gray-100 transition text-xs font-semibold flex items-center gap-1"
        >
          <EditOutlined className="text-xs" />
          Thêm
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {farmAddresses.map((address, index) => {
          let lat = null;
          let lng = null;
          if (address.coordinates) {
            const [latitude, longitude] = address.coordinates.split(',').map(v => parseFloat(v.trim()));
            lat = latitude;
            lng = longitude;
          }

          return (
            <div key={address.id || index} className="flex items-start justify-between gap-2 rounded-lg bg-gray-50 p-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-gray-800 truncate">
                  {address.address}
                </p>
                <p className="text-xs text-gray-600 truncate">
                  {address.farmType}
                </p>
                {address.coordinates && (
                  <p className="text-xs text-gray-500 truncate">
                    {lat?.toFixed(4)}, {lng?.toFixed(4)}
                  </p>
                )}
              </div>
              <div className="shrink-0 flex gap-1">
                {address.coordinates && (
                  <button
                    onClick={() => handleViewMap(address)}
                    className="rounded-md bg-white p-1.5 text-[#2f6e37] hover:bg-gray-100 transition text-xs"
                    title="Xem trên bản đồ"
                  >
                    <EyeOutlined className="text-sm" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Button */}
      <div className="mt-2 flex justify-end">
        <button
          onClick={handleEditAddresses}
          className="rounded-md bg-white px-3 py-1.5 text-[#2f6e37] hover:bg-gray-100 transition text-xs font-semibold flex items-center gap-1 border border-[#d0e4d1]"
        >
          <EditOutlined className="text-xs" />
          Sửa thông tin địa chỉ
        </button>
      </div>

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

      {/* Edit Modal */}
      <ProfileInfoModal
        open={editModalOpen}
        onClose={handleEditModalClose}
        onSubmit={handleEditSubmit}
        title="Sửa thông tin địa chỉ canh tác"
        fields={getEditFields()}
        loading={editLoading}
        initialFarmAddresses={farmAddresses}
      />
    </>
  );
};

export default FarmAddressesCompact;
