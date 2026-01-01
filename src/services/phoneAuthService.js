import { auth } from '../firebase/config';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber
} from 'firebase/auth';

class PhoneAuthService {
  constructor() {
    this.recaptchaVerifier = null;
    this.confirmationResult = null;
    this.useTestMode = false; // Set true để dùng test OTP
    // Test phone numbers cho development
    this.TEST_PHONE_NUMBERS = {
      '+84395752407': '123456',
      '+84987654321': '654321', 
      '+84123456789': '111111'
    };
  }

  // Toggle giữa test và real OTP
  setTestMode(enabled) {
    this.useTestMode = enabled;
  }

  // Khởi tạo reCAPTCHA
  initRecaptcha(containerId = 'recaptcha-container') {
    // Xóa reCAPTCHA cũ nếu có
    this.cleanup();
    
    // Sử dụng element có sẵn hoặc tạo mới
    let element = document.getElementById(containerId);
    if (!element) {
      element = document.createElement('div');
      element.id = containerId;
      element.style.display = 'none';
      document.body.appendChild(element);
    }
    
    // Xóa nội dung cũ
    element.innerHTML = '';
    
    this.recaptchaVerifier = new RecaptchaVerifier(containerId, {
      size: 'invisible',
      callback: () => {
        console.log('reCAPTCHA solved');
      },
      'expired-callback': () => {
        console.log('reCAPTCHA expired');
        this.recaptchaVerifier = null;
      }
    }, auth);
    
    return this.recaptchaVerifier;
  }

