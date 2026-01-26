import React, { useState, useCallback, useEffect } from 'react';
import { doc, updateDoc, increment, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../hooks/useAuth';
import { 
  Avatar, 
  Typography, 
  Space, 
  Button, 
  Dropdown, 
  Tag,
  Image,
  Row,
  Col,
  Statistic,
  Divider,
  message
} from 'antd';
import { 
  HeartOutlined, 
  HeartFilled,
  MessageOutlined, 
  ShareAltOutlined, 
  MoreOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { NongLacCard, CategoryTag } from '../common';
import { nongLacColors } from '../../theme/nongLacTheme';
import VideoPlayer from '../VideoPlayer';
import { useNavigate } from 'react-router-dom';

const { Text, Paragraph } = Typography;

export const EnhancedPostCard = ({
  post,
  onLike,
  onComment,
  onShare,
  onUserClick,
  currentUserId,
  isDetailView = false
}) => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments || 0);

  // Load user's like status
  useEffect(() => {
    if (!user || !post.id) return;
    
    const likeDoc = doc(db, 'likes', `${user.uid}_${post.id}`);
    const unsubscribe = onSnapshot(likeDoc, (doc) => {
      setIsLiked(doc.exists());
    });
    
    return unsubscribe;
  }, [user, post.id]);

  const handleLike = useCallback(async () => {
    if (!user) {
      message.warning('Vui lòng đăng nhập để thích bài viết');
      return;
    }

    try {
      const newLikedState = !isLiked;
      setIsLiked(newLikedState);
      setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);
      
      const likeDoc = doc(db, 'likes', `${user.uid}_${post.id}`);
      const postDoc = doc(db, 'posts', post.id);
      
      if (newLikedState) {
        await setDoc(likeDoc, {
          userId: user.uid,
          postId: post.id,
          createdAt: new Date()
        });
        await updateDoc(postDoc, {
          likes: increment(1)
        });
      } else {
        await deleteDoc(likeDoc);
        await updateDoc(postDoc, {
          likes: increment(-1)
        });
      }
      
      if (onLike) {
        await onLike(post.id, newLikedState);
      }
    } catch (error) {
      console.error('Error handling like:', error);
      // Revert on error
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev + 1 : prev - 1);
      message.error('Có lỗi xảy ra, vui lòng thử lại');
    }
  }, [user, post.id, isLiked, onLike]);

  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Vừa xong';
    
    const now = new Date();
    const postTime = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffInMinutes = Math.floor((now - postTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  const getReputationColor = (reputation) => {
    if (reputation >= 1000) return nongLacColors.primary[600];
    if (reputation >= 500) return nongLacColors.primary[500];
    if (reputation >= 100) return nongLacColors.primary[400];
    return nongLacColors.primary[300];
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title || 'Bài viết từ NôngLạc',
        text: post.content,
        url: `${window.location.origin}/post/${post.id}`
      });
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
      message.success('Đã copy link bài viết!');
    }
    
    if (onShare) {
      onShare(post);
    }
  };

  const handlePostClick = () => {
    navigate(`/post/${post.id}`);
  };

  const handleUserClick = () => {
    if (onUserClick) {
      onUserClick(post.authorId);
    } else {
      navigate(`/user/${post.authorId}`);
    }
  };

  const handleCommentClick = () => {
    setShowComments(!showComments);
    if (onComment) {
      onComment(post.id);
    }
  };

  const menuItems = [
    {
      key: 'save',
      label: 'Lưu bài viết',
    },
    {
      key: 'report',
      label: 'Báo cáo vi phạm',
      danger: true,
    },
  ];

  const getCategoryFromContent = (content) => {
    const keywords = {
      vegetables: ['rau', 'củ', 'cà chua', 'khoai', 'bắp cải'],
      fruits: ['trái cây', 'xoài', 'cam', 'chanh', 'táo'],
      grains: ['lúa', 'gạo', 'ngô', 'lúa mì'],
      livestock: ['heo', 'bò', 'gà', 'vịt', 'chăn nuôi'],
      aquaculture: ['cá', 'tôm', 'thủy sản', 'nuôi trồng thủy sản']
    };
    
    const lowerContent = content.toLowerCase();
    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => lowerContent.includes(word))) {
        return category;
      }
    }
    return 'default';
  };

  const detectedCategory = post.category || getCategoryFromContent(post.content || '');

  return (
    <NongLacCard
      hoverable
      style={{ 
        marginBottom: 16,
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(82, 196, 26, 0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 12px rgba(82, 196, 26, 0.08)';
      }}
      content={
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          {/* Header */}
          <Row justify="space-between" align="top">
            <Col flex="auto">
              <Space size={12}>
                <Avatar 
                  size={48}
                  src={post.authorAvatar}
                  style={{ 
                    backgroundColor: nongLacColors.primary[500],
                    cursor: 'pointer'
                  }}
                  onClick={handleUserClick}
                >
                  {post.authorName?.charAt(0)?.toUpperCase()}
                </Avatar>
                
                <Space direction="vertical" size={2}>
                  <Space align="center">
                    <Text 
                      strong 
                      style={{ 
                        fontSize: 15,
                        cursor: 'pointer',
                        color: '#262626'
                      }}
                      onClick={handleUserClick}
                    >
                      {post.authorName}
                    </Text>
                    
                    {post.authorReputation >= 100 && (
                      <Tag
                        icon={<TrophyOutlined />}
                        color={getReputationColor(post.authorReputation)}
                        style={{
                          borderRadius: 12,
                          fontSize: 10,
                          border: 'none',
                          color: 'white'
                        }}
                      >
                        {post.authorReputation}
                      </Tag>
                    )}
                  </Space>
                  
                  <Space size={8} align="center">
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {formatTimeAgo(post.createdAt)}
                    </Text>
                    
                    {detectedCategory && (
                      <CategoryTag category={detectedCategory} size="small" />
                    )}
                  </Space>
                </Space>
              </Space>
            </Col>
            
            <Col>
              <Dropdown
                menu={{ items: menuItems }}
                trigger={['click']}
                placement="bottomRight"
              >
                <Button 
                  type="text" 
                  icon={<MoreOutlined />} 
                  size="small"
                  style={{ color: '#8C8C8C' }}
                />
              </Dropdown>
            </Col>
          </Row>

          {/* Content */}
          <div 
            onClick={handlePostClick}
            style={{ 
              cursor: 'pointer',
              padding: '8px',
              borderRadius: 8,
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#FAFAFA';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
            title="Click để xem chi tiết bài viết"
          >
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {post.title && (
                <Text 
                  strong 
                  style={{ 
                    fontSize: 16,
                    color: '#262626',
                    lineHeight: 1.4,
                    display: 'block'
                  }}
                >
                  {post.title}
                </Text>
              )}
              
              <Paragraph 
                style={{ 
                  margin: 0,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: '#595959'
                }}
                ellipsis={isDetailView ? false : { 
                  rows: 3, 
                  expandable: true, 
                  symbol: 'Xem thêm' 
                }}
              >
                {post.content}
              </Paragraph>
            </Space>
          </div>

          {/* Media (Images and Videos) */}
          {((post.media && post.media.length > 0) || (post.images && post.images.length > 0)) && (
            <div onClick={handlePostClick} style={{ cursor: 'pointer' }}>
              {/* New media structure */}
              {post.media && post.media.length > 0 ? (
                <div className="media-gallery">
                  {post.media.length === 1 ? (
                    // Single media item
                    post.media[0].type === 'image' ? (
                      <Image
                        src={post.media[0].url}
                        alt={post.title}
                        style={{
                          width: '100%',
                          borderRadius: 8,
                          maxHeight: 400,
                          objectFit: 'cover'
                        }}
                        preview={{
                          mask: (
                            <Space>
                              <EyeOutlined />
                              <span>Xem ảnh</span>
                            </Space>
                          )
                        }}
                      />
                    ) : (
                      <VideoPlayer
                        src={post.media[0].url}
                        poster={post.media[0].thumbnailUrl}
                        controls={true}
                        lazy={false}
                        style={{
                          borderRadius: 8,
                          maxHeight: 400
                        }}
                      />
                    )
                  ) : (
                    // Multiple media items
                    <Row gutter={[8, 8]}>
                      {post.media.slice(0, 4).map((mediaItem, index) => (
                        <Col key={index} span={post.media.length === 2 ? 12 : 6}>
                          {mediaItem.type === 'image' ? (
                            <Image
                              src={mediaItem.url}
                              style={{
                                width: '100%',
                                height: 120,
                                objectFit: 'cover',
                                borderRadius: 8
                              }}
                            />
                          ) : (
                            <VideoPlayer
                              src={mediaItem.url}
                              poster={mediaItem.thumbnailUrl}
                              controls={true}
                              lazy={false}
                              style={{
                                width: '100%',
                                height: 120,
                                borderRadius: 8
                              }}
                            />
                          )}
                          {index === 3 && post.media.length > 4 && (
                            <div style={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 8,
                              color: 'white',
                              fontSize: 16,
                              fontWeight: 'bold'
                            }}>
                              +{post.media.length - 4}
                            </div>
                          )}
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              ) : (
                /* Backward compatibility - old images structure */
                post.images && post.images.length > 0 && (
                  post.images.length === 1 ? (
                    // Single item - check if it's video or image
                    /\.(mp4|mov|avi|wmv|mkv)$/i.test(post.images[0]) ? (
                      <VideoPlayer
                        src={post.images[0]}
                        controls={true}
                        lazy={false}
                        style={{
                          borderRadius: 8,
                          maxHeight: 400
                        }}
                      />
                    ) : (
                      <Image
                        src={post.images[0]}
                        alt={post.title}
                        style={{
                          width: '100%',
                          borderRadius: 8,
                          maxHeight: 400,
                          objectFit: 'cover'
                        }}
                        preview={{
                          mask: (
                            <Space>
                              <EyeOutlined />
                              <span>Xem ảnh</span>
                            </Space>
                          )
                        }}
                      />
                    )
                  ) : (
                    // Multiple items - handle mixed images and videos
                    <Row gutter={[8, 8]}>
                      {post.images.slice(0, 4).map((imageUrl, index) => {
                        const isVideo = /\.(mp4|mov|avi|wmv|mkv)$/i.test(imageUrl);
                        
                        return (
                          <Col key={index} span={post.images.length === 2 ? 12 : 6} style={{ position: 'relative' }}>
                            {isVideo ? (
                              <VideoPlayer
                                src={imageUrl}
                                controls={true}
                                lazy={false}
                                style={{
                                  width: '100%',
                                  height: 120,
                                  borderRadius: 8
                                }}
                              />
                            ) : (
                              <Image
                                src={imageUrl}
                                style={{
                                  width: '100%',
                                  height: 120,
                                  objectFit: 'cover',
                                  borderRadius: 8
                                }}
                              />
                            )}
                            {index === 3 && post.images.length > 4 && (
                              <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 8,
                                color: 'white',
                                fontSize: 16,
                                fontWeight: 'bold'
                              }}>
                                +{post.images.length - 4}
                              </div>
                            )}
                          </Col>
                        );
                      })}
                    </Row>
                  )
                )
              )}
            </div>
          )}

          {/* Source Link */}
          {post.url && (
            <div style={{ marginBottom: 12 }}>
              <Button
                type="link"
                icon={<LinkOutlined />}
                href={post.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: 0,
                  height: 'auto',
                  fontSize: 13,
                  color: nongLacColors.primary[600],
                  fontWeight: 500
                }}
              >
                Đọc bài gốc tại {post.source || 'nguồn'}
              </Button>
            </div>
          )}

          {/* Category Tags */}
          {(post.category || post.source) && (
            <Space wrap style={{ marginBottom: 8 }}>
              {post.category && (
                <Tag 
                  style={{ 
                    fontSize: 11,
                    borderRadius: 12,
                    backgroundColor: '#F6FFED',
                    color: nongLacColors.primary[600],
                    border: `1px solid ${nongLacColors.primary[300]}`
                  }}
                >
                  #{post.category}
                </Tag>
              )}
              {post.source && (
                <Tag 
                  style={{ 
                    fontSize: 11,
                    borderRadius: 12,
                    backgroundColor: '#E6F7FF',
                    color: '#1890FF',
                    border: '1px solid #91D5FF'
                  }}
                >
                  {post.source}
                </Tag>
              )}
            </Space>
          )}

          {/* Stats */}
          <Row gutter={24}>
            <Col>
              <Statistic
                value={likesCount}
                suffix="lượt thích"
                valueStyle={{ 
                  fontSize: 12, 
                  color: '#8C8C8C' 
                }}
              />
            </Col>
            <Col>
              <Statistic
                value={commentCount}
                suffix="bình luận"
                valueStyle={{ 
                  fontSize: 12, 
                  color: '#8C8C8C' 
                }}
              />
            </Col>
            <Col>
              <Statistic
                value={post.shares || 0}
                suffix="chia sẻ"
                valueStyle={{ 
                  fontSize: 12, 
                  color: '#8C8C8C' 
                }}
              />
            </Col>
          </Row>

          <Divider style={{ margin: '8px 0' }} />

          {/* Actions */}
          <Row gutter={8}>
            <Col flex="auto">
              <Button
                type="text"
                icon={isLiked ? <HeartFilled /> : <HeartOutlined />}
                onClick={handleLike}
                style={{
                  width: '100%',
                  height: 40,
                  borderRadius: 8,
                  color: isLiked ? nongLacColors.error : '#8C8C8C',
                  fontWeight: 500
                }}
              >
                {isLiked ? 'Đã thích' : 'Thích'}
              </Button>
            </Col>
            
            <Col flex="auto">
              <Button
                type="text"
                icon={<MessageOutlined />}
                onClick={handleCommentClick}
                style={{
                  width: '100%',
                  height: 40,
                  borderRadius: 8,
                  color: '#8C8C8C',
                  fontWeight: 500
                }}
              >
                Bình luận
              </Button>
            </Col>
            
            <Col flex="auto">
              <Button
                type="text"
                icon={<ShareAltOutlined />}
                onClick={handleShare}
                style={{
                  width: '100%',
                  height: 40,
                  borderRadius: 8,
                  color: '#8C8C8C',
                  fontWeight: 500
                }}
              >
                Chia sẻ
              </Button>
            </Col>
          </Row>

          {/* Comments Section */}
          {showComments && (
            <div style={{ 
              marginTop: 16,
              padding: '16px 0',
              borderTop: '1px solid #F0F0F0'
            }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Tính năng bình luận đang được phát triển...
              </Text>
            </div>
          )}
        </Space>
      }
    />
  );
};

export default EnhancedPostCard;