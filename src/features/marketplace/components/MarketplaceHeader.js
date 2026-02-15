import React from 'react';
import AuthGuardButton from '../../../components/enhanced/AuthGuardButton';

const MarketplaceHeader = ({ onPostProduct, totalProducts = 0 }) => {
  return (
    <header className="marketplace-hero">
      <div className="marketplace-hero-inner">
        <div className="marketplace-hero-copy">
          <div className="marketplace-hero-kicker">NÔNG SẢN VIỆT NAM</div>
          <h1>Chợ NôngLạc</h1>
          <p>
            Kết nối người bán và người mua trong một không gian giao dịch nông sản
            minh bạch, cập nhật nhanh và dễ liên hệ.
          </p>
          <div className="marketplace-hero-stats">
            <span>{totalProducts} sản phẩm hiển thị</span>
            <span>Cập nhật theo thời gian thực</span>
          </div>
        </div>

        <div className="marketplace-hero-action">
          <AuthGuardButton
            authType="marketplace"
            onClick={onPostProduct}
            className="marketplace-post-btn"
          >
            Đăng bán sản phẩm
          </AuthGuardButton>
        </div>
      </div>
    </header>
  );
};

export default MarketplaceHeader;
