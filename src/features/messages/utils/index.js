import moment from 'moment';

/**
 * Messages Utils - Các hàm tiện ích cho messages feature
 */
export const messagesUtils = {
  /**
   * Format thời gian tin nhắn theo kiểu relative time
   * @param {*} timestamp - Timestamp từ Firestore
   * @returns {string} Thời gian đã format
   */
  formatMessageTime(timestamp) {
    if (!timestamp) return '';
    
    const messageDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now - messageDate) / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInMinutes < 1) {
      return 'Vừa xong';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}p`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h`;
    } else if (diffInDays === 1) {
      return 'Hôm qua';
    } else if (diffInDays < 7) {
      return `${diffInDays} ngày`;
    } else {
      return messageDate.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  },

  /**
   * Format thời gian cho conversation list
   * @param {*} timestamp - Timestamp từ Firestore
   * @returns {string} Thời gian đã format
   */
  formatConversationTime(timestamp) {
    if (!timestamp) return '';
    
    const messageDate = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return moment(messageDate).fromNow();
  },

  /**
   * Format thời gian chi tiết (HH:mm)
   * @param {*} timestamp - Timestamp từ Firestore
   * @returns {string} Thời gian đã format
   */
  formatDetailTime(timestamp) {
    if (!timestamp) return '';
    const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return moment(time).format('HH:mm');
  },

  /**
   * Lấy tên hiển thị của người dùng
   * @param {object} userInfo - Thông tin người dùng
   * @returns {string} Tên hiển thị
   */
  getDisplayName(userInfo) {
    if (!userInfo) return 'Người dùng';
    return userInfo.displayName || userInfo.email || 'Người dùng';
  },

  /**
   * Kiểm tra tin nhắn có phải của user hiện tại không
   * @param {string} messageSenderId - ID người gửi tin nhắn
   * @param {string} currentUserId - ID user hiện tại
   * @returns {boolean}
   */
  isOwnMessage(messageSenderId, currentUserId) {
    return messageSenderId === currentUserId;
  },

  /**
   * Kiểm tra có nên hiển thị ngày không (khi chuyển ngày)
   * @param {*} currentTimestamp - Timestamp tin nhắn hiện tại
   * @param {*} previousTimestamp - Timestamp tin nhắn trước đó
   * @returns {boolean}
   */
  shouldShowDate(currentTimestamp, previousTimestamp) {
    if (!currentTimestamp) return false;
    if (!previousTimestamp) return true;
    
    const current = currentTimestamp.toDate ? currentTimestamp.toDate() : new Date(currentTimestamp);
    const previous = previousTimestamp.toDate ? previousTimestamp.toDate() : new Date(previousTimestamp);
    
    return !moment(current).isSame(moment(previous), 'day');
  },

  /**
   * Format ngày tháng đầy đủ
   * @param {*} timestamp - Timestamp từ Firestore
   * @returns {string} Ngày tháng đã format
   */
  formatFullDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return moment(date).format('DD/MM/YYYY');
  },

  /**
   * Truncate text nếu quá dài
   * @param {string} text - Text cần truncate
   * @param {number} maxLength - Độ dài tối đa
   * @returns {string} Text đã truncate
   */
  truncateText(text, maxLength = 50) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  },

  /**
   * Validate nội dung tin nhắn
   * @param {string} content - Nội dung tin nhắn
   * @returns {object} Kết quả validate
   */
  validateMessage(content) {
    const errors = {};
    
    if (!content || !content.trim()) {
      errors.content = 'Nội dung tin nhắn không được để trống';
    }
    
    if (content && content.trim().length > 1000) {
      errors.content = 'Nội dung tin nhắn không được vượt quá 1000 ký tự';
    }
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};