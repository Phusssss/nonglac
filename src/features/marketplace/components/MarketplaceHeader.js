import React from 'react';
import { Button } from '../../../components/ui';
import AuthGuardButton from '../../../components/enhanced/AuthGuardButton';

const MarketplaceHeader = ({ onPostProduct }) => {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#4CAF50] to-[#45a049] rounded-xl flex items-center justify-center text-2xl mr-4">
                🌾
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Chợ Nông Lạc</h1>
                <p className="text-gray-600">Nơi kết nối nông dân và thương gia</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap justify-center md:justify-start">
              <span className="px-3 py-1 bg-[#4CAF50]/10 text-[#4CAF50] rounded-full text-sm">Thông minh</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">Chất lượng</span>
              <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm">An toàn</span>
            </div>
          </div>
          <div className="text-center">
            <AuthGuardButton
              authType="marketplace"
              onClick={onPostProduct}
              className="w-full md:w-auto"
            >
              ➕ Đăng bán sản phẩm
            </AuthGuardButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketplaceHeader;