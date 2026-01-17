import DOMPurify from 'dompurify';

// Input validation utilities
export const validatePost = (data) => {
  const errors = {};
  const sanitizedData = { ...data };
  
  // Title validation
  if (!data.title || typeof data.title !== 'string') {
    errors.title = 'Tiêu đề là bắt buộc';
  } else if (data.title.trim().length < 5) {
    errors.title = 'Tiêu đề phải có ít nhất 5 ký tự';
  } else if (data.title.length > 200) {
    errors.title = 'Tiêu đề không được quá 200 ký tự';
  } else {
    sanitizedData.title = DOMPurify.sanitize(data.title.trim());
  }
  
  // Content validation
  if (!data.content || typeof data.content !== 'string') {
    errors.content = 'Nội dung là bắt buộc';
  } else if (data.content.trim().length < 10) {
    errors.content = 'Nội dung phải có ít nhất 10 ký tự';
  } else if (data.content.length > 10000) {
    errors.content = 'Nội dung không được quá 10,000 ký tự';
  } else {
    // Sanitize HTML content but allow basic formatting
    sanitizedData.content = DOMPurify.sanitize(data.content, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h3', 'h4', 'blockquote'],
      ALLOWED_ATTR: ['class'],
      FORBID_SCRIPTS: true,
      FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input'],
      FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover']
    });
  }
  
  // Category validation
  const validCategories = [
    'trong-trot', 'chan-nuoi', 'thuy-san', 'khuyen-nong',
    'khoa-hoc-cong-nghe', 'lam-nghiep', 'moi-truong',
    'kinh-te', 'thoi-su', 'khac'
  ];
  
  if (!data.category || !validCategories.includes(data.category)) {
    errors.category = 'Danh mục không hợp lệ';
  }
  
  // Image URL validation (if provided)
  if (data.imageUrl && typeof data.imageUrl === 'string') {
    const urlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)$/i;
    if (!urlPattern.test(data.imageUrl)) {
      errors.imageUrl = 'URL hình ảnh không hợp lệ';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: sanitizedData
  };
};

export const validateComment = (data) => {
  const errors = {};
  const sanitizedData = { ...data };
  
  // Content validation
  if (!data.content || typeof data.content !== 'string') {
    errors.content = 'Nội dung bình luận là bắt buộc';
  } else if (data.content.trim().length < 1) {
    errors.content = 'Bình luận không được để trống';
  } else if (data.content.length > 1000) {
    errors.content = 'Bình luận không được quá 1,000 ký tự';
  } else {
    // Sanitize comment content (more restrictive than posts)
    sanitizedData.content = DOMPurify.sanitize(data.content.trim(), {
      ALLOWED_TAGS: ['strong', 'em', 'br'],
      ALLOWED_ATTR: [],
      FORBID_SCRIPTS: true
    });
  }
  
  // Post ID validation
  if (!data.postId || typeof data.postId !== 'string') {
    errors.postId = 'ID bài viết không hợp lệ';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: sanitizedData
  };
};

export const validateUser = (data) => {
  const errors = {};
  const sanitizedData = { ...data };
  
  // Display name validation
  if (!data.displayName || typeof data.displayName !== 'string') {
    errors.displayName = 'Tên hiển thị là bắt buộc';
  } else if (data.displayName.trim().length < 2) {
    errors.displayName = 'Tên hiển thị phải có ít nhất 2 ký tự';
  } else if (data.displayName.length > 50) {
    errors.displayName = 'Tên hiển thị không được quá 50 ký tự';
  } else {
    sanitizedData.displayName = DOMPurify.sanitize(data.displayName.trim());
  }
  
  // Email validation
  if (data.email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(data.email)) {
      errors.email = 'Email không hợp lệ';
    }
  }
  
  // Bio validation (optional)
  if (data.bio && typeof data.bio === 'string') {
    if (data.bio.length > 500) {
      errors.bio = 'Tiểu sử không được quá 500 ký tự';
    } else {
      sanitizedData.bio = DOMPurify.sanitize(data.bio.trim(), {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: []
      });
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: sanitizedData
  };
};

export const validateMessage = (data) => {
  const errors = {};
  const sanitizedData = { ...data };
  
  // Text validation
  if (!data.text || typeof data.text !== 'string') {
    errors.text = 'Nội dung tin nhắn là bắt buộc';
  } else if (data.text.trim().length < 1) {
    errors.text = 'Tin nhắn không được để trống';
  } else if (data.text.length > 2000) {
    errors.text = 'Tin nhắn không được quá 2,000 ký tự';
  } else {
    // Sanitize message content (very restrictive)
    sanitizedData.text = DOMPurify.sanitize(data.text.trim(), {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
      FORBID_SCRIPTS: true
    });
  }
  
  // Conversation ID validation
  if (!data.conversationId || typeof data.conversationId !== 'string') {
    errors.conversationId = 'ID cuộc trò chuyện không hợp lệ';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: sanitizedData
  };
};

// Rate limiting helpers
export const createRateLimiter = (maxRequests, windowMs) => {
  const requests = new Map();
  
  return (userId) => {
    const now = Date.now();
    const userRequests = requests.get(userId) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return {
        allowed: false,
        resetTime: validRequests[0] + windowMs
      };
    }
    
    validRequests.push(now);
    requests.set(userId, validRequests);
    
    return {
      allowed: true,
      remaining: maxRequests - validRequests.length
    };
  };
};

// Content moderation helpers
export const detectSpam = (content) => {
  const spamPatterns = [
    /(.)\1{10,}/g, // Repeated characters
    /https?:\/\/[^\s]+/gi, // Multiple URLs
    /\b(mua|bán|giá rẻ|khuyến mãi|liên hệ|zalo|facebook)\b/gi, // Commercial keywords
    /\b\d{10,11}\b/g // Phone numbers
  ];
  
  let spamScore = 0;
  const lowerContent = content.toLowerCase();
  
  spamPatterns.forEach(pattern => {
    const matches = lowerContent.match(pattern);
    if (matches) {
      spamScore += matches.length;
    }
  });
  
  // Check for excessive capitalization
  const upperCaseRatio = (content.match(/[A-Z]/g) || []).length / content.length;
  if (upperCaseRatio > 0.5) {
    spamScore += 2;
  }
  
  return {
    isSpam: spamScore >= 3,
    score: spamScore,
    confidence: Math.min(spamScore / 5, 1)
  };
};

export const containsProfanity = (content) => {
  const profanityWords = [
    'đm', 'dm', 'đmm', 'dmm', 'vcl', 'vkl', 'cc', 'cặc',
    'lồn', 'buồi', 'chó', 'súc vật', 'thằng ngu', 'con điên'
  ];
  
  const lowerContent = content.toLowerCase();
  
  for (const word of profanityWords) {
    if (lowerContent.includes(word)) {
      return {
        hasProfanity: true,
        word: word
      };
    }
  }
  
  return {
    hasProfanity: false,
    word: null
  };
};

// File validation
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxWidth = 2048,
    maxHeight = 2048
  } = options;
  
  const errors = [];
  
  // Size validation
  if (file.size > maxSize) {
    errors.push(`File quá lớn. Kích thước tối đa: ${maxSize / 1024 / 1024}MB`);
  }
  
  // Type validation
  if (!allowedTypes.includes(file.type)) {
    errors.push(`Định dạng file không được hỗ trợ. Chỉ chấp nhận: ${allowedTypes.join(', ')}`);
  }
  
  // For images, validate dimensions
  if (file.type.startsWith('image/')) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        if (img.width > maxWidth || img.height > maxHeight) {
          errors.push(`Kích thước ảnh quá lớn. Tối đa: ${maxWidth}x${maxHeight}px`);
        }
        
        resolve({
          isValid: errors.length === 0,
          errors,
          dimensions: { width: img.width, height: img.height }
        });
      };
      
      img.onerror = () => {
        errors.push('File ảnh không hợp lệ');
        resolve({
          isValid: false,
          errors
        });
      };
      
      img.src = URL.createObjectURL(file);
    });
  }
  
  return Promise.resolve({
    isValid: errors.length === 0,
    errors
  });
};

// Security headers validation
export const validateSecurityHeaders = (headers) => {
  const requiredHeaders = {
    'Content-Security-Policy': true,
    'X-Frame-Options': true,
    'X-Content-Type-Options': true,
    'Referrer-Policy': true,
    'Permissions-Policy': true
  };
  
  const missing = [];
  
  Object.keys(requiredHeaders).forEach(header => {
    if (!headers[header.toLowerCase()]) {
      missing.push(header);
    }
  });
  
  return {
    isSecure: missing.length === 0,
    missingHeaders: missing
  };
};