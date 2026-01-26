export const USER_PROFILE_CONSTANTS = {
  POSTS_PER_PAGE: 10,
  REPUTATION_LEVELS: {
    EXPERT: { min: 1000, label: 'Chuyên gia' },
    EXPERIENCED: { min: 500, label: 'Người có kinh nghiệm' },
    ACTIVE: { min: 100, label: 'Thành viên tích cực' },
    MEMBER: { min: 50, label: 'Thành viên' },
    NEWBIE: { min: 0, label: 'Người mới' }
  },
  DEFAULT_SKILLS: [
    'Trồng trọt',
    'Chăn nuôi',
    'Thủy sản', 
    'Nông nghiệp bền vững',
    'Công nghệ nông nghiệp'
  ]
};