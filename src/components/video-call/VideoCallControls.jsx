import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip } from 'antd';
import {
  CameraFilled,
  PhoneOutlined,
  PictureOutlined,
  ReloadOutlined,
  VideoCameraAddOutlined,
  VideoCameraOutlined,
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

  const utilityBtnClass =
    'w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20 hover:border-white/35 transition-all duration-200';

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
              <Button
                type="text"
                shape="circle"
                size="large"
                icon={isCameraOn ? <VideoCameraOutlined /> : <VideoCameraAddOutlined />}
                onClick={onToggleCamera}
                className={`${utilityBtnClass} ${isCameraOn ? '' : 'text-white/65 bg-white/5'}`}
                aria-label={isCameraOn ? 'Tắt camera' : 'Bật camera'}
              />
            </Tooltip>
          </div>

          <div className="flex justify-center">
            {isCameraOn ? (
              <Tooltip title="Đổi camera">
                <Button
                  type="text"
                  shape="circle"
                  size="large"
                  icon={<ReloadOutlined />}
                  onClick={onSwitchCamera}
                  className={utilityBtnClass}
                  aria-label="Đổi camera"
                />
              </Tooltip>
            ) : (
              <div className="w-11 h-11 sm:w-12 sm:h-12 opacity-0 pointer-events-none" />
            )}
          </div>

          <div className="flex justify-center">
            <motion.div whileTap={canCapture ? { scale: 0.94 } : {}} transition={{ duration: 0.12 }}>
              <Tooltip title={canCapture ? 'Chụp ảnh để phân tích' : 'Bật camera để chụp'}>
                <div
                  className={`rounded-full p-1.5 sm:p-2 ${
                    canCapture ? 'bg-cyan-300/30 shadow-[0_0_34px_rgba(120,255,245,0.45)]' : 'bg-slate-400/20'
                  }`}
                >
                  <Button
                    type="text"
                    shape="circle"
                    size="large"
                    icon={<CameraFilled style={{ fontSize: '24px' }} />}
                    onClick={onCapture}
                    disabled={!canCapture}
                    className={`w-[68px] h-[68px] sm:w-[82px] sm:h-[82px] flex items-center justify-center text-2xl border-4 ${
                      canCapture
                        ? '!bg-white hover:!bg-white !text-slate-900 border-white shadow-[0_10px_30px_rgba(255,255,255,0.45)]'
                        : 'bg-slate-500/60 border-slate-300/20 text-white/70 cursor-not-allowed'
                    }`}
                    aria-label="Chụp ảnh"
                  />
                </div>
              </Tooltip>
            </motion.div>
          </div>

          <div className="flex justify-center">
            <Tooltip title="Tải ảnh lên">
              <Button
                type="text"
                shape="circle"
                size="large"
                icon={<PictureOutlined />}
                onClick={handleUploadClick}
                className={utilityBtnClass}
                aria-label="Tải ảnh lên"
              />
            </Tooltip>
          </div>

          <div className="flex justify-center">
            <Tooltip title="Kết thúc cuộc gọi">
              <Button
                type="primary"
                shape="circle"
                size="large"
                danger
                icon={<PhoneOutlined style={{ transform: 'rotate(135deg)', fontSize: '18px' }} />}
                onClick={onEndCall}
                className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 border-0"
                aria-label="Kết thúc cuộc gọi"
              />
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