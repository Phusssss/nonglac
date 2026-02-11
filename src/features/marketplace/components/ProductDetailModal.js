import React, { useState, useEffect } from 'react';
import { Modal, Typography, Button, Space, Tag } from 'antd';
import { PhoneOutlined, UserOutlined, EnvironmentOutlined, ShoppingCartOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const ProductDetailModal = ({ 
  product, 
  open, 
  onClose, 
  user, 
  onContactClick,
  formatPrice 
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    if (open) {
      setSelectedImageIndex(0);
    }
  }, [open, product]);

  if (!product) return null;

  return (
    <Modal
      title={null}
      open={open}
      onCancel={onClose}
      footer={
        <Button
          type="primary"
          size="large"
          icon={user ? <PhoneOutlined /> : <UserOutlined />}
          onClick={() => onContactClick(product)}
          className="w-full h-12 text-lg bg-[#52c41a] border-none hover:bg-[#389e0d] transition-colors"
        >
          {user ? 'Liên hệ người bán' : 'Đăng nhập để liên hệ'}
        </Button>
      }
      width={700}
      centered
      className="product-detail-modal"
    >
      <div className="flex flex-col md:flex-row gap-6 mt-4">
        {/* Gallery Section */}
        <div className="w-full md:w-1/2">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
            {product.images && product.images.length > 0 ? (
              <img
                src={product.images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl text-gray-300">
                🌾
              </div>
            )}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-2 hide-scrollbar">
              {product.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`${product.name} ${index + 1}`}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-16 h-16 object-cover rounded-lg cursor-pointer transition-all ${
                    selectedImageIndex === index ? 'ring-2 ring-[#52c41a] border-white' : 'border border-gray-200 opacity-70 hover:opacity-100'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="w-full md:w-1/2 flex flex-col">
          <Tag color="green" className="w-fit mb-2">{product.category || 'Nông sản'}</Tag>
          <Title level={3} className="!mb-2 !text-gray-800 leading-tight">
            {product.name}
          </Title>
          
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-2xl font-bold text-red-600">
              {formatPrice ? formatPrice(product.price) : `${product.price?.toLocaleString()} đ`}
            </span>
            <span className="text-gray-500">/{product.unit || 'kg'}</span>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-3 mb-4">
            <div className="flex items-start gap-2">
              <EnvironmentOutlined className="mt-1 text-gray-400" />
              <div>
                <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Khu vực</div>
                <div className="text-sm text-gray-700">{product.address || 'Việt Nam'}</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2">
              <UserOutlined className="mt-1 text-gray-400" />
              <div>
                <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Người bán</div>
                <div className="text-sm text-gray-700 font-medium">{product.supplier || 'Nông dân NôngLạc'}</div>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <ShoppingCartOutlined className="mt-1 text-gray-400" />
              <div>
                <div className="text-xs text-gray-400 uppercase font-bold tracking-wider">Tình trạng</div>
                <div className="text-sm text-gray-700">
                  {product.quantity > 0 ? `Còn hàng (${product.quantity} ${product.unit})` : 'Liên hệ để biết số lượng'}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1">
            <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Mô tả</div>
            <p className="text-sm text-gray-600 leading-relaxed max-h-40 overflow-y-auto">
              {product.description || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ProductDetailModal;