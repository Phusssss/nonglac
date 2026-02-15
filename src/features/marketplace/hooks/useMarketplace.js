import { useState, useEffect, useCallback, useRef } from 'react';
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { useAuth } from '../../../hooks/useAuth';
import { MARKETPLACE_CONSTANTS } from '../constants';
import { missionsService } from '../../missions/services';

const CACHE_KEY = 'nonglac_marketplace_cache_v1';
const CACHE_TTL_MS = 5 * 60 * 1000;

const filterProductsByActiveFilters = (items, filters = {}) => {
  let filtered = [...items];

  if (filters.category) {
    filtered = filtered.filter((p) => p.category === filters.category);
  }

  if (filters.priceRange) {
    const [min, max] = filters.priceRange;
    filtered = filtered.filter((p) => p.price >= min && p.price <= max);
  }

  if (filters.location) {
    const locationQuery = String(filters.location).trim().toLowerCase();
    if (locationQuery) {
      filtered = filtered.filter((p) => p.location?.toLowerCase().includes(locationQuery)
        || p.address?.toLowerCase().includes(locationQuery));
    }
  }

  if (filters.condition) {
    filtered = filtered.filter((p) => p.condition === filters.condition);
  }

  return filtered;
};

const readCache = () => {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.timestamp || !Array.isArray(parsed?.products)) return null;
    if (Date.now() - parsed.timestamp > CACHE_TTL_MS) return null;
    return parsed.products;
  } catch (error) {
    return null;
  }
};

const writeCache = (products) => {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      products
    }));
  } catch (error) {
    // Ignore cache write failures
  }
};

export const useMarketplace = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisibleDoc, setLastVisibleDoc] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});

  const productsRef = useRef([]);
  const activeFiltersRef = useRef({});
  const hasMoreRef = useRef(true);
  const loadingMoreRef = useRef(false);
  const lastVisibleDocRef = useRef(null);

  const productsPerPage = MARKETPLACE_CONSTANTS.PRODUCTS_PER_PAGE || 12;

  const applyFiltersToCurrentProducts = useCallback((sourceProducts, filters) => {
    setFilteredProducts(filterProductsByActiveFilters(sourceProducts, filters));
  }, []);

  const syncProducts = useCallback((nextProducts) => {
    productsRef.current = nextProducts;
    setProducts(nextProducts);
    applyFiltersToCurrentProducts(nextProducts, activeFiltersRef.current);
    writeCache(nextProducts);
  }, [applyFiltersToCurrentProducts]);

  const fetchProducts = useCallback(async ({ append = false } = {}) => {
    try {
      if (append) {
        if (!hasMoreRef.current || loadingMoreRef.current || !lastVisibleDocRef.current) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const productsRefDb = collection(db, 'marketplace_products');
      const constraints = [orderBy('createdAt', 'desc'), limit(productsPerPage)];
      if (append && lastVisibleDocRef.current) {
        constraints.push(startAfter(lastVisibleDocRef.current));
      }
      const q = query(productsRefDb, ...constraints);
      const snapshot = await getDocs(q);

      const fetchedProducts = snapshot.docs.map((item) => ({
        id: item.id,
        ...item.data()
      }));

      const mergedProducts = append ? [...productsRef.current, ...fetchedProducts] : fetchedProducts;
      syncProducts(mergedProducts);

      const newLastDoc = snapshot.docs[snapshot.docs.length - 1] || null;
      lastVisibleDocRef.current = newLastDoc;
      setLastVisibleDoc(newLastDoc);

      const canLoadMore = snapshot.docs.length === productsPerPage;
      hasMoreRef.current = canLoadMore;
      setHasMore(canLoadMore);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      loadingMoreRef.current = false;
    }
  }, [productsPerPage, syncProducts]);

  const loadProducts = useCallback(async ({ append = false } = {}) => {
    await fetchProducts({ append });
  }, [fetchProducts]);

  const loadMoreProducts = useCallback(async () => {
    await fetchProducts({ append: true });
  }, [fetchProducts]);

  const addProduct = useCallback(async (productData) => {
    try {
      if (!user?.uid) {
        return { success: false, error: 'Bạn cần đăng nhập để đăng sản phẩm.' };
      }

      const newProduct = {
        ...productData,
        userId: user.uid,
        userEmail: user.email,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const productsRefDb = collection(db, 'marketplace_products');
      const productRef = await addDoc(productsRefDb, newProduct);

      const insertedProduct = { id: productRef.id, ...newProduct };
      syncProducts([insertedProduct, ...productsRef.current]);

      missionsService.getUserMissionsData(user.uid)
        .then((missionsData) => {
          if (!missionsData.success) return;
          const firstProductMission = missionsData.data?.missions?.find(
            (m) => m.id === 'first_product_post' && m.status === 'pending'
          );
          if (firstProductMission) {
            return missionsService.executeMission(user.uid, 'first_product_post');
          }
          return null;
        })
        .catch((missionError) => {
          console.error('Error updating mission:', missionError);
        });

      return { success: true };
    } catch (error) {
      console.error('Error adding product:', error);
      return { success: false, error: error.message };
    }
  }, [syncProducts, user]);

  const getSellerInfo = useCallback(async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      return userDoc.exists() ? userDoc.data() : null;
    } catch (error) {
      console.error('Error getting seller info:', error);
      return null;
    }
  }, []);

  const applyFilters = useCallback((filters) => {
    const normalizedFilters = filters || {};
    activeFiltersRef.current = normalizedFilters;
    setActiveFilters(normalizedFilters);
    applyFiltersToCurrentProducts(productsRef.current, normalizedFilters);
  }, [applyFiltersToCurrentProducts]);

  useEffect(() => {
    const cachedProducts = readCache();
    if (cachedProducts?.length) {
      syncProducts(cachedProducts);
      setLoading(false);
    }
    fetchProducts({ append: false });
  }, [fetchProducts, syncProducts]);

  return {
    products,
    filteredProducts,
    loading,
    loadingMore,
    hasMore,
    activeFilters,
    lastVisibleDoc,
    addProduct,
    getSellerInfo,
    applyFilters,
    loadProducts,
    loadMoreProducts
  };
};
