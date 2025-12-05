import React from 'react';
import { Card, CardContent, Box, Avatar, TextField, Button, Divider } from '@mui/material';
import { PhotoLibrary, Videocam, EmojiEmotions } from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';

const CreatePostCard = ({ onCreatePost }) => {
  const { user, userProfile } = useAuth();

  if (!user) return null;

  return (
    <Card sx={{ 
      mb: 2, 
      bgcolor: 'background.paper',
      borderRadius: '8px',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)'
    }}>
      <CardContent sx={{ pb: '8px !important' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <Avatar 
            sx={{ width: 40, height: 40 }}
            src={userProfile?.avatar}
          >
            {!userProfile?.avatar && (userProfile?.displayName?.charAt(0) || user.email?.charAt(0))}
          </Avatar>
          <TextField
            fullWidth
            placeholder={`${userProfile?.displayName || 'Bạn'} ơi, bạn đang nghĩ gì?`}
            variant="outlined"
            onClick={onCreatePost}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '20px',
                backgroundColor: '#F0F2F5',
                border: 'none',
                '&:hover': {
                  backgroundColor: '#E4E6EA',
                },
                '& fieldset': {
                  border: 'none',
                },
              },
              '& .MuiInputBase-input': {
                cursor: 'pointer',
                color: '#65676B',
                fontSize: '16px',
              }
            }}
          />
        </Box>
        
        <Divider sx={{ mb: 1 }} />
        
        <Box sx={{ display: 'flex', justifyContent: 'space-around' }}>
          <Button
            startIcon={<PhotoLibrary sx={{ color: '#45BD62' }} />}
            onClick={onCreatePost}
            sx={{
              color: '#65676B',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '8px',
              px: 3,
              py: 1,
              '&:hover': {
                backgroundColor: '#F0F2F5',
              }
            }}
          >
            Ảnh/Video
          </Button>
          <Button
            startIcon={<EmojiEmotions sx={{ color: '#F7B928' }} />}
            onClick={onCreatePost}
            sx={{
              color: '#65676B',
              fontWeight: 600,
              textTransform: 'none',
              borderRadius: '8px',
              px: 3,
              py: 1,
              '&:hover': {
                backgroundColor: '#F0F2F5',
              }
            }}
          >
            Cảm xúc
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CreatePostCard;