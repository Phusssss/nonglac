import React, { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, query, orderBy, where, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { 
  Layout, 
  Row, 
  Col, 
  Card, 
  Avatar, 
  Button, 
  Input, 
  Select, 
  Modal, 
  Form, 
  Space, 
  Typography, 
  Tag, 
  Spin, 
  Divider,
  Statistic,
  Badge
} from 'antd';
import { 
  PlusOutlined, 
  TrophyOutlined, 
  RiseOutlined, 
  FallOutlined,
  UserOutlined,
  EditOutlined,
  FireOutlined,
  TeamOutlined
} from '@ant-design/icons';

import { logUserAction, ACTIONS } from '../utils/analytics';
import PostCard from '../components/PostCard';
import { EnhancedPostCard } from '../components/enhanced/EnhancedPostCard';
import GitHubImageUpload from '../components/GitHubImageUpload';
import CoffeePrices from '../components/CoffeePrices';
import RightSidebar from '../components/RightSidebar';
import WeatherWidget from '../components/WeatherWidget';
import SEO from '../components/SEO';
import FloatingChatButton from '../components/FloatingChatButton';
import { NongLacCard, PriceDisplay, CategoryTag } from '../components/common';
import { useNavigate } from 'react-router-dom';

const { Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;


const Home = () => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [firebasePosts, setFirebasePosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', category: '', images: [] });
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [savedPosts, setSavedPosts] = useState(new Set());
  const [followedUsers, setFollowedUsers] = useState(new Set());
  const [showComments, setShowComments] = useState(new Set());
  const [newComment, setNewComment] = useState({});
  
  const POSTS_PER_PAGE = 10;
  const categories = [
    { key: 'vegetables', label: 'Trồng trọt', icon: '🌾' },
    { key: 'livestock', label: 'Chăn nuôi', icon: '🐖' },
    { key: 'aquaculture', label: 'Thủy sản', icon: '🐟' },
    { key: 'grains', label: 'Máy nông nghiệp', icon: '🚜' },
    { key: 'fruits', label: 'Thị trường & Giá cả', icon: '💰' },
    { key: 'default', label: 'Chính sách', icon: '📜' }
  ];

  const categoryMapping = {
    'Cây trồng': 'Trồng trọt',
    'Chăn nuôi': 'Chăn nuôi',
    'Công nghệ': 'Công nghệ nông nghiệp',
    'Thị trường': 'Thị trường'
  };

  const handleCategoryClick = (displayName) => {
    const category = categoryMapping[displayName] || displayName;
    setSelectedCategory(category);
  };

  const handleTopicClick = (topic) => {
    setSelectedCategory(topic);
  };

  const toggleLike = (postId) => {
    setLikedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const toggleSave = (postId) => {
    setSavedPosts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const toggleFollow = (userId) => {
    setFollowedUsers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleShare = (post) => {
    if (navigator.share) {
      navigator.share({
        title: post.title || 'Bài viết từ NôngLạc',
        text: post.content,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Đã copy link bài viết!');
    }
  };

  const toggleComments = (postId) => {
    setShowComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleAddComment = (postId) => {
    const comment = newComment[postId];
    if (!comment?.trim()) return;
    
    // Add comment logic here
    console.log('Adding comment:', comment, 'to post:', postId);
    
    // Clear comment input
    setNewComment(prev => ({ ...prev, [postId]: '' }));
  };

  // Removed fake data - will load from Firebase

  const [trendingTopics, setTrendingTopics] = useState([]);
  const [topContributors, setTopContributors] = useState([]);

  // Load trending topics and top contributors from Firestore
  useEffect(() => {
    const loadTrendingTopics = async () => {
      try {
        const postsSnapshot = await getDocs(collection(db, 'posts'));
        const categoryCount = {};
        const userPosts = {};
        
        postsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          const category = data.category;
          if (category) {
            categoryCount[category] = (categoryCount[category] || 0) + 1;
          }
          
          const authorId = data.authorId;
          if (authorId) {
            if (!userPosts[authorId]) {
              userPosts[authorId] = {
                name: data.authorName || 'Anonymous',
                avatar: data.authorAvatar,
                reputation: data.authorReputation || 0,
                posts: 0
              };
            }
            userPosts[authorId].posts += 1;
          }
        });
        
        const trending = Object.entries(categoryCount)
          .map(([topic, posts]) => ({ topic, posts }))
          .sort((a, b) => b.posts - a.posts)
          .slice(0, 5);
          
        const contributors = Object.values(userPosts)
          .sort((a, b) => b.reputation - a.reputation)
          .slice(0, 5);
          
        setTrendingTopics(trending);
        setTopContributors(contributors);
      } catch (error) {
        console.error('Error loading trending topics:', error);
        setTrendingTopics([]);
        setTopContributors([]);
      }
    };
    
    loadTrendingTopics();
  }, [posts]);

  const loadInitialPosts = useCallback(async () => {
    setLoading(true);
    setFirebasePosts([]);
    setLastDoc(null);
    setHasMore(true);
    
    try {
      let q;
      if (selectedCategory === 'Tất cả') {
        q = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(POSTS_PER_PAGE)
        );
      } else {
        q = query(
          collection(db, 'posts'),
          where('category', '==', selectedCategory),
          orderBy('createdAt', 'desc'),
          limit(POSTS_PER_PAGE)
        );
      }
      
      const snapshot = await getDocs(q);
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setFirebasePosts(postsData);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === POSTS_PER_PAGE);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);
  
  const loadMorePosts = useCallback(async () => {
    if (!hasMore || loadingMore || !lastDoc) return;
    
    setLoadingMore(true);
    try {
      let q;
      if (selectedCategory === 'Tất cả') {
        q = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(POSTS_PER_PAGE)
        );
      } else {
        q = query(
          collection(db, 'posts'),
          where('category', '==', selectedCategory),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(POSTS_PER_PAGE)
        );
      }
      
      const snapshot = await getDocs(q);
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (newPosts.length > 0) {
        setFirebasePosts(prev => [...prev, ...newPosts]);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(newPosts.length === POSTS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [selectedCategory, lastDoc, hasMore, loadingMore]);
  
  useEffect(() => {
    loadInitialPosts();
  }, [loadInitialPosts]);
  
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore) return;
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      
      if (scrollHeight - scrollTop <= clientHeight + 100) {
        loadMorePosts();
      }
    };
    
    const throttledScroll = throttle(handleScroll, 200);
    window.addEventListener('scroll', throttledScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledScroll);
  }, [loadMorePosts, loadingMore, hasMore]);
  
  const throttle = (func, delay) => {
    let timeoutId;
    let lastExecTime = 0;
    return function (...args) {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  };

  useEffect(() => {
    const uniquePosts = firebasePosts.filter((post, index, self) => 
      index === self.findIndex(p => p.id === post.id)
    );
    setPosts(uniquePosts);
  }, [firebasePosts]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter(post => 
        post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.authorName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  }, [posts, searchTerm]);

  const handleSubmit = async () => {
    if (!user || !newPost.title || !newPost.content) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }

    setSubmitting(true);
    try {
      const imageUrls = newPost.images || [];

      const postData = {
        title: newPost.title || '',
        content: newPost.content || '',
        category: newPost.category || 'Khác',
        images: imageUrls || [],
        authorId: user.uid,
        authorName: userProfile?.displayName || user.email || 'Anonymous',
        authorAvatar: userProfile?.avatar || null,
        authorReputation: userProfile?.reputation || 0,
        createdAt: new Date(),
        likes: 0,
        comments: 0
      };

      const docRef = await addDoc(collection(db, 'posts'), postData);
      await logUserAction(user.uid, userProfile?.displayName || user.email, ACTIONS.CREATE_POST, { postId: docRef.id, category: postData.category });
      setNewPost({ title: '', content: '', category: '', images: [] });
      setOpen(false);
    } catch (error) {
      console.error('Full error:', error);
      alert('Lỗi khi đăng bài: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <SEO 
        title="NôngLạc - Mạng xã hội nông nghiệp Việt Nam"
        description="Kết nối cộng đồng nông dân Việt Nam. Chia sẻ kinh nghiệm trồng trọt, chăn nuôi, cập nhật giá nông sản mới nhất."
        keywords="nông nghiệp việt nam, nông dân, trồng trọt, chăn nuôi, giá nông sản, cộng đồng nông nghiệp"
      />
      
      <Layout style={{ minHeight: '100vh', backgroundColor: '#F6FFED' }}>
        <Content style={{ padding: '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
          <Row gutter={[24, 24]}>
            
            {/* Left Sidebar - User Profile & Categories */}
            <Col xs={0} lg={6}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                
                {/* User Profile Card */}
                {user ? (
                  <NongLacCard
                    content={
                      <div style={{ textAlign: 'center' }}>
                        <Avatar 
                          size={80}
                          src={userProfile?.avatar}
                          style={{ 
                            backgroundColor: '#52C41A',
                            marginBottom: 16,
                            border: '4px solid #F6FFED'
                          }}
                        >
                          {userProfile?.displayName?.charAt(0) || 'U'}
                        </Avatar>
                        
                        <Title level={4} style={{ margin: '0 0 8px 0' }}>
                          {userProfile?.displayName || user?.email || 'Guest'}
                        </Title>
                        
                        <Tag 
                          color={userProfile?.reputation >= 100 ? '#52C41A' : '#73D13D'}
                          style={{ marginBottom: 16 }}
                        >
                          {userProfile?.reputation >= 100 ? 'Chuyên gia' : 'Nông dân tiên tiến'}
                        </Tag>
                        
                        <Divider style={{ margin: '16px 0' }} />
                        
                        <Row gutter={16}>
                          <Col span={12}>
                            <Statistic
                              title="Bài viết"
                              value={userProfile?.postsCount || 0}
                              valueStyle={{ fontSize: 16, color: '#262626' }}
                            />
                          </Col>
                          <Col span={12}>
                            <Statistic
                              title="Uy tín"
                              value={userProfile?.reputation || 0}
                              valueStyle={{ fontSize: 16, color: '#52C41A' }}
                            />
                          </Col>
                        </Row>
                      </div>
                    }
                  />
                ) : (
                  <NongLacCard
                    content={
                      <div style={{ textAlign: 'center' }}>
                        <Avatar 
                          size={80}
                          icon={<UserOutlined />}
                          style={{ 
                            backgroundColor: '#D9D9D9',
                            marginBottom: 16
                          }}
                        />
                        
                        <Title level={4} style={{ margin: '0 0 16px 0' }}>
                          Chào mừng đến NôngLạc
                        </Title>
                        
                        <Button 
                          type="primary"
                          size="large"
                          block
                          onClick={() => navigate('/login')}
                          style={{ marginBottom: 8 }}
                        >
                          Đăng nhập
                        </Button>
                        
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          Đăng nhập để tham gia cộng đồng
                        </Text>
                      </div>
                    }
                  />
                )}

                {/* Categories Menu */}
                <NongLacCard
                  title="Danh mục thảo luận"
                  content={
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      {categories.map((cat) => (
                        <Button
                          key={cat.key}
                          type={selectedCategory === cat.label ? 'primary' : 'text'}
                          block
                          style={{ 
                            textAlign: 'left',
                            height: 'auto',
                            padding: '8px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start'
                          }}
                          onClick={() => setSelectedCategory(cat.label)}
                        >
                          <span style={{ marginRight: 8 }}>{cat.icon}</span>
                          {cat.label}
                        </Button>
                      ))}
                    </Space>
                  }
                />

                {/* Trending Topics */}
                <NongLacCard
                  title={
                    <Space>
                      <FireOutlined style={{ color: '#52C41A' }} />
                      <span>Chủ đề hot</span>
                    </Space>
                  }
                  content={
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                      {trendingTopics.map((item, index) => (
                        <div
                          key={index}
                          onClick={() => setSelectedCategory(item.topic)}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 12px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            backgroundColor: selectedCategory === item.topic ? '#F6FFED' : 'transparent',
                            borderLeft: selectedCategory === item.topic ? '4px solid #52C41A' : 'none',
                            transition: 'all 0.3s ease'
                          }}
                        >
                          <Text style={{ fontSize: 14, fontWeight: 500 }}>
                            {item.topic}
                          </Text>
                          <Badge 
                            count={item.posts} 
                            style={{ backgroundColor: '#52C41A' }}
                          />
                        </div>
                      ))}
                      {trendingTopics.length === 0 && (
                        <Text type="secondary" style={{ fontSize: 12, fontStyle: 'italic' }}>
                          Chưa có chủ đề nào
                        </Text>
                      )}
                    </Space>
                  }
                />
              </Space>
            </Col>

            {/* Main Content - Posts Feed */}
            <Col xs={24} lg={12}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                
                {/* Trending Topics - Mobile Only */}
                <Col xs={24} lg={0}>
                  <NongLacCard
                    title={
                      <Space>
                        <RiseOutlined style={{ color: '#52C41A' }} />
                        <span>Chủ đề thịnh hành</span>
                      </Space>
                    }
                    content={
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        {trendingTopics.map((item, index) => (
                          <div
                            key={index}
                            onClick={() => handleTopicClick(item.topic)}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '8px 12px',
                              borderRadius: 8,
                              cursor: 'pointer',
                              backgroundColor: selectedCategory === item.topic ? '#F6FFED' : '#FAFAFA',
                              borderLeft: selectedCategory === item.topic ? '4px solid #52C41A' : 'none',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <Text style={{ fontSize: 14, fontWeight: 500 }}>
                              {item.topic}
                            </Text>
                            <Badge count={item.posts} style={{ backgroundColor: '#52C41A' }} />
                          </div>
                        ))}
                      </Space>
                    }
                  />
                </Col>

                {/* Create Post */}
                <NongLacCard
                  content={
                    <Space style={{ width: '100%' }}>
                      <Avatar 
                        size={40}
                        src={userProfile?.avatar}
                        style={{ backgroundColor: '#52C41A' }}
                      >
                        {user ? (userProfile?.displayName?.charAt(0) || 'U') : 'G'}
                      </Avatar>
                      
                      <Input
                        placeholder="Chia sẻ kinh nghiệm nông nghiệp..."
                        onClick={() => setOpen(true)}
                        style={{ 
                          flex: 1,
                          borderRadius: 20,
                          cursor: 'pointer'
                        }}
                        readOnly
                      />
                      
                      <Button 
                        type="primary"
                        icon={<EditOutlined />}
                        onClick={() => setOpen(true)}
                        style={{ borderRadius: 20 }}
                      >
                        Đăng
                      </Button>
                    </Space>
                  }
                />

                {/* Posts */}
                <div>
                  {loading ? (
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                      {Array.from({ length: 3 }).map((_, index) => (
                        <NongLacCard key={index} loading />
                      ))}
                    </Space>
                  ) : filteredPosts.length === 0 ? (
                    <NongLacCard
                      content={
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                          <Text type="secondary">
                            {searchTerm ? 'Không tìm thấy bài viết nào.' : 'Chưa có bài viết nào trong danh mục này.'}
                          </Text>
                        </div>
                      }
                    />
                  ) : (
                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                      {filteredPosts.map((post, index) => (
                        <div 
                          key={post.id}
                          style={{
                            opacity: 0,
                            animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`
                          }}
                        >
                          <EnhancedPostCard 
                          post={post}
                          currentUserId={user?.uid}
                          onUserClick={(userId) => navigate(`/user/${userId}`)}
                        />
                        </div>
                      ))}
                      
                      {loadingMore && (
                        <div style={{ textAlign: 'center', padding: '24px' }}>
                          <Spin size="large" />
                          <div style={{ marginTop: 12 }}>
                            <Text type="secondary">Đang tải thêm bài viết...</Text>
                          </div>
                        </div>
                      )}
                      
                      {!hasMore && filteredPosts.length > 0 && (
                        <div style={{ textAlign: 'center', padding: '24px' }}>
                          <Tag color="#52C41A" style={{ fontSize: 14, padding: '8px 16px' }}>
                            🎉 Đã xem hết tất cả bài viết
                          </Tag>
                        </div>
                      )}
                    </Space>
                  )}
                </div>
              </Space>
            </Col>

            {/* Right Sidebar - Weather & Market Prices */}
            <Col xs={0} lg={6}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <WeatherWidget />

                {/* Quick Market Prices */}
                <NongLacCard
                  title={
                    <Space>
                      <span>Giá nông sản 24h</span>
                      <Tag color="success" size="small">Live</Tag>
                    </Space>
                  }
                  content={
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text>Lúa OM 5451</Text>
                        <PriceDisplay 
                          currentPrice={8200} 
                          previousPrice={8000}
                          unit="đ/kg"
                          size="small"
                        />
                      </div>
                      
                      <Divider style={{ margin: '8px 0' }} />
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text>Cà phê Robusta</Text>
                        <PriceDisplay 
                          currentPrice={120000} 
                          previousPrice={125000}
                          unit="đ/kg"
                          size="small"
                        />
                      </div>
                      
                      <Divider style={{ margin: '8px 0' }} />
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text>Tiêu đen</Text>
                        <PriceDisplay 
                          currentPrice={95000} 
                          previousPrice={95000}
                          unit="đ/kg"
                          size="small"
                        />
                      </div>
                      
                      <Button 
                        type="link" 
                        block
                        onClick={() => navigate('/gia-nong-san')}
                        style={{ marginTop: 8 }}
                      >
                        Xem tất cả
                      </Button>
                    </Space>
                  }
                />

                {/* Top Experts */}
                <NongLacCard
                  title={
                    <Space>
                      <TrophyOutlined style={{ color: '#FAAD14' }} />
                      <span>Chuyên gia tuần này</span>
                    </Space>
                  }
                  content={
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                      {topContributors.slice(0, 3).map((contributor, idx) => (
                        <div 
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '8px 12px',
                            borderRadius: 8,
                            cursor: 'pointer',
                            transition: 'background-color 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#F6FFED'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <Avatar 
                            size={40}
                            src={contributor.avatar}
                            style={{ backgroundColor: '#52C41A' }}
                          >
                            {contributor.name?.charAt(0)}
                          </Avatar>
                          
                          <div style={{ flex: 1 }}>
                            <Text strong style={{ fontSize: 14 }}>
                              {contributor.name}
                            </Text>
                            <div>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {contributor.posts} bài viết
                              </Text>
                            </div>
                          </div>
                          
                          <div style={{ textAlign: 'right' }}>
                            <Text strong style={{ fontSize: 12, color: '#52C41A' }}>
                              {contributor.reputation} ⭐
                            </Text>
                          </div>
                        </div>
                      ))}
                      
                      <Button 
                        block
                        style={{ marginTop: 16 }}
                        onClick={() => navigate('/register')}
                      >
                        <TeamOutlined /> Đăng ký chuyên gia
                      </Button>
                    </Space>
                  }
                />
              </Space>
            </Col>

          </Row>
        </Content>
      </Layout>

      {/* Create Post Modal */}
      <Modal
        title="Tạo bài viết mới"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={600}
        style={{ top: 20 }}
      >
        <Form layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Tiêu đề"
            required
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input
              placeholder="Nhập tiêu đề bài viết..."
              value={newPost.title}
              onChange={(e) => setNewPost({...newPost, title: e.target.value})}
              size="large"
            />
          </Form.Item>
          
          <Form.Item
            label="Danh mục"
            required
            rules={[{ required: true, message: 'Vui lòng chọn danh mục!' }]}
          >
            <Select
              placeholder="Chọn danh mục"
              value={newPost.category}
              onChange={(value) => setNewPost({...newPost, category: value})}
              size="large"
            >
              {categories.map(cat => (
                <Option key={cat.key} value={cat.label}>
                  <Space>
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            label="Nội dung"
            required
            rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
          >
            <TextArea
              placeholder="Chia sẻ kinh nghiệm, kiến thức nông nghiệp của bạn..."
              value={newPost.content}
              onChange={(e) => setNewPost({...newPost, content: e.target.value})}
              rows={6}
              showCount
              maxLength={2000}
            />
          </Form.Item>
          
          <Form.Item label="Hình ảnh">
            <GitHubImageUpload 
              onUploadComplete={(imageUrl) => {
                setNewPost(prev => ({...prev, images: [...(prev.images || []), imageUrl]}));
              }}
            />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setOpen(false)}>
                Hủy
              </Button>
              <Button 
                type="primary"
                htmlType="submit"
                loading={submitting}
                size="large"
              >
                {submitting ? 'Đang đăng...' : 'Đăng bài'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Floating Action Button - Mobile */}
      <Button
        type="primary"
        shape="circle"
        size="large"
        icon={<PlusOutlined />}
        onClick={() => user ? setOpen(true) : navigate('/login')}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          width: 56,
          height: 56,
          zIndex: 1000,
          display: 'none'
        }}
        className="mobile-fab"
      />

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 992px) {
          .mobile-fab {
            display: flex !important;
            align-items: center;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
};

export default Home;