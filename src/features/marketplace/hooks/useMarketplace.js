import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../hooks/useAuth';
import { MARKETPLACE_CONSTANTS } from '../constants';
import { missionsService } from '../../missions/services';

export const useMarketplace = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({});

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsRef = collection(db, 'marketplace_products');
      const q = query(productsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = async (productData) => {
    try {
      const newProduct = {
        ...productData,
        userId: user.uid,
        userEmail: user.email,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const productsRef = collection(db, 'marketplace_products');
      await addDoc(productsRef, newProduct);
      
      // Cập nhật nhiệm vụ "first_product_post" nếu chưa hoàn thành
      if (user?.uid) {
        try {
          const missionsData = await missionsService.getUserMissionsData(user.uid);
          if (missionsData.success) {
            const firstProductMission = missionsData.data.missions.find(
              m => m.id === 'first_product_post' && m.status === 'pending'
            );
            
            if (firstProductMission) {
              await missionsService.executeMission(user.uid, 'first_product_post');
            }
          }
        } catch (missionError) {
          console.error('Error updating mission:', missionError);
          // Không throw error để không ảnh hưởng đến việc đăng sản phẩm
        }
      }
      
      await loadProducts();
      return { success: true };
    } catch (error) {
      console.error('Error adding product:', error);
      return { success: false, error: error.message };
    }
  };

  const getSellerInfo = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Error getting seller info:', error);
      return null;
    }
  };

  const applyFilters = (filters) => {
    setActiveFilters(filters);
    let filtered = [...products];

    if (filters.category) {
      filtered = filtered.filter(p => p.category === filters.category);
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      filtered = filtered.filter(p => p.price >= min && p.price <= max);
    }

    if (filters.location) {
      filtered = filtered.filter(p => 
        p.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.condition) {
      filtered = filtered.filter(p => p.condition === filters.condition);
    }

    setFilteredProducts(filtered);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return {
    products,
    filteredProducts,
    loading,
    activeFilters,
    addProduct,
    getSellerInfo,
    applyFilters,
    loadProducts
  };
};