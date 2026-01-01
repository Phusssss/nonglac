import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

class ImageUploadService {
  async uploadProductImages(images, productId) {
    const uploadPromises = images.map(async (image, index) => {
      const imageRef = ref(storage, `marketplace/${productId}/${index}_${Date.now()}`);
      const snapshot = await uploadBytes(imageRef, image);
      return getDownloadURL(snapshot.ref);
    });

    return Promise.all(uploadPromises);
  }

  async uploadSingleImage(image, path) {
    const imageRef = ref(storage, path);
    const snapshot = await uploadBytes(imageRef, image);
    return getDownloadURL(snapshot.ref);
  }
}

export default new ImageUploadService();