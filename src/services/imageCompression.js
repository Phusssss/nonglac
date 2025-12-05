// Hàm nén ảnh tự động
export const compressImage = (file, maxWidth = 800, quality = 0.7) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      // Tính toán kích thước mới giữ tỷ lệ
      let { width, height } = img;
      
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxWidth) {
          width = (width * maxWidth) / height;
          height = maxWidth;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // Vẽ ảnh lên canvas với kích thước mới
      ctx.drawImage(img, 0, 0, width, height);
      
      // Chuyển canvas thành blob với chất lượng nén
      canvas.toBlob(resolve, 'image/jpeg', quality);
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// Hàm nén nhiều ảnh
export const compressMultipleImages = async (files) => {
  const compressedFiles = [];
  
  for (const file of files) {
    const compressedBlob = await compressImage(file);
    
    // Tạo File object mới từ blob
    const compressedFile = new File([compressedBlob], file.name, {
      type: 'image/jpeg',
      lastModified: Date.now()
    });
    
    compressedFiles.push(compressedFile);
  }
  
  return compressedFiles;
};