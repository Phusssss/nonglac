import React, { useState, useCallback, useEffect } from 'react';
import { doc, updateDoc, increment, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { createNotification, notificationTypes } from '../services/notificationService';
import ImageGallery from './ImageGallery';
import CommentSection from './CommentSection';
import ShareDialog from './ShareDialog';
import PostMenu from './PostMenu';
import FollowButton from './FollowButton';
import SaveButton from './SaveButton';
import ReactionButton from './ReactionButton';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { useChat } from '../contexts/ChatContext';
import { Heart, MessageCircle, Share2, MoreHorizontal, UserPlus, Bookmark } from 'lucide-react';

const PostCard = ({ post, isDetailView = false }) => {
  const { user, userProfile, updateReputation } = useAuth();
  const navigate = useNavigate();
  const { startChat } = useChat();
  const [likes, setLikes] = useState(post.likes || 0);
  const [userReaction, setUserReaction] = useState(null);
  
  // Load user's like status
  useEffect(() => {
    if (!user || !post.id) return;
    
    const likeDoc = doc(db, 'likes', `${user.uid}_${post.id}`);
    const unsubscribe = onSnapshot(likeDoc, (doc) => {
      setUserReaction(doc.exists() ? 'like' : null);
    });
    
    return unsubscribe;
  }, [user, post.id]);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments || 0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  
  const contentLimit = 200;
  const shouldTruncate = post.content.length > contentLimit;

  const handleReaction = useCallback(async (reactionType) => {
    if (!user) return;
    
    const wasLiked = userReaction === 'like';
    const willLike = reactionType === 'like';
    
    try {
      const likeDoc = doc(db, 'likes', `${user.uid}_${post.id}`);
      
      if (wasLiked) {
        // Unlike
        await deleteDoc(likeDoc);
        await updateDoc(doc(db, 'posts', post.id), {
          likes: increment(-1)
        });
      } else if (willLike) {
        // Like
        await setDoc(likeDoc, {
          userId: user.uid,
          postId: post.id,
          createdAt: new Date()
        });
        await updateDoc(doc(db, 'posts', post.id), {
          likes: increment(1)
        });
        
        if (post.authorId !== user.uid) {
          await updateReputation(post.authorId, 1);
          await createNotification(
            post.authorId,
            notificationTypes.LIKE,
            `${userProfile?.displayName || user.email} đã thích bài viết: "${post.title}"`,
            post.id
          );
        }
      }
    } catch (error) {
      console.error('Error updating like:', error);
    }
  }, [user, userReaction, post.id, post.authorId, updateReputation, userProfile]);

  const getReputationColor = (reputation) => {
    if (reputation >= 100) return 'success';
    if (reputation >= 50) return 'warning';
    return 'default';
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-4 sm:mb-6 hover:shadow-md transition-shadow">
      {/* Post Header */}
      <div className="p-4 sm:p-6 pb-3 sm:pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <img
              src={post.authorAvatar || `https://ui-avatars.com/api/?name=${post.authorName}&background=4CAF50&color=fff`}
              alt={post.authorName}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full cursor-pointer hover:ring-2 hover:ring-[#4CAF50] transition-all flex-shrink-0"
              onClick={() => navigate(`/user/${post.authorId}`)}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 
                  className="font-medium text-[#795548] cursor-pointer hover:text-[#4CAF50] transition-colors text-sm sm:text-base truncate"
                  onClick={() => navigate(`/user/${post.authorId}`)}
                >
                  {post.authorName}
                </h4>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                  {post.authorReputation || 0}
                </span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-gray-500">
                <span className="truncate">{moment(post.createdAt instanceof Date ? post.createdAt : post.createdAt?.toDate?.() || new Date()).fromNow()}</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full truncate max-w-[100px] sm:max-w-none">
                  {post.category}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
            {user && post.authorId !== user.uid && (
              <div className="hidden sm:block">
                <FollowButton targetUserId={post.authorId} targetUserName={post.authorName} />
              </div>
            )}
            <SaveButton postId={post.id} />
            <button 
              onClick={(e) => setMenuAnchor(e.currentTarget)}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <MoreHorizontal className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 sm:px-6 pb-3 sm:pb-4">
        {post.title && (
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 leading-tight">
            {post.title}
          </h3>
        )}
        <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
          {shouldTruncate && !showFullContent 
            ? post.content.substring(0, contentLimit) + '...' 
            : post.content}
          {shouldTruncate && (
            <button 
              onClick={() => setShowFullContent(!showFullContent)}
              className="ml-1 text-[#4CAF50] hover:text-[#45a049] font-medium text-sm"
            >
              {showFullContent ? 'Thu gọn' : 'Xem thêm'}
            </button>
          )}
        </p>
      </div>

      {/* Post Images */}
      {post.images && post.images.length > 0 && (
        <div className="px-4 sm:px-6 pb-3 sm:pb-4">
          <ImageGallery images={post.images} />
        </div>
      )}

      {/* Post Actions */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-6 overflow-x-auto">
            <ReactionButton
              onReaction={handleReaction}
              currentReaction={userReaction}
              totalLikes={likes}
            />
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-1 sm:space-x-2 text-gray-500 hover:text-[#4CAF50] transition-colors whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm">Bình luận {commentCount > 0 && `(${commentCount})`}</span>
            </button>
            <button 
              onClick={() => setShowShareDialog(true)}
              className="flex items-center space-x-1 sm:space-x-2 text-gray-500 hover:text-[#4CAF50] transition-colors whitespace-nowrap"
            >
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs sm:text-sm hidden sm:inline">Chia sẻ</span>
            </button>
            {post.authorId !== user?.uid && (
              <button 
                onClick={() => startChat(post.authorId, post.authorName)}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-500 hover:text-[#4CAF50] transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-xs sm:text-sm hidden sm:inline">Nhắn tin</span>
              </button>
            )}
          </div>
          {!isDetailView && (
            <button
              onClick={() => navigate(`/post/${post.id}`)}
              className="text-xs sm:text-sm text-gray-500 hover:text-[#4CAF50] transition-colors whitespace-nowrap ml-2"
            >
              <span className="hidden sm:inline">Xem chi tiết</span>
              <span className="sm:hidden">Chi tiết</span>
            </button>
          )}
        </div>
      </div>
      
      {/* Comments Section */}
      {showComments && (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-100">
          <CommentSection 
            postId={post.id}
            postAuthorId={post.authorId}
            onCommentCountChange={setCommentCount}
          />
        </div>
      )}
      
      <ShareDialog 
        open={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        post={post}
      />
      
      <PostMenu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
        post={post}
        currentUser={user}
        onPostUpdated={() => window.location.reload()}
        onPostDeleted={() => window.location.reload()}
      />
    </div>
  );
};

export default React.memo(PostCard);