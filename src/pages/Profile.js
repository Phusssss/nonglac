import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, updateDoc, doc, limit, startAfter, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { githubStorage } from '../services/githubStorage';
import { useAuth } from '../hooks/useAuth';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { useNavigate } from 'react-router-dom';
import PostCard from '../components/PostCard';
import PostSkeleton from '../components/PostSkeleton';
import EnhancedLoginModal from '../components/enhanced/EnhancedLoginModal';

const Profile = () => {
  const { user, userProfile } = useAuth();
  const { requireAuth, showLoginModal, setShowLoginModal } = useAuthGuard();
  const navigate = useNavigate();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState(null);
  
  const POSTS_PER_PAGE = 10;
  const [activeTab, setActiveTab] = useState('posts');
  const [editDialog, setEditDialog] = useState(false);
  const [editData, setEditData] = useState({ displayName: userProfile?.displayName || '' });
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);

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

  const loadInitialPosts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, 'posts'),
        where('authorId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(POSTS_PER_PAGE)
      );
      
      const snapshot = await getDocs(q);
      const posts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setUserPosts(posts);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === POSTS_PER_PAGE);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadMorePosts = async () => {
    if (!hasMore || loadingMore || !lastDoc || !user) return;
    
    setLoadingMore(true);
    try {
      const q = query(
        collection(db, 'posts'),
        where('authorId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(POSTS_PER_PAGE)
      );
      
      const snapshot = await getDocs(q);
      const newPosts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      if (newPosts.length > 0) {
        setUserPosts(prev => [...prev, ...newPosts]);
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
  };
  
  useEffect(() => {
    // Chỉ load data khi user đã đăng nhập
    if (user) {
      loadInitialPosts();
    }
  }, [user]);

  // Redirect nếu chưa đăng nhập
  useEffect(() => {
    if (!user) {
      // Lưu thông tin redirect
      localStorage.setItem('loginMessage', 'Đăng nhập để xem profile - xem thông tin cá nhân');
      localStorage.setItem('redirectAfterLogin', window.location.pathname);
      // Redirect trực tiếp
      navigate('/phone-login');
    }
  }, [user, navigate]);
  
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

  useEffect(() => {
    if (!user) return;

    const followersQuery = query(
      collection(db, 'follows'),
      where('followingId', '==', user.uid)
    );
    const unsubscribeFollowers = onSnapshot(followersQuery, (snapshot) => {
      setFollowers(snapshot.docs.length);
    });

    const followingQuery = query(
      collection(db, 'follows'),
      where('followerId', '==', user.uid)
    );
    const unsubscribeFollowing = onSnapshot(followingQuery, (snapshot) => {
      setFollowing(snapshot.docs.length);
    });

    return () => {
      unsubscribeFollowers();
      unsubscribeFollowing();
    };
  }, [user]);

  const handleUpdateProfile = async () => {
    return requireAuth(async () => {
      setUploading(true);
      try {
        let updateData = { displayName: editData.displayName };
        
        if (avatarFile) {
          const avatarUrl = await githubStorage.uploadImage(avatarFile, 'avatars');
          updateData.avatar = avatarUrl;
        }
        
        await updateDoc(doc(db, 'users', user.uid), updateData);
        setEditDialog(false);
        setAvatarFile(null);
      } catch (error) {
        console.error('Error updating profile:', error);
        alert('Lỗi cập nhật hồ sơ: ' + error.message);
      } finally {
        setUploading(false);
      }
    }, {
      message: 'Đăng nhập để cập nhật profile',
      feature: 'chỉnh sửa thông tin cá nhân'
    });
  };
  
  const handleAvatarChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setAvatarFile(file);
    }
  };

  if (!user) return null;

  const getReputationLevel = (reputation) => {
    if (reputation >= 1000) return 'Chuyên gia';
    if (reputation >= 500) return 'Người có kinh nghiệm';
    if (reputation >= 100) return 'Thành viên tích cực';
    if (reputation >= 50) return 'Thành viên';
    return 'Người mới';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          {/* Profile Header */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex gap-6 items-center">
                <div className="relative">
                  <div className="w-24 h-24 md:w-32 md:h-32 bg-[#4CAF50] rounded-full" style={{
                    backgroundImage: userProfile?.avatar ? `url(${userProfile.avatar})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}>
                    {!userProfile?.avatar && (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
                        {userProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  <button 
                    onClick={() => setEditDialog(true)}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-[#4CAF50] text-white rounded-full flex items-center justify-center hover:bg-[#45a049]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{userProfile?.displayName || 'Người dùng'}</h1>
                  <p className="text-[#4CAF50]">{getReputationLevel(userProfile?.reputation || 0)}</p>
                  <p className="text-gray-500 text-sm">{user?.email}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setEditDialog(true)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                >
                  Chỉnh sửa
                </button>
                <button className="px-4 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] font-medium">
                  Chia sẻ
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <aside className="lg:col-span-1 flex flex-col gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-bold mb-3">Giới thiệu</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {userProfile?.bio || 'Chưa có thông tin giới thiệu. Hãy cập nhật hồ sơ để chia sẻ về bản thân bạn!'}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <h3 className="text-lg font-bold mb-4">Chuyên môn</h3>
                <div className="flex gap-2 flex-wrap">
                  {['Trồng trọt', 'Chăn nuôi', 'Thủy sản', 'Nông nghiệp bền vững', 'Công nghệ nông nghiệp'].map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-[#4CAF50]/10 text-[#4CAF50] rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="flex justify-around text-center">
                  <div>
                    <p className="text-xl font-bold">{followers}</p>
                    <p className="text-sm text-gray-500">Người theo dõi</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{following}</p>
                    <p className="text-sm text-gray-500">Đang theo dõi</p>
                  </div>
                  <div>
                    <p className="text-xl font-bold">{userPosts.length}</p>
                    <p className="text-sm text-gray-500">Bài viết</p>
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="bg-white rounded-xl shadow-sm">
                {/* Tab Navigation */}
                <div className="border-b border-gray-200 px-6">
                  <nav className="-mb-px flex space-x-6">
                    <button 
                      onClick={() => setActiveTab('posts')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'posts' 
                          ? 'border-[#4CAF50] text-[#4CAF50]' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Bài viết gần đây
                    </button>
                    <button 
                      onClick={() => setActiveTab('articles')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'articles' 
                          ? 'border-[#4CAF50] text-[#4CAF50]' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Bài báo
                    </button>
                    <button 
                      onClick={() => setActiveTab('qa')}
                      className={`py-4 px-1 border-b-2 font-medium text-sm ${
                        activeTab === 'qa' 
                          ? 'border-[#4CAF50] text-[#4CAF50]' 
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Hỏi đáp
                    </button>
                  </nav>
                </div>

                {/* Content Feed */}
                <div className="p-6 flex flex-col gap-6">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <PostSkeleton key={index} />
                    ))
                  ) : userPosts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Bạn chưa có bài viết nào. Hãy đăng bài viết đầu tiên!</p>
                    </div>
                  ) : (
                    <>
                      {userPosts.map((post, index) => (
                        <div key={post.id} className="animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
                          <PostCard post={post} />
                        </div>
                      ))}
                      {loadingMore && (
                        <div className="flex justify-center py-4">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                            <div className="w-2 h-2 bg-[#4CAF50] rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Dialog */}
      {editDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4">Chỉnh sửa hồ sơ</h3>
            <div className="text-center mb-4">
              <div className="w-20 h-20 bg-[#4CAF50] rounded-full mx-auto mb-3" style={{
                backgroundImage: avatarFile ? `url(${URL.createObjectURL(avatarFile)})` : userProfile?.avatar ? `url(${userProfile.avatar})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}>
                {!avatarFile && !userProfile?.avatar && (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                    {userProfile?.displayName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <label className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
                Chọn ảnh
                <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
              </label>
            </div>
            <input
              type="text"
              placeholder="Tên hiển thị"
              value={editData.displayName}
              onChange={(e) => setEditData({...editData, displayName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
            />
            <div className="flex gap-3">
              <button 
                onClick={() => {
                  setEditDialog(false);
                  setAvatarFile(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Hủy
              </button>
              <button 
                onClick={handleUpdateProfile}
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] disabled:opacity-50"
              >
                {uploading ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Login Modal */}
      <EnhancedLoginModal
        open={showLoginModal}
        onCancel={() => setShowLoginModal(false)}
        title="Đăng nhập để xem profile"
        message="Đăng nhập để xem và chỉnh sửa thông tin cá nhân"
        feature="sử dụng trang cá nhân"
      />
    </div>
  );
};

export default Profile;

// Add CSS for animations
const styles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .animate-fadeInUp {
    animation: fadeInUp 0.6s ease-out forwards;
    opacity: 0;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}