  // Gửi OTP đến số điện thoại
  async sendOTP(phoneNumber) {
    try {
      // Đảm bảo số điện thoại có mã quốc gia
      const formattedPhone = phoneNumber.startsWith('+84') 
        ? phoneNumber 
        : `+84${phoneNumber.replace(/^0/, '')}`;

      console.log('Sending OTP to:', formattedPhone);
      console.log('Phone validation result:', this.isValidVietnamesePhone(phoneNumber));

      // Kiểm tra đầu số cũ trước khi gửi
      if (this.isDeprecatedPrefix(phoneNumber)) {
        return {
          success: false,
          message: 'Số điện thoại này sử dụng đầu số cũ không được hỗ trợ. Vui lòng sử dụng số mới (10 số) hoặc liên hệ nhà mạng để chuyển đổi.'
        };
      }

      // Kiểm tra nếu là test phone number và đang bật test mode
      if (this.useTestMode && this.TEST_PHONE_NUMBERS[formattedPhone]) {
        console.log('Using test phone number - bypassing SMS');
        
        // Tạo mock confirmation result
        this.confirmationResult = {
          confirm: async (code) => {
            if (code === this.TEST_PHONE_NUMBERS[formattedPhone]) {
              return {
                user: {
                  uid: 'test-user-' + Date.now(),
                  phoneNumber: formattedPhone,
                  displayName: 'Test User'
                }
              };
            }
            throw new Error('auth/invalid-verification-code');
          }
        };
        
        return {
          success: true,
          message: `Mã OTP test: ${this.TEST_PHONE_NUMBERS[formattedPhone]} (Development mode)`
        };
      }

      // Khởi tạo reCAPTCHA nếu chưa có
      if (!this.recaptchaVerifier) {
        this.initRecaptcha();
      }

      // Gửi OTP thật
      this.confirmationResult = await signInWithPhoneNumber(
        auth, 
        formattedPhone, 
        this.recaptchaVerifier
      );

      console.log('OTP sent successfully');
      console.log('Confirmation result:', this.confirmationResult);
      
      return {
        success: true,
        message: 'Mã OTP đã được gửi đến số điện thoại của bạn. Nếu không nhận được, hãy kiểm tra spam hoặc thử lại sau 1-2 phút.'
      };

    } catch (error) {
      console.error('Error sending OTP:', error);
      
      // Reset reCAPTCHA nếu có lỗi
      if (this.recaptchaVerifier) {
        this.recaptchaVerifier.clear();
        this.recaptchaVerifier = null;
      }

      return {
        success: false,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // Xác thực OTP
  async verifyOTP(otpCode) {
    try {
      if (!this.confirmationResult) {
        throw new Error('Vui lòng gửi OTP trước');
      }

      console.log('Verifying OTP:', otpCode);

      // Xác thực OTP
      const result = await this.confirmationResult.confirm(otpCode);
      const user = result.user;

      console.log('OTP verified successfully:', user.uid);

      return {
        success: true,
        user: user,
        message: 'Đăng nhập thành công'
      };

    } catch (error) {
      console.error('Error verifying OTP:', error);
      
      return {
        success: false,
        message: this.getErrorMessage(error.code)
      };
    }
  }

  // Đăng xuất
  async signOut() {
    try {
      await auth.signOut();
      this.cleanup();
      return {
        success: true,
        message: 'Đăng xuất thành công'
      };
    } catch (error) {
      console.error('Error signing out:', error);
      return {
        success: false,
        message: 'Lỗi khi đăng xuất'
      };
    }
  }

  // Dọn dẹp
  cleanup() {
    if (this.recaptchaVerifier) {
      try {
        this.recaptchaVerifier.clear();
      } catch (error) {
        console.log('Error clearing reCAPTCHA:', error);
      }
      this.recaptchaVerifier = null;
    }
    this.confirmationResult = null;
    
    // Chỉ xóa nội dung, không xóa element
    const element = document.getElementById('recaptcha-container');
    if (element) {
      element.innerHTML = '';
    }
  }

  // Chuyển đổi mã lỗi thành thông báo tiếng Việt
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/invalid-phone-number': 'Số điện thoại không hợp lệ',
      'auth/missing-phone-number': 'Vui lòng nhập số điện thoại',
      'auth/quota-exceeded': 'Đã vượt quá giới hạn gửi SMS',
      'auth/user-disabled': 'Tài khoản đã bị vô hiệu hóa',
      'auth/operation-not-allowed': 'Phương thức đăng nhập chưa được kích hoạt',
      'auth/invalid-app-credential': 'Cấu hình Firebase không hợp lệ. Vui lòng kiểm tra domain và cài đặt',
      'auth/invalid-verification-code': 'Mã OTP không đúng',
      'auth/invalid-verification-id': 'Mã xác thực không hợp lệ',
      'auth/code-expired': 'Mã OTP đã hết hạn',
      'auth/too-many-requests': 'Quá nhiều yêu cầu, vui lòng thử lại sau',
      'auth/network-request-failed': 'Lỗi kết nối mạng'
    };

    return errorMessages[errorCode] || 'Có lỗi xảy ra, vui lòng thử lại';
  }

  // Định dạng số điện thoại Việt Nam
  formatPhoneNumber(phone) {
    // Loại bỏ tất cả ký tự không phải số
    const cleaned = phone.replace(/\D/g, '');
    
    // Nếu bắt đầu bằng 84, thêm +
    if (cleaned.startsWith('84')) {
      return `+${cleaned}`;
    }
    
    // Nếu bắt đầu bằng 0, thay thế bằng +84
    if (cleaned.startsWith('0')) {
      return `+84${cleaned.substring(1)}`;
    }
    
    // Nếu không có mã quốc gia, thêm +84
    if (cleaned.length === 9) {
      return `+84${cleaned}`;
    }
    
    return `+84${cleaned}`;
  }

  // Kiểm tra số điện thoại Việt Nam hợp lệ
  isValidVietnamesePhone(phone) {
    const cleaned = phone.replace(/\D/g, '');
    
    // Các đầu số di động Việt Nam (chỉ những đầu số Firebase hỗ trợ)
    const validPrefixes = [
      '032', '033', '034', '035', '036', '037', '038', '039', // Viettel
      '070', '079', '077', '076', '078', // Mobifone  
      '083', '084', '085', '081', '082', // Vinaphone
      '056', '058', // Vietnamobile
      '059', // Gmobile
      '096', '097', '098', // Viettel mới
      '090', '093', // Mobifone mới
      '091', '094', // Vinaphone mới
      '088', '089', // Vinaphone mới
      '092', '095', '099', // Các mạng khác
      '086', '087', // Vinaphone thêm
      '071', '072', '073', '074', '075', // Mobifone thêm
      '395', '396', '397', '398', '399' // Viettel mới nhất
    ];

    // Kiểm tra độ dài
    if (cleaned.length < 9 || cleaned.length > 12) {
      return false;
    }

    // Nếu bắt đầu bằng 84
    if (cleaned.startsWith('84')) {
      const phoneWithoutCountryCode = cleaned.substring(2);
      return validPrefixes.some(prefix => phoneWithoutCountryCode.startsWith(prefix));
    }

    // Nếu bắt đầu bằng 0
    if (cleaned.startsWith('0')) {
      const phoneWithoutZero = cleaned.substring(1);
      return validPrefixes.some(prefix => phoneWithoutZero.startsWith(prefix));
    }

    // Kiểm tra trực tiếp (số 9 chữ số)
    return validPrefixes.some(prefix => cleaned.startsWith(prefix));
  }

  // Kiểm tra đầu số cũ không được Firebase hỗ trợ
  isDeprecatedPrefix(phone) {
    const cleaned = phone.replace(/\D/g, '');
    const deprecatedPrefixes = ['939', '169', '168', '167', '166', '165', '164', '163', '162', '161'];
    
    let phoneToCheck = cleaned;
    if (cleaned.startsWith('84')) {
      phoneToCheck = cleaned.substring(2);
    } else if (cleaned.startsWith('0')) {
      phoneToCheck = cleaned.substring(1);
    }
    
    return deprecatedPrefixes.some(prefix => phoneToCheck.startsWith(prefix));
  }
}

// Export singleton instance
const phoneAuthService = new PhoneAuthService();
export default phoneAuthService;