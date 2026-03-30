import React, { useMemo } from 'react';
import { Card, Button, Empty, Spin, Space } from 'antd';
import { ReloadOutlined, EnvironmentOutlined, EyeOutlined } from '@ant-design/icons';
import moment from 'moment';
import PostCard from '../../../components/PostCard';
import ShareProductButton from '../../../components/ShareProductButton';
import { marketplaceService } from '../../marketplace/services';

const FeedSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((item) => (
      <div key={item} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gray-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-gray-200" />
            <div className="h-2.5 w-1/4 rounded bg-gray-100" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 w-4/5 rounded bg-gray-200" />
          <div className="h-3 w-3/5 rounded bg-gray-100" />
        </div>
        <div className="mt-4 h-96 rounded-lg bg-gray-100" />
      </div>
    ))}
  </div>
);

const HomeProductCard = ({ product, onClick }) => {
  const coverImage = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : null;
  const viewCount = Number(product.views || 0);

  return (
    <button
      type="button"
      onClick={() => onClick(product)}
      className="w-full h-full text-left bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:border-[#4CAF50] transition-colors flex flex-col"
    >
      <div className="relative w-full aspect-square bg-slate-50 flex-shrink-0 overflow-hidden">
        {coverImage ? (
          <img
            src={coverImage}
            alt={product.name || 'Sản phẩm'}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full flex items-center justify-center text-4xl">🌿</div>
        )}

        <div className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          Sản phẩm
        </div>
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
          <EyeOutlined />
          {viewCount}
        </div>
      </div>

      <div className="p-3 flex-1 flex flex-col">
        <div className="font-semibold text-slate-800 text-[13px] line-clamp-2 leading-snug h-[38px]">{product.name || 'Sản phẩm nông nghiệp'}</div>
        
        <div className="mt-auto pt-2">
          <div className="text-[15px] font-bold text-orange-600">
            {marketplaceService.formatPrice(product.price || 0)}
            <span className="text-[11px] font-medium text-slate-500 ml-0.5">/{product.unit || 'kg'}</span>
          </div>
          
          <div className="mt-2 text-[11px] text-slate-500 inline-flex items-center gap-1 w-full truncate">
            <EnvironmentOutlined className="text-emerald-500 flex-shrink-0" />
            <span className="truncate">{product.address || product.location || 'Việt Nam'}</span>
          </div>
        </div>
      </div>
    </button>
  );
};

const PostsList = ({
  items,
  loading,
  loadingMore,
  hasMore,
  searchTerm,
  onLoadMore,
  onRefresh,
  onPostClick,
  onProductClick
}) => {
  const totalPosts = useMemo(() => items.filter((item) => item.type === 'post').length, [items]);
  const groupedItems = useMemo(() => {
    const list = [];
    let tempProducts = [];
    
    items.forEach(item => {
      if (item.type === 'product') {
        tempProducts.push(item);
      } else {
        if (tempProducts.length > 0) {
          list.push({ type: 'product-group', products: tempProducts });
          tempProducts = [];
        }
        list.push(item);
      }
    });
    
    if (tempProducts.length > 0) {
      list.push({ type: 'product-group', products: tempProducts });
    }
    
    return list;
  }, [items]);

  if (loading) {
    return <FeedSkeleton />;
  }

  if (items.length === 0) {
    return (
      <Card className="text-center py-12">
        <Empty
          description={
            searchTerm
              ? `Không tìm thấy nội dung nào cho "${searchTerm}"`
              : 'Chưa có nội dung nào'
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button
            type="primary"
            onClick={onRefresh}
            className="bg-[#4CAF50] hover:bg-[#45a049] border-[#4CAF50]"
          >
            Làm mới nguồn cấp
          </Button>
        </Empty>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {searchTerm && (
        <div className="flex justify-between items-center px-1">
          <div className="text-[13px] font-medium text-slate-500 flex items-center gap-2">
            Tìm thấy <span className="text-slate-800 font-bold">{items.length}</span> kết quả cho "{searchTerm}"
          </div>
          <button
            onClick={onRefresh}
            className="text-slate-400 hover:text-[#4CAF50] hover:bg-green-50 w-8 h-8 rounded-full flex items-center justify-center transition-all bg-white shadow-sm border border-slate-100"
            title="Làm mới"
          >
            <ReloadOutlined className="text-[13px]" />
          </button>
        </div>
      )}

      <div className="space-y-4">
        {groupedItems.map((group, index) => {
          if (group.type === 'post') {
            return (
              <PostCard
                key={`post-${group.data.id || index}`}
                post={group.data}
                onCardClick={() => onPostClick?.(group.data)}
                viewCount={group.data?.views || 0}
              />
            );
          } else if (group.type === 'product-group') {
            return (
              <div key={`product-group-${index}`} className="grid grid-cols-2 gap-3 mx-1">
                {group.products.map(prod => (
                  <HomeProductCard
                    key={`prod-${prod.data.id}`}
                    product={prod.data}
                    onClick={onProductClick}
                  />
                ))}
              </div>
            );
          }
          return null;
        })}
      </div>

      {!searchTerm && hasMore && (
        <div className="text-center py-6">
          <Button
            type="default"
            onClick={onLoadMore}
            loading={loadingMore}
            size="large"
            className="px-8 hover:border-[#4CAF50] hover:text-[#4CAF50]"
          >
            {loadingMore ? 'Đang tải...' : 'Xem thêm nội dung'}
          </Button>
        </div>
      )}

      {!searchTerm && !hasMore && items.length > 0 && (
        <div className="text-center py-6 text-gray-500 text-sm">
          <div className="border-t border-gray-200 pt-4">Bạn đã xem hết nội dung phù hợp</div>
        </div>
      )}

      {loadingMore && (
        <div className="text-center py-4">
          <Space>
            <Spin size="small" />
            <span className="text-gray-500 text-sm">Đang tải thêm nội dung...</span>
          </Space>
        </div>
      )}
    </div>
  );
};

export default PostsList;
