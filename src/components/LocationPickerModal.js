import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Space, message, Input, Row, Col } from 'antd';
import { EnvironmentOutlined, EnvironmentFilled } from '@ant-design/icons';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const LocationPickerModal = ({ 
  open, 
  onClose, 
  onConfirm, 
  initialLat = null, 
  initialLng = null,
  loading = false,
  readOnly = false
}) => {
  const [latitude, setLatitude] = useState(initialLat || '');
  const [longitude, setLongitude] = useState(initialLng || '');
  const [isLocating, setIsLocating] = useState(false);
  const [mapMode, setMapMode] = useState('satellite'); // 'satellite', 'street', 'terrain'
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const tileLayerRef = useRef(null);

  useEffect(() => {
    if (initialLat) setLatitude(initialLat);
    if (initialLng) setLongitude(initialLng);
  }, [initialLat, initialLng]);

  // Get tile layer URL based on mode
  const getTileLayerUrl = (mode) => {
    switch (mode) {
      case 'street':
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      case 'terrain':
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
      case 'satellite':
      default:
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    }
  };

  const getAttribution = (mode) => {
    switch (mode) {
      case 'street':
        return '&copy; OpenStreetMap contributors';
      case 'terrain':
      case 'satellite':
      default:
        return '&copy; Esri';
    }
  };

  // Initialize map
  useEffect(() => {
    if (!open || mapRef.current) return;

    const mapContainer = document.getElementById('location-picker-map');
    if (!mapContainer) return;

    const map = L.map(mapContainer).setView(
      [parseFloat(latitude) || 10.7769, parseFloat(longitude) || 106.6869],
      13
    );

    // Add initial tile layer
    tileLayerRef.current = L.tileLayer(getTileLayerUrl(mapMode), {
      attribution: getAttribution(mapMode),
      maxZoom: 19,
    }).addTo(map);

    // Add marker if coordinates exist
    if (latitude && longitude) {
      markerRef.current = L.marker([parseFloat(latitude), parseFloat(longitude)]).addTo(map);
    }

    // Handle map click (only if not readonly)
    const handleMapClick = (e) => {
      if (readOnly) return;
      
      const { lat, lng } = e.latlng;
      setLatitude(lat.toFixed(6));
      setLongitude(lng.toFixed(6));

      // Update marker
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng]).addTo(map);
      }
    };

    map.on('click', handleMapClick);
    mapRef.current = map;

    return () => {
      map.off('click', handleMapClick);
      map.remove();
      mapRef.current = null;
    };
  }, [open, readOnly, latitude, longitude, mapMode]);

  // Handle map mode change
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;

    const map = mapRef.current;
    
    // Remove old tile layer
    map.removeLayer(tileLayerRef.current);
    
    // Add new tile layer
    tileLayerRef.current = L.tileLayer(getTileLayerUrl(mapMode), {
      attribution: getAttribution(mapMode),
      maxZoom: 19,
    }).addTo(map);
  }, [mapMode]);

  const handleGetCurrentLocation = () => {
    setIsLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: lng } = position.coords;
          setLatitude(lat.toFixed(6));
          setLongitude(lng.toFixed(6));

          // Update map view and marker
          if (mapRef.current) {
            mapRef.current.setView([lat, lng], 13);
            if (markerRef.current) {
              markerRef.current.setLatLng([lat, lng]);
            } else {
              markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
            }
          }

          message.success('Đã lấy vị trí hiện tại');
          setIsLocating(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          message.error('Không thể lấy vị trí hiện tại. Vui lòng kiểm tra quyền truy cập.');
          setIsLocating(false);
        }
      );
    } else {
      message.error('Trình duyệt không hỗ trợ định vị');
      setIsLocating(false);
    }
  };

  const handleConfirm = () => {
    if (!latitude || !longitude) {
      message.error('Vui lòng chọn vị trí trên bản đồ');
      return;
    }
    onConfirm(parseFloat(latitude), parseFloat(longitude));
  };

  return (
    <Modal
      title={
        <Space>
          <EnvironmentOutlined style={{ color: '#52c41a' }} />
          <span>Chọn vị trí canh tác trên bản đồ</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width="90%"
      style={{ maxWidth: '900px' }}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Hủy
        </Button>,
        <Button 
          key="confirm" 
          type="primary" 
          onClick={handleConfirm}
          loading={loading}
        >
          Xác nhận
        </Button>,
      ]}
    >
      <div className="space-y-4">
        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800 mb-2">
            <EnvironmentFilled className="mr-2" />
            Bấm vào bản đồ để chọn vị trí canh tác của bạn hoặc sử dụng nút định vị để lấy vị trí hiện tại
          </p>
        </div>

        {/* Coordinates Display */}
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <div>
              <label className="block text-sm font-medium mb-2">Vĩ độ (Latitude)</label>
              <Input
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="VD: 10.776969"
                readOnly
                className="bg-gray-50"
              />
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div>
              <label className="block text-sm font-medium mb-2">Kinh độ (Longitude)</label>
              <Input
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="VD: 106.686869"
                readOnly
                className="bg-gray-50"
              />
            </div>
          </Col>
        </Row>

        {/* Get Current Location Button */}
        {!readOnly && (
          <Button
            type="default"
            icon={<EnvironmentFilled />}
            onClick={handleGetCurrentLocation}
            loading={isLocating}
            block
          >
            {isLocating ? 'Đang định vị...' : 'Lấy vị trí hiện tại'}
          </Button>
        )}

        {/* Map Mode Selector */}
        {!readOnly && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              type={mapMode === 'satellite' ? 'primary' : 'default'}
              onClick={() => setMapMode('satellite')}
              style={{ flex: 1 }}
            >
              🛰️ Vệ tinh
            </Button>
            <Button
              type={mapMode === 'street' ? 'primary' : 'default'}
              onClick={() => setMapMode('street')}
              style={{ flex: 1 }}
            >
              🗺️ Bản đồ
            </Button>
            <Button
              type={mapMode === 'terrain' ? 'primary' : 'default'}
              onClick={() => setMapMode('terrain')}
              style={{ flex: 1 }}
            >
              🏔️ Địa hình
            </Button>
          </div>
        )}

        {/* Map */}
        <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height: '400px' }}>
          <div id="location-picker-map" style={{ height: '100%', width: '100%' }} />
        </div>

        {/* Info */}
        <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
          <p>💡 Mẹo: Bạn có thể bấm trực tiếp trên bản đồ để chọn vị trí, hoặc sử dụng nút định vị để tự động lấy vị trí hiện tại của bạn.</p>
        </div>
      </div>
    </Modal>
  );
};

export default LocationPickerModal;
