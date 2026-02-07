import React, { useState } from 'react';
import { Layout, notification, Modal } from 'antd';
import { useAuth } from '../../../hooks/useAuth';
import { useAuthGuard } from '../../../hooks/useAuthGuard';
import { useMarketplace } from '../hooks';
import { MARKETPLACE_CONSTANTS } from '../constants';
import {
  ProductGrid,
  MarketplaceFilters,
  ProductPostForm,
  ProductImageGallery,
  ContactModal,
  MarketplaceHeader
} from '../components';
import EnhancedLoginModal from '../../../components/enhanced/EnhancedLoginModal';
import '../components/marketplace.css';

const { Content } = Layout;

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
      {/* Professional Header */}
      <MarketplaceHeader onPostProduct={() => setPostFormOpen(true)} />

      <Content className="marketplace-main-content">
        {/* Modern Filters Section */}
        <div className="bg-white rounded-2xl shadow-sm p-4 md:p-6 mb-6">
          <MarketplaceFilters
            onFiltersChange={applyFilters}
            userRole={userRole}
            transactionIntent={transactionIntent}
          />
        </div>

        {/* Product Grid Section */}
        <div className="mt-8">
          <ProductGrid
            products={filteredProducts}
            loading={loading}
            onContactClick={handleContactClick}
            user={user}
          />
        </div>
      </Content>

      {/* Modals & Overlays */}
      <Modal
        title={<span className="text-xl font-bold text-agri-600">🌾 Đăng bán sản phẩm</span>}
        open={postFormOpen}
        onCancel={() => setPostFormOpen(false)}
        footer={null}
        width={650}
        centered
        className="rounded-2xl overflow-hidden"
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