import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../hooks/useAuth';
import { Layout, Card, Button, Row, Col, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
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
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [imageGalleryOpen, setImageGalleryOpen] = useState(false);

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const productDoc = await getDoc(doc(db, 'marketplace_products', id));
      
      if (productDoc.exists()) {
        const productData = { id: productDoc.id, ...productDoc.data() };
        setProduct(productData);
        
        // Load seller info
        if (productData.userId) {
          const sellerDoc = await getDoc(doc(db, 'users', productData.userId));
          if (sellerDoc.exists()) {
            setSeller({ id: sellerDoc.id, ...sellerDoc.data() });
          }
        }
        
        // Load related products
        const relatedQuery = query(
          collection(db, 'marketplace_products'),
          where('category', '==', productData.category),
          limit(4)
        );
        const relatedSnapshot = await getDocs(relatedQuery);
        const related = relatedSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(p => p.id !== id);
        setRelatedProducts(related);
      } else {
        navigate('/marketplace');
      }
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactClick = () => {
    if (!user) {
      alert('Vui lòng đăng nhập để xem thông tin liên hệ!');
      return;
    }
    setContactModalOpen(true);
  };

  const handleShare = () => {
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
      <Layout style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
          <Card loading style={{ marginBottom: 24 }}>
            <Card.Meta />
          </Card>
        </div>
      </Layout>
    );
  }

  if (!product) return null;

  return (
    <Layout className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Back Button */}
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/marketplace')}
          style={{ marginBottom: 24 }}
        >
          Quay lại chợ
        </Button>

        <Row gutter={[24, 24]}>
          {/* Product Images */}
          <Col xs={24} lg={12}>
            <ProductImageCarousel
              images={product.images}
              productName={product.name}
              onGalleryOpen={() => setImageGalleryOpen(true)}
            />
          </Col>

          {/* Product Info */}
          <Col xs={24} lg={12}>
            <ProductInfo
              product={product}
              seller={seller}
              onContactClick={handleContactClick}
              onShare={handleShare}
            />
          </Col>
        </Row>

        {/* Product Details Tabs */}
        <ProductTabs product={product} />

        {/* Related Products */}
        <RelatedProducts 
          products={relatedProducts}
          onProductClick={(productId) => navigate(`/product/${productId}`)}
        />
      </div>

      {/* Contact Modal */}
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

      {/* Image Gallery Modal */}
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