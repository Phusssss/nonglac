import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, IconButton, Typography, Snackbar, Alert } from '@mui/material';
import { Facebook, Twitter, Link, WhatsApp } from '@mui/icons-material';

const ShareDialog = ({ open, onClose, post }) => {
  const [showAlert, setShowAlert] = useState(false);
  
  const postUrl = `${window.location.origin}/post/${post?.id}`;
  const shareText = `${post?.title} - ${post?.content.substring(0, 100)}...`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setShowAlert(true);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleTwitterShare = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
  };

  const handleWhatsAppShare = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + postUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>Chia sẻ bài viết</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {post?.title}
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Box sx={{ textAlign: 'center' }}>
              <IconButton 
                onClick={handleFacebookShare}
                sx={{ 
                  backgroundColor: '#1877F2', 
                  color: 'white',
                  '&:hover': { backgroundColor: '#166FE5' },
                  mb: 1
                }}
              >
                <Facebook />
              </IconButton>
              <Typography variant="caption" display="block">Facebook</Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <IconButton 
                onClick={handleTwitterShare}
                sx={{ 
                  backgroundColor: '#1DA1F2', 
                  color: 'white',
                  '&:hover': { backgroundColor: '#1A91DA' },
                  mb: 1
                }}
              >
                <Twitter />
              </IconButton>
              <Typography variant="caption" display="block">Twitter</Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <IconButton 
                onClick={handleWhatsAppShare}
                sx={{ 
                  backgroundColor: '#25D366', 
                  color: 'white',
                  '&:hover': { backgroundColor: '#22C55E' },
                  mb: 1
                }}
              >
                <WhatsApp />
              </IconButton>
              <Typography variant="caption" display="block">WhatsApp</Typography>
            </Box>
            
            <Box sx={{ textAlign: 'center' }}>
              <IconButton 
                onClick={handleCopyLink}
                sx={{ 
                  backgroundColor: 'grey.600', 
                  color: 'white',
                  '&:hover': { backgroundColor: 'grey.700' },
                  mb: 1
                }}
              >
                <Link />
              </IconButton>
              <Typography variant="caption" display="block">Sao chép</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Đóng</Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar 
        open={showAlert} 
        autoHideDuration={3000} 
        onClose={() => setShowAlert(false)}
      >
        <Alert severity="success" onClose={() => setShowAlert(false)}>
          Đã sao chép liên kết!
        </Alert>
      </Snackbar>
    </>
  );
};

export default ShareDialog;