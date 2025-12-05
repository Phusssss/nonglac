import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Plus, LogIn, Filter, Grid, List, Heart, ShoppingCart, Star } from 'lucide-react';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import ProductForm from '../components/ProductForm';
import ProductFilter from '../components/ProductFilter';

const Marketplace = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [filters, setFilters] = useState({});
  const [sellers, setSellers] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [likedProducts, setLikedProducts] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const toggleLike = (productId) => {
    setLikedProducts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const productsRef = collection(db, 'products');
      const q = query(productsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setProducts(productsData);
      applyFilters(productsData, filters, searchTerm);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (productList, currentFilters, search) => {
    let filtered = productList;
    
    // Apply search
    if (search) {
      filtered = filtered.filter(product =>
        product.productName?.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase()) ||
        product.location?.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Apply type filter
    if (currentFilters.productType) {
      filtered = filtered.filter(product => 
        product.productType === currentFilters.productType
      );
    }
    
    // Apply location filter
    if (currentFilters.location) {
      filtered = filtered.filter(product => 
        product.location === currentFilters.location
      );
    }
    
    setFilteredProducts(filtered);
    
    // Get unique sellers for current filter
    if (currentFilters.productType) {
      const uniqueSellers = [...new Map(
        filtered.map(product => [product.sellerId, {
          id: product.sellerId,
          name: product.sellerName,
          avatar: product.sellerAvatar,
          location: product.location,
          productCount: filtered.filter(p => p.sellerId === product.sellerId).length
        }])
      ).values()];
      setSellers(uniqueSellers);
    } else {
      setSellers([]);
    }
  };
  
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    applyFilters(products, newFilters, searchTerm);
  };
  
  const handleSearchChange = (e) => {
    const search = e.target.value;
    setSearchTerm(search);
    applyFilters(products, filters, search);
  };
  
  useEffect(() => {
    applyFilters(products, filters, searchTerm);
  }, [products]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#795548] mb-2">Chợ nông sản</h1>
            <p className="text-gray-600 text-sm sm:text-base">Mua và bán sản phẩm nông nghiệp, thiết bị và chăn nuôi</p>
          </div>
          <button
            onClick={() => {
              if (user) {
                setShowProductForm(true);
              } else {
                setShowLoginDialog(true);
              }
            }}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors font-medium text-sm sm:text-base w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Đăng bán sản phẩm</span>
          </button>
        </div>
        
        {/* Search Bar */}
        <div className="mb-4 sm:mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full px-3 py-2.5 sm:px-4 sm:py-3 pl-10 sm:pl-12 pr-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4CAF50] focus:border-transparent bg-white shadow-sm text-sm sm:text-base"
            />
            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Sellers Section */}
      {sellers.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-[#795548] mb-3 sm:mb-4">
            Người bán {filters.productType}
          </h2>
          <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4">
            {sellers.map((seller) => (
              <div
                key={seller.id}
                onClick={() => navigate(`/user/${seller.id}`)}
                className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 min-w-[160px] sm:min-w-[200px] cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all text-center flex-shrink-0"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#4CAF50] rounded-full flex items-center justify-center mx-auto mb-2 sm:mb-3">
                  {seller.avatar ? (
                    <img src={seller.avatar} alt={seller.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-white text-lg sm:text-2xl font-bold">{seller.name?.charAt(0)}</span>
                  )}
                </div>
                <h3 className="font-semibold text-[#795548] mb-1 truncate text-sm sm:text-base">{seller.name}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 truncate">{seller.location}</p>
                <span className="inline-block px-2 py-1 sm:px-3 bg-[#4CAF50]/10 text-[#4CAF50] text-xs rounded-full font-medium">
                  {seller.productCount} sản phẩm
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <span className="text-xs sm:text-sm text-gray-600">Tìm thấy {filteredProducts.length} sản phẩm</span>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <ProductFilter onFilterChange={handleFilterChange} />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-[#4CAF50] text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-[#4CAF50] text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
              <div className="h-40 sm:h-48 bg-gray-200"></div>
              <div className="p-3 sm:p-4">
                <div className="flex justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-5 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Products Grid */
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6' : 'space-y-3 sm:space-y-4'}>
          {filteredProducts.map((product) => (
          <div
            key={product.id}
            className={`bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all relative ${viewMode === 'list' ? 'flex' : ''}`}
          >
            <div className={`relative ${viewMode === 'list' ? 'w-32 h-24 sm:w-48 sm:h-32' : 'h-40 sm:h-48'}`}>
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-xs sm:text-sm">Không có hình ảnh</span>
                </div>
              )}
              <button
                onClick={() => toggleLike(product.id)}
                className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-1.5 sm:p-2 rounded-full transition-colors ${
                  likedProducts.has(product.id)
                    ? 'bg-red-500 text-white'
                    : 'bg-white/80 text-gray-600 hover:bg-white'
                }`}
              >
                <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${likedProducts.has(product.id) ? 'fill-current' : ''}`} />
              </button>
            </div>

            <div className={`p-3 sm:p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full truncate max-w-[80px] sm:max-w-none">{product.productType}</span>
                <span className="text-sm sm:text-lg font-bold text-[#4CAF50] whitespace-nowrap ml-2">
                  {new Intl.NumberFormat('vi-VN').format(product.price)}đ/{product.unit}
                </span>
              </div>

              <h3 className="font-semibold text-[#795548] mb-1 text-sm sm:text-base line-clamp-2">{product.productName}</h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                {product.description?.substring(0, viewMode === 'list' ? 80 : 120)}...
              </p>

              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                Sản lượng: <strong>{product.quantity} {product.unit}</strong>
              </p>

              <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{product.location}</span>
              </div>

              <div className="flex items-center space-x-1 text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                <Phone className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{product.phone || product.sellerPhone}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                  ))}
                </div>
                <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors font-medium text-xs sm:text-sm">
                  Liên hệ
                </button>
              </div>
            </div>
          </div>
          ))}
        </div>
      )}

      {!loading && filteredProducts.length === 0 && (
        <div className="text-center py-8">
          <h3 className="text-lg sm:text-xl text-gray-500 mb-2">Không tìm thấy sản phẩm nào</h3>
          <p className="text-gray-400 text-sm sm:text-base">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      )}
      
      <ProductForm
        visible={showProductForm}
        onClose={() => setShowProductForm(false)}
        onSuccess={() => {
          loadProducts();
          setShowProductForm(false);
        }}
      />
      
      {/* Login Required Dialog */}
      {showLoginDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-lg sm:text-xl font-bold text-[#795548] mb-4">Yêu cầu đăng nhập</h3>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">
              Bạn cần đăng nhập để có thể đăng bán sản phẩm trên chợ nông sản.
            </p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => setShowLoginDialog(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  setShowLoginDialog(false);
                  navigate('/login');
                }}
                className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-[#4CAF50] text-white rounded-lg hover:bg-[#45a049] transition-colors text-sm sm:text-base"
              >
                <LogIn className="w-4 h-4" />
                <span>Đăng nhập</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;