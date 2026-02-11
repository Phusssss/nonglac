import React from 'react';
import { Card, Typography, Modal, Tag, Button, Space } from 'antd';
import { EnvironmentOutlined, PhoneOutlined, UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

const ProductCard = ({ 
  product, 
  formatPrice, 
  user,
  onContactClick,
  onProductClick
}) => {
  const getProvince = (address) => {
    if (!address) return '';
    const parts = address.split(',');
    return parts[parts.length - 1]?.trim() || address;
  };

  const handleContactClick = (e) => {
    e.stopPropagation();
    onContactClick(product);
  };

  return (
    <Card
      hoverable
      className="rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300"
      styles={{ body: { padding: 12 } }}
      onClick={() => onProductClick(product)}
      cover={
        <div className="h-40 overflow-hidden bg-gray-50 relative group">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
              🌾
            </div>
          )}
          
          {product.images && product.images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm color-white px-2 py-1 rounded text-[10px] font-medium text-white">
              📷 {product.images.length}
            </div>
          )}
        </div>
      }
    >
      {/* Product Name */}
      <div className="text-sm font-medium text-gray-800 line-clamp-2 h-9 mb-2 leading-snug">
        {product.name}
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-[#ee4d2d] text-base font-bold">
          {formatPrice(product.price)}
        </span>
        <span className="text-gray-400 text-[11px]">
          /{product.unit || 'kg'}
        </span>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1 mb-3 text-gray-400">
        <EnvironmentOutlined className="text-[10px] flex-shrink-0" />
        <span className="text-[11px] truncate">
          {getProvince(product.address) || 'Việt Nam'}
        </span>
      </div>

      {/* Bottom section */}
      <div className="flex justify-between items-center pt-2 border-t border-gray-50">
        <div className="text-[11px] text-gray-400">
          {product.sold ? `Đã bán ${product.sold}` : 'Mới đăng'}
        </div>
        
        <Button
          size="small"
          type="text"
          icon={user ? <PhoneOutlined /> : <UserOutlined />}
          onClick={handleContactClick}
          className="text-[10px] h-6 px-2 text-[#52c41a] hover:bg-green-50 rounded-md"
        >
          {user ? 'Gọi' : 'Đăng nhập'}
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;