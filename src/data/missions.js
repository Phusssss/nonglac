// Dữ liệu nhiệm vụ cho hệ thống gamification
export const MISSIONS = [
  {
    id: 'complete_profile',
    title: 'Hoàn thiện hồ sơ',
    description: 'Cập nhật đầy đủ thông tin cá nhân',
    icon: 'person',
    reward: 100,
    maxProgress: 1,
    currentProgress: 0,
    status: 'pending',
    actionLink: 'profile'
  },
  {
    id: 'first_post',
    title: 'Bài viết đầu tiên',
    description: 'Chia sẻ kinh nghiệm nông nghiệp đầu tiên',
    icon: 'edit_note',
    reward: 150,
    maxProgress: 1,
    currentProgress: 0,
    status: 'pending',
    actionLink: 'forum'
  },
  {
    id: 'get_likes',
    title: 'Nhận 10 lượt thích',
    description: 'Bài viết của bạn được cộng đồng yêu thích',
    icon: 'favorite',
    reward: 200,
    maxProgress: 10,
    currentProgress: 0,
    status: 'locked',
    actionLink: 'forum'
  },
  {
    id: 'daily_login',
    title: 'Đăng nhập hàng ngày',
    description: 'Đăng nhập 7 ngày liên tiếp',
    icon: 'login',
    reward: 300,
    maxProgress: 7,
    currentProgress: 1,
    status: 'pending',
    actionLink: 'home'
  },
  {
    id: 'help_community',
    title: 'Hỗ trợ cộng đồng',
    description: 'Trả lời 5 câu hỏi của nông dân khác',
    icon: 'help',
    reward: 250,
    maxProgress: 5,
    currentProgress: 0,
    status: 'locked',
    actionLink: 'forum'
  }
];

export const BADGES = {
  newbie: {
    label: 'Người mới',
    description: 'Chào mừng đến với cộng đồng',
    minScore: 0,
    icon: '🌱'
  },
  farmer: {
    label: 'Nông dân',
    description: 'Đã có kinh nghiệm cơ bản',
    minScore: 500,
    icon: '🚜'
  },
  expert: {
    label: 'Chuyên gia',
    description: 'Người có uy tín trong cộng đồng',
    minScore: 1500,
    icon: '🏆'
  },
  master: {
    label: 'Bậc thầy',
    description: 'Người dẫn dắt cộng đồng',
    minScore: 3000,
    icon: '👑'
  }
};

export const ULTIMATE_REWARD = {
  title: 'Huy hiệu Nông dân Xuất sắc',
  description: 'Nhận huy hiệu bạc thật được giao tận nhà miễn phí. Biểu tượng của sự uy tín trong cộng đồng nông nghiệp Việt Nam.',
  threshold: 5000,
  icon: '🥈'
};