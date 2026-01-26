import React, { useState } from 'react';
import { Layout, Button, Typography, Space, notification, Modal } from 'antd';
import { PlusOutlined, ShopOutlined } from '@ant-design/icons';
import { useAuth } from '../../../hooks/useAuth';
import { useAuthGuard } from '../../../hooks/useAuthGuard';
import { useMarketplace } from '../hooks';
import { MARKETPLACE_CONSTANTS } from '../constants';
import {
  ProductGrid,
  MarketplaceFilters,
  ProductPostForm,
  ProductImageGallery,
  ContactModal
} from '../components';
import EnhancedLoginModal from '../../../components/enhanced/EnhancedLoginModal';
import '../components/marketplace.css';

const { Content } = Layout;
const { Title } = Typography;

const Marketplace = () => {
  const { user } = useAuth();
  const { requireAuthForMarketplace, showLoginModal, setShowLoginModal } = useAuthGuard();
  const { 
    filteredProducts, 
    loading, 
    addProduct, 
    getSellerInfo, 
    applyFilters 
  } = useMarketplace();

  const [postFormOpen, setPostFormOpen] = useState(false);
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);
  
  const userRole = MARKETPLACE_CONSTANTS.USER_ROLES.FARMER;
  const transactionIntent = MARKETPLACE_CONSTANTS.TRANSACTION_TYPES.B2B;

  const handleProductSubmit = async (productData) => {
    return requireAuthForMarketplace(async () => {
      const result = await addProduct(productData);
      if (result.success) {
        setPostFormOpen(false);
        notification.success({
          message: MARKETPLACE_CONSTANTS.MESSAGES.SUCCESS.TITLE,
          description: MARKETPLACE_CONSTANTS.MESSAGES.SUCCESS.PRODUCT_POSTED
        });
      } else {
        notification.error({
          message: MARKETPLACE_CONSTANTS.MESSAGES.ERROR.TITLE,
          description: MARKETPLACE_CONSTANTS.MESSAGES.ERROR.PREFIX + result.error
        });
      }
    });
  };

  const handleContactClick = async (product) => {
    return requireAuthForMarketplace(async () => {
      const sellerData = await getSellerInfo(product.userId);
      setSelectedProduct(product);
      setSelectedSeller({
        id: product.userId,
        name: sellerData?.displayName || product.userEmail,
        email: product.userEmail,
        phone: sellerData?.phone || product.phone,
        ...sellerData
      });
      setContactModalOpen(true);
    });
  };

  return (
    <div className="marketplace-container">
      {/* Header */}
      <div style={{ 
        background: 'white', 
        borderBottom: '1px solid #f0f0f0',
        padding: '16px 0'
      }}>
        <div className="marketplace-main-content">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16
          }}>
            <Space align="center">
              <ShopOutlined style={{ fontSize: 24, color: MARKETPLACE_CONSTANTS.COLORS.PRIMARY }} />
              <Title level={3} style={{ margin: 0, color: MARKETPLACE_CONSTANTS.COLORS.PRIMARY }}>
                {MARKETPLACE_CONSTANTS.MESSAGES.LABELS.MARKETPLACE_TITLE}
              </Title>
            </Space>
            <Button 
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setPostFormOpen(true)}
              style={{ background: MARKETPLACE_CONSTANTS.COLORS.PRIMARY, border: 'none' }}
            >
              {MARKETPLACE_CONSTANTS.MESSAGES.BUTTONS.POST_PRODUCT}
            </Button>
          </div>
        </div>
      </div>

      <Content className="marketplace-main-content">
        <MarketplaceFilters
          onFiltersChange={applyFilters}
          userRole={userRole}
          transactionIntent={transactionIntent}
        />

        <div style={{ marginTop: 20 }}>
          <ProductGrid
            products={filteredProducts}
            loading={loading}
            onContactClick={handleContactClick}
            user={user}
          />
        </div>
      </Content>

      {/* Product Post Modal */}
      <Modal
        title="🌾 Đăng bán sản phẩm"
        open={postFormOpen}
        onCancel={() => setPostFormOpen(false)}
        footer={null}
        width={600}
        style={{ top: 20 }}
      >
        <ProductPostForm
          onSubmit={handleProductSubmit}
          onCancel={() => setPostFormOpen(false)}
        />
      </Modal>

      <ProductImageGallery
        images={selectedProduct?.images || []}
        visible={imageGalleryOpen}
        onClose={() => setImageGalleryOpen(false)}
        productName={selectedProduct?.name || ''}
      />

      <ContactModal
        visible={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        product={selectedProduct}
        seller={selectedSeller}
      />

      <EnhancedLoginModal
        open={showLoginModal}
        onCancel={() => setShowLoginModal(false)}
        title={MARKETPLACE_CONSTANTS.MESSAGES.LOGIN.TITLE}
        message={MARKETPLACE_CONSTANTS.MESSAGES.LOGIN.MESSAGE}
        feature={MARKETPLACE_CONSTANTS.MESSAGES.LOGIN.FEATURE}
      />
    </div>
  );
};

export default Marketplace;