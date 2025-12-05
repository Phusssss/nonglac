import React from 'react';
import { Button } from '@mui/material';
import { ThumbUp } from '@mui/icons-material';

const ReactionButton = ({ onReaction, currentReaction, totalLikes }) => {
  const isLiked = currentReaction === 'like';

  const handleClick = () => {
    onReaction(isLiked ? null : 'like');
  };

  return (
    <Button
      startIcon={<ThumbUp />}
      onClick={handleClick}
      color={isLiked ? 'primary' : 'inherit'}
      sx={{ 
        textTransform: 'none', 
        minWidth: 'auto', 
        px: 2,
        fontWeight: isLiked ? 'bold' : 'normal'
      }}
    >
      Thích {totalLikes > 0 && `(${totalLikes})`}
    </Button>
  );
};

export default ReactionButton;