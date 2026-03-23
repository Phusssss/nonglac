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
      <div key={item} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm animate-pulse">
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
      className="w-full text-left bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all"
    >
      <div className="relative w-full" style={{ aspectRatio: '3/4' }}>
        {coverImage ? (
          <img
            src={coverImage}
            alt={product.name || 'Sản phẩm'}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center text-5xl">🌿</div>
        )}

        <div className="absolute left-3 top-3 inline-flex items-center rounded-full bg-black/65 px-2.5 py-1 text-xs text-white">
          Sản phẩm
        </div>
        <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/65 px-2.5 py-1 text-xs text-white">
          <EyeOutlined />
          {viewCount}
        </div>
      </div>

      <div className="p-4">
        <div className="font-bold text-gray-900 line-clamp-2">{product.name || 'Sản phẩm nông nghiệp'}</div>
        <div className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description || 'Nhấn để xem chi tiết sản phẩm.'}</div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="text-base font-bold text-[#2f8f3a]">
            {marketplaceService.formatPrice(product.price || 0)}
            <span className="ml-1 text-xs font-medium text-gray-500">/{product.unit || 'kg'}</span>
          </div>
          <ShareProductButton product={product} size="small" variant="text" />
        </div>

        <div className="mt-3 text-xs text-gray-600 inline-flex items-center gap-1 rounded-lg bg-gray-50 px-2 py-1">
          <EnvironmentOutlined />
          {product.address || product.location || 'Việt Nam'}
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
  const totalProducts = useMemo(() => items.filter((item) => item.type === 'product').length, [items]);

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          {searchTerm ? (
            <>
              Tìm thấy <span className="font-medium">{items.length}</span> kết quả cho "{searchTerm}"
            </>
          ) : (
            <>
              Hiển thị <span className="font-medium">{items.length}</span> nội dung
            </>
          )}
          <span className="ml-2">({totalPosts} bài viết, {totalProducts} sản phẩm)</span>
        </div>
        <Button
          type="text"
          icon={<ReloadOutlined />}
          onClick={onRefresh}
          className="text-gray-500 hover:text-[#4CAF50]"
          size="small"
        >
          Làm mới
        </Button>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          item.type === 'post' ? (
            <PostCard
              key={`${item.type}-${item.id}`}
              post={item.data}
              onCardClick={() => onPostClick?.(item.data)}
              viewCount={item.data?.views || 0}
            />
          ) : (
            <HomeProductCard
              key={`${item.type}-${item.id}`}
              product={item.data}
              onClick={onProductClick}
            />
          )
        ))}
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
