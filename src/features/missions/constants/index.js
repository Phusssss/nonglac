const badgeVerified = '/badges/badge-verified.svg';
const badgeProducer = '/badges/badge-producer.svg';
const badgeSupplier = '/badges/badge-supplier.svg';
const badgeTrader = '/badges/badge-trader.svg';
const badgeConnector = '/badges/badge-connector.svg';
const badgeLoanEligible = '/badges/badge-loan-eligible.svg';

export const MISSIONS_CONSTANTS = {
  // UI Constants
  COLORS: {
    PRIMARY: '#52c41a',
    SECONDARY: '#faad14',
    SUCCESS: '#52c41a',
    WARNING: '#faad14',
    ERROR: '#ff4d4f',
    GRADIENT_PRIMARY: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    GRADIENT_REWARD: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  },

  // AgriTrust Score System
  AGRI_TRUST: {
    LEVELS: {
      BRONZE: { min: 200, max: 499, name: 'Tích xanh', icon: badgeVerified, color: '#cd7f32' },
      SILVER: { min: 500, max: 999, name: 'Người sản xuất', icon: badgeProducer, color: '#c0c0c0' },
      GOLD: { min: 1000, max: 1499, name: 'Người kết nối', icon: badgeConnector, color: '#ffd700' },
      PLATINUM: { min: 1500, max: 9999, name: 'Vay vốn', icon: badgeLoanEligible, color: '#e5e4e2' }
    },
    WEIGHTS: {
      IDENTITY: 0.2, // Lớp 1: 20%
      BEHAVIOR: 0.4, // Lớp 2: 40%
      FINANCIAL: 0.4 // Lớp 3: 40%
    }
  },

  // Mission Status
  MISSION_STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    CLAIMED: 'claimed',
    LOCKED: 'locked',
    WAITING_VERIFICATION: 'waiting_verification'
  },

  // Mission Categories
  MISSION_CATEGORIES: {
    IDENTITY: 'identity', // Lớp 1
    BEHAVIOR: 'behavior', // Lớp 2
    SOCIAL: 'social', // Lớp 3
    REFERRAL: 'referral' // Mini game
  },

  // Badge Types
  BADGE_TYPES: {
    BRONZE: 'bronze',
    SILVER: 'silver',
    GOLD: 'gold',
    DIAMOND: 'diamond'
  },

  // Default missions theo thuật toán mới
  DEFAULT_MISSIONS: [
    // Nhiệm vụ lớp 1 (20%): Dữ liệu định danh
    {
      id: 'verify_phone',
      title: 'Xác minh số điện thoại',
      description: 'Xác minh số điện thoại kinh doanh hoặc định danh',
      icon: '📱',
      category: 'identity',
      reward: 50,
      maxProgress: 1,
      currentProgress: 0,
      status: 'pending',
      layer: 1,
      weight: 0.2
    },
    {
      id: 'add_farm_address',
      title: 'Nhập địa chỉ canh tác',
      description: 'Nhập địa chỉ khu vực canh tác/địa chỉ hàng hóa',
      icon: '📍',
      category: 'identity',
      reward: 150,
      maxProgress: 1,
      currentProgress: 0,
      status: 'pending',
      layer: 1,
      weight: 0.2
    },

    // Nhiệm vụ lớp 2 (40%): Năng lực & Hành vi
    {
      id: 'add_farm_area',
      title: 'Diện tích canh tác',
      description: 'Nhập diện tích canh tác (Ha) hoặc quy mô hàng hóa (Tấn)',
      icon: '🌾',
      category: 'behavior',
      reward: 100,
      maxProgress: 1,
      currentProgress: 0,
      status: 'pending',
      layer: 2,
      weight: 0.4
    },
    {
      id: 'first_product_post',
      title: 'Đăng sản phẩm đầu tiên',
      description: 'Đăng sản phẩm đầu tiên lên marketplace',
      icon: '📦',
      category: 'behavior',
      reward: 200,
      maxProgress: 1,
      currentProgress: 0,
      status: 'pending',
      layer: 2,
      weight: 0.4,
      actionText: 'Xem hướng dẫn'
    },

    // Nhiệm vụ lớp 3 (40%): Uy tín xã hội
    {
      id: 'get_first_like',
      title: 'Nhận lượt thích',
      description: 'Bạn sẽ được cộng điểm tự động khi nhận like bài viết (tối đa 500 điểm)',
      icon: '❤️',
      category: 'social',
      reward: 1,
      maxProgress: 500,
      currentProgress: 0,
      status: 'pending',
      layer: 3,
      weight: 0.4,
      recurring: true,
      autoUpdate: true,
      noButton: true
    },
    {
      id: 'make_friends',
      title: 'Kết bạn',
      description: 'Bạn sẽ được cộng điểm tự động nếu follow người khác (tối đa 500 điểm)',
      icon: '🤝',
      category: 'social',
      reward: 5,
      maxProgress: 100,
      currentProgress: 0,
      status: 'pending',
      layer: 3,
      weight: 0.4,
      recurring: true,
      autoUpdate: true,
      noButton: true
    },

    // Nhiệm vụ lớp 4: Tương lai (2027)
    {
      id: 'transaction_success_rate',
      title: 'Tỷ lệ giao dịch thành công',
      description: 'Đạt >90% tỷ lệ xác nhận giao dịch thành công (từ giao dịch thứ 100)',
      icon: '💰',
      category: 'behavior',
      reward: 500,
      maxProgress: 1,
      currentProgress: 0,
      status: 'locked',
      layer: 4,
      weight: 0.0,
      comingSoon: '2027'
    }
  ],

  // Badges theo cấp độ AgriTrust
  BADGES: {
    VERIFIED: {
      id: 'verified',
      label: 'Tích xanh',
      description: 'Đã xác minh thông tin cơ bản',
      icon: badgeVerified,
      minScore: 200,
      type: 'bronze',
      benefits: ['Bài viết được ưu tiên hiển thị'],
      autoUnlock: true
    },
    PRODUCER: {
      id: 'producer',
      label: 'Người sản xuất',
      description: 'Nhà sản xuất nông sản uy tín',
      icon: badgeProducer,
      minScore: 500,
      type: 'silver',
      benefits: ['Chọn huy hiệu chuyên môn', 'Ưu tiên hiển thị cao hơn'],
      requiresSelection: true,
      selectionGroup: 'profession'
    },
    SUPPLIER: {
      id: 'supplier',
      label: 'Nhà cung cấp',
      description: 'Nhà cung cấp vật tư nông nghiệp',
      icon: badgeSupplier,
      minScore: 500,
      type: 'silver',
      benefits: ['Chọn huy hiệu chuyên môn', 'Ưu tiên hiển thị cao hơn'],
      requiresSelection: true,
      selectionGroup: 'profession'
    },
    TRADER: {
      id: 'trader',
      label: 'Vựa/Buôn bán',
      description: 'Thương lái, vựa thu mua',
      icon: badgeTrader,
      minScore: 500,
      type: 'silver',
      benefits: ['Chọn huy hiệu chuyên môn', 'Ưu tiên hiển thị cao hơn'],
      requiresSelection: true,
      selectionGroup: 'profession'
    },
    CONNECTOR: {
      id: 'connector',
      label: 'Người kết nối',
      description: 'Thành viên tích cực kết nối cộng đồng',
      icon: badgeConnector,
      minScore: 1000,
      type: 'gold',
      benefits: ['Nhận Nút Bạc vật lý', 'Ghép xe logistics', 'BNPL', 'Ưu tiên tối đa'],
      autoUnlock: true
    },
    LOAN_ELIGIBLE: {
      id: 'loan_eligible',
      label: 'Đủ điều kiện vay vốn',
      description: 'Đủ điều kiện vay vốn ngân hàng',
      icon: badgeLoanEligible,
      minScore: 1500,
      type: 'diamond',
      benefits: ['Vay vốn ngân hàng', 'Tất cả quyền lợi cao cấp'],
      comingSoon: '2027',
      autoUnlock: true
    }
  },

  // Referral System - Mini game
  REFERRAL_SYSTEM: {
    BRONZE_BUTTON: {
      title: 'Nút Đồng NôngLạc',
      description: 'Tiếp thị liên kết - Nhận thưởng lên tới 100.000đ/người',
      icon: '🥉',
      rewards: {
        MISSION_1: 30000, // 30k khi người được mời hoàn thành nhiệm vụ 1
        MISSION_2: 20000, // +20k khi hoàn thành nhiệm vụ 2
        MISSION_3: 50000 // +50k khi hoàn thành nhiệm vụ 3
      },
      endDate: '2024-07-01',
      launchDate: '2024-04-01'
    }
  },

  // Physical rewards
  PHYSICAL_REWARDS: {
    SILVER_BUTTON: {
      id: 'silver_button',
      title: 'Nút Bạc NôngLạc',
      description: 'Nút bạc vật lý gửi về địa chỉ',
      icon: '🥈',
      threshold: 1000,
      requiresAddress: true
    }
  },

  // Messages
  MESSAGES: {
    SUCCESS: {
      MISSION_COMPLETED: 'Hoàn thành nhiệm vụ thành công!',
      REWARD_CLAIMED: 'Đã nhận thưởng thành công!',
      LEVEL_UP: 'Chúc mừng! Bạn đã lên cấp mới!',
      SILVER_BUTTON: 'Chúc mừng! Bạn đã đủ điều kiện nhận Nút Bạc!'
    },
    ERROR: {
      MISSION_FAILED: 'Không thể hoàn thành nhiệm vụ',
      REWARD_FAILED: 'Không thể nhận thưởng'
    },
    BUTTONS: {
      COMPLETE: 'Hoàn thành',
      CLAIM: 'Nhận thưởng',
      CLAIMED: 'Đã nhận',
      LOCKED: 'Khóa',
      WAITING_VERIFICATION: 'Chờ xác thực'
    },
    LABELS: {
      AGRI_TRUST_SCORE: 'Điểm AgriTrust-Score',
      MISSIONS_TITLE: 'Hệ thống nhiệm vụ AgriTrust',
      BADGES_TITLE: 'Danh hiệu & Quyền lợi',
      REFERRAL_TITLE: 'Tiếp thị liên kết',
      LAYER_1: 'Lớp 1: Dữ liệu định danh (20%)',
      LAYER_2: 'Lớp 2: Năng lực & Hành vi (40%)',
      LAYER_3: 'Lớp 3: Uy tín xã hội (40%)',
      COMING_SOON: 'Sắp ra mắt'
    }
  },

  // Modal configurations
  MODAL_CONFIGS: {
    FARM_ADDRESS: {
      title: 'Nhập địa chỉ canh tác',
      fields: [
        {
          id: 'farmAddresses',
          label: 'Địa chỉ canh tác',
          type: 'farm-addresses',
          required: true,
          helperText: 'Thêm một hoặc nhiều địa chỉ canh tác'
        }
      ]
    },
    FARM_AREA: {
      title: 'Nhập diện tích canh tác',
      fields: [
        {
          id: 'farmArea',
          label: 'Diện tích canh tác (Ha)',
          placeholder: 'VD: 2.5',
          required: true,
          type: 'number',
          helperText: 'Nhập diện tích bằng héc-ta (Ha)'
        },
        {
          id: 'cropType',
          label: 'Loại cây trồng chính',
          placeholder: 'VD: Lúa, ngô, cà chua...',
          required: true
        },
        {
          id: 'farmingMethod',
          label: 'Phương pháp canh tác',
          placeholder: 'VD: Hữu cơ, VietGAP, thông thường...',
          required: false
        },
        {
          id: 'notes',
          label: 'Ghi chú thêm',
          placeholder: 'Thông tin bổ sung về quá trình canh tác',
          multiline: true,
          rows: 3
        }
      ]
    }
  }
};
