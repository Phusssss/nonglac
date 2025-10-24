import React from 'react';
import { Paper, Box, Avatar, TextField, Button, Divider } from '@mui/material';
import { Image, Poll, Event } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const CreatePostCard = ({ onCreatePost }) => {
  const { user, userProfile } = useAuth();

  if (!user) return null;

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Avatar sx={{ width: 40, height: 40 }}>
          {userProfile?.displayName?.charAt(0) || user.email?.charAt(0)}
        </Avatar>
        <TextField
          fullWidth
          placeholder="Bạn đang nghĩ gì về nông nghiệp?"
          variant="outlined"
          multiline
          rows={2}
          onClick={onCreatePost}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'grey.50'
            }
          }}
        />
      </Box>
      
      <Divider sx={{ my: 2 }} />
      
      <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
        <Button
          startIcon={<Image />}
          sx={{ color: 'text.secondary', textTransform: 'none' }}
          onClick={onCreatePost}
        >
          Ảnh/Video
        </Button>
        <Button
          startIcon={<Poll />}
          sx={{ color: 'text.secondary', textTransform: 'none' }}
          onClick={onCreatePost}
        >
          Thăm dò ý kiến
        </Button>
        <Button
          startIcon={<Event />}
          sx={{ color: 'text.secondary', textTransform: 'none' }}
          onClick={onCreatePost}
        >
          Sự kiện
        </Button>
      </Box>
    </Paper>
  );
};

export default CreatePostCard;