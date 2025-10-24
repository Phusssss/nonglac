// Sử dụng base64 để lưu hình ảnh tạm thời (chỉ cho demo)
export const convertImageToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const convertMultipleImages = async (files) => {
  const promises = files.map(file => convertImageToBase64(file));
  return Promise.all(promises);
};