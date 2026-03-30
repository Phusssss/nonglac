import React, { useEffect, useMemo, useState } from 'react';
import { Card, Tabs, Typography, Row, Col } from 'antd';

const { Title, Text, Paragraph } = Typography;

const ProductTabs = ({ product }) => {
  const [resolvedLocation, setResolvedLocation] = useState('');

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('vi-VN');
  };

  const lat = Number(product?.locationCoords?.lat);
  const lng = Number(product?.locationCoords?.lng);
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);

  const mapEmbedUrl = hasCoordinates
    ? `https://maps.google.com/maps?q=${lat},${lng}&z=15&ie=UTF8&iwloc=&output=embed`
    : '';

  const mapOpenUrl = hasCoordinates ? `https://www.google.com/maps?q=${lat},${lng}` : '';

  const storedLocationText = useMemo(() => {
    return (
      product?.locationResolved?.displayName
      || product?.locationLabel
      || product?.address
      || product?.location
      || ''
    );
  }, [product]);

  useEffect(() => {
    let active = true;

    if (storedLocationText) {
      setResolvedLocation(storedLocationText);
      return () => {
        active = false;
      };
    }

    if (!hasCoordinates) {
      setResolvedLocation('');
      return () => {
        active = false;
      };
    }

    const fetchReverse = async () => {
      try {
        const endpoint = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=vi`;
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) return;

        const data = await response.json();
        const address = data?.address || {};

        const ward = address.suburb || address.quarter || address.village || address.hamlet || '';
        const district = address.city_district || address.district || address.county || '';
        const province = address.state || address.province || address.city || '';

        const compact = [ward, district, province].filter(Boolean).join(', ');

        if (active) {
          setResolvedLocation(compact || data?.display_name || '');
        }
      } catch (error) {
        if (active) {
          setResolvedLocation('');
        }
      }
    };

    fetchReverse();

    return () => {
      active = false;
    };
  }, [hasCoordinates, lat, lng, storedLocationText]);

  const tabItems = [
    {
      key: 'description',
      label: 'Mô tả sản phẩm',
      children: (
        <div style={{ padding: '16px 0' }}>
          <Paragraph style={{ color: '#475569', fontSize: 15, lineHeight: 1.6 }}>
            {product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
          </Paragraph>

          <Title level={4} className="elegant-title" style={{ marginTop: 24, marginBottom: 16 }}>
            Thông tin chi tiết
          </Title>
          <ul style={{ paddingLeft: 20, color: '#475569', fontSize: 15, lineHeight: 1.8 }}>
            <li>Danh mục: {product.category}</li>
            {product.quantity && <li>Số lượng: {product.quantity} {product.unit}</li>}
            {!!resolvedLocation && <li>Khu vực: {resolvedLocation}</li>}
            {!resolvedLocation && product.location && <li>Khu vực: {product.location}</li>}
            {product.transactionIntent && (
              <li>
                Loại giao dịch:{' '}
                {product.transactionIntent === 'b2b'
                  ? 'Bán buôn'
                  : product.transactionIntent === 'export'
                    ? 'Xuất khẩu'
                    : 'Bán lẻ'}
              </li>
            )}
          </ul>

          {hasCoordinates && (
            <div style={{ marginTop: 32 }}>
              <Title level={4} className="elegant-title" style={{ marginBottom: 16 }}>
                Vị trí trên bản đồ
              </Title>
              <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <iframe
                  title="product-location-map"
                  src={mapEmbedUrl}
                  width="100%"
                  height="280"
                  style={{ border: 0, display: 'block' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <a
                href={mapOpenUrl}
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-block', marginTop: 8 }}
              >
                Mở trên Google Maps
              </a>
            </div>
          )}
        </div>
      )
    },
    {
      key: 'specifications',
      label: 'Thông số kỹ thuật',
      children: (
        <div style={{ padding: '16px 0' }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}><Text strong>Tên sản phẩm:</Text></Col>
            <Col xs={24} sm={16}><Text>{product.name}</Text></Col>

            <Col xs={24} sm={8}><Text strong>Danh mục:</Text></Col>
            <Col xs={24} sm={16}><Text>{product.category}</Text></Col>

            <Col xs={24} sm={8}><Text strong>Giá:</Text></Col>
            <Col xs={24} sm={16}><Text>{formatPrice(product.price)}/{product.unit}</Text></Col>

            {product.quantity && (
              <>
                <Col xs={24} sm={8}><Text strong>Số lượng:</Text></Col>
                <Col xs={24} sm={16}><Text>{product.quantity} {product.unit}</Text></Col>
              </>
            )}

            {!!resolvedLocation && (
              <>
                <Col xs={24} sm={8}><Text strong>Khu vực:</Text></Col>
                <Col xs={24} sm={16}><Text>{resolvedLocation}</Text></Col>
              </>
            )}

            {!resolvedLocation && product.location && (
              <>
                <Col xs={24} sm={8}><Text strong>Khu vực:</Text></Col>
                <Col xs={24} sm={16}><Text>{product.location}</Text></Col>
              </>
            )}

            <Col xs={24} sm={8}><Text strong>Ngày đăng:</Text></Col>
            <Col xs={24} sm={16}><Text>{formatDate(product.createdAt)}</Text></Col>
          </Row>
        </div>
      )
    },
    {
      key: 'reviews',
      label: 'Đánh giá',
      children: (
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
          Chưa có đánh giá nào
        </div>
      )
    }
  ];

  return (
    <Card className="elegant-detail-card" style={{ marginTop: 24, padding: '8px 4px' }}>
      <Tabs defaultActiveKey="description" items={tabItems} size="large" />
    </Card>
  );
};

export default ProductTabs;
