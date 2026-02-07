import React from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import AudioVisualizer from './AudioVisualizer';
import FocusReticle from './FocusReticle';

/**
 * VideoStream Component
 * 
 * Main video display component for AI video call feature
 * Handles video element rendering, audio visualization, focus reticle,
 * and flash effects for image capture
 * 
 * @component
 * @param {Object} props
 * @param {React.RefObject} props.videoRef - Ref for video element
 * @param {React.RefObject} props.canvasRef - Ref for hidden canvas (image capture)
 * @param {React.RefObject} props.visualizerRef - Ref for audio visualizer canvas
 * @param {boolean} props.isCameraOn - Whether camera is active
 * @param {string} props.facingMode - Camera facing mode ('user' or 'environment')
 * @param {boolean} props.showReticle - Whether to show focus reticle
 * @param {boolean} props.flash - Whether flash effect is active
 * @param {AnalyserNode} props.analyserNode - Web Audio API analyser for visualization
 */
const VideoStream = ({
  videoRef,
  canvasRef,
  visualizerRef = null,
  isCameraOn,
  facingMode,
  showReticle = false,
  flash = false,
  analyserNode = null
}) => {
  // Debug log
  console.log('VideoStream render - isCameraOn:', isCameraOn, 'facingMode:', facingMode);
  
  return (
    <div className="relative flex-1 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" style={{ minHeight: '100%' }}>
      {/* Video Element - ALWAYS VISIBLE FOR DEBUG */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
          zIndex: 999,
          backgroundColor: 'red'
        }}
      />

      {/* Hidden Canvas for Image Capture */}
      <canvas
        ref={canvasRef}
        className="hidden"
        aria-hidden="true"
      />

      {/* Audio Visualizer Overlay */}
      {isCameraOn && (
        <AudioVisualizer
          analyserNode={analyserNode}
          isActive={isCameraOn}
        />
      )}

      {/* Focus Reticle Overlay */}
      <FocusReticle isActive={showReticle && isCameraOn} />

      {/* Flash Effect */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-white pointer-events-none"
            style={{ zIndex: 30 }}
          />
        )}
      </AnimatePresence>

      {/* Background Gradient (when camera is off) */}
      {!isCameraOn && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white opacity-50">
            <svg
              className="w-24 h-24 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            <p className="text-lg">Camera đang tắt</p>
          </div>
        </div>
      )}
    </div>
  );
};

VideoStream.propTypes = {
  videoRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element)
  }).isRequired,
  canvasRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element)
  }).isRequired,
  visualizerRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element)
  }),
  isCameraOn: PropTypes.bool.isRequired,
  facingMode: PropTypes.oneOf(['user', 'environment']).isRequired,
  showReticle: PropTypes.bool,
  flash: PropTypes.bool,
  analyserNode: PropTypes.object
};

export default VideoStream;
