import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import { collection, addDoc, query, where, orderBy, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import moment from 'moment';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { createNotification, notificationTypes } from '../services/notificationService';
import { useNavigate } from 'react-router-dom';
import { chatWithAgriBot, replyToComment } from '../services/geminiService';

const CommentSection = ({ postId, postAuthorId, postContent, postTitle, onCommentCountChange }) => {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReplyingTo, setAiReplyingTo] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'comments'),
      where('postId', '==', postId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComments(commentsData);
      onCommentCountChange?.(commentsData.length);
    });

    return unsubscribe;
  }, [postId, onCommentCountChange]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setLoading(true);
    try {
      await addDoc(collection(db, 'comments'), {
        postId,
        content: newComment.trim(),
        authorId: user.uid,
        authorName: userProfile?.displayName || user.email,
        authorAvatar: userProfile?.avatar || null,
        authorReputation: userProfile?.reputation || 0,
        createdAt: new Date(),
        likes: 0,
        parentId: null
      });

      // Chỉ cập nhật số comment cho bài viết Firebase (không phải sample data)
      if (postId && !postId.toString().match(/^[0-9]+$/)) {
        await updateDoc(doc(db, 'posts', postId), {
          comments: increment(1)
        });
      }

      // Tạo thông báo cho tác giả bài viết
      if (postAuthorId && postAuthorId !== user.uid) {
        await createNotification(
          postAuthorId,
          notificationTypes.COMMENT,
          `${userProfile?.displayName || user.email} đã bình luận bài viết của bạn`,
          postId
        );
      }

      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeComment = async (commentId, currentLikes) => {
    if (!user) return;
    
    try {
      await updateDoc(doc(db, 'comments', commentId), {
        likes: increment(1)
      });
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };
  
  const handleReply = async (parentCommentId) => {
    if (!user || !replyText.trim()) return;
    
    setLoading(true);
    try {
      await addDoc(collection(db, 'comments'), {
        postId,
        content: replyText.trim(),
        authorId: user.uid,
        authorName: userProfile?.displayName || user.email,
        authorAvatar: userProfile?.avatar || null,
        authorReputation: userProfile?.reputation || 0,
        createdAt: new Date(),
        likes: 0,
        parentId: parentCommentId
      });
      
      // Tạo thông báo cho người được reply
      const parentComment = comments.find(c => c.id === parentCommentId);
      if (parentComment && parentComment.authorId !== user.uid) {
        await createNotification(
          parentComment.authorId,
          notificationTypes.COMMENT,
          `${userProfile?.displayName || user.email} đã trả lời bình luận của bạn`,
          postId
        );
      }
      
      setReplyText('');
      setReplyingTo(null);
    } catch (error) {
      console.error('Error adding reply:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const getParentComments = () => {
    return comments.filter(comment => !comment.parentId);
  };
  
  const getReplies = (parentId) => {
    return comments.filter(comment => comment.parentId === parentId);
  };

  const handleAiReply = async () => {
    setAiLoading(true);
    try {
      // Gọi Gemini API để tạo comment thông minh
      const prompt = `Với tư cách là chuyên gia nông nghiệp AgriBot, hãy viết một bình luận hữu ích, ngắn gọn để trả lời cho bài viết này: "${postTitle}: ${postContent}"`;
      const aiResponse = await chatWithAgriBot([], prompt);
      
      // Kiểm tra nếu service trả về null (user chưa đăng nhập)
      if (aiResponse === null) {
        // Service đã xử lý auth guard, không cần làm gì thêm
        return;
      }
      
      await addDoc(collection(db, 'comments'), {
        postId,
        content: aiResponse,
        authorId: 'ai-bot',
        authorName: 'AgriBot (AI)',
        authorAvatar: 'https://ui-avatars.com/api/?name=Agri+Bot&background=16a34a&color=fff',
        authorReputation: 999,
        createdAt: new Date(),
        likes: 0,
        parentId: null,
        isAI: true
      });

      if (postId && !postId.toString().match(/^[0-9]+$/)) {
        await updateDoc(doc(db, 'posts', postId), {
          comments: increment(1)
        });
      }
    } catch (error) {
      console.error('Error adding AI comment:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiReplyToComment = async (comment) => {
    setAiReplyingTo(comment.id);
    try {
      // Gọi Gemini API để reply comment
      const prompt = `Ngữ cảnh bài viết: "${postTitle}: ${postContent}". Người dùng ${comment.authorName} đã bình luận: "${comment.content}". Là AgriBot, hãy trả lời trực tiếp cho bình luận của ${comment.authorName} một cách lịch sự, hữu ích và ngắn gọn. Bắt đầu bằng "Chào @${comment.authorName},...".`;
      const aiResponse = await chatWithAgriBot([], prompt);
      
      // Kiểm tra nếu service trả về null (user chưa đăng nhập)
      if (aiResponse === null) {
        // Service đã xử lý auth guard, không cần làm gì thêm
        return;
      }
      
      await addDoc(collection(db, 'comments'), {
        postId,
        content: aiResponse,
        authorId: 'ai-bot',
        authorName: 'AgriBot (AI)',
        authorAvatar: 'https://ui-avatars.com/api/?name=Agri+Bot&background=16a34a&color=fff',
        authorReputation: 999,
        createdAt: new Date(),
        likes: 0,
        parentId: comment.id,
        isAI: true
      });
    } catch (error) {
      console.error('Error adding AI reply:', error);
    } finally {
      setAiReplyingTo(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Reply Button */}
      <button 
        onClick={handleAiReply}
        disabled={aiLoading}
        className="flex items-center gap-1 text-agri-600 bg-agri-50 hover:bg-agri-100 px-3 py-1.5 rounded-full text-xs font-bold transition-colors disabled:opacity-50"
      >
        {aiLoading ? (
          <span className="animate-pulse flex items-center gap-1">
            <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            Đang viết...
          </span>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            AgriBot Trả Lời
          </>
        )}
      </button>

      {user && (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <img 
            src={userProfile?.avatar || `https://ui-avatars.com/api/?name=${userProfile?.displayName || user.email}&background=4CAF50&color=fff`}
            alt="Your avatar"
            className="w-8 h-8 rounded-full border border-gray-200 bg-white flex-shrink-0"
          />
          <div className="flex-1">
            <div className="relative">
              <input
                type="text"
                placeholder="Viết bình luận..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full px-4 py-2 pr-10 rounded-full border border-gray-200 focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50] outline-none text-sm bg-white"
              />
              <button
                type="submit"
                disabled={loading || !newComment.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#4CAF50] hover:bg-green-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {getParentComments().map((comment) => (
          <div key={comment.id} className="flex gap-3 group">
            <img 
              src={comment.authorAvatar || `https://ui-avatars.com/api/?name=${comment.authorName}&background=random&color=fff`}
              alt={comment.authorName}
              className="w-8 h-8 rounded-full border border-gray-200 bg-white flex-shrink-0 cursor-pointer"
              onClick={() => navigate(`/user/${comment.authorId}`)}
            />
            <div className="flex-1">
              <div className="bg-white p-2.5 rounded-2xl shadow-sm text-sm border border-gray-100 inline-block max-w-full">
                <div className="font-bold text-gray-800 text-xs mb-1 flex items-center gap-2">
                  <span 
                    className="cursor-pointer hover:text-[#4CAF50] transition-colors"
                    onClick={() => comment.authorId !== 'ai-bot' && navigate(`/user/${comment.authorId}`)}
                  >
                    {comment.authorName}
                  </span>
                  {comment.isAI && <span className="bg-agri-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">AI</span>}
                </div>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{comment.content}</p>
              </div>
              
              <div className="flex items-center gap-3 mt-1 ml-2">
                <span className="text-xs text-gray-400">
                  {moment(comment.createdAt?.toDate()).fromNow()}
                </span>
                <button 
                  onClick={() => handleLikeComment(comment.id, comment.likes)}
                  className="text-xs text-gray-500 font-semibold hover:text-[#4CAF50]"
                >
                  Thích {comment.likes > 0 && `(${comment.likes})`}
                </button>
                {user && (
                  <button
                    onClick={() => setReplyingTo(comment.id)}
                    className="text-xs text-gray-500 font-semibold hover:text-[#4CAF50]"
                  >
                    Trả lời
                  </button>
                )}
                {!comment.isAI && comment.authorId !== 'ai-bot' && (
                  <>
                    <span className="text-xs text-gray-300">•</span>
                    <button 
                      onClick={() => handleAiReplyToComment(comment)}
                      disabled={aiReplyingTo === comment.id}
                      className="text-xs text-agri-600 font-bold hover:text-agri-700 flex items-center gap-1 opacity-80 hover:opacity-100 transition-opacity disabled:opacity-50"
                    >
                      {aiReplyingTo === comment.id ? (
                        <span className="flex items-center gap-1 text-gray-400">
                          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                          Đang đọc...
                        </span>
                      ) : (
                        <>
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          AgriBot tư vấn
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
              {comment.isAI && (
                <div className="mt-1 ml-2 text-xs text-gray-400 italic">Được tạo tự động bởi AI</div>
              )}
              
              {/* Reply form */}
              {replyingTo === comment.id && (
                <div className="mt-2 flex gap-2 items-start">
                  <img 
                    src={userProfile?.avatar || `https://ui-avatars.com/api/?name=${userProfile?.displayName || user?.email}&background=4CAF50&color=fff`}
                    alt="Your avatar"
                    className="w-6 h-6 rounded-full border border-gray-200 bg-white flex-shrink-0"
                  />
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Viết phản hồi..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-full border border-gray-200 focus:border-[#4CAF50] focus:ring-1 focus:ring-[#4CAF50] outline-none text-sm"
                    />
                    <div className="mt-1 flex gap-2">
                      <button
                        onClick={() => handleReply(comment.id)}
                        disabled={!replyText.trim() || loading}
                        className="text-xs px-3 py-1 bg-[#4CAF50] text-white rounded-full hover:bg-[#45a049] disabled:opacity-50"
                      >
                        Gửi
                      </button>
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyText('');
                        }}
                        className="text-xs px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-full"
                      >
                        Hủy
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Replies */}
              {getReplies(comment.id).map((reply) => (
                <div key={reply.id} className="ml-4 mt-2 flex gap-2">
                  <img 
                    src={reply.authorAvatar || `https://ui-avatars.com/api/?name=${reply.authorName}&background=random&color=fff`}
                    alt={reply.authorName}
                    className="w-7 h-7 rounded-full border border-gray-200 bg-white flex-shrink-0 cursor-pointer"
                    onClick={() => navigate(`/user/${reply.authorId}`)}
                  />
                  <div className="flex-1">
                    <div className="bg-white p-2 rounded-2xl shadow-sm text-sm border border-gray-100 inline-block max-w-full">
                      <div className="font-bold text-gray-800 text-xs mb-1">
                        <span 
                          className="cursor-pointer hover:text-[#4CAF50] transition-colors"
                          onClick={() => navigate(`/user/${reply.authorId}`)}
                        >
                          {reply.authorName}
                        </span>
                      </div>
                      <p className="text-gray-700 text-xs whitespace-pre-wrap">{reply.content}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 ml-2">
                      <span className="text-xs text-gray-400">
                        {moment(reply.createdAt?.toDate()).fromNow()}
                      </span>
                      <button 
                        onClick={() => handleLikeComment(reply.id, reply.likes)}
                        className="text-xs text-gray-500 font-semibold hover:text-[#4CAF50]"
                      >
                        Thích {reply.likes > 0 && `(${reply.likes})`}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;