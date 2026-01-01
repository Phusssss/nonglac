import React from 'react';
import { Heart } from 'lucide-react';

const ReactionButton = ({ onReaction, currentReaction, totalLikes }) => {
  const isLiked = currentReaction === 'like';

  const handleClick = () => {
    onReaction(isLiked ? null : 'like');
  };

  return (
    <button 
      onClick={handleClick}
      className="flex items-center gap-1 text-gray-500 hover:text-red-500 transition-colors text-sm group"
    >
      <Heart 
        className={`w-5 h-5 transition-all ${isLiked ? 'fill-red-500 text-red-500 scale-110' : 'group-hover:scale-110'}`}
      />
      <span className={isLiked ? 'text-red-500 font-medium' : ''}>
        {totalLikes > 0 ? totalLikes : ''}
      </span>
    </button>
  );
};

export default ReactionButton;