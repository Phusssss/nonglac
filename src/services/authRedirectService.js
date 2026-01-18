import { message } from 'antd';

class AuthRedirectService {
  // Lưu thông tin redirect
  setRedirectInfo(path, message, feature) {
    localStorage.setItem('redirectAfterLogin', path);
    if (message) {
      localStorage.setItem('loginMessage', message);
    }
    if (feature) {
      localStorage.setItem('loginFeature', feature);
    }
  }

  // Lấy thông tin redirect
  getRedirectInfo() {
    return {
      path: localStorage.getItem('redirectAfterLogin') || '/',
      message: localStorage.getItem('loginMessage'),
      feature: localStorage.getItem('loginFeature')
    };
  }

  // Xóa thông tin redirect
  clearRedirectInfo() {
    localStorage.removeItem('redirectAfterLogin');
    localStorage.removeItem('loginMessage');
    localStorage.removeItem('loginFeature');
  }

  // Thực hiện redirect sau khi login thành công
  handlePostLoginRedirect(navigate) {
    const { path, message: redirectMessage } = this.getRedirectInfo();
    
    if (redirectMessage) {
      message.success('Đăng nhập thành công! ' + redirectMessage);
    } else {
      message.success('Đăng nhập thành công!');
    }

    // Redirect về trang trước đó hoặc trang chủ
    navigate(path);
    
    // Xóa thông tin redirect
    this.clearRedirectInfo();
  }

  // Các helper methods cho từng loại action
  redirectForPost(navigate) {
    this.setRedirectInfo(
      window.location.pathname,
      'Bây giờ bạn có thể tạo bài viết',
      'đăng bài viết'
    );
    navigate('/phone-login');
  }

  redirectForComment(navigate) {
    this.setRedirectInfo(
      window.location.pathname,
      'Bây giờ bạn có thể bình luận',
      'bình luận bài viết'
    );
    navigate('/phone-login');
  }

  redirectForLike(navigate) {
    this.setRedirectInfo(
      window.location.pathname,
      'Bây giờ bạn có thể thích bài viết',
      'thích bài viết'
    );
    navigate('/phone-login');
  }

  redirectForMarketplace(navigate) {
    this.setRedirectInfo(
      window.location.pathname,
      'Bây giờ bạn có thể sử dụng chợ',
      'đăng sản phẩm và liên hệ người bán'
    );
    navigate('/phone-login');
  }

  redirectForChat(navigate) {
    this.setRedirectInfo(
      window.location.pathname,
      'Bây giờ bạn có thể nhắn tin',
      'gửi tin nhắn'
    );
    navigate('/phone-login');
  }

  redirectForAI(navigate) {
    this.setRedirectInfo(
      window.location.pathname,
      'Bây giờ bạn có thể sử dụng AI',
      'sử dụng các công cụ AI'
    );
    navigate('/phone-login');
  }

  redirectForProfile(navigate) {
    this.setRedirectInfo(
      '/profile',
      'Bây giờ bạn có thể xem profile',
      'xem thông tin cá nhân'
    );
    navigate('/phone-login');
  }

  // Show message cho các action cần auth
  showAuthRequiredMessage(feature = 'sử dụng tính năng này') {
    message.error(`Vui lòng đăng nhập để ${feature}`, 3);
  }
}

export const authRedirectService = new AuthRedirectService();