import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, limit, doc, updateDoc, increment, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { useAuthGuard } from '../hooks/useAuthGuard';
import { createNotification, notificationTypes } from '../services/notificationService';
import { missionsService } from '../features/missions/services';
import { logUserAction, ACTIONS } from '../utils/analytics';
import { MessageCircle, Share2, Heart, MoreHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import OptimizedVideoPlayer from '../components/OptimizedVideoPlayer';
import OptimizedImage from '../components/OptimizedImage';
import CommentSection from '../components/CommentSection';
import LoginModal from '../components/common/LoginModal';
import moment from 'moment';
import './ReelsPage.css';

const ReelsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, userProfile, updateReputation } = useAuth();
  const { requireAuthForLike, requireAuthForComment, showLoginModal: authShowLoginModal, setShowLoginModal: authSetShowLoginModal } = useAuthGuard();
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userReactions, setUserReactions] = useState({});
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const containerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);
  const isScrollingRef = useRef(false);
  const preloadedVideosRef = useRef({});
  const touchStartRef = useRef(0);

  // Sync auth guard modal with local state
  useEffect(() => {
    setShowLoginModal(authShowLoginModal);
  }, [authShowLoginModal]);

  // Load reels from Firestore
  useEffect(() => {
    const loadReels = async () => {
      try {
        setLoading(true);
        const postsRef = collection(db, 'posts');
        
        const q = query(
          postsRef,
          orderBy('createdAt', 'desc'),
          limit(20)
        );
        
        const snapshot = await getDocs(q);
        const reelsData = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(post => {
            return post.media && Array.isArray(post.media) && post.media.some(m => m.type === 'video');
          });
        
        setReels(reelsData);
        
        const startReelId = searchParams.get('reelId');
        if (startReelId) {
          const index = reelsData.findIndex(r => r.id === startReelId);
          if (index !== -1) {
            setCurrentIndex(index);
          }
        }
      } catch (error) {
        console.error('Error loading reels:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReels();
  }, [searchParams]);

  // Load user reactions
  useEffect(() => {
    if (!user || reels.length === 0) return;

    const loadReactions = async () => {
      try {
        const reactions = {};
        for (const reel of reels) {
          const likesRef = collection(db, 'likes');
          const likeQuery = query(
            likesRef,
            where('userId', '==', user.uid),
            where('postId', '==', reel.id)
          );
          const likeSnapshot = await getDocs(likeQuery);
          reactions[reel.id] = likeSnapshot.size > 0 ? 'like' : null;
        }
        setUserReactions(reactions);
      } catch (error) {
        console.error('Error loading reactions:', error);
      }
    };

    loadReactions();
  }, [user, reels]);

  // Preload first 3 videos on initial load
  useEffect(() => {
    if (reels.length === 0) return;

    reels.slice(0, 3).forEach((reel) => {
      const videoMedia = reel.media?.find(m => m.type === 'video');
      if (videoMedia && !preloadedVideosRef.current[reel.id]) {
        const video = document.createElement('video');
        video.src = videoMedia.url;
        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true;
        preloadedVideosRef.current[reel.id] = video;
      }
    });
  }, [reels]);

  // Preload next and previous videos during scrolling
  useEffect(() => {
    if (reels.length === 0) return;

    const preloadVideo = (index) => {
      if (index < 0 || index >= reels.length) return;
      
      const reel = reels[index];
      const videoMedia = reel.media?.find(m => m.type === 'video');
      
      if (videoMedia && !preloadedVideosRef.current[reel.id]) {
        const video = document.createElement('video');
        video.src = videoMedia.url;
        video.preload = 'auto';
        video.muted = true;
        video.playsInline = true;
        preloadedVideosRef.current[reel.id] = video;
      }
    };

    preloadVideo(currentIndex + 1);
    preloadVideo(currentIndex + 2);
    preloadVideo(currentIndex - 1);
  }, [currentIndex, reels]);

  const handleScroll = useCallback((direction) => {
    if (isScrollingRef.current) return;

    let newIndex = currentIndex;
    if (direction === 'down') {
      newIndex = Math.min(currentIndex + 1, reels.length - 1);
    } else if (direction === 'up') {
      newIndex = Math.max(currentIndex - 1, 0);
    }

    if (newIndex !== currentIndex) {
      isScrollingRef.current = true;
      setCurrentIndex(newIndex);
      setShowComments(false);
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
      }, 500);
    }
  }, [currentIndex, reels.length]);

  // Handle wheel scroll
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        handleScroll('down');
      } else {
        handleScroll('up');
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleScroll]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleScroll('down');
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleScroll('up');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleScroll]);

  // Handle touch swipe
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartRef.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      const touchEnd = e.changedTouches[0].clientY;
      const diff = touchStartRef.current - touchEnd;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          handleScroll('down');
        } else {
          handleScroll('up');
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('touchstart', handleTouchStart);
      container.addEventListener('touchend', handleTouchEnd);
      return () => {
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [handleScroll]);

  const handleLike = useCallback(async () => {
    return requireAuthForLike(async () => {
      const currentReel = reels[currentIndex];
      if (!currentReel || !user) return;

      try {
        const likeDoc = doc(db, 'likes', `${user.uid}_${currentReel.id}`);
        const isLiked = userReactions[currentReel.id] === 'like';

        if (isLiked) {
          await deleteDoc(likeDoc);
          await updateDoc(doc(db, 'posts', currentReel.id), {
            likes: increment(-1)
          });
          setUserReactions(prev => ({
            ...prev,
            [currentReel.id]: null
          }));
        } else {
          await setDoc(likeDoc, {
            userId: user.uid,
            postId: currentReel.id,
            createdAt: new Date()
          });
          await updateDoc(doc(db, 'posts', currentReel.id), {
            likes: increment(1)
          });
          setUserReactions(prev => ({
            ...prev,
            [currentReel.id]: 'like'
          }));
          await logUserAction(user.uid, userProfile?.displayName || user.email, ACTIONS.LIKE_POST, { postId: currentReel.id, postAuthor: currentReel.authorName });

          if (currentReel.authorId !== user.uid) {
            await updateReputation(currentReel.authorId, 1);
            await createNotification(
              currentReel.authorId,
              notificationTypes.LIKE,
              `${userProfile?.displayName || user.email} đã thích video: "${currentReel.title}"`,
              currentReel.id
            );
            try {
              await missionsService.updateLikeMission(currentReel.authorId);
            } catch (missionError) {
              console.error('Error updating like mission:', missionError);
            }
          }
        }
      } catch (error) {
        console.error('Error updating like:', error);
      }
    });
  }, [user, userProfile, currentIndex, reels, userReactions, requireAuthForLike, updateReputation]);

  const handleComment = useCallback(() => {
    return requireAuthForComment(() => {
      setShowComments(true);
    });
  }, [requireAuthForComment]);

  if (loading) {
    return (
      <div className="reels-container loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="reels-container empty">
        <div className="empty-state">
          <p>Chưa có video nào</p>
          <button onClick={() => navigate('/')} className="back-btn">
            Quay lại trang chủ
          </button>
        </div>
      </div>
    );
  }

  const currentReel = reels[currentIndex];
  const videoMedia = currentReel.media?.find(m => m.type === 'video');

  return (
    <div className="reels-page" ref={containerRef}>
      <button
        className="close-btn"
        onClick={() => navigate('/')}
        aria-label="Đóng"
      >
        <X size={24} />
      </button>

      <div className="reels-container">
        <div className="reel-video-wrapper">
          {videoMedia && (
            <OptimizedVideoPlayer
              key={currentReel.id}
              src={videoMedia.url}
              poster={videoMedia.thumbnailUrl}
              controls={true}
              autoPlay={true}
              muted={true}
              lazy={false}
              style={{ width: '100%', height: '100%' }}
            />
          )}
        </div>

        <div className="reel-sidebar-left">
          <div className="author-info">
            <OptimizedImage
              src={currentReel.authorAvatar || `https://ui-avatars.com/api/?name=${currentReel.authorName}&background=4CAF50&color=fff`}
              alt={currentReel.authorName}
              width={40}
              height={40}
              className="author-avatar"
              onClick={() => navigate(`/user/${currentReel.authorId}`)}
            />
            <div className="author-details">
              <h4 className="author-name" onClick={() => navigate(`/user/${currentReel.authorId}`)}>
                {currentReel.authorName}
              </h4>
              <p className="author-time">
                {moment(currentReel.createdAt instanceof Date ? currentReel.createdAt : currentReel.createdAt?.toDate?.() || new Date()).fromNow()}
              </p>
            </div>
            <button className="follow-btn">Theo dõi</button>
          </div>

          <div className="reel-description">
            <p>{currentReel.title || currentReel.content}</p>
          </div>
        </div>

        <div className="reel-sidebar-right">
          <div className="action-button">
            <button
              className={`icon-btn ${userReactions[currentReel.id] === 'like' ? 'active' : ''}`}
              onClick={handleLike}
            >
              <Heart size={28} fill={userReactions[currentReel.id] === 'like' ? 'currentColor' : 'none'} />
            </button>
            <span className="action-count">{currentReel.likes || 0}</span>
          </div>

          <div className="action-button">
            <button className="icon-btn" onClick={handleComment}>
              <MessageCircle size={28} />
            </button>
            <span className="action-count">{currentReel.comments || 0}</span>
          </div>

          <div className="action-button">
            <button className="icon-btn">
              <Share2 size={28} />
            </button>
            <span className="action-count">Chia sẻ</span>
          </div>

          <div className="action-button">
            <button className="icon-btn">
              <MoreHorizontal size={28} />
            </button>
          </div>
        </div>

        <div className="reel-bottom-nav">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${((currentIndex + 1) / reels.length) * 100}%` }}></div>
          </div>
          <div className="nav-buttons">
            <button
              className="nav-btn prev-btn"
              onClick={() => handleScroll('up')}
              disabled={currentIndex === 0}
              aria-label="Video trước"
            >
              <ChevronUp size={20} />
            </button>
            <span className="reel-counter">{currentIndex + 1} / {reels.length}</span>
            <button
              className="nav-btn next-btn"
              onClick={() => handleScroll('down')}
              disabled={currentIndex === reels.length - 1}
              aria-label="Video tiếp theo"
            >
              <ChevronDown size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Comments Overlay */}
      {showComments && (
        <div className="reel-comments-overlay">
          <div className="reel-comments-panel">
            <div className="reel-comments-header">
              <h3>Bình luận</h3>
              <button 
                className="close-comments-btn"
                onClick={() => setShowComments(false)}
              >
                <X size={24} />
              </button>
            </div>
            <div className="reel-comments-content">
              <CommentSection 
                postId={currentReel.id}
                postAuthorId={currentReel.authorId}
                postContent={currentReel.content}
                postTitle={currentReel.title}
                onCommentCountChange={() => {}}
              />
            </div>
          </div>
        </div>
      )}

      <LoginModal 
        isOpen={showLoginModal || authShowLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          authSetShowLoginModal(false);
        }}
        message="Đăng nhập để tương tác với video"
        feature="thích và bình luận video"
      />
    </div>
  );
};

export default ReelsPage;
