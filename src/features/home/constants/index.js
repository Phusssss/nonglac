import { 
  AppstoreOutlined, 
  ExperimentOutlined,
  ToolOutlined,
  DollarOutlined,
  FileTextOutlined 
} from '@ant-design/icons';
import { Wheat, Fish } from 'lucide-react';

// Home feature constants
export const HOME_CONSTANTS = {
  POSTS_PER_PAGE: 10,
  MAX_POST_LENGTH: 2000,
  REFRESH_INTERVAL: 30000, // 30 seconds
};

export const POST_CATEGORIES = [
  { key: 'all', label: 'Tất cả', icon: AppstoreOutlined, value: 'Tất cả' },
  { key: 'vegetables', label: 'Trồng trọt', icon: Wheat, value: 'Trồng trọt' },
  { key: 'livestock', label: 'Chăn nuôi', icon: ExperimentOutlined, value: 'Chăn nuôi' },
  { key: 'aquaculture', label: 'Thủy sản', icon: Fish, value: 'Thủy sản' },
  { key: 'machinery', label: 'Máy nông nghiệp', icon: ToolOutlined, value: 'Máy nông nghiệp' },
  { key: 'market', label: 'Thị trường & Giá cả', icon: DollarOutlined, value: 'Thị trường & Giá cả' },
  { key: 'policy', label: 'Chính sách', icon: FileTextOutlined, value: 'Chính sách' }
];

// Legacy categories array for backward compatibility
export const LEGACY_POST_CATEGORIES = [
  'Trồng trọt',
  'Chăn nuôi', 
  'Thủy sản',
  'Kinh nghiệm',
  'Thị trường',
  'Khác'
];

export const SORT_OPTIONS = {
  NEWEST: 'newest',
  POPULAR: 'popular',
  TRENDING: 'trending'
};