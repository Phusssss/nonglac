// Utility functions for handling large content

// Nén HTML content
export const compressHTML = (html) => {
  return html
    .replace(/\s+/g, ' ')           // Thay nhiều space thành 1
    .replace(/>\s+</g, '><')        // Xóa space giữa tags
    .replace(/\s+>/g, '>')          // Xóa space trước >
    .replace(/<\s+/g, '<')          // Xóa space sau <
    .trim();
};

// Giải nén HTML content
export const decompressHTML = (compressedHtml) => {
  return compressedHtml; // Có thể thêm logic format lại nếu cần
};

// Chia content thành chunks
export const splitContent = (content, maxSize = 800000) => { // 800KB per chunk
  const compressed = compressHTML(content);
  const chunks = [];
  
  if (compressed.length <= maxSize) {
    return [compressed];
  }
  
  // Chia theo đoạn văn để tránh cắt giữa tag HTML
  const paragraphs = compressed.split('</p>');
  let currentChunk = '';
  
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i] + (i < paragraphs.length - 1 ? '</p>' : '');
    
    if ((currentChunk + paragraph).length > maxSize && currentChunk) {
      chunks.push(currentChunk);
      currentChunk = paragraph;
    } else {
      currentChunk += paragraph;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
};

// Ghép chunks thành content
export const mergeChunks = (chunks) => {
  return chunks.join('');
};

// Chuyển đổi base64 images thành GitHub URLs
export const processImagesInContent = async (content) => {
  const imgRegex = /<img[^>]+src="data:image\/[^;]+;base64,([^"]+)"[^>]*>/g;
  let processedContent = content;
  const matches = [...content.matchAll(imgRegex)];
  
  for (const match of matches) {
    try {
      const base64Data = match[1];
      const fullMatch = match[0];
      
      // Upload to GitHub (sử dụng service có sẵn)
      const githubUrl = await uploadBase64ToGitHub(base64Data);
      
      if (githubUrl) {
        // Thay thế base64 bằng GitHub URL
        const newImgTag = fullMatch.replace(/src="data:image\/[^;]+;base64,[^"]+"/, `src="${githubUrl}"`);
        processedContent = processedContent.replace(fullMatch, newImgTag);
      }
    } catch (error) {
      console.error('Error processing image:', error);
    }
  }
  
  return processedContent;
};

// Upload base64 to GitHub (sử dụng githubStorage service)
const uploadBase64ToGitHub = async (base64Data) => {
  try {
    // Chuyển base64 thành blob
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });
    blob.name = `lesson_${Date.now()}.jpg`;
    
    // Sử dụng githubStorage service có sẵn
    const { githubStorage } = await import('../services/githubStorage');
    return await githubStorage.uploadImage(blob, 'lesson-images');
  } catch (error) {
    console.error('GitHub upload error:', error);
    return null;
  }
};