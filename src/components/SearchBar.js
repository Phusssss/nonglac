import React, { useState, useEffect } from 'react';
import { AutoComplete, Avatar, Typography } from 'antd';
import { SearchOutlined, TrophyOutlined } from '@ant-design/icons';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchTerm.length > 2) {
      searchContent();
    } else {
      setSuggestions([]);
    }
  }, [searchTerm]);

  const searchContent = async () => {
    setLoading(true);
    try {
      const results = [];
      
      // Search posts
      const postsQuery = query(
        collection(db, 'posts'),
        where('title', '>=', searchTerm),
        where('title', '<=', searchTerm + '\uf8ff'),
        limit(5)
      );
      const postsSnapshot = await getDocs(postsQuery);
      postsSnapshot.docs.forEach(doc => {
        results.push({
          id: doc.id,
          type: 'post',
          title: doc.data().title,
          subtitle: doc.data().authorName,
          path: `/post/${doc.id}`
        });
      });

      // Search users
      const usersQuery = query(
        collection(db, 'users'),
        where('displayName', '>=', searchTerm),
        where('displayName', '<=', searchTerm + '\uf8ff'),
        limit(3)
      );
      const usersSnapshot = await getDocs(usersQuery);
      usersSnapshot.docs.forEach(doc => {
        results.push({
          id: doc.id,
          type: 'user',
          title: doc.data().displayName,
          subtitle: `Uy tín: ${doc.data().reputation || 0}`,
          path: `/profile/${doc.id}`
        });
      });

      setSuggestions(results);
    } catch (error) {
      console.error('Search error:', error);
    }
    setLoading(false);
  };

  const handleSelect = (value, option) => {
    if (option && option.path) {
      navigate(option.path);
      setSearchTerm('');
    }
  };

  const options = suggestions.map(item => ({
    value: item.title,
    label: (
      <div className="flex items-center">
        <Avatar 
          size="small" 
          className="mr-2"
          style={{ 
            backgroundColor: item.type === 'post' ? '#1890ff' : '#52c41a' 
          }}
        >
          {item.type === 'post' ? <TrophyOutlined /> : item.title.charAt(0)}
        </Avatar>
        <div>
          <div className="text-sm">{item.title}</div>
          <Typography.Text type="secondary" className="text-xs">
            {item.subtitle}
          </Typography.Text>
        </div>
      </div>
    ),
    path: item.path
  }));

  return (
    <AutoComplete
      style={{ minWidth: 300 }}
      options={options}
      value={searchTerm}
      onSearch={setSearchTerm}
      onSelect={handleSelect}
      placeholder="Tìm kiếm bài viết, người dùng..."
      allowClear
    >
      <div className="relative">
        <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input 
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Tìm kiếm bài viết, người dùng..."
        />
      </div>
    </AutoComplete>
  );
};

export default SearchBar;