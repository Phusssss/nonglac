import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Button, Modal } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { collection, query, orderBy, where, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../hooks/useAuth';
import { useAuthGuard } from '../../../hooks/useAuthGuard';
import SEO from '../../../components/SEO';
import LoginModal from '../../../components/common/LoginModal';
import CreatePostForm from './CreatePostForm';
import CategoryFilter from './CategoryFilter';
import PostsList from './PostsList';
import RightSidebar from './RightSidebar';
import { HOME_CONSTANTS } from '../constants';

const HomePage = () => {
  const { user, userProfile } = useAuth();
  const { showLoginModal, setShowLoginModal } = useAuthGuard();
  const [searchParams] = useSearchParams();
  
  // Posts state
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  
  // Filter state
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [filteredPosts, setFilteredPosts] = useState([]);
  
  // Sidebar state
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  
  // Get search term from URL params
  const searchTerm = searchParams.get('search') || '';

  // Filter posts based on category and search term
  useEffect(() => {
    let filtered = posts;
    
    // Filter by category
    if (selectedCategory !== 'Tất cả') {
      filtered = filtered.filter(post => 
        post.category === selectedCategory || 
        (post.category && post.category.includes(selectedCategory))
      );
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(post =>
        post.title?.toLowerCase().includes(searchLower) ||
        post.content?.toLowerCase().includes(searchLower) ||
        post.authorName?.toLowerCase().includes(searchLower)
      );
    }
    
    setFilteredPosts(filtered);
  }, [posts, selectedCategory, searchTerm]);

  // Load trending topics and top contributors
  useEffect(() => {
    if (posts.length === 0) return;

    try {
      // Calculate trending topics
      const categoryCount = {};
      posts.forEach(post => {
        if (post.category) {
          categoryCount[post.category] = (categoryCount[post.category] || 0) + 1;
        }
      });

      const trending = Object.entries(categoryCount)
        .map(([topic, count]) => ({ topic, posts: count }))
        .sort((a, b) => b.posts - a.posts)
        .slice(0, 5);

      // Calculate top contributors
      const authorCount = {};
      posts.forEach(post => {
        if (post.authorName) {
          authorCount[post.authorName] = (authorCount[post.authorName] || 0) + 1;
        }
      });

      const contributors = Object.entries(authorCount)
        .map(([name, count]) => ({ name, posts: count }))
        .sort((a, b) => b.posts - a.posts)
        .slice(0, 5);

      setTrendingTopics(trending);
      setTopContributors(contributors);
    } catch (error) {
      console.error('Error calculating trending data:', error);
      setTrendingTopics([]);
      setTopContributors([]);
    }
  }, [posts]);

  // Load initial posts
  const loadInitialPosts = useCallback(async () => {
    setLoading(true);
    setPosts([]);
    setLastDoc(null);
    setHasMore(true);
    
    try {
      let q;
      if (searchTerm.trim()) {
        // Load more posts for search
        q = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(50)
        );
      } else if (selectedCategory === 'Tất cả') {
        q = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(HOME_CONSTANTS.POSTS_PER_PAGE)
        );
      } else {
        q = query(
          collection(db, 'posts'),
          where('category', '==', selectedCategory),
          orderBy('createdAt', 'desc'),
          limit(HOME_CONSTANTS.POSTS_PER_PAGE)
        );
      }
      
      const snapshot = await getDocs(q);
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setPosts(postsData);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(!searchTerm.trim() && snapshot.docs.length === HOME_CONSTANTS.POSTS_PER_PAGE);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchTerm]);

  // Load more posts
  const loadMorePosts = useCallback(async () => {
    if (!hasMore || loadingMore || !lastDoc || searchTerm.trim()) return;
    
    setLoadingMore(true);
    try {
      let q;
      if (selectedCategory === 'Tất cả') {
        q = query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(HOME_CONSTANTS.POSTS_PER_PAGE)
        );
      } else {
        q = query(
          collection(db, 'posts'),
          where('category', '==', selectedCategory),
          orderBy('createdAt', 'desc'),
          startAfter(lastDoc),
          limit(HOME_CONSTANTS.POSTS_PER_PAGE)
        );
      }
      
      const snapshot = await getDocs(q);
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (newPosts.length > 0) {
        setPosts(prev => [...prev, ...newPosts]);
        setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(newPosts.length === HOME_CONSTANTS.POSTS_PER_PAGE);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, lastDoc, searchTerm, selectedCategory]);

  // Load posts when component mounts or filters change
  useEffect(() => {
    loadInitialPosts();
  }, [loadInitialPosts]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handlePostCreated = () => {
    loadInitialPosts();
  };

  const handleRefresh = () => {
    loadInitialPosts();
  };

  return (
    <>
      <SEO 
        title="NôngLạc - Mạng xã hội nông nghiệp hàng đầu Việt Nam"
        description="Kết nối cộng đồng nông dân Việt Nam. Chia sẻ kinh nghiệm trồng trọt, chăn nuôi và cập nhật giá nông sản realtime."
        keywords="nông nghiệp việt nam, nông dân, trồng trọt, chăn nuôi, giá nông sản, cộng đồng nông nghiệp"
        url="/"
      />

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Row gutter={[24, 24]}>
            {/* Left Sidebar - Categories */}
            <Col xs={24} lg={6}>
              <div className="space-y-6">
                {/* User Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm p-6 text-center border border-gray-100">
                  {user ? (
                    <>
                      <div className="relative mx-auto w-24 h-24 mb-4">
                        <div className="w-24 h-24 rounded-full bg-[#4CAF50] flex items-center justify-center text-white text-2xl font-bold">
                          {userProfile?.displayName?.charAt(0) || 'U'}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-4 border-white"></div>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">
                        {userProfile?.displayName || user?.email || 'Guest'}
                      </h2>
                      <p className="text-sm text-gray-600 mb-4">
                        {userProfile?.reputation >= 100 ? 'Chuyên gia' : 'Nông dân tiên tiến'}
                      </p>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">{userProfile?.postsCount || 0}</div>
                          <div className="text-xs text-gray-500">Bài viết</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-[#4CAF50]">{userProfile?.reputation || 0}</div>
                          <div className="text-xs text-gray-500">Uy tín</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="relative mx-auto w-24 h-24 mb-4">
                        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl">
                          👤
                        </div>
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">Chào mừng đến NôngLạc</h2>
                      <p className="text-sm text-gray-600 mb-6">Kết nối cộng đồng nông nghiệp Việt</p>
                      <Button 
                        type="default" 
                        className="w-full"
                        onClick={() => setShowLoginModal(true)}
                      >
                        Đăng nhập để tham gia
                      </Button>
                    </>
                  )}
                </div>

                {/* Categories Menu */}
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                />
              </div>
            </Col>

            {/* Main Content */}
            <Col xs={24} lg={12}>
              <div className="space-y-6">
                {/* Search Results Header */}
                {searchTerm && (
                  <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[#4CAF50] text-xl">🔍</span>
                        <div>
                          <h3 className="font-bold text-gray-900">Kết quả tìm kiếm cho: "{searchTerm}"</h3>
                          <p className="text-sm text-gray-500">Tìm thấy {filteredPosts.length} bài viết</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Create Post Form */}
                <CreatePostForm 
                  onPostCreated={handlePostCreated} 
                  setShowLoginModal={setShowLoginModal}
                />

                {/* Posts List */}
                <PostsList
                  posts={filteredPosts}
                  loading={loading}
                  loadingMore={loadingMore}
                  hasMore={hasMore}
                  searchTerm={searchTerm}
                  onLoadMore={loadMorePosts}
                  onRefresh={handleRefresh}
                />
              </div>
            </Col>

            {/* Right Sidebar */}
            <Col xs={24} lg={6}>
              <RightSidebar
                trendingTopics={trendingTopics}
                topContributors={topContributors}
                selectedCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
              />
            </Col>
          </Row>
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
    </>
  );
};

export default HomePage;