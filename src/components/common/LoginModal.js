import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircleOutlined,
  CloseOutlined,
  LoginOutlined,
  UserAddOutlined
} from '@ant-design/icons';
import logo from '../../assets/images/logo.demo.nontext.png';

const benefits = [
  'Tạo và chia sẻ bài viết nông nghiệp',
  'Kết nối với cộng đồng nông dân',
  'Sử dụng AI hỗ trợ nông nghiệp',
  'Mua bán nông sản trực tuyến'
];

const LoginModal = ({ isOpen, onClose, message, feature }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogin = () => {
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    if (message) {
      localStorage.setItem('loginMessage', message);
    }
    navigate('/phone-login');
    onClose();
  };

  const handleRegister = () => {
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    navigate('/phone-register');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Đóng"
        >
          <CloseOutlined className="text-xl" />
        </button>

        <div className="text-center mb-6">
          <img src={logo} alt="NôngLạc Logo" className="h-16 w-auto mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Đăng nhập để tiếp tục
          </h2>
          <p className="text-gray-600 text-sm">
            {message || `Bạn cần đăng nhập để ${feature || 'sử dụng tính năng này'}`}
          </p>
        </div>

        <div className="mb-6 space-y-3">
          {benefits.map((benefit) => (
            <div key={benefit} className="flex items-center gap-3 text-sm text-gray-700">
              <CheckCircleOutlined className="text-[#4CAF50] text-lg" />
              <span>{benefit}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <button
            onClick={handleLogin}
            className="w-full bg-[#4CAF50] hover:bg-[#388E3C] text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <LoginOutlined />
            Đăng nhập
          </button>

          <button
            onClick={handleRegister}
            className="w-full border border-gray-200 hover:bg-gray-50 text-gray-700 py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <UserAddOutlined />
            Tạo tài khoản mới
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Bằng cách đăng nhập, bạn đồng ý với{' '}
            <button
              onClick={() => navigate('/terms-of-service')}
              className="text-[#4CAF50] hover:underline"
            >
              Điều khoản dịch vụ
            </button>
            {' '}và{' '}
            <button
              onClick={() => navigate('/privacy')}
              className="text-[#4CAF50] hover:underline"
            >
              Chính sách bảo mật
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
