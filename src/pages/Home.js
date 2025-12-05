import React, { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, query, orderBy, where, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import PostCard from '../components/PostCard';
import GitHubImageUpload from '../components/GitHubImageUpload';
import CoffeePrices from '../components/CoffeePrices';
import RightSidebar from '../components/RightSidebar';
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

  const featuredFarms = [
    {
      id: 1,
      name: "Trang trại hữu cơ Green Valley",
      location: "Đà Lạt, Việt Nam",
      image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop",
      specialty: "Rau hữu cơ",
      followers: 1250,
    },
    {
      id: 2,
      name: "Trang trại bò sữa Sunrise",
      location: "Mộc Châu, Việt Nam",
      image: "https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400&h=300&fit=crop",
      specialty: "Chăn nuôi & Sữa",
      followers: 890,
    },
    {
      id: 3,
      name: "Công ty nông nghiệp thông minh Tech Harvest",
      location: "Cần Thơ, Việt Nam",
      image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop",
      specialty: "Nông nghiệp công nghệ cao",
      followers: 2100,
    },
  ];

  const samplePosts = [
    {
      id: 1,
      author: "Nguyễn Văn An",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face",
      time: "2 giờ trước",
      content: "Vừa thu hoạch được lô cà chua hữu cơ đầu tiên của mùa này! Năng suất tuyệt vời nhờ hệ thống tưới nước mới. 🍅",
      image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=600&h=400&fit=crop",
      likes: 45,
      comments: 12,
      category: "🌾 Cây trồng",
    },
    {
      id: 2,
      author: "Trần Thị Bình",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=50&h=50&fit=crop&crop=face",
      time: "4 giờ trước",
      content: "Máy kéo John Deere mới đã tới hôm nay! Không thể chờ để thử nghiệm trên cánh đồng ngô. Hệ thống GPS tuyệt vời. 🚜",
      image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=600&h=400&fit=crop",
      likes: 78,
      comments: 23,
      category: "🚜 Công nghệ",
    },
    {
      id: 3,
      author: "Lê Văn Cường",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=50&h=50&fit=crop&crop=face",
      time: "6 giờ trước",
      content: "Những con bò Holstein của chúng tôi đang sản xuất lượng sữa kỷ lục tháng này! Dinh dưỡng và chăm sóc đúng cách thực sự quan trọng. 🐄",
      image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?w=600&h=400&fit=crop",
      likes: 62,
      comments: 18,
      category: "🐄 Chăn nuôi",
    },
  ];

  const trendingTopics = [
    { topic: "Nông nghiệp bền vững", posts: 234 },
    { topic: "Nông nghiệp chính xác", posts: 189 },
    { topic: "Chứng chỉ hữu cơ", posts: 156 },
    { topic: "Biến đổi khí hậu", posts: 143 },
    { topic: "Xoay vòng cây trồng", posts: 128 },
  ];

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
      setFilteredPosts(posts.length > 0 ? posts : samplePosts);
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

      await addDoc(collection(db, 'posts'), postData);
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
    <div className="h-screen bg-gray-50 flex">
      {/* Left Sidebar - Trending Topics */}
      <div className="hidden lg:block w-96 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="sticky top-0 p-6">
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
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
                  className="flex justify-between items-center p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                >
                  <span className="text-sm text-gray-700">{item.topic}</span>
                  <span className="text-xs text-gray-500">{item.posts}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Categories */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h3 className="font-semibold text-[#795548] mb-4">Danh mục</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <span className="text-lg">🌾</span>
                <span className="text-sm text-gray-700">Cây trồng</span>
              </div>
              <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <span className="text-lg">🐄</span>
                <span className="text-sm text-gray-700">Chăn nuôi</span>
              </div>
              <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <span className="text-lg">🚜</span>
                <span className="text-sm text-gray-700">Công nghệ</span>
              </div>
              <div className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                <span className="text-lg">💰</span>
                <span className="text-sm text-gray-700">Thị trường</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Posts Feed */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-3 sm:p-6">
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
      </div>

      {/* Right Sidebar - Featured Farms & More */}
      <div className="hidden lg:block w-96 bg-white border-l border-gray-200 overflow-y-auto">
        <div className="sticky top-0 p-6">
          <CoffeePrices />
          <div className="mt-6">
            <RightSidebar />
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-lg">☕</span>
              <h3 className="font-semibold text-[#795548]">
                Giá cà phê hôm nay
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-2 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-700">Robusta</span>
                <span className="text-sm font-medium text-green-600">45,500 VNĐ/kg</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-700">Arabica</span>
                <span className="text-sm font-medium text-blue-600">52,000 VNĐ/kg</span>
              </div>
              <div className="text-xs text-gray-500 text-center mt-2">
                Cập nhật: 15/11/2024
              </div>
            </div>
          </div>

          {/* Expert Tips */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-lg">👨‍🌾</span>
              <h3 className="font-semibold text-[#795548]">
                Lời khuyên chuyên gia
              </h3>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  "Mùa khô sắp tới, hãy chuẩn bị hệ thống tưới tiết kiệm nước."
                </p>
                <span className="text-xs text-gray-500">- TS. Nguyễn Văn A</span>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  "Sử dụng phân hữu cơ để cải thiện độ phì nhiêu đất."
                </p>
                <span className="text-xs text-gray-500">- KS. Trần Thị B</span>
              </div>
            </div>
          </div>

          {/* News */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-lg">📰</span>
              <h3 className="font-semibold text-[#795548]">
                Tin tức nông nghiệp
              </h3>
            </div>
            <div className="space-y-3">
              <div className="border-l-4 border-green-500 pl-3">
                <h4 className="text-sm font-medium text-gray-800 mb-1">
                  Chính sách hỗ trợ nông dân 2024
                </h4>
                <p className="text-xs text-gray-500">2 giờ trước</p>
              </div>
              <div className="border-l-4 border-blue-500 pl-3">
                <h4 className="text-sm font-medium text-gray-800 mb-1">
                  Công nghệ AI trong nông nghiệp
                </h4>
                <p className="text-xs text-gray-500">5 giờ trước</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-3">
                <h4 className="text-sm font-medium text-gray-800 mb-1">
                  Xuất khẩu gạo tăng 15%
                </h4>
                <p className="text-xs text-gray-500">1 ngày trước</p>
              </div>
            </div>
          </div>

          {/* Featured Farms */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Users className="w-5 h-5 text-[#4CAF50]" />
              <h3 className="font-semibold text-[#795548]">
                Trang trại nổi bật
              </h3>
            </div>
            <div className="space-y-4">
              {featuredFarms.map((farm) => (
                <div
                  key={farm.id}
                  className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <img
                    src={farm.image}
                    alt={farm.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h4 className="font-medium text-[#795548] mb-1">
                    {farm.name}
                  </h4>
                  <div className="flex items-center space-x-1 text-sm text-gray-500 mb-2">
                    <MapPin className="w-3 h-3" />
                    <span>{farm.location}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    {farm.specialty}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {farm.followers} người theo dõi
                    </span>
                    <button className="px-3 py-1 bg-[#4CAF50] text-white text-xs rounded-full hover:bg-[#45a049] transition-colors">
                      Theo dõi
                    </button>
                  </div>
                </div>
              ))}
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
      {user && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-[#4CAF50] text-white rounded-full shadow-lg hover:bg-[#45a049] transition-colors flex items-center justify-center z-40 lg:hidden"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      )}
      
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
    </div>
  );
};

export default Home;