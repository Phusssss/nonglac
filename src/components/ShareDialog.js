import React from 'react';

const ShareDialog = ({ isOpen, onClose, post }) => {
  if (!isOpen) return null;

  const handleShare = (platform) => {
    const url = window.location.href;
    const text = post?.title || 'Bài viết từ NôngLạc';
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`);
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        alert('Đã copy link!');
        break;
      default:
        break;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Chia sẻ bài viết</h3>
        <div className="space-y-3">
          <button
            onClick={() => handleShare('facebook')}
            className="w-full p-3 text-left hover:bg-gray-50 rounded-lg flex items-center gap-3"
          >
            📘 Facebook
          </button>
          <button
            onClick={() => handleShare('twitter')}
            className="w-full p-3 text-left hover:bg-gray-50 rounded-lg flex items-center gap-3"
          >
            🐦 Twitter
          </button>
          <button
            onClick={() => handleShare('copy')}
            className="w-full p-3 text-left hover:bg-gray-50 rounded-lg flex items-center gap-3"
          >
            📋 Copy link
          </button>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-4 p-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

export default ShareDialog;