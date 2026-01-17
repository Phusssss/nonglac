import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { 
  Card, 
  Avatar, 
  Button, 
  Typography, 
  Tag, 
  Row, 
  Col, 
  Statistic, 
  Tabs, 
  Empty,
  Space,
  Spin
} from 'antd';
import { 
  MessageOutlined, 
  EnvironmentOutlined, 
  StarOutlined,
  UserOutlined 
} from '@ant-design/icons';
import { db } from '../firebase/config';
import PostCard from '../components/PostCard';
import FollowButton from '../components/FollowButton';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../contexts/ChatContext';

const { Title, Text, Paragraph } = Typography;

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { startChat } = useChat();
  const [userProfile, setUserProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await fetchUserProfile();
      await fetchUserPosts();
      loadFollowStats();
    };
    
    fetchData();
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUserProfile({ id: userDoc.id, ...userDoc.data() });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const postsQuery = query(
        collection(db, 'posts'),
        where('authorId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(postsQuery);
      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setUserPosts(posts);
    } catch (error) {
      console.error('Error fetching user posts:', error);
    }
  };

  const loadFollowStats = () => {
    const followersQuery = query(
      collection(db, 'follows'),
      where('followingId', '==', userId)
    );
    const unsubscribeFollowers = onSnapshot(followersQuery, (snapshot) => {
      setFollowers(snapshot.docs.length);
    });

    const followingQuery = query(
      collection(db, 'follows'),
      where('followerId', '==', userId)
    );
    const unsubscribeFollowing = onSnapshot(followingQuery, (snapshot) => {
      setFollowing(snapshot.docs.length);
    });

    return () => {
      unsubscribeFollowers();
      unsubscribeFollowing();
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        <Empty 
          description="Không tìm thấy người dùng"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
        <Button 
          type="primary"
          onClick={() => navigate('/')}
          className="mt-4"
        >
          Về trang chủ
        </Button>
      </div>
    );
  }

  const getReputationLevel = (reputation) => {
    if (reputation >= 1000) return 'Chuyên gia';
    if (reputation >= 500) return 'Người có kinh nghiệm';
    if (reputation >= 100) return 'Thành viên tích cực';
    if (reputation >= 50) return 'Thành viên';
    return 'Người mới';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <Row gutter={[24, 24]}>
          {/* Profile Header */}
          <Col span={24}>
            <Card className="mb-6">
              <Row gutter={[24, 24]} align="middle">
                <Col xs={24} md={6} className="text-center md:text-left">
                  <Avatar 
                    size={120}
                    src={userProfile?.avatar}
                    icon={<UserOutlined />}
                    className="mb-4"
                  >
                    {!userProfile?.avatar && userProfile?.displayName?.charAt(0)}
                  </Avatar>
                </Col>
                
                <Col xs={24} md={12}>
                  <Title level={2} className="mb-2">
                    {userProfile?.displayName || 'Người dùng'}
                  </Title>
                  <Tag color="green" className="mb-2">
                    {getReputationLevel(userProfile?.reputation || 0)}
                  </Tag>
                  <Paragraph className="text-gray-500 mb-2">
                    {userProfile?.email}
                  </Paragraph>
                  
                  <Space className="text-gray-500">
                    <Space>
                      <EnvironmentOutlined />
                      <Text>{userProfile?.location || 'Việt Nam'}</Text>
                    </Space>
                    <Space>
                      <StarOutlined />
                      <Text>{userProfile?.reputation || 0} điểm uy tín</Text>
                    </Space>
                  </Space>
                </Col>
                
                <Col xs={24} md={6} className="text-center md:text-right">
                  <Space direction="vertical" size="middle" className="w-full">
                    <FollowButton targetUserId={userId} />
                    {user && user.uid !== userId && (
                      <Button 
                        type="primary"
                        icon={<MessageOutlined />}
                        onClick={async () => {
                          await startChat(userId, userProfile.displayName);
                          navigate('/messages');
                        }}
                        className="w-full"
                        style={{ 
                          backgroundColor: '#52c41a', 
                          borderColor: '#52c41a',
                          color: '#fff'
                        }}
                      >
                        Nhắn tin
                      </Button>
                    )}
                  </Space>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Main Content */}
          <Col xs={24} lg={8}>
            {/* About Section */}
            <Card title="Giới thiệu" className="mb-6">
              <Paragraph>
                {userProfile?.about || 'Chưa có thông tin giới thiệu.'}
              </Paragraph>
            </Card>
            
            {/* Skills Section */}
            <Card title="Chuyên môn" className="mb-6">
              <Space wrap>
                {['Trồng trọt', 'Chăn nuôi', 'Thủy sản', 'Nông nghiệp bền vững', 'Công nghệ nông nghiệp'].map((skill) => (
                  <Tag key={skill} color="green">
                    {skill}
                  </Tag>
                ))}
              </Space>
            </Card>
            
            {/* Stats Section */}
            <Card>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic 
                    title="Người theo dõi" 
                    value={followers}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="Đang theo dõi" 
                    value={following}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic 
                    title="Bài viết" 
                    value={userPosts.length}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Posts Section */}
          <Col xs={24} lg={16}>
            <Card>
              <Tabs 
                defaultActiveKey="posts"
                items={[
                  {
                    key: 'posts',
                    label: 'Bài viết gần đây',
                    children: (
                      <div className="space-y-6">
                        {userPosts.length === 0 ? (
                          <Empty 
                            description="Người dùng chưa có bài viết nào"
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                          />
                        ) : (
                          userPosts.map((post) => (
                            <PostCard key={post.id} post={post} />
                          ))
                        )}
                      </div>
                    )
                  }
                ]}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default UserProfile;