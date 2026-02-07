import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import VideoCallContainer from '../components/video-call/VideoCallContainer';

/**
 * AIVideoCall Page Component
 * 
 * Entry point page for AI video call feature.
 * Handles authentication, routing, and AI usage tracking.
 * 
 * Features:
 * - Authentication check and redirect
 * - AI usage tracking integration
 * - Page-level animations
 * - Navigation handling
 * 
 * Route: /ai-video-call
 * 
 * @component
 */
const AIVideoCall = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();

  // ============================================================================
  // AUTHENTICATION CHECK
  // ============================================================================
  
  /**
   * Redirect to login if user is not authenticated
   */
  useEffect(() => {
    if (!user) {
      navigate('/login', { 
        state: { 
          from: '/ai-video-call',
          message: 'Vui lòng đăng nhập để sử dụng tính năng gọi video AI' 
        } 
      });
    }
  }, [user, navigate]);

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handle close button click
   * Navigate back to previous page or home
   */
  const handleClose = () => {
    navigate(-1);
  };

  /**
   * Handle AI usage event
   * Called when user captures an image for AI analysis
   * Can be extended to track usage limits and quotas
   */
  const handleUsage = () => {
    // TODO: Implement AI usage tracking
    // - Increment user's AI usage count
    // - Check against usage limits
    // - Show warning if near limit
    console.log('AI usage event:', {
      userId: user?.uid,
      timestamp: new Date().toISOString(),
      feature: 'video-call-capture'
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  // Get user's display name (memoized to prevent re-renders)
  const userName = useMemo(() => {
    return userProfile?.displayName || user?.displayName || 'Bạn';
  }, [userProfile?.displayName, user?.displayName]);

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50"
    >
      <VideoCallContainer
        userName={userName}
        onClose={handleClose}
        onUsage={handleUsage}
      />
    </motion.div>
  );
};

export default AIVideoCall;
