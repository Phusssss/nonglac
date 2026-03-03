import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Row, Col, Button } from 'antd';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  collection,
  query,
  orderBy,
  where,
  limit,
  startAfter,
  getDocs,
  doc,
  updateDoc,
  increment
} from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../hooks/useAuth';
import { useAuthGuard } from '../../../hooks/useAuthGuard';
import SEO from '../../../components/SEO';
import LoginModal from '../../../components/common/LoginModal';
import CreatePostForm from './CreatePostForm';
import CategoryFilter from './CategoryFilter';
import PostsList from './PostsList';
import RightSidebar from './RightSidebar';
import { HOME_CONSTANTS, POST_CATEGORIES } from '../constants';

const ALL_CATEGORY = POST_CATEGORIES[0]?.value || 'Tất cả';
const SEARCH_LIMIT = 50;

const toMillis = (value) => {
  if (!value) return 0;
  if (typeof value?.toDate === 'function') return value.toDate().getTime();
  if (value instanceof Date) return value.getTime();
  if (typeof value === 'number') return value;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
};

const HomePage = () => {
  const { user, userProfile } = useAuth();
  const { showLoginModal, setShowLoginModal } = useAuthGuard();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [lastPostDoc, setLastPostDoc] = useState(null);
  const [lastProductDoc, setLastProductDoc] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORY);

  const [trendingTopics, setTrendingTopics] = useState([]);
  const [topContributors, setTopContributors] = useState([]);

  const searchTerm = searchParams.get('search') || '';
  const isSearchMode = Boolean(searchTerm.trim());
  const isAllCategory = selectedCategory === ALL_CATEGORY;

  const incrementCounter = useCallback(async (type, id, fieldName) => {
    if (!id) return;

    const collectionName = type === 'product' ? 'marketplace_products' : 'posts';
    try {
      await updateDoc(doc(db, collectionName, id), {
        [fieldName]: increment(1)
      });
    } catch (error) {
      console.error(`Failed to increment ${fieldName} for ${type} ${id}:`, error);
    }
  }, []);

  const trackClick = useCallback((type, id) => {
    if (!id) return;
    incrementCounter(type, id, 'views');
  }, [incrementCounter]);

  const filteredPosts = useMemo(() => {
    let next = posts;

    if (!isAllCategory) {
      next = next.filter((post) => post.category === selectedCategory || post.category?.includes(selectedCategory));
    }

    if (isSearchMode) {
      const keyword = searchTerm.toLowerCase();
      next = next.filter((post) =>
        post.title?.toLowerCase().includes(keyword)
        || post.content?.toLowerCase().includes(keyword)
        || post.authorName?.toLowerCase().includes(keyword)
      );
    }

    return next;
  }, [posts, isAllCategory, selectedCategory, isSearchMode, searchTerm]);

  const filteredProducts = useMemo(() => {
    if (!isAllCategory && !isSearchMode) return [];

    let next = products;
    if (isSearchMode) {
      const keyword = searchTerm.toLowerCase();
      next = next.filter((product) =>
        product.name?.toLowerCase().includes(keyword)
        || product.description?.toLowerCase().includes(keyword)
        || product.category?.toLowerCase().includes(keyword)
        || product.address?.toLowerCase().includes(keyword)
        || product.location?.toLowerCase().includes(keyword)
      );
    }

    return next;
  }, [products, isAllCategory, isSearchMode, searchTerm]);

  const feedItems = useMemo(() => {
    const postItems = filteredPosts.map((post) => ({
      type: 'post',
      id: post.id,
      createdAtMs: toMillis(post?.createdAt),
      data: post
    }));

    const productItems = filteredProducts.map((product) => ({
      type: 'product',
      id: product.id,
      createdAtMs: toMillis(product?.createdAt),
      data: product
    }));

    return [...postItems, ...productItems].sort((a, b) => b.createdAtMs - a.createdAtMs);
  }, [filteredPosts, filteredProducts]);

  useEffect(() => {
    if (!posts.length) {
      setTrendingTopics([]);
      setTopContributors([]);
      return;
    }

    try {
      const categoryCount = {};
      const authorCount = {};

      posts.forEach((post) => {
        if (post.category) {
          categoryCount[post.category] = (categoryCount[post.category] || 0) + 1;
        }
        if (post.authorName) {
          authorCount[post.authorName] = (authorCount[post.authorName] || 0) + 1;
        }
      });

      const trending = Object.entries(categoryCount)
        .map(([topic, count]) => ({ topic, posts: count }))
        .sort((a, b) => b.posts - a.posts)
        .slice(0, 5);

      const contributors = Object.entries(authorCount)
        .map(([name, count]) => ({ name, posts: count }))
        .sort((a, b) => b.posts - a.posts)
        .slice(0, 5);

      setTrendingTopics(trending);
      setTopContributors(contributors);
    } catch (error) {
      console.error('Error calculating home sidebar stats:', error);
      setTrendingTopics([]);
      setTopContributors([]);
    }
  }, [posts]);

  const loadInitialContent = useCallback(async () => {
    setLoading(true);
    setLoadingMore(false);
    setPosts([]);
    setProducts([]);
    setLastPostDoc(null);
    setLastProductDoc(null);
    setHasMorePosts(true);
    setHasMoreProducts(true);

    try {
      const postLimit = isSearchMode ? SEARCH_LIMIT : HOME_CONSTANTS.POSTS_PER_PAGE;
      const postQuery = !isAllCategory
        ? query(
          collection(db, 'posts'),
          where('category', '==', selectedCategory),
          orderBy('createdAt', 'desc'),
          limit(postLimit)
        )
        : query(
          collection(db, 'posts'),
          orderBy('createdAt', 'desc'),
          limit(postLimit)
        );

      const shouldLoadProducts = isAllCategory || isSearchMode;
      const productLimit = isSearchMode ? SEARCH_LIMIT : HOME_CONSTANTS.POSTS_PER_PAGE;
      const productQuery = shouldLoadProducts
        ? query(
          collection(db, 'marketplace_products'),
          orderBy('createdAt', 'desc'),
          limit(productLimit)
        )
        : null;

      const [postSnapshot, productSnapshot] = await Promise.all([
        getDocs(postQuery),
        productQuery ? getDocs(productQuery) : Promise.resolve(null)
      ]);

      const postData = postSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
      setPosts(postData);
      setLastPostDoc(postSnapshot.docs[postSnapshot.docs.length - 1] || null);
      setHasMorePosts(!isSearchMode && postSnapshot.docs.length === HOME_CONSTANTS.POSTS_PER_PAGE);

      if (productSnapshot) {
        const productData = productSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        setProducts(productData);
        setLastProductDoc(productSnapshot.docs[productSnapshot.docs.length - 1] || null);
        setHasMoreProducts(!isSearchMode && productSnapshot.docs.length === HOME_CONSTANTS.POSTS_PER_PAGE);
      } else {
        setProducts([]);
        setLastProductDoc(null);
        setHasMoreProducts(false);
      }
    } catch (error) {
      console.error('Error loading home content:', error);
      setHasMorePosts(false);
      setHasMoreProducts(false);
    } finally {
      setLoading(false);
    }
  }, [isAllCategory, isSearchMode, selectedCategory]);

  const loadMoreContent = useCallback(async () => {
    if (loadingMore || isSearchMode) return;
    if (!hasMorePosts && (!isAllCategory || !hasMoreProducts)) return;

    setLoadingMore(true);

    try {
      const postPromise = hasMorePosts && lastPostDoc
        ? getDocs(query(
          collection(db, 'posts'),
          ...(isAllCategory
            ? [orderBy('createdAt', 'desc')]
            : [where('category', '==', selectedCategory), orderBy('createdAt', 'desc')]),
          startAfter(lastPostDoc),
          limit(HOME_CONSTANTS.POSTS_PER_PAGE)
        ))
        : Promise.resolve(null);

      const shouldLoadMoreProducts = isAllCategory && hasMoreProducts && lastProductDoc;
      const productPromise = shouldLoadMoreProducts
        ? getDocs(query(
          collection(db, 'marketplace_products'),
          orderBy('createdAt', 'desc'),
          startAfter(lastProductDoc),
          limit(HOME_CONSTANTS.POSTS_PER_PAGE)
        ))
        : Promise.resolve(null);

      const [postSnapshot, productSnapshot] = await Promise.all([postPromise, productPromise]);

      if (postSnapshot) {
        const nextPosts = postSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        if (nextPosts.length) {
          setPosts((prev) => [...prev, ...nextPosts]);
          setLastPostDoc(postSnapshot.docs[postSnapshot.docs.length - 1]);
        }
        setHasMorePosts(nextPosts.length === HOME_CONSTANTS.POSTS_PER_PAGE);
      }

      if (productSnapshot) {
        const nextProducts = productSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
        if (nextProducts.length) {
          setProducts((prev) => [...prev, ...nextProducts]);
          setLastProductDoc(productSnapshot.docs[productSnapshot.docs.length - 1]);
        }
        setHasMoreProducts(nextProducts.length === HOME_CONSTANTS.POSTS_PER_PAGE);
      }
    } catch (error) {
      console.error('Error loading more home content:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [
    loadingMore,
    isSearchMode,
    hasMorePosts,
    hasMoreProducts,
    lastPostDoc,
    lastProductDoc,
    isAllCategory,
    selectedCategory
  ]);

  useEffect(() => {
    loadInitialContent();
  }, [loadInitialContent]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handlePostCreated = () => {
    loadInitialContent();
  };

  const handleRefresh = () => {
    loadInitialContent();
  };

  const handlePostClick = (post) => {
    trackClick('post', post?.id);
  };

  const handleProductClick = (product) => {
    if (!product?.id) return;
    trackClick('product', product.id);
    navigate(`/product/${product.id}`);
  };

  const hasMore = isAllCategory ? (hasMorePosts || hasMoreProducts) : hasMorePosts;

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
          <Row gutter={[16, 16]}>
            <Col xs={24} lg={6}>
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-sm p-6 text-center border border-gray-100">
                  {user ? (
                    <>
                      <div className="relative mx-auto w-24 h-24 mb-4">
                        <div className="w-24 h-24 rounded-full bg-[#4CAF50] flex items-center justify-center text-white text-2xl font-bold">
                          {userProfile?.displayName?.charAt(0) || 'U'}
                        </div>
                        <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-4 border-white" />
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

                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onCategoryChange={handleCategoryChange}
                />

                <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-blue-50/50">
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                      <span className="text-blue-500">🤖</span>
                      Công cụ AI
                    </h3>
                  </div>
                  <div className="p-3 grid grid-cols-1 gap-2">
                    <button
                      onClick={() => navigate('/plant-doctor')}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors text-gray-700 text-sm font-medium"
                    >
                      <span className="text-xl">🩺</span>
                      Bác sĩ cây trồng
                    </button>
                    <button
                      onClick={() => navigate('/market-insights')}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-orange-50 transition-colors text-gray-700 text-sm font-medium"
                    >
                      <span className="text-xl">📈</span>
                      Thị trường
                    </button>
                    <button
                      onClick={() => navigate('/agri-map')}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-50 transition-colors text-gray-700 text-sm font-medium"
                    >
                      <span className="text-xl">🗺️</span>
                      Bản đồ nông vụ
                    </button>
                  </div>
                </div>
              </div>
            </Col>

            <Col xs={24} lg={12}>
              <div className="space-y-6">
                {searchTerm && (
                  <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-[#4CAF50] text-xl">🔍</span>
                        <div>
                          <h3 className="font-bold text-gray-900">Kết quả tìm kiếm cho: "{searchTerm}"</h3>
                          <p className="text-sm text-gray-500">Tìm thấy {feedItems.length} nội dung</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <CreatePostForm
                  onPostCreated={handlePostCreated}
                  setShowLoginModal={setShowLoginModal}
                />

                <PostsList
                  items={feedItems}
                  loading={loading}
                  loadingMore={loadingMore}
                  hasMore={hasMore}
                  searchTerm={searchTerm}
                  onLoadMore={loadMoreContent}
                  onRefresh={handleRefresh}
                  onPostClick={handlePostClick}
                  onProductClick={handleProductClick}
                />
              </div>
            </Col>

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

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
};

export default HomePage;
