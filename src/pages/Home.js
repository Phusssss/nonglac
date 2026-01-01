import React, { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, query, orderBy, where, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';

import { logUserAction, ACTIONS } from '../utils/analytics';
import PostCard from '../components/PostCard';
import GitHubImageUpload from '../components/GitHubImageUpload';

import CoffeePrices from '../components/CoffeePrices';
import RightSidebar from '../components/RightSidebar';
import WeatherWidget from '../components/WeatherWidget';
import SEO from '../components/SEO';
import { Heart, MessageCircle, Share2, TrendingUp, Users, MapPin, Bookmark, MoreHorizontal, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


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
  const categories = ['Trồng trọt', 'Chăn nuôi', 'Thủy sản', 'Công nghệ nông nghiệp', 'Thị trường', 'Khác'];

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
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Left Sidebar - User Profile & Categories */}
      <div className="hidden lg:block lg:col-span-3 space-y-6">
          {/* User Profile Card */}
          {user ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <img 
                src={userProfile?.avatar || `https://ui-avatars.com/api/?name=${userProfile?.displayName || user?.email || 'User'}&background=4CAF50&color=fff`}
                alt={userProfile?.displayName || 'User'}
                className="w-20 h-20 rounded-full mx-auto border-4 border-agri-50 mb-3 object-cover"
              />
              <h3 className="font-bold text-gray-800 text-lg">{userProfile?.displayName || user?.email || 'Guest'}</h3>
              <span className="inline-block bg-agri-100 text-agri-700 text-xs px-2 py-1 rounded-full font-medium mt-1 mb-4">
                {userProfile?.reputation >= 100 ? 'Chuyên gia' : 'Nông dân tiên tiến'}
              </span>
              <div className="flex justify-center gap-6 text-sm text-gray-600 border-t border-gray-100 pt-4">
                <div className="text-center">
                  <span className="block font-bold text-gray-900">{userProfile?.postsCount || 0}</span>
                  <span className="text-xs">Bài viết</span>
                </div>
                <div className="text-center">
                  <span className="block font-bold text-gray-900">{userProfile?.reputation || 0}</span>
                  <span className="text-xs">Uy tín</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
              <div className="w-20 h-20 rounded-full mx-auto bg-gray-200 flex items-center justify-center mb-3">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-4">Chào mừng đến NôngLạc</h3>
              <button 
                onClick={() => navigate('/login')}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
              >
                Đăng nhập
              </button>
              <p className="text-xs text-gray-500 mt-2">Đăng nhập để tham gia cộng đồng</p>
            </div>
          )}

          {/* Categories Menu */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <h4 className="font-bold text-gray-700 p-4 border-b border-gray-100 bg-gray-50">Danh mục thảo luận</h4>
            <div className="p-2">
              {[
                { name: 'Trồng trọt', icon: '🌾' },
                { name: 'Chăn nuôi', icon: '🐖' },
                { name: 'Thủy sản', icon: '🐟' },
                { name: 'Máy nông nghiệp', icon: '🚜' },
                { name: 'Thị trường & Giá cả', icon: '💰' },
                { name: 'Chính sách', icon: '📜' },
              ].map((cat) => (
                <button 
                  key={cat.name} 
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg hover:bg-agri-50 text-gray-700 flex items-center gap-3 transition-colors text-sm font-medium ${
                    selectedCategory === cat.name ? 'bg-agri-50 border-l-4 border-agri-600' : ''
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Post Tags Filter */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wider">Lọc theo tag</h4>
            <div className="flex flex-wrap gap-2">
              {trendingTopics.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedCategory(item.topic)}
                  className={`text-xs px-2 py-1 rounded cursor-pointer transition-colors ${
                    selectedCategory === item.topic 
                      ? 'bg-agri-100 text-agri-700 border border-agri-300' 
                      : 'bg-gray-100 hover:bg-agri-100 text-gray-600 hover:text-agri-700'
                  }`}
                >
                  #{item.topic} ({item.posts})
                </button>
              ))}
              {trendingTopics.length === 0 && (
                <span className="text-xs text-gray-500 italic">Chưa có tag nào</span>
              )}
            </div>
          </div>
      </div>

      {/* Main Content - Posts Feed */}
      <div className="lg:col-span-6 space-y-6">
          {/* Trending Topics - Mobile Only */}
          <div className="bg-white rounded-2xl shadow-sm p-6 lg:hidden">
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="w-5 h-5 text-[#4CAF50]" />
              <h3 className="font-semibold text-[#795548]">
                Chủ đề thịnh hành
              </h3>
            </div>
            <div className="space-y-3">
              {trendingTopics.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleTopicClick(item.topic)}
                  className={`flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors ${
                    selectedCategory === item.topic ? 'bg-green-50 border-l-4 border-[#4CAF50]' : ''
                  }`}
                >
                  <span className="text-sm text-gray-700 font-medium">{item.topic}</span>
                  <span className="text-xs text-gray-500">{item.posts}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Create Post */}
          <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-6">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#4CAF50] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white text-xs sm:text-sm font-medium">
                  {user ? (userProfile?.displayName?.charAt(0) || 'U') : 'G'}
                </span>
              </div>
              <input
                type="text"
                placeholder="Chia sẻ kinh nghiệm..."
                onClick={() => setOpen(true)}
                className="flex-1 px-3 py-2 sm:px-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent cursor-pointer text-sm sm:text-base"
              />
              <button 
                onClick={() => setOpen(true)}
                aria-label="Tạo bài viết mới"
                className="px-3 py-2 sm:px-6 bg-[#4CAF50] text-white rounded-full hover:bg-[#45a049] transition-colors text-sm sm:text-base font-medium"
              >
                Đăng
              </button>
            </div>
          </div>

          {/* Posts */}
          <div className="space-y-6">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-sm p-6 animate-pulse">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-24"></div>
                      <div className="h-3 bg-gray-300 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  </div>
                  <div className="h-64 bg-gray-300 rounded-xl"></div>
                </div>
              ))
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchTerm ? 'Không tìm thấy bài viết nào.' : 'Chưa có bài viết nào trong danh mục này.'}
              </div>
            ) : (
              <>
                {filteredPosts.map((post, index) => (
                  <div 
                    key={post.id}
                    style={{
                      opacity: 0,
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`
                    }}
                  >
                    <PostCard post={post} />
                  </div>
                ))}
                {loadingMore && (
                  <div className="flex flex-col items-center py-6 space-y-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                      <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                      <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                    </div>
                    <p className="text-sm text-gray-500">Đang tải thêm bài viết...</p>
                  </div>
                )}
                {!hasMore && filteredPosts.length > 0 && (
                  <div className="text-center py-6">
                    <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-full">
                      <span className="text-sm text-gray-600">🎉 Đã xem hết tất cả bài viết</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
      </div>

      {/* Right Sidebar - Weather & Market Prices */}
      <div className="hidden lg:block lg:col-span-3 space-y-6">
          <WeatherWidget />

          {/* Quick Market Prices */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-gray-700">Giá nông sản 24h</h4>
              <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Live</span>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                <span className="text-gray-600">Lúa OM 5451</span>
                <span className="font-bold text-gray-900">8.200 đ/kg <span className="text-green-500 text-xs">▲</span></span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-gray-50 pb-2">
                <span className="text-gray-600">Cà phê Robusta</span>
                <span className="font-bold text-gray-900">120.000 đ/kg <span className="text-red-500 text-xs">▼</span></span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Tiêu đen</span>
                <span className="font-bold text-gray-900">95.000 đ/kg <span className="text-gray-400 text-xs">-</span></span>
              </div>
            </div>
            <button 
              onClick={() => navigate('/gia-nong-san')}
              className="w-full mt-3 text-center text-xs text-agri-600 font-medium hover:underline"
            >
              Xem tất cả
            </button>
          </div>

          {/* Top Experts */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <h4 className="font-bold text-gray-700 mb-3">Chuyên gia tuần này</h4>
            <div className="space-y-4">
              {topContributors.slice(0, 3).map((contributor, idx) => (
                <div key={idx} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <img 
                    src={contributor.avatar || `https://ui-avatars.com/api/?name=${contributor.name}&background=random&color=fff`}
                    alt={contributor.name}
                    className="w-10 h-10 rounded-full border border-gray-100 object-cover"
                  />
                  <div className="flex-1">
                    <h5 className="font-bold text-sm text-gray-800">{contributor.name}</h5>
                    <p className="text-xs text-gray-500">{contributor.posts} bài viết</p>
                  </div>
                  <div className="text-xs font-semibold text-agri-600">
                    {contributor.reputation} ⭐
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 border border-agri-100 rounded-lg text-sm text-agri-700 font-medium hover:bg-agri-50 transition-colors">
              Đăng ký chuyên gia
            </button>
          </div>
      </div>

          </div>
        </div>

      {/* Create Post Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-semibold text-[#795548]">Tạo bài viết mới</h2>
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Tiêu đề"
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  className="w-full px-3 py-2 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-sm sm:text-base"
                />
                
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                  className="w-full px-3 py-2 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] text-sm sm:text-base"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                
                <textarea
                  placeholder="Nội dung"
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 sm:px-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] resize-none text-sm sm:text-base"
                />
                
                <GitHubImageUpload 
                  onUploadComplete={(imageUrl) => {
                    setNewPost(prev => ({...prev, images: [...(prev.images || []), imageUrl]}));
                  }}
                />
                
                <button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full bg-[#4CAF50] text-white py-2 rounded-lg hover:bg-[#45a049] transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Đang đăng...' : 'Đăng bài'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => user ? setOpen(true) : navigate('/login')}
        aria-label="Tạo bài viết mới"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-[#4CAF50] text-white rounded-full shadow-lg hover:bg-[#45a049] transition-colors flex items-center justify-center z-40 lg:hidden"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>


      
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
        
        .animate-bounce {
          animation: bounce 1s infinite;
        }
        
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-8px,0);
          }
          70% {
            transform: translate3d(0,-4px,0);
          }
        }
      `}</style>
      </main>
    </>
  );
};

export default Home;