import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Statistic, Row, Col, message, Modal, Tag, Alert } from 'antd';
import { DeleteOutlined, ReloadOutlined, DatabaseOutlined, ExclamationCircleOutlined, PlayCircleOutlined } from '@ant-design/icons';
import { collection, getDocs, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';

const { confirm } = Modal;

const CrawlerDataManagement = () => {
  const [loading, setLoading] = useState(false);
  const [crawling, setCrawling] = useState(false);
  const [stats, setStats] = useState({
    coffeePricesCount: 0,
    fullPricesExists: false,
    pricesCount: 0,
    lastUpdate: null
  });

  const loadStats = async () => {
    setLoading(true);
    try {
      // Count coffee_prices
      const coffeePricesSnapshot = await getDocs(collection(db, 'coffee_prices'));
      
      // Check full_prices/current
      const fullPricesDoc = await getDoc(doc(db, 'full_prices', 'current'));
      
      // Count prices
      const pricesSnapshot = await getDocs(collection(db, 'prices'));

      setStats({
        coffeePricesCount: coffeePricesSnapshot.size,
        fullPricesExists: fullPricesDoc.exists(),
        pricesCount: pricesSnapshot.size,
        lastUpdate: fullPricesDoc.exists() ? fullPricesDoc.data()?.date : null
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      message.error('Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleTriggerCrawler = async () => {
    setCrawling(true);
    try {
      // Show info about scheduled crawler
      Modal.info({
        title: 'Thông tin Crawler',
        content: (
          <div>
            <p>Do giới hạn bảo mật IAM, không thể trigger crawler trực tiếp từ web.</p>
            <br />
            <p><strong>Crawler tự động:</strong></p>
            <ul>
              <li>Chạy mỗi 30 phút (scheduled function)</li>
              <li>Cập nhật dữ liệu tự động</li>
            </ul>
            <br />
            <p><strong>Trigger thủ công:</strong></p>
            <ol>
              <li>Vào <a href="https://console.firebase.google.com/project/nonglac-2026/functions" target="_blank" rel="noopener noreferrer">Firebase Console</a></li>
              <li>Tìm function <code>crawlCoffeeManual</code></li>
              <li>Click "Test function" hoặc trigger qua Cloud Scheduler</li>
            </ol>
          </div>
        ),
        width: 600
      });
      
      // Still try to call (may work in production)
      const response = await fetch('https://asia-southeast1-nonglac-2026.cloudfunctions.net/crawlCoffeeManual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          message.success(`Crawler hoàn tất! Đã cào ${data.result.allTables?.length || 0} bảng giá`);
          loadStats();
        }
      }
    } catch (error) {
      console.error('Crawler error:', error);
      // Don't show error since we already showed info modal
    } finally {
      setCrawling(false);
    }
  };

  const handleClearCoffeePrices = () => {
    confirm({
      title: 'Xóa dữ liệu coffee_prices?',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc muốn xóa ${stats.coffeePricesCount} bản ghi trong collection coffee_prices?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        setLoading(true);
        try {
          const snapshot = await getDocs(collection(db, 'coffee_prices'));
          const deletePromises = snapshot.docs.map(docSnap => 
            deleteDoc(doc(db, 'coffee_prices', docSnap.id))
          );
          await Promise.all(deletePromises);
          message.success(`Đã xóa ${snapshot.size} bản ghi`);
          loadStats();
        } catch (error) {
          console.error('Error:', error);
          message.error('Lỗi khi xóa dữ liệu');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleClearFullPrices = () => {
    confirm({
      title: 'Xóa dữ liệu full_prices/current?',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc muốn xóa document full_prices/current? Đây là dữ liệu hiển thị trên trang giá nông sản.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        setLoading(true);
        try {
          await deleteDoc(doc(db, 'full_prices', 'current'));
          message.success('Đã xóa full_prices/current');
          loadStats();
        } catch (error) {
          console.error('Error:', error);
          message.error('Lỗi khi xóa dữ liệu');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleClearPrices = () => {
    confirm({
      title: 'Xóa dữ liệu prices?',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc muốn xóa ${stats.pricesCount} bản ghi trong collection prices?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        setLoading(true);
        try {
          const snapshot = await getDocs(collection(db, 'prices'));
          const deletePromises = snapshot.docs.map(docSnap => 
            deleteDoc(doc(db, 'prices', docSnap.id))
          );
          await Promise.all(deletePromises);
          message.success(`Đã xóa ${snapshot.size} bản ghi`);
          loadStats();
        } catch (error) {
          console.error('Error:', error);
          message.error('Lỗi khi xóa dữ liệu');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleClearAll = () => {
    confirm({
      title: 'Xóa TẤT CẢ dữ liệu giá?',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Bạn có chắc muốn xóa TẤT CẢ dữ liệu giá?</p>
          <ul>
            <li>coffee_prices: {stats.coffeePricesCount} bản ghi</li>
            <li>full_prices/current: {stats.fullPricesExists ? 'Có' : 'Không'}</li>
            <li>prices: {stats.pricesCount} bản ghi</li>
          </ul>
          <p style={{ color: 'red', fontWeight: 'bold' }}>Hành động này KHÔNG THỂ hoàn tác!</p>
        </div>
      ),
      okText: 'Xóa tất cả',
      okType: 'danger',
      cancelText: 'Hủy',
      async onOk() {
        setLoading(true);
        try {
          // Clear coffee_prices
          const coffeePricesSnapshot = await getDocs(collection(db, 'coffee_prices'));
          const coffeePricesPromises = coffeePricesSnapshot.docs.map(docSnap => 
            deleteDoc(doc(db, 'coffee_prices', docSnap.id))
          );
          
          // Clear full_prices/current
          const fullPricesPromise = deleteDoc(doc(db, 'full_prices', 'current'));
          
          // Clear prices
          const pricesSnapshot = await getDocs(collection(db, 'prices'));
          const pricesPromises = pricesSnapshot.docs.map(docSnap => 
            deleteDoc(doc(db, 'prices', docSnap.id))
          );

          await Promise.all([...coffeePricesPromises, fullPricesPromise, ...pricesPromises]);
          
          message.success('Đã xóa tất cả dữ liệu giá');
          loadStats();
        } catch (error) {
          console.error('Error:', error);
          message.error('Lỗi khi xóa dữ liệu');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return (
    <div className="space-y-4">
      <Card 
        title="Chạy Crawler" 
        extra={
          <Button 
            type="primary"
            icon={<PlayCircleOutlined />} 
            onClick={handleTriggerCrawler}
            loading={crawling}
            size="large"
          >
            Xem hướng dẫn
          </Button>
        }
      >
        <Alert
          message="Crawler tự động chạy mỗi 30 phút"
          description={
            <div>
              <p>Crawler được lên lịch tự động qua Cloud Scheduler và chạy mỗi 30 phút.</p>
              <p style={{ marginTop: 8 }}>
                <strong>Để trigger thủ công:</strong> Vào{' '}
                <a 
                  href="https://console.firebase.google.com/project/nonglac-2026/functions" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  Firebase Console → Functions
                </a>
                {' '}và test function <code>crawlCoffeeManual</code>
              </p>
            </div>
          }
          type="info"
          showIcon
        />
      </Card>

      <Card title="Quản lý dữ liệu Crawler" extra={
        <Button 
          icon={<ReloadOutlined />} 
          onClick={loadStats}
          loading={loading}
        >
          Làm mới
        </Button>
      }>
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="coffee_prices"
                value={stats.coffeePricesCount}
                prefix={<DatabaseOutlined />}
                suffix="bản ghi"
              />
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={handleClearCoffeePrices}
                disabled={stats.coffeePricesCount === 0}
                loading={loading}
                style={{ marginTop: 16, width: '100%' }}
              >
                Xóa collection
              </Button>
            </Card>
          </Col>

          <Col span={6}>
            <Card>
              <Statistic
                title="full_prices/current"
                value={stats.fullPricesExists ? 'Có dữ liệu' : 'Trống'}
                prefix={<DatabaseOutlined />}
              />
              {stats.lastUpdate && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                  Cập nhật: {stats.lastUpdate}
                </div>
              )}
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={handleClearFullPrices}
                disabled={!stats.fullPricesExists}
                loading={loading}
                style={{ marginTop: 16, width: '100%' }}
              >
                Xóa document
              </Button>
            </Card>
          </Col>

          <Col span={6}>
            <Card>
              <Statistic
                title="prices"
                value={stats.pricesCount}
                prefix={<DatabaseOutlined />}
                suffix="bản ghi"
              />
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={handleClearPrices}
                disabled={stats.pricesCount === 0}
                loading={loading}
                style={{ marginTop: 16, width: '100%' }}
              >
                Xóa collection
              </Button>
            </Card>
          </Col>

          <Col span={6}>
            <Card>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <h3>Xóa tất cả</h3>
                <p style={{ color: '#666', fontSize: 12 }}>
                  Xóa toàn bộ dữ liệu giá
                </p>
              </div>
              <Button 
                danger 
                type="primary"
                icon={<DeleteOutlined />}
                onClick={handleClearAll}
                disabled={stats.coffeePricesCount === 0 && !stats.fullPricesExists && stats.pricesCount === 0}
                loading={loading}
                style={{ marginTop: 16, width: '100%' }}
              >
                Xóa tất cả
              </Button>
            </Card>
          </Col>
        </Row>
      </Card>

      <Card title="Hướng dẫn">
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Tag color="blue">coffee_prices</Tag>
            <span>Lưu trữ lịch sử giá cà phê theo thời gian (mỗi lần cào tạo 1 document mới)</span>
          </div>
          <div>
            <Tag color="green">full_prices/current</Tag>
            <span>Dữ liệu giá mới nhất hiển thị trên trang /coffee-latest (ghi đè mỗi lần cào)</span>
          </div>
          <div>
            <Tag color="orange">prices</Tag>
            <span>Collection giá cũ (nếu có)</span>
          </div>
          <div style={{ marginTop: 16, padding: 12, background: '#fff7e6', border: '1px solid #ffd591', borderRadius: 4 }}>
            <strong>⚠️ Lưu ý:</strong> Sau khi xóa dữ liệu, cần chạy lại crawler để cập nhật giá mới.
            <br />
            Crawler tự động chạy mỗi 30 phút hoặc có thể trigger thủ công qua Firebase Functions.
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default CrawlerDataManagement;
