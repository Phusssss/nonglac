import { message } from 'antd';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';

class ShareService {
  /**
   * Sao chép liên kết vào clipboard
   */
  async copyToClipboard(url) {
    try {
      await navigator.clipboard.writeText(url);
      message.success('Đã sao chép liên kết!');
      return { success: true };
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      message.error('Không thể sao chép liên kết');
      return { success: false, error: error.message };
    }
  }

  /**
   * Chia sẻ lên Facebook
   */
  shareToFacebook(url, title = '') {
    try {
      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`;
      window.open(facebookUrl, 'facebook-share', 'width=600,height=400');
      return { success: true };
    } catch (error) {
      console.error('Error sharing to Facebook:', error);
      message.error('Không thể chia sẻ lên Facebook');
      return { success: false, error: error.message };
    }
  }

  /**
   * Chia sẻ lên Twitter/X
   */
  shareToTwitter(url, title = '') {
    try {
      const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
      window.open(twitterUrl, 'twitter-share', 'width=600,height=400');
      return { success: true };
    } catch (error) {
      console.error('Error sharing to Twitter:', error);
      message.error('Không thể chia sẻ lên Twitter');
      return { success: false, error: error.message };
    }
  }

  /**
   * Chia sẻ qua WhatsApp
   */
  shareToWhatsApp(url, title = '') {
    try {
      const text = title ? `${title}\n${url}` : url;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
      window.open(whatsappUrl, 'whatsapp-share');
      return { success: true };
    } catch (error) {
      console.error('Error sharing to WhatsApp:', error);
      message.error('Không thể chia sẻ qua WhatsApp');
      return { success: false, error: error.message };
    }
  }

  /**
   * Chia sẻ qua Telegram
   */
  shareToTelegram(url, title = '') {
    try {
      const text = title ? `${title}\n${url}` : url;
      const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
      window.open(telegramUrl, 'telegram-share');
      return { success: true };
    } catch (error) {
      console.error('Error sharing to Telegram:', error);
      message.error('Không thể chia sẻ qua Telegram');
      return { success: false, error: error.message };
    }
  }

  /**
   * Chia sẻ qua Email
   */
  shareToEmail(url, title = '', description = '') {
    try {
      const subject = encodeURIComponent(title || 'Chia sẻ từ NôngLạc');
      const body = encodeURIComponent(`${description}\n\n${url}`);
      const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
      window.location.href = mailtoUrl;
      return { success: true };
    } catch (error) {
      console.error('Error sharing to Email:', error);
      message.error('Không thể chia sẻ qua Email');
      return { success: false, error: error.message };
    }
  }

  /**
   * Sử dụng Web Share API nếu có sẵn (cho mobile)
   */
  async useNativeShare(title, text, url) {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title,
          text: text,
          url: url
        });
        return { success: true };
      }
      return { success: false, error: 'Web Share API không được hỗ trợ' };
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error using native share:', error);
      }
      return { success: false, error: error.message };
    }
  }

  /**
   * Kiểm tra xem trình duyệt có hỗ trợ Web Share API không
   */
  canUseNativeShare() {
    return !!navigator.share;
  }

  /**
   * Tạo URL chia sẻ cho bài viết
   */
  generatePostShareUrl(postId) {
    return `${window.location.origin}/post/${postId}`;
  }

  /**
   * Tạo URL chia sẻ cho sản phẩm
   */
  generateProductShareUrl(productId) {
    return `${window.location.origin}/product/${productId}`;
  }

  /**
   * Chia sẻ bài viết lên hồ sơ cá nhân
   */
  async shareToProfile(post, userId, userName) {
    try {
      if (!userId || !post.id) {
        throw new Error('Thiếu thông tin người dùng hoặc bài viết');
      }

      const sharedPost = {
        originalPostId: post.id,
        originalAuthorId: post.authorId,
        originalAuthorName: post.authorName,
        originalAuthorAvatar: post.authorAvatar,
        originalTitle: post.title,
        originalContent: post.content,
        originalImages: post.images || post.media || [],
        originalCategory: post.category,
        originalCreatedAt: post.createdAt,
        
        // Thông tin người chia sẻ
        sharedByUserId: userId,
        sharedByUserName: userName,
        sharedAt: serverTimestamp(),
        
        // Metadata
        likes: 0,
        comments: 0,
        views: 0
      };

      const docRef = await addDoc(collection(db, 'userPostShares'), sharedPost);
      message.success('Đã chia sẻ lên hồ sơ của bạn!');
      
      return {
        success: true,
        shareId: docRef.id,
        message: 'Chia sẻ thành công'
      };
    } catch (error) {
      console.error('Error sharing to profile:', error);
      message.error('Không thể chia sẻ lên hồ sơ');
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Chia sẻ sản phẩm lên hồ sơ cá nhân
   */
  async shareProductToProfile(product, userId, userName) {
    try {
      if (!userId || !product.id) {
        throw new Error('Thiếu thông tin người dùng hoặc sản phẩm');
      }

      const sharedProduct = {
        type: 'product',
        originalProductId: product.id,
        originalProductName: product.name,
        originalProductDescription: product.description,
        originalProductPrice: product.price,
        originalProductUnit: product.unit,
        originalProductImages: product.images || [],
        originalProductCategory: product.category,
        originalProductAddress: product.address || product.location,
        originalProductCreatedAt: product.createdAt,
        
        // Thông tin người chia sẻ
        sharedByUserId: userId,
        sharedByUserName: userName,
        sharedAt: serverTimestamp(),
        
        // Metadata
        likes: 0,
        comments: 0,
        views: 0
      };

      const docRef = await addDoc(collection(db, 'userPostShares'), sharedProduct);
      message.success('Đã chia sẻ sản phẩm lên hồ sơ của bạn!');
      
      return {
        success: true,
        shareId: docRef.id,
        message: 'Chia sẻ thành công'
      };
    } catch (error) {
      console.error('Error sharing product to profile:', error);
      message.error('Không thể chia sẻ sản phẩm lên hồ sơ');
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new ShareService();
