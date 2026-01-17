import React, { useState, useEffect } from 'react';
import { Card, Typography, List, Tag, Space } from 'antd';
import { 
  TrophyOutlined, 
  BugOutlined, 
  ToolOutlined, 
  ShopOutlined, 
  QuestionCircleOutlined,
  RiseOutlined 
} from '@ant-design/icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';

const Sidebar = ({ selectedCategory, onCategoryChange }) => {
  const [categoryCounts, setCategoryCounts] = useState({});
  const [trendingTopics, setTrendingTopics] = useState([]);

  const categories = [
    { name: 'Tất cả', icon: <TrendingUp /> },
    { name: 'Trồng trọt', icon: <LocalFlorist /> },
    { name: 'Chăn nuôi', icon: <Pets /> },
    { name: 'Thủy sản', icon: <Water /> },
    { name: 'Công nghệ nông nghiệp', icon: <Engineering /> },
    { name: 'Thị trường', icon: <Store /> },
    { name: 'Khác', icon: <Help /> }
  ];

  useEffect(() => {
    loadCategoryCounts();
    loadTrendingTopics();
  }, []);

  const loadCategoryCounts = async () => {
    try {
      const postsSnapshot = await getDocs(collection(db, 'posts'));
      const counts = {};
      
      postsSnapshot.docs.forEach(doc => {
        const category = doc.data().category || 'Khác';
        counts[category] = (counts[category] || 0) + 1;
      });
      
      counts['Tất cả'] = postsSnapshot.size;
      setCategoryCounts(counts);
    } catch (error) {
      console.error('Error loading category counts:', error);
    }
  };

  const loadTrendingTopics = async () => {
    try {
      const postsSnapshot = await getDocs(
        query(collection(db, 'posts'))
      );
      
      // Extract unique topics from recent posts
      const topics = postsSnapshot.docs
        .slice(0, 5)
        .map(doc => doc.data().title || doc.data().content?.substring(0, 30))
        .filter(Boolean);
      
      setTrendingTopics(topics);
    } catch (error) {
      console.error('Error loading trending topics:', error);
    }
  };

  return (
    <div className="w-70">
      <Card className="mb-4" title="Danh mục">
        <List
          dataSource={categories}
          renderItem={(cat) => (
            <List.Item
              className={`cursor-pointer rounded p-2 mb-1 ${
                selectedCategory === cat.name ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
              }`}
              onClick={() => onCategoryChange(cat.name)}
            >
              <List.Item.Meta
                avatar={cat.icon}
                title={cat.name}
              />
              <Tag color="blue">{categoryCounts[cat.name] || 0}</Tag>
            </List.Item>
          )}
        />
      </Card>

      <Card title="Chủ đề hot">
        <Space wrap>
          {trendingTopics.map((topic, index) => (
            <Tag
              key={index}
              className="cursor-pointer"
              onClick={() => {}}
            >
              {topic}
            </Tag>
          ))}
        </Space>
      </Card>
    </div>
  );
};

export default Sidebar;