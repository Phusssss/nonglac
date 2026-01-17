import React, { useState, useEffect } from 'react';
import { Card, Typography, Avatar, List, Tag, Divider, Button, Space } from 'antd';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import { 
  FileTextOutlined, 
  EnvironmentOutlined, 
  TeamOutlined,
  TrophyOutlined 
} from '@ant-design/icons';

const RightSidebar = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [news, setNews] = useState([]);
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load top users by reputation
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('reputation', 'desc'),
        limit(4)
      );
      const usersSnapshot = await getDocs(usersQuery);
      setTopUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Load news posts (category: 'tin-tuc')
      const newsQuery = query(
        collection(db, 'posts'),
        where('category', '==', 'tin-tuc'),
        orderBy('createdAt', 'desc'),
        limit(3)
      );
      const newsSnapshot = await getDocs(newsQuery);
      setNews(newsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Load featured farms (users with type: 'farm')
      const farmsQuery = query(
        collection(db, 'users'),
        where('userType', '==', 'farm'),
        orderBy('followersCount', 'desc'),
        limit(3)
      );
      const farmsSnapshot = await getDocs(farmsQuery);
      setFarms(farmsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading sidebar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    const now = new Date();
    const postDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now - postDate;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  if (loading) {
    return (
      <div className="w-full">
        <Card className="mb-4">
          <Typography.Text type="secondary">Đang tải...</Typography.Text>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Chuyên gia hàng đầu */}
      <Card className="mb-4" title="Chuyên gia hàng đầu">
        {topUsers.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={topUsers}
            renderItem={(user) => (
              <List.Item>
                <List.Item.Meta
                  avatar={
                    <Avatar size={32}>
                      {user.displayName?.charAt(0) || 'U'}
                    </Avatar>
                  }
                  title={user.displayName || 'Người dùng'}
                  description={
                    <Tag color="blue">{user.reputation || 0} uy tín</Tag>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Typography.Text type="secondary">Chưa có dữ liệu</Typography.Text>
        )}
      </Card>

      {/* Tin tức nông nghiệp */}
      <Card 
        className="mb-4"
        title={
          <Space>
            <FileTextOutlined />
            <span>Tin tức nông nghiệp</span>
          </Space>
        }
      >
        {news.length > 0 ? (
          <div>
            {news.map((item, index) => (
              <div key={item.id}>
                <div className="py-3">
                  <Typography.Text 
                    strong
                    className="cursor-pointer hover:text-blue-600 block mb-1"
                  >
                    {item.title || item.content?.substring(0, 60)}
                  </Typography.Text>
                  <Typography.Text type="secondary" className="text-xs">
                    {getTimeAgo(item.createdAt)}
                  </Typography.Text>
                </div>
                {index < news.length - 1 && <Divider />}
              </div>
            ))}
          </div>
        ) : (
          <Typography.Text type="secondary">Chưa có tin tức</Typography.Text>
        )}
      </Card>

      {/* Trang trại nổi bật */}
      <Card 
        title={
          <Space>
            <TrophyOutlined />
            <span>Trang trại nổi bật</span>
          </Space>
        }
      >
        {farms.length > 0 ? (
          <div>
            {farms.map((farm, index) => (
              <div key={farm.id}>
                <div className="py-3">
                  <div className="flex items-start mb-2">
                    <Avatar 
                      src={farm.photoURL} 
                      size={48}
                      className="mr-3"
                    >
                      {farm.displayName?.charAt(0) || 'F'}
                    </Avatar>
                    <div className="flex-1">
                      <Typography.Text strong className="block">
                        {farm.displayName || 'Trang trại'}
                      </Typography.Text>
                      <div className="flex items-center mt-1">
                        <EnvironmentOutlined className="text-xs mr-1 text-gray-500" />
                        <Typography.Text type="secondary" className="text-xs">
                          {farm.location || 'Việt Nam'}
                        </Typography.Text>
                      </div>
                      <Tag color="green" className="mt-1" size="small">
                        {farm.farmType || 'Nông nghiệp'}
                      </Tag>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <TeamOutlined className="text-sm mr-1 text-gray-500" />
                      <Typography.Text type="secondary" className="text-xs">
                        {farm.followersCount || 0} người theo dõi
                      </Typography.Text>
                    </div>
                    <Button size="small" type="default">Theo dõi</Button>
                  </div>
                </div>
                {index < farms.length - 1 && <Divider />}
              </div>
            ))}
          </div>
        ) : (
          <Typography.Text type="secondary">Chưa có trang trại</Typography.Text>
        )}
      </Card>
    </div>
  );
};

export default RightSidebar;