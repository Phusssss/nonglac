import React, { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, query, orderBy, where, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { logUserAction, ACTIONS } from '../utils/analytics';
import PostCard from '../components/PostCard';
import { EnhancedPostCard } from '../components/enhanced/EnhancedPostCard';
import GitHubImageUpload from '../components/GitHubImageUpload';
import SEO from '../components/SEO';
import LoginModal from '../components/common/LoginModal';
import WeatherWidget from '../components/WeatherWidget';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { user, userProfile } = useAuth();
  const { requireAuthForPost, showLoginModal, setShowLoginModal } = useAuthGuard();
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
    return requireAuthForPost(async () => {
      if (!newPost.title || !newPost.content) {
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
    });
  };

  return (
    <>
      <SEO 
        title="NôngLạc - Mạng xã hội nông nghiệp Việt Nam"
        description="Kết nối cộng đồng nông dân Việt Nam. Chia sẻ kinh nghiệm trồng trọt, chăn nuôi, cập nhật giá nông sản mới nhất."
        keywords="nông nghiệp việt nam, nông dân, trồng trọt, chăn nuôi, giá nông sản, cộng đồng nông nghiệp"
      />
      
      <div className="bg-gray-50 min-h-screen font-['Inter']">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Sidebar */}
            <div className="lg:col-span-3 space-y-6">
              
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
                      <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                        <span className="material-icons-round text-6xl">person</span>
                      </div>
                      <div className="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-4 border-white"></div>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Chào mừng đến NôngLạc</h2>
                    <p className="text-sm text-gray-600 mb-6">Kết nối cộng đồng nông nghiệp Việt</p>
                    <button 
                      onClick={() => navigate('/phone-login')}
                      className="w-full py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-sm font-medium transition-colors text-gray-600"
                    >
                      Đăng nhập để tham gia
                    </button>
                  </>
                )}
              </div>

              {/* Categories Menu */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-green-50/50">
                  <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <span className="material-icons-round text-[#4CAF50]">forum</span>
                    Danh mục thảo luận
                  </h3>
                </div>
                <div className="p-2">
                  <button
                    onClick={() => setSelectedCategory('Tất cả')}
                    className={`flex items-center gap-4 p-3 rounded-xl w-full transition-colors group ${
                      selectedCategory === 'Tất cả' 
                        ? 'bg-green-50 text-[#4CAF50]' 
                        : 'hover:bg-green-50 text-gray-700'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600">
                      <span className="text-lg">📋</span>
                    </div>
                    <span className="font-medium group-hover:text-[#4CAF50] transition-colors">
                      Tất cả
                    </span>
                  </button>
                  
                  {categories.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.label)}
                      className={`flex items-center gap-4 p-3 rounded-xl w-full transition-colors group ${
                        selectedCategory === cat.label 
                          ? 'bg-green-50 text-[#4CAF50]' 
                          : 'hover:bg-green-50 text-gray-700'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-lg">{cat.icon}</span>
                      </div>
                      <span className="font-medium group-hover:text-[#4CAF50] transition-colors">
                        {cat.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer Links */}
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500 px-2">
                <button onClick={() => navigate('/terms-of-service')} className="hover:underline">Điều khoản</button>
                <button onClick={() => navigate('/about-us')} className="hover:underline">Về chúng tôi</button>
                <button onClick={() => navigate('/privacy')} className="hover:underline">Quyền riêng tư</button>
                <span className="block w-full mt-2 opacity-70">© 2023 NongLac Inc.</span>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Trending Topics - Mobile Only */}
              <div className="lg:hidden">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 bg-green-50/50">
                    <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                      <span className="material-icons-round text-[#4CAF50]">trending_up</span>
                      Chủ đề thịnh hành
                    </h3>
                  </div>
                  <div className="p-2 space-y-1">
                    {trendingTopics.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => handleTopicClick(item.topic)}
                        className={`w-full flex justify-between items-center p-3 rounded-xl transition-colors ${
                          selectedCategory === item.topic 
                            ? 'bg-green-50 text-[#4CAF50] border-l-4 border-[#4CAF50]' 
                            : 'hover:bg-green-50 text-gray-700'
                        }`}
                      >
                        <span className="text-sm font-medium">{item.topic}</span>
                        <span className="bg-[#4CAF50] text-white text-xs px-2 py-1 rounded-full">
                          {item.posts}
                        </span>
                      </button>
                    ))}
                    {trendingTopics.length === 0 && (
                      <div className="text-center py-4">
                        <span className="text-gray-500 text-sm italic">Chưa có chủ đề nào</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Create Post */}
              <div className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-600 text-white flex items-center justify-center font-bold shadow-md flex-shrink-0">
                    {user ? (userProfile?.displayName?.charAt(0) || 'U') : 'G'}
                  </div>
                  <div className="flex-1">
                    <input 
                      className="w-full bg-gray-50 border-none rounded-full px-5 py-2.5 text-sm focus:ring-2 focus:ring-[#4CAF50]/50 transition-shadow mb-3" 
                      placeholder="Chia sẻ kinh nghiệm nông nghiệp của bạn..." 
                      type="text"
                      onClick={() => requireAuthForPost(() => setOpen(true))}
                      readOnly
                    />
                    <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                      <div className="flex gap-2">
                        <button className="p-2 rounded-full hover:bg-gray-100 text-green-600 transition-colors" title="Ảnh">
                          <span className="material-icons-round text-xl">image</span>
                        </button>
                        <button className="p-2 rounded-full hover:bg-gray-100 text-blue-500 transition-colors" title="Video">
                          <span className="material-icons-round text-xl">videocam</span>
                        </button>
                        <button className="p-2 rounded-full hover:bg-gray-100 text-orange-500 transition-colors" title="Cảm xúc">
                          <span className="material-icons-round text-xl">sentiment_satisfied_alt</span>
                        </button>
                      </div>
                      <button 
                        onClick={() => requireAuthForPost(() => setOpen(true))}
                        className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors opacity-90 hover:opacity-100"
                      >
                        Đăng bài
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Posts */}
              <div className="space-y-6">
                {loading ? (
                  // Loading skeletons
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="bg-white rounded-2xl shadow-sm p-4 border border-gray-100 opacity-60">
                      <div className="flex gap-4 items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                        <div className="flex flex-col gap-2">
                          <div className="w-32 h-3 bg-gray-200 rounded"></div>
                          <div className="w-20 h-2 bg-gray-100 rounded"></div>
                        </div>
                      </div>
                      <div className="w-full h-40 bg-gray-100 rounded-xl mb-3"></div>
                      <div className="w-3/4 h-3 bg-gray-200 rounded mb-2"></div>
                      <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
                    </div>
                  ))
                ) : filteredPosts.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100 text-center">
                    <span className="text-gray-500">
                      {searchTerm ? 'Không tìm thấy bài viết nào.' : 'Chưa có bài viết nào trong danh mục này.'}
                    </span>
                  </div>
                ) : (
                  filteredPosts.map((post, index) => (
                    <div 
                      key={post.id}
                      style={{
                        opacity: 0,
                        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`
                      }}
                    >
                      <PostCard 
                        post={post}
                        currentUserId={user?.uid}
                        onUserClick={(userId) => navigate(`/user/${userId}`)}
                      />
                    </div>
                  ))
                )}
                
                {loadingMore && (
                  <div className="text-center py-6">
                    <div className="inline-flex items-center gap-2 text-gray-500">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#4CAF50]"></div>
                      <span className="text-sm">Đang tải thêm bài viết...</span>
                    </div>
                  </div>
                )}
                
                {!hasMore && filteredPosts.length > 0 && (
                  <div className="text-center py-6">
                    <span className="bg-[#4CAF50] text-white text-sm px-4 py-2 rounded-full">
                      🎉 Đã xem hết tất cả bài viết
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Weather Widget */}
              <WeatherWidget />

              {/* Market Prices */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-gray-900">Giá nông sản 24h</h3>
                  <span className="flex items-center gap-1 bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> Live
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {[
                    { name: 'Lúa OM 5451', price: '8.200 đ/kg', location: 'Hậu Giang', change: '+2.5%', trend: 'up' },
                    { name: 'Cà phê Robusta', price: '120.000 đ/kg', location: 'Đắk Lắk', change: '-4%', trend: 'down' },
                    { name: 'Tiêu đen', price: '92.500 đ/kg', location: 'Bình Phước', change: '0%', trend: 'same' }
                  ].map((item, idx) => (
                    <div key={idx} className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-gray-900">{item.name}</span>
                        <span className="font-bold text-gray-900">{item.price}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">{item.location}</span>
                        <span className={`px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                          item.trend === 'up' ? 'bg-green-100 text-green-700' :
                          item.trend === 'down' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          <span className="material-icons-round text-[10px]">
                            {item.trend === 'up' ? 'trending_up' : item.trend === 'down' ? 'trending_down' : 'remove'}
                          </span> 
                          {item.change}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-gray-100 text-center">
                  <button 
                    onClick={() => navigate('/gia-nong-san')}
                    className="text-sm text-[#4CAF50] font-medium hover:underline"
                  >
                    Xem tất cả giá cả
                  </button>
                </div>
              </div>

              {/* Trending Topics */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <span className="material-icons-round text-[#4CAF50]">local_fire_department</span>
                    Chủ đề hot
                  </h3>
                </div>
                <div className="p-2 space-y-1">
                  {trendingTopics.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedCategory(item.topic)}
                      className={`w-full flex justify-between items-center p-3 rounded-xl transition-colors ${
                        selectedCategory === item.topic 
                          ? 'bg-green-50 text-[#4CAF50] border-l-4 border-[#4CAF50]' 
                          : 'hover:bg-green-50 text-gray-700'
                      }`}
                    >
                      <span className="text-sm font-medium">{item.topic}</span>
                      <span className="bg-[#4CAF50] text-white text-xs px-2 py-1 rounded-full">
                        {item.posts}
                      </span>
                    </button>
                  ))}
                  {trendingTopics.length === 0 && (
                    <div className="text-center py-4">
                      <span className="text-gray-500 text-sm italic">Chưa có chủ đề nào</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Contributors */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                    <span className="material-icons-round text-yellow-500">emoji_events</span>
                    Chuyên gia tuần này
                  </h3>
                </div>
                <div className="p-2 space-y-2">
                  {topContributors.slice(0, 3).map((contributor, idx) => (
                    <div 
                      key={idx}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#4CAF50] flex items-center justify-center text-white font-bold">
                        {contributor.name?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {contributor.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {contributor.posts} bài viết
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-[#4CAF50]">
                          {contributor.reputation} ⭐
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => navigate('/register')}
                    className="w-full mt-4 py-2 px-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium text-gray-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-icons-round text-lg">group_add</span>
                    Đăng ký chuyên gia
                  </button>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Create Post Modal */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Tạo bài viết mới</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề</label>
                <input
                  type="text"
                  placeholder="Nhập tiêu đề bài viết..."
                  value={newPost.title}
                  onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                <select
                  value={newPost.category}
                  onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50]"
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.key} value={cat.label}>{cat.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung</label>
                <textarea
                  placeholder="Chia sẻ kinh nghiệm, kiến thức nông nghiệp của bạn..."
                  value={newPost.content}
                  onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                  rows={6}
                  maxLength={2000}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-[#4CAF50] resize-none"
                />
                <div className="text-xs text-gray-500 mt-1">{newPost.content.length}/2000</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hình ảnh</label>
                <GitHubImageUpload 
                  onUploadComplete={(imageUrl) => {
                    setNewPost(prev => ({...prev, images: [...(prev.images || []), imageUrl]}));
                  }}
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !newPost.title || !newPost.content}
                className="bg-[#4CAF50] hover:bg-[#388E3C] text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Đang đăng...' : 'Đăng bài'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        message="Đăng nhập để tạo và chia sẻ bài viết"
        feature="tạo bài viết nông nghiệp"
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
      `}</style>
    </>
  );
};

export default Home;