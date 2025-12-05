import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import PostCard from '../components/PostCard';
import LoadingSpinner from '../components/LoadingSpinner';
import FollowButton from '../components/FollowButton';
import { useAuth } from '../hooks/useAuth';
import { useChat } from '../contexts/ChatContext';

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
    fetchUserProfile();
    fetchUserPosts();
    loadFollowStats();
  }, [userId]);

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
    return <LoadingSpinner />;
  }

  if (!userProfile) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold mb-4">Không tìm thấy người dùng</h2>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Về trang chủ
        </button>
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
    <div className="min-h-screen bg-green-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          {/* Profile Header */}
          <div className="bg-white p-6 rounded-xl border border-green-100">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="flex gap-6 items-center">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-green-200 rounded-full border-2 border-green-300" style={{
                  backgroundImage: userProfile?.avatar ? `url(${userProfile.avatar})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                }}>
                  {!userProfile?.avatar && (
                    <div className="w-full h-full flex items-center justify-center text-green-700 font-bold text-2xl">
                      {userProfile?.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold">{userProfile?.displayName || 'Người dùng'}</h1>
                  <p className="text-green-600">{getReputationLevel(userProfile?.reputation || 0)}</p>
                  <p className="text-gray-500 text-sm">{userProfile?.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{userProfile?.location || 'Việt Nam'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                      <span>{userProfile?.reputation || 0} điểm uy tín</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <FollowButton targetUserId={userId} />
                {user && user.uid !== userId && (
                  <button 
                    onClick={() => startChat(userId, userProfile.displayName)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Nhắn tin
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <aside className="lg:col-span-1 flex flex-col gap-6">
              <div className="bg-white p-6 rounded-xl border border-green-100">
                <h3 className="text-lg font-bold mb-3">Giới thiệu</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {userProfile?.about || 'Chưa có thông tin giới thiệu.'}
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-green-100">
                <h3 className="text-lg font-bold mb-4">Chuyên môn</h3>
                <div className="flex gap-2 flex-wrap">
                  {['Trồng trọt', 'Chăn nuôi', 'Thủy sản', 'Nông nghiệp bền vững', 'Công nghệ nông nghiệp'].map((skill) => (
                    <span key={skill} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm border border-green-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl border border-green-100">
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
              <div className="bg-white rounded-xl border border-green-100">
                {/* Tab Navigation */}
                <div className="border-b border-green-100 px-6">
                  <nav className="-mb-px flex space-x-6">
                    <button className="py-4 px-1 border-b-2 border-green-500 text-green-500 font-medium text-sm">
                      Bài viết gần đây
                    </button>
                  </nav>
                </div>

                {/* Content Feed */}
                <div className="p-6 flex flex-col gap-6">
                  {userPosts.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Người dùng chưa có bài viết nào.</p>
                    </div>
                  ) : (
                    userPosts.map((post, index) => (
                      <div key={post.id} className="animate-fadeInUp" style={{animationDelay: `${index * 0.1}s`}}>
                        <PostCard post={post} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;

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