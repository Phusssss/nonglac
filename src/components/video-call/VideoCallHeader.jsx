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
 * @param {string} props.userName - Current user display name
 * @param {boolean} props.isSimulationMode - Whether in simulation mode
 * @param {Function} props.onClose - Handler for close button
 */
const VideoCallHeader = ({
  status,
  userName = 'Bạn',
  isSimulationMode = false,
  onClose,
}) => {
  const statusConfig = {
    connecting: {
      text: 'Đang kết nối...',
      tone: 'bg-amber-500/20 text-amber-200 border-amber-400/30',
      dotColor: 'bg-amber-400',
    },
    connected: {
      text: 'Đã kết nối',
      tone: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
      dotColor: 'bg-emerald-400',
    },
    listening: {
      text: 'Đang lắng nghe',
      tone: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/30',
      dotColor: 'bg-emerald-400',
    },
    thinking: {
      text: 'Đang xử lý...',
      tone: 'bg-sky-500/20 text-sky-200 border-sky-400/30',
      dotColor: 'bg-sky-400',
    },
    speaking: {
      text: 'Đang phản hồi',
      tone: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30',
      dotColor: 'bg-cyan-400',
    },
    analyzing: {
      text: 'Đang phân tích...',
      tone: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30',
      dotColor: 'bg-cyan-400',
    },
    idle: {
      text: 'Sẵn sàng',
      tone: 'bg-slate-500/20 text-slate-200 border-slate-300/30',
      dotColor: 'bg-slate-300',
    },
    error: {
      text: 'Lỗi kết nối',
      tone: 'bg-rose-500/20 text-rose-200 border-rose-400/30',
      dotColor: 'bg-rose-400',
    },
    announcement: {
      text: 'Thông báo',
      tone: 'bg-cyan-500/20 text-cyan-200 border-cyan-400/30',
      dotColor: 'bg-cyan-400',
    },
    simulation: {
      text: 'Chế độ mô phỏng',
      tone: 'bg-orange-500/20 text-orange-200 border-orange-400/30',
      dotColor: 'bg-orange-400',
    },
    disconnected: {
      text: 'Đã ngắt kết nối',
      tone: 'bg-slate-500/20 text-slate-200 border-slate-300/30',
      dotColor: 'bg-slate-300',
    },
  };

  const currentStatus = statusConfig[status] || statusConfig.connecting;

  return (
    <div className="absolute top-0 left-0 right-0 z-30 flex items-start justify-between px-4 pt-4 sm:px-6 sm:pt-6 pointer-events-none">
      <div className="pointer-events-auto rounded-2xl border border-white/15 bg-[#0d141d]/65 backdrop-blur-xl px-4 py-3 shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
        <p className="text-[10px] tracking-[0.16em] uppercase text-white/55">AI Video Assistant</p>
        <p className="text-white text-sm sm:text-base font-semibold mt-1">Xin chào, {userName}</p>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs ${currentStatus.tone}`}>
            <motion.div
              className={`w-2.5 h-2.5 rounded-full ${currentStatus.dotColor}`}
              animate={{
                opacity: [1, 0.45, 1],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.8,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <span>{currentStatus.text}</span>
          </div>

          {isSimulationMode && (
            <span className="px-3 py-1 text-xs rounded-full border border-orange-300/30 bg-orange-500/15 text-orange-200">
              Mô phỏng
            </span>
          )}
        </div>
      </div>

      <Button
        type="text"
        shape="circle"
        size="large"
        icon={<CloseOutlined />}
        onClick={onClose}
        className="pointer-events-auto w-11 h-11 flex items-center justify-center border border-white/20 bg-[#0f1722]/70 text-white hover:bg-[#1a2635] transition-all duration-200"
        aria-label="Đóng cuộc gọi"
      />
    </div>
  );
};

VideoCallHeader.propTypes = {
  status: PropTypes.oneOf([
    'connecting',
    'connected',
    'listening',
    'thinking',
    'speaking',
    'analyzing',
    'idle',
    'error',
    'announcement',
    'simulation',
    'disconnected',
  ]).isRequired,
  userName: PropTypes.string,
  isSimulationMode: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

export default VideoCallHeader;
