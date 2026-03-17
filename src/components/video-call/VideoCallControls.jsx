import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'antd';
import {
  VideoCameraFilled,
  PhoneOutlined,
  PictureOutlined,
  SwapOutlined,
  CameraOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';

/**
 * VideoCallControls Component
 *
 * Bottom control panel for video call interface
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
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files?.[0];
    if (file && onUploadImage) {
      onUploadImage(file);
    }
    event.target.value = '';
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const getCameraButtonColor = () => {
    return isCameraOn ? 'text-cyan-400' : 'text-gray-400';
  };

  const getUploadButtonColor = () => {
    return 'text-blue-400';
  };

  const getEndCallButtonColor = () => {
    return 'text-red-500';
  };

  return (
    <div className="relative z-20 px-3 pb-3 sm:px-5 sm:pb-5">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Chọn ảnh để tải lên"
      />

      <div className="mx-auto w-full max-w-4xl rounded-[1.75rem] border border-white/15 bg-[#0d1723]/80 backdrop-blur-2xl px-3 py-3 sm:px-5 sm:py-4 shadow-[0_16px_42px_rgba(0,0,0,0.45)]">
        <div className="grid grid-cols-5 items-center">
          <div className="flex justify-center">
            <Tooltip title={isCameraOn ? 'Tắt camera' : 'Bật camera'}>
              <button
                onClick={onToggleCamera}
                className={`flex items-center justify-center text-4xl transition-all duration-200 ${getCameraButtonColor()} hover:opacity-80 relative`}
                aria-label={isCameraOn ? 'Tắt camera' : 'Bật camera'}
              >
                <VideoCameraFilled />
                {!isCameraOn && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-1.5 bg-red-500 transform -rotate-45 rounded" />
                  </div>
                )}
              </button>
            </Tooltip>
          </div>

          <div className="flex justify-center">
            {isCameraOn ? (
              <Tooltip title="Đổi camera">
                <button
                  onClick={onSwitchCamera}
                  className="flex items-center justify-center text-4xl transition-all duration-200 text-blue-400 hover:opacity-80"
                  aria-label="Đổi camera"
                >
                  <SwapOutlined />
                </button>
              </Tooltip>
            ) : (
              <div className="w-12 h-12 opacity-0 pointer-events-none" />
            )}
          </div>

          <div className="flex justify-center">
            <motion.div whileTap={canCapture ? { scale: 0.94 } : {}} transition={{ duration: 0.12 }}>
              <Tooltip title={canCapture ? 'Chụp ảnh để phân tích' : 'Bật camera để chụp'}>
                <button
                  onClick={onCapture}
                  disabled={!canCapture}
                  className={`flex items-center justify-center text-5xl transition-all duration-200 ${
                    canCapture
                      ? 'text-white hover:opacity-80 cursor-pointer'
                      : 'text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                  aria-label="Chụp ảnh"
                >
                  <CameraOutlined />
                </button>
              </Tooltip>
            </motion.div>
          </div>

          <div className="flex justify-center">
            <Tooltip title="Tải ảnh lên">
              <button
                onClick={handleUploadClick}
                className={`flex items-center justify-center text-4xl transition-all duration-200 ${getUploadButtonColor()} hover:opacity-80`}
                aria-label="Tải ảnh lên"
              >
                <PictureOutlined />
              </button>
            </Tooltip>
          </div>

          <div className="flex justify-center">
            <Tooltip title="Kết thúc cuộc gọi">
              <button
                onClick={onEndCall}
                className={`flex items-center justify-center text-4xl transition-all duration-200 ${getEndCallButtonColor()} hover:opacity-80`}
                aria-label="Kết thúc cuộc gọi"
              >
                <PhoneOutlined style={{ transform: 'rotate(135deg)' }} />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
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