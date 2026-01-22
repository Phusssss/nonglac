import { auth, db } from '../firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import phoneAuthService from './phoneAuthService';

class ForgotPasswordService {
  constructor() {
    this.resetData = {
      phoneNumber: '',
      isPhoneVerified: false,
      userEmail: ''
    };
  }

  // Bước 1: Tìm user theo số điện thoại
  async findUserByPhone(phoneNumber) {
    try {
      // Thử nhiều format khác nhau
      const phoneFormats = [
        phoneAuthService.formatPhoneNumber(phoneNumber), // +84395752407
        phoneNumber, // 0395752407 (input gốc)
        phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber, // 395752407
        phoneNumber.startsWith('+84') ? '0' + phoneNumber.substring(3) : phoneNumber // 0395752407 từ +84
      ];
      
      console.log('Searching for phone formats:', phoneFormats);
      
      const usersRef = collection(db, 'users');
      
      // Thử tìm với từng format
      for (const format of phoneFormats) {
        const q = query(usersRef, where('phoneNumber', '==', format));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          console.log('Found user with phone format:', format);
          const userData = querySnapshot.docs[0].data();
          return {
            success: true,
            user: userData,
            message: 'Tìm thấy tài khoản'
          };
        }
      }
      
      console.log('No user found with any phone format');
      return {
        success: false,
        message: 'Không tìm thấy tài khoản với số điện thoại này'
      };
    } catch (error) {
      console.error('Error finding user by phone:', error);
      return {
        success: false,
        message: 'Có lỗi xảy ra khi tìm kiếm tài khoản'
      };
    }
  }

  // Bước 2: Gửi OTP để xác thực số điện thoại
  async sendPhoneOTP(phoneNumber) {
    try {
      // Tìm user trước
      const userResult = await this.findUserByPhone(phoneNumber);
      if (!userResult.success) {
        return userResult;
      }

      // Lưu thông tin user
      this.resetData.phoneNumber = phoneNumber;
      this.resetData.userEmail = userResult.user.email;

      // Gửi OTP
      const result = await phoneAuthService.sendOTP(phoneNumber);
      return result;
    } catch (error) {
      console.error('Error sending OTP:', error);
      return {
        success: false,
        message: 'Lỗi gửi OTP: ' + error.message
      };
    }
  }

  // Bước 3: Xác thực OTP
  async verifyPhoneOTP(otpCode) {
    try {
      const result = await phoneAuthService.verifyOTP(otpCode);
      if (result.success) {
        this.resetData.isPhoneVerified = true;
        // Đăng xuất ngay sau khi verify để không ảnh hưởng đến flow reset
        await auth.signOut();
      }
      return result;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      return {
        success: false,
        message: 'Lỗi xác thực OTP: ' + error.message
      };
    }
  }

  // Bước 4: Gửi email reset mật khẩu
  async sendPasswordResetEmail() {
    try {
      if (!this.resetData.isPhoneVerified) {
        return {
          success: false,
          message: 'Vui lòng xác thực số điện thoại trước'
        };
      }

      if (!this.resetData.userEmail) {
        return {
          success: false,
          message: 'Không tìm thấy email của tài khoản'
        };
      }

      // Gửi email reset password
      await sendPasswordResetEmail(auth, this.resetData.userEmail);

      return {
        success: true,
        message: 'Email đặt lại mật khẩu đã được gửi. Vui lòng kiểm tra hộp thư của bạn.'
      };

    } catch (error) {
      console.error('Error sending password reset email:', error);
      return {
        success: false,
        message: this.getErrorMessage(error.code) || 'Có lỗi xảy ra khi gửi email'
      };
    }
  }

  // Reset dữ liệu
  resetData() {
    this.resetData = {
      phoneNumber: '',
      isPhoneVerified: false,
      userEmail: ''
    };
    phoneAuthService.cleanup();
  }

  // Lấy trạng thái hiện tại
  getResetStatus() {
    return {
      phoneNumber: this.resetData.phoneNumber,
      isPhoneVerified: this.resetData.isPhoneVerified,
      userEmail: this.resetData.userEmail,
      currentStep: this.getCurrentStep()
    };
  }

  getCurrentStep() {
    if (!this.resetData.phoneNumber) return 1; // Nhập số điện thoại
    if (!this.resetData.isPhoneVerified) return 2; // Xác thực OTP
    return 3; // Gửi email reset
  }

  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': 'Không tìm thấy tài khoản với email này',
      'auth/invalid-email': 'Email không hợp lệ',
      'auth/too-many-requests': 'Quá nhiều yêu cầu, vui lòng thử lại sau',
      'auth/network-request-failed': 'Lỗi kết nối mạng'
    };

    return errorMessages[errorCode] || 'Có lỗi xảy ra, vui lòng thử lại';
  }
}

const forgotPasswordService = new ForgotPasswordService();
export default forgotPasswordService;