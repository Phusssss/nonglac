import React from 'react';
import { Paper, Typography, Box, Avatar, List, ListItem, ListItemAvatar, ListItemText, Chip, Divider } from '@mui/material';

const RightSidebar = () => {
  const topUsers = [
    { name: 'Lê Minh Tuấn', reputation: 234, specialty: 'Công nghệ nông nghiệp' },
    { name: 'Nguyễn Văn Hai', reputation: 178, specialty: 'Thủy sản' },
    { name: 'Nguyễn Văn Nam', reputation: 156, specialty: 'Trồng trọt' },
    { name: 'Phạm Văn Đức', reputation: 145, specialty: 'Chăn nuôi' }
  ];

  const recentActivity = [
    'Giá lúa tăng 5% trong tuần',
    'Xuất khẩu tôm đạt kỷ lục',
    'Công nghệ AI trong nông nghiệp',
    'Thời tiết thuận lợi cho vụ mùa'
  ];

  return (
    <Box sx={{ width: 280 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          Chuyên gia hàng đầu
        </Typography>
        <List dense>
          {topUsers.map((user, index) => (
            <ListItem key={index} sx={{ px: 0 }}>
              <ListItemAvatar>
                <Avatar sx={{ width: 32, height: 32 }}>
                  {user.name.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={user.name}
                secondary={
                  <>
                    <Chip label={`${user.reputation} uy tín`} size="small" color="primary" sx={{ mr: 1 }} />
                    <span style={{ fontSize: '0.75rem', color: 'rgba(0, 0, 0, 0.6)' }}>
                      {user.specialty}
                    </span>
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Tin tức nông nghiệp
        </Typography>
        <Box>
          {recentActivity.map((activity, index) => (
            <Box key={index}>
              <Typography variant="body2" sx={{ py: 1, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
                • {activity}
              </Typography>
              {index < recentActivity.length - 1 && <Divider />}
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default RightSidebar;