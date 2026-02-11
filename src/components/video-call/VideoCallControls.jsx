import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import {
  VideoCameraOutlined,
  VideoCameraAddOutlined,
  CameraOutlined,
  PhoneOutlined,
  PictureOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';

/**
 * VideoCallControls Component
 * 
 * Bottom control panel for video call interface
 * Provides buttons for camera, capture, upload, and call management
 * Note: Microphone/voice input removed - TTS output only
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.isCameraOn - Whether camera is active
 * @param {boolean} props.canCapture - Whether image capture is available
 * @param {Function} props.onToggleCamera - Handler for camera toggle
 * @param {Function} props.onSwitchCamera - Handler for camera switch (front/back)
 * @param {Function} props.onCapture - Handler for image capture
 * @param {Function} props.onUploadImage - Handler for image upload
 * @param {Function} props.onEndCall - Handler for ending call
 */
const VideoCallControls = ({
  isCameraOn,
  canCapture,
  onToggleCamera,
  onSwitchCamera,
  onCapture,
  onUploadImage,
  onEndCall,
}) => {
  // File input ref for image upload
  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file && onUploadImage) {
      onUploadImage(file);
    }
    // Reset input to allow selecting the same file again
    event.target.value = '';
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="h-32 bg-white/5 backdrop-blur-lg flex items-center justify-center space-x-8 pb-6 pt-4 z-20 rounded-t-[2rem] border-t border-white/5">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Chọn ảnh để upload"
      />
      {/* Camera Toggle Button */}
      <Button
        type="text"
        shape="circle"
        size="large"
        icon={isCameraOn ? <VideoCameraOutlined /> : <VideoCameraAddOutlined />}
        onClick={onToggleCamera}
        className={`
          w-14 h-14 flex items-center justify-center
          transition-all duration-200
          ${isCameraOn 
            ? 'bg-white/20 text-white hover:bg-white/30' 
            : 'bg-white/10 text-white/50 hover:bg-white/20'
          }
        `}
        aria-label={isCameraOn ? 'Tắt camera' : 'Bật camera'}
      />

      {/* Note: Microphone button removed - no voice input support */}

      {/* Capture Button */}
      <motion.div
        whileTap={canCapture ? { scale: 0.9 } : {}}
        transition={{ duration: 0.1 }}
      >
        <Button
          type="primary"
          shape="circle"
          size="large"
          icon={<CameraOutlined />}
          onClick={onCapture}
          disabled={!canCapture}
          className={`
            w-20 h-20 flex items-center justify-center
            text-2xl
            ${canCapture 
              ? 'bg-[#1CBECF] hover:bg-[#17a8b8] border-4 border-white/30' 
              : 'bg-gray-500/50 cursor-not-allowed'
            }
          `}
          aria-label="Chụp ảnh"
        />
      </motion.div>

      {/* Upload Image Button */}
      <Button
        type="text"
        shape="circle"
        size="large"
        icon={<PictureOutlined />}
        onClick={handleUploadClick}
        className="w-14 h-14 flex items-center justify-center bg-white/20 text-white hover:bg-white/30 transition-all duration-200"
        aria-label="Upload ảnh"
      />

      {/* Camera Switch Button */}
      {isCameraOn && (
        <Button
          type="text"
          shape="circle"
          size="large"
          icon={
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          }
          onClick={onSwitchCamera}
          className="w-14 h-14 flex items-center justify-center bg-white/20 text-white hover:bg-white/30 transition-all duration-200"
          aria-label="Đổi camera"
        />
      )}

      {/* End Call Button */}
      <Button
        type="primary"
        shape="circle"
        size="large"
        danger
        icon={
          <PhoneOutlined 
            style={{ 
              transform: 'rotate(135deg)',
              fontSize: '20px'
            }} 
          />
        }
        onClick={onEndCall}
        className="w-14 h-14 flex items-center justify-center bg-red-500 hover:bg-red-600"
        aria-label="Kết thúc cuộc gọi"
      />
    </div>
  );
};

VideoCallControls.propTypes = {
  isCameraOn: PropTypes.bool.isRequired,
  canCapture: PropTypes.bool.isRequired,
  onToggleCamera: PropTypes.func.isRequired,
  onSwitchCamera: PropTypes.func.isRequired,
  onCapture: PropTypes.func.isRequired,
  onUploadImage: PropTypes.func,
  onEndCall: PropTypes.func.isRequired,
};

export default VideoCallControls;
