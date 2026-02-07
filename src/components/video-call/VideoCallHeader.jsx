import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { motion } from 'framer-motion';

/**
 * VideoCallHeader Component
 * 
 * Header component for video call interface
 * Displays connection status and close button
 * 
 * @component
 * @param {Object} props
 * @param {string} props.status - Current call status
 * @param {boolean} props.isSimulationMode - Whether in simulation mode
 * @param {Function} props.onClose - Handler for close button
 */
const VideoCallHeader = ({ status, isSimulationMode = false, onClose }) => {
  // Status configuration with colors and Vietnamese text
  const statusConfig = {
    connecting: {
      text: 'Đang kết nối...',
      color: 'bg-yellow-500',
      dotColor: 'bg-yellow-400',
    },
    listening: {
      text: 'Đang lắng nghe',
      color: 'bg-green-500',
      dotColor: 'bg-green-400',
    },
    thinking: {
      text: 'Đang suy nghĩ...',
      color: 'bg-blue-500',
      dotColor: 'bg-blue-400',
    },
    speaking: {
      text: 'Đang nói',
      color: 'bg-purple-500',
      dotColor: 'bg-purple-400',
    },
    error: {
      text: 'Lỗi kết nối',
      color: 'bg-red-500',
      dotColor: 'bg-red-400',
    },
    announcement: {
      text: 'Thông báo',
      color: 'bg-cyan-500',
      dotColor: 'bg-cyan-400',
    },
  };

  const currentStatus = statusConfig[status] || statusConfig.connecting;

  return (
    <div className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-4 bg-black/30 backdrop-blur-md">
      {/* Status Badge */}
      <div className="flex items-center space-x-3">
        {/* Animated Dot Indicator */}
        <motion.div
          className={`w-3 h-3 rounded-full ${currentStatus.dotColor}`}
          animate={{
            opacity: [1, 0.5, 1],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        
        {/* Status Text removed for total clean UI */}

        {/* Simulation Mode Badge */}
        {isSimulationMode && (
          <span className="ml-2 px-2 py-1 text-xs bg-orange-500/80 text-white rounded-full">
            Chế độ mô phỏng
          </span>
        )}
      </div>

      {/* Close Button */}
      <Button
        type="text"
        shape="circle"
        size="large"
        icon={<CloseOutlined />}
        onClick={onClose}
        className="w-10 h-10 flex items-center justify-center bg-white/10 text-white hover:bg-white/20 transition-all duration-200"
        aria-label="Đóng cuộc gọi"
      />
    </div>
  );
};

VideoCallHeader.propTypes = {
  status: PropTypes.oneOf([
    'connecting',
    'listening',
    'thinking',
    'speaking',
    'error',
    'announcement',
  ]).isRequired,
  isSimulationMode: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

export default VideoCallHeader;
