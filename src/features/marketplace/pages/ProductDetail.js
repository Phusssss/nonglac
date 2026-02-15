import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { Layout, Card, Button, Row, Col, Skeleton, Empty } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../hooks/useAuth';
import ContactModal from '../components/ContactModal';
import ProductImageGallery from '../components/ProductImageGallery';
import ProductImageCarousel from '../components/ProductImageCarousel';
import ProductInfo from '../components/ProductInfo';
import ProductTabs from '../components/ProductTabs';
import RelatedProducts from '../components/RelatedProducts';
import '../styles/ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [seller, setSeller] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);

  const requestRef = useRef(0);

  const loadProduct = useCallback(async () => {
    const requestId = Date.now();
    requestRef.current = requestId;

    setLoading(true);
    setRelatedLoading(true);
    setProduct(null);
    setSeller(null);
    setRelatedProducts([]);

    try {
      const productDoc = await getDoc(doc(db, 'marketplace_products', id));

      if (requestRef.current !== requestId) return;

      if (!productDoc.exists()) {
        navigate('/marketplace', { replace: true });
        return;
      }

      const productData = { id: productDoc.id, ...productDoc.data() };
      setProduct(productData);
      setLoading(false);

      const sellerPromise = productData.userId
        ? getDoc(doc(db, 'users', productData.userId))
        : Promise.resolve(null);

      const relatedQuery = query(
        collection(db, 'marketplace_products'),
        where('category', '==', productData.category),
        limit(4)
      );
      const relatedPromise = getDocs(relatedQuery);

      const [sellerDoc, relatedSnapshot] = await Promise.all([sellerPromise, relatedPromise]);
      if (requestRef.current !== requestId) return;

      if (sellerDoc?.exists()) {
        setSeller({ id: sellerDoc.id, ...sellerDoc.data() });
      }

      const related = relatedSnapshot.docs
        .map((item) => ({ id: item.id, ...item.data() }))
        .filter((item) => item.id !== id);
      setRelatedProducts(related);
    } catch (error) {
      console.error('Error loading product detail:', error);
      if (requestRef.current === requestId) {
        setLoading(false);
      }
    } finally {
      if (requestRef.current === requestId) {
        setRelatedLoading(false);
      }
    }
  }, [id, navigate]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    loadProduct();
  }, [loadProduct]);

  const handleContactClick = () => {
    if (!user) {
      alert('Vui lòng đăng nhập để xem thông tin liên hệ!');
      return;
    }
    setContactModalOpen(true);
  };

  const handleShare = () => {
    if (!product) return;
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href
      });
    }
  };

  if (loading) {
    return (
      <Layout className="product-detail-layout">
        <div className="product-detail-page">
          <Skeleton.Button active block style={{ height: 36, maxWidth: 140, marginBottom: 16 }} />
          <Row gutter={[20, 20]}>
            <Col xs={24} lg={12}>
              <Card>
                <Skeleton.Image active style={{ width: '100%', height: 320 }} />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card>
                <Skeleton active paragraph={{ rows: 9 }} />
              </Card>
            </Col>
          </Row>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout className="product-detail-layout">
        <div className="product-detail-page">
          <Empty description="Không tìm thấy sản phẩm" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout className="product-detail-layout">
      <div className="product-detail-page">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/marketplace')}
          className="product-detail-back-btn"
        >
          Quay lại chợ
        </Button>

        <Row gutter={[20, 20]} align="top">
          <Col xs={24} xl={13}>
            <ProductImageCarousel
              images={product.images}
              productName={product.name}
              onGalleryOpen={() => setImageGalleryOpen(true)}
            />
          </Col>

          <Col xs={24} xl={11}>
            <ProductInfo
              product={product}
              seller={seller}
              onContactClick={handleContactClick}
              onShare={handleShare}
            />
          </Col>
        </Row>

        <ProductTabs product={product} />

        <RelatedProducts
          products={relatedProducts}
          loading={relatedLoading}
          onProductClick={(productId) => navigate(`/product/${productId}`)}
        />
      </div>

      <ContactModal
        visible={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        product={product}
        seller={{
          id: product?.userId,
          name: seller?.displayName || product?.supplier,
          email: product?.userEmail,
          phone: seller?.phone || product?.phone,
          ...seller
        }}
      />

      <ProductImageGallery
        images={product?.images || []}
        visible={imageGalleryOpen}
        onClose={() => setImageGalleryOpen(false)}
        productName={product?.name || ''}
      />
    </Layout>
  );
};

export default ProductDetail;
