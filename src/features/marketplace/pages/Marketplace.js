import React, { useState, lazy, Suspense, useCallback } from 'react';
import { Layout, notification, Modal, Button, Spin } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useAuthGuard } from '../../../hooks/useAuthGuard';
import { useMarketplace } from '../hooks/useMarketplace';
import { MARKETPLACE_CONSTANTS } from '../constants';
import ProductGrid from '../components/ProductGrid';
import MarketplaceFilters from '../components/MarketplaceFilters';
import MarketplaceHeader from '../components/MarketplaceHeader';
import EnhancedLoginModal from '../../../components/enhanced/EnhancedLoginModal';
import '../components/marketplace.css';

const ProductPostForm = lazy(() => import('../components/ProductPostForm'));
const ProductImageGallery = lazy(() => import('../components/ProductImageGallery'));
const ContactModal = lazy(() => import('../components/ContactModal'));

const { Content } = Layout;

const Marketplace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { requireAuthForMarketplace, showLoginModal, setShowLoginModal } = useAuthGuard();
  const {
    filteredProducts,
    loading,
    loadingMore,
    hasMore,
    addProduct,
    getSellerInfo,
    applyFilters,
    loadMoreProducts,
    loadProducts
  } = useMarketplace();

  const [postFormOpen, setPostFormOpen] = useState(false);
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSeller, setSelectedSeller] = useState(null);

  const userRole = MARKETPLACE_CONSTANTS.USER_ROLES.FARMER;
  const transactionIntent = MARKETPLACE_CONSTANTS.TRANSACTION_TYPES.B2B;

  const handleProductSubmit = useCallback(async (productData) => {
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
  }, [addProduct, requireAuthForMarketplace]);

  const handleContactClick = useCallback(async (product) => {
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
  }, [getSellerInfo, requireAuthForMarketplace]);

  return (
    <div className="marketplace-container">
      <MarketplaceHeader
        onPostProduct={() => setPostFormOpen(true)}
        totalProducts={filteredProducts.length}
      />

      <Content className="marketplace-main-content">
        <div className="marketplace-filters-wrap">
          <MarketplaceFilters
            onFiltersChange={applyFilters}
            userRole={userRole}
            transactionIntent={transactionIntent}
          />
        </div>

        <div className="marketplace-grid-wrap">
          <ProductGrid
            products={filteredProducts}
            loading={loading}
            onContactClick={handleContactClick}
            onProductClick={(product) => {
              if (!product?.id) return;
              navigate(`/product/${product.id}`);
            }}
            onPreviewImages={(product) => {
              setSelectedProduct(product);
              setImageGalleryOpen(true);
            }}
            user={user}
          />

          {!loading && hasMore && (
            <div className="marketplace-loadmore-wrap">
              <Button
                size="large"
                loading={loadingMore}
                onClick={loadMoreProducts}
                className="marketplace-loadmore-btn"
              >
                {loadingMore ? 'Đang tải thêm...' : 'Xem thêm sản phẩm'}
              </Button>
            </div>
          )}

          {!loading && filteredProducts.length > 0 && (
            <div className="marketplace-refresh-wrap">
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={() => loadProducts({ append: false })}
              >
                Làm mới dữ liệu
              </Button>
            </div>
          )}
        </div>
      </Content>

      <Modal
        title={<span className="text-xl font-bold text-agri-600">Đăng bán sản phẩm</span>}
        open={postFormOpen}
        onCancel={() => setPostFormOpen(false)}
        footer={null}
        width="min(96vw, 920px)"
        centered
        className="rounded-2xl overflow-hidden"
        destroyOnHidden
      >
        <Suspense fallback={<div className="py-12 text-center"><Spin /></div>}>
          <ProductPostForm
            onSubmit={handleProductSubmit}
            onCancel={() => setPostFormOpen(false)}
          />
        </Suspense>
      </Modal>

      <Suspense fallback={null}>
        <ProductImageGallery
          images={selectedProduct?.images || []}
          visible={imageGalleryOpen}
          onClose={() => setImageGalleryOpen(false)}
          productName={selectedProduct?.name || ''}
        />
      </Suspense>

      <Suspense fallback={null}>
        <ContactModal
          visible={contactModalOpen}
          onClose={() => setContactModalOpen(false)}
          product={selectedProduct}
          seller={selectedSeller}
        />
      </Suspense>

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
