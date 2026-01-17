import React, { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Card, Typography, Table, Tag, Spin, Space } from 'antd';
import { RiseOutlined, FallOutlined, CoffeeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const CoffeePrices = () => {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'prices'), orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const pricesData = [];
      querySnapshot.forEach((doc) => {
        pricesData.push({ id: doc.id, ...doc.data() });
      });
      
      setPrices(pricesData);
    } catch (err) {
      console.error('Error fetching prices:', err);
      setError('Không thể tải dữ liệu giá nông sản');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getPriceChange = (current, previous) => {
    const change = current - previous;
    return {
      value: change,
      percentage: ((change / previous) * 100).toFixed(2)
    };
  };

  const getPriceChangeIcon = (change) => {
    if (change > 0) return <RiseOutlined style={{ color: '#52c41a', fontSize: 16 }} />;
    if (change < 0) return <FallOutlined style={{ color: '#ff4d4f', fontSize: 16 }} />;
    return null;
  };

  const getPriceChangeColor = (change) => {
    if (change > 0) return 'success';
    if (change < 0) return 'error';
    return 'default';
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <Text type="danger">{error}</Text>
      </Card>
    );
  }

  const columns = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Thị trường',
      dataIndex: 'market',
      key: 'market'
    },
    {
      title: 'Giá hiện tại',
      dataIndex: 'currentPrice',
      key: 'currentPrice',
      align: 'right',
      render: (price) => (
        <Text strong style={{ color: '#1890ff' }}>
          {formatPrice(price)} đ/kg
        </Text>
      )
    },
    {
      title: 'Thay đổi',
      key: 'change',
      align: 'right',
      render: (_, record) => {
        const change = getPriceChange(record.currentPrice, record.previousPrice);
        return (
          <Space>
            {getPriceChangeIcon(change.value)}
            <Tag color={getPriceChangeColor(change.value)}>
              {change.value > 0 ? '+' : ''}{formatPrice(change.value)} đ
            </Tag>
          </Space>
        );
      }
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'date',
      key: 'date',
      align: 'center',
      render: (date) => <Text type="secondary" style={{ fontSize: 12 }}>{date}</Text>
    }
  ];

  return (
    <Card>
      <Space style={{ marginBottom: 16 }}>
        <CoffeeOutlined style={{ color: '#8B4513' }} />
        <Title level={4} style={{ margin: 0 }}>
          Giá Nông Sản Hôm Nay
        </Title>
      </Space>
      
      {prices.length === 0 ? (
        <Text type="secondary">
          Chưa có dữ liệu giá nông sản
        </Text>
      ) : (
        <>
          <Table 
            columns={columns}
            dataSource={prices}
            rowKey="id"
            size="small"
            pagination={false}
          />
          
          <div style={{ 
            marginTop: 16, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Nguồn: WebGia.com
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Đơn vị: VNĐ/kg
            </Text>
          </div>
        </>
      )}
    </Card>
  );
};

export default CoffeePrices;