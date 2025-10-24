// Sử dụng Imgur thay vì Cloudinary vì đơn giản hơn
const IMGUR_CLIENT_ID = 'c9a6efb3d7932fd'; // Client ID công khai

export const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const response = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': `Client-ID ${IMGUR_CLIENT_ID}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      return data.data.link;
    } else {
      console.error('Imgur upload failed:', data);
      return null;
    }
  } catch (error) {
    console.error('Error uploading to Imgur:', error);
    return null;
  }
};

export const uploadMultipleImages = async (files) => {
  const uploadPromises = files.map(file => uploadImageToCloudinary(file));
  const results = await Promise.all(uploadPromises);
  // Lọc bỏ các kết quả null/undefined
  return results.filter(url => url && url !== null);
};