import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { useVideoCall } from '../../hooks/useVideoCall';
import VideoCallHeader from './VideoCallHeader';
import VideoStream from './VideoStream';
import VideoCallControls from './VideoCallControls';
import LacLacMascot from '../LacLacMascot';
import ErrorDisplay from '../common/ErrorDisplay';

/**
 * VideoCallContainer Component
 * 
 * Main container component for AI video call feature.
 * Manages the complete video call lifecycle and coordinates all child components.
 * 
 * Features:
 * - Real-time video streaming with camera control
 * - Audio input/output with AI voice responses
 * - Image capture and AI analysis
 * - Interactive mascot with status feedback
 * - Error handling with simulation mode fallback
 * - Tool calling integration (price lookup, diagnosis, store finder)
 * 
 * @component
 * @param {Object} props
 * @param {string} props.userName - User's name for personalized AI interactions
 * @param {Function} props.onClose - Handler for closing the video call
 * @param {Function} props.onUsage - Callback when AI usage occurs (for tracking)
 */
const VideoCallContainer = ({ userName, onClose, onUsage = () => {} }) => {
  // ============================================================================
  // HOOK INTEGRATION
  // ============================================================================
  
  const {
    // State
    status,
    errorMessage,
    isCameraOn,
    facingMode,
    isMicOn,
    isSimulationMode,
    mascotMessage,
    activeTool,
    flash,
    aiResponse,
    
    // Refs
    videoRef,
    canvasRef,
    visualizerRef,
    
    // Audio processor nodes
    inputAnalyser,
    outputAnalyser,
    
    // Actions
    startSession,
    stopSession,
    toggleCamera,
    switchCamera,
    captureAndAnalyze,
    toggleMic,
    
    // Computed
    canCapture,
  } = useVideoCall(userName, onUsage);

  // ============================================================================
  // LIFECYCLE MANAGEMENT
  // ============================================================================
  
  /**
   * Initialize video call session on mount
   */
  useEffect(() => {
    let mounted = true;
    let sessionStarted = false;
    
    const initSession = async () => {
      if (mounted) {
        await startSession();
        sessionStarted = true;
      }
    };
    
    initSession();
    
    // Cleanup on unmount
    return () => {
      mounted = false;
      // Only stop if session was actually started
      if (sessionStarted) {
        console.log('VideoCallContainer unmounting, stopping session');
        stopSession();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  
  /**
   * Handle close button click
   * Stops session and calls parent onClose handler
   */
  const handleClose = () => {
    stopSession();
    onClose();
  };

  /**
   * Handle retry after error
   * Attempts to restart the session
   */
  const handleRetry = () => {
    startSession();
  };

  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="fixed inset-0 z-50 bg-[#1A1C1E] flex flex-col font-sans">
      {/* Header */}
      <VideoCallHeader
        status={status}
        isSimulationMode={isSimulationMode}
        onClose={handleClose}
      />

      {/* Main Content */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1A1C1E] to-[#0D0E0F]"></div>

        {/* Video */}
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          muted 
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
            opacity: isCameraOn ? 1 : 0,
            transition: 'opacity 0.5s'
          }}
        />
        
        <canvas ref={canvasRef} className="hidden" />

        {/* Flash */}
        <div className={`absolute inset-0 bg-white z-40 pointer-events-none transition-opacity duration-150 ${flash ? 'opacity-80' : 'opacity-0'}`}></div>

        {/* Reticle */}
        {isCameraOn && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
            <div className="w-72 h-72 border border-white/20 rounded-2xl relative">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white rounded-tl-lg"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white rounded-tr-lg"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white rounded-bl-lg"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white rounded-br-lg"></div>
              <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-white/50 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          </div>
        )}

        {/* Mascot */}
        {!isCameraOn && (
          <div className="relative z-20 flex flex-col items-center">
            <LacLacMascot status={status} size="large" />
          </div>
        )}
      </div>

      {/* Controls */}
      <VideoCallControls
        isCameraOn={isCameraOn}
        isMicOn={isMicOn}
        canCapture={canCapture}
        onToggleCamera={toggleCamera}
        onSwitchCamera={switchCamera}
        onCapture={captureAndAnalyze}
        onToggleMic={toggleMic}
        onEndCall={handleClose}
      />
    </div>
  );
};

VideoCallContainer.propTypes = {
  userName: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onUsage: PropTypes.func,
};

export default VideoCallContainer;
