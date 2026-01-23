import { auth, db } from '../firebase/config';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import phoneAuthService from './phoneAuthService';
import { getErrorMessage } from '../constants/errorMessages';

class RegistrationService {
  constructor() {
    this.registrationData = {
      phoneNumber: '',
      isPhoneVerified: false,
      personalInfo: null,
      password: ''
    };
  }

  // Bước 1: Gửi OTP
  async sendPhoneOTP(phoneNumber) {
    try {
      const result = await phoneAuthService.sendOTP(phoneNumber);
      if (result.success) {
        this.registrationData.phoneNumber = phoneNumber;
      }
      return result;
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error)
      };
    }
  }

  // Bước 2: Xác thực OTP
  async verifyPhoneOTP(otpCode) {
    try {
      const result = await phoneAuthService.verifyOTP(otpCode);
      if (result.success) {
        this.registrationData.isPhoneVerified = true;
        // Đăng xuất ngay sau khi verify để không tạo user Firebase Auth
        await auth.signOut();
      }
      return result;
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error)
      };
    }
  }

  // Bước 3: Lưu thông tin cá nhân
  savePersonalInfo(personalInfo) {
    if (!this.registrationData.isPhoneVerified) {
      return {
        success: false,
        message: 'Vui lòng xác thực số điện thoại trước'
      };
    }

    this.registrationData.personalInfo = {
      displayName: personalInfo.displayName,
      email: personalInfo.email,
      dateOfBirth: personalInfo.dateOfBirth,
      gender: personalInfo.gender,
      address: personalInfo.address
    };

    return {
      success: true,
      message: 'Thông tin cá nhân đã được lưu'
    };
  }

  // Bước 4: Lưu thông tin địa điểm
  saveLocationInfo(locationInfo) {
    if (!this.registrationData.personalInfo) {
      return {
        success: false,
        message: 'Vui lòng nhập thông tin cá nhân trước'
      };
    }

    this.registrationData.locationInfo = {
      province: locationInfo.province,
      coordinates: locationInfo.coordinates,
      verified: locationInfo.verified,
      verificationDistance: locationInfo.verificationDistance
    };

    return {
      success: true,
      message: 'Thông tin địa điểm đã được lưu'
    };
  }

  // Tạo tài khoản đơn giản chỉ với phone và password
  async createSimpleAccount(password) {
    try {
      if (!this.registrationData.isPhoneVerified) {
        throw new Error('Số điện thoại chưa được xác thực');
      }

      const { phoneNumber } = this.registrationData;
      
      // Tạo email tạm thời từ số điện thoại
      const tempEmail = `${phoneNumber.replace('+84', '0').replace(/\D/g, '')}@nonglac.temp`;
      
      // Tạo tài khoản Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        tempEmail,
        password
      );

      const user = userCredential.user;
      
      // Tạo displayName từ số điện thoại
      const displayName = `Người dùng ${phoneNumber.slice(-4)}`;

      // Cập nhật profile
      await updateProfile(user, {
        displayName: displayName
      });

      // Lưu thông tin user vào Firestore với thông tin tối thiểu
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        phoneNumber: phoneNumber,
        email: tempEmail,
        displayName: displayName,
        // Thông tin sẽ được bổ sung trong nhiệm vụ
        dateOfBirth: null,
        gender: null,
        address: null,
        province: null,
        coordinates: null,
        locationVerified: false,
        profileCompleted: false, // Flag để track nhiệm vụ
        reputation: 0,
        joinDate: new Date(),
        postsCount: 0,
        likesReceived: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Reset registration data
      this.resetRegistrationData();

      return {
        success: true,
        user: user,
        message: 'Tài khoản đã được tạo thành công'
      };

    } catch (error) {
      console.error('Error creating simple account:', error);
      return {
        success: false,
        message: getErrorMessage(error)
      };
    }
  }

  // Bước 4: Tạo tài khoản với mật khẩu (giữ lại cho tương lai)
  async createAccount(password) {
    try {
      if (!this.registrationData.isPhoneVerified) {
        throw new Error('Số điện thoại chưa được xác thực');
      }

      if (!this.registrationData.personalInfo) {
        throw new Error('Thông tin cá nhân chưa được nhập');
      }

      if (!this.registrationData.locationInfo) {
        throw new Error('Thông tin địa điểm chưa được xác thực');
      }

      const { personalInfo, phoneNumber, locationInfo } = this.registrationData;

      // Tạo tài khoản Firebase Auth với email và password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        personalInfo.email,
        password
      );

      const user = userCredential.user;

      // Cập nhật profile
      await updateProfile(user, {
        displayName: personalInfo.displayName
      });

      // Lưu thông tin user vào Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        phoneNumber: phoneNumber,
        email: personalInfo.email,
        displayName: personalInfo.displayName,
        dateOfBirth: personalInfo.dateOfBirth,
        gender: personalInfo.gender,
        address: personalInfo.address,
        province: locationInfo.province,
        coordinates: locationInfo.coordinates,
        locationVerified: locationInfo.verified,
        verificationDistance: locationInfo.verificationDistance,
        profileCompleted: true,
        reputation: 0,
        joinDate: new Date(),
        postsCount: 0,
        likesReceived: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Reset registration data
      this.resetRegistrationData();

      return {
        success: true,
        user: user,
        message: 'Tài khoản đã được tạo thành công'
      };

    } catch (error) {
      console.error('Error creating account:', error);
      return {
        success: false,
        message: getErrorMessage(error)
      };
    }
  }

  // Đăng nhập bằng số điện thoại và mật khẩu
  async signInWithPhone(phoneNumber, password) {
    try {
      // Tìm user theo số điện thoại
      const userDoc = await this.findUserByPhone(phoneNumber);
      
      if (!userDoc) {
        throw new Error('Số điện thoại chưa được đăng ký');
      }

      // Tạo email tạm thời từ số điện thoại
      const tempEmail = `${phoneNumber.replace('+84', '0').replace(/\D/g, '')}@nonglac.temp`;
      
      // Đăng nhập bằng email tạm và password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        tempEmail,
        password
      );

      return {
        success: true,
        user: userCredential.user,
        message: 'Đăng nhập thành công'
      };

    } catch (error) {
      console.error('Error signing in:', error);
      return {
        success: false,
        message: getErrorMessage(error)
      };
    }
  }

  // Tìm user theo số điện thoại
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
          return querySnapshot.docs[0].data();
        }
      }
      
      console.log('No user found with any phone format');
      return null;
    } catch (error) {
      console.error('Error finding user by phone:', error);
      return null;
    }
  }

  // Reset dữ liệu đăng ký
  resetRegistrationData() {
    this.registrationData = {
      phoneNumber: '',
      isPhoneVerified: false,
      personalInfo: null,
      locationInfo: null,
      password: ''
    };
    phoneAuthService.cleanup();
  }

  // Lấy trạng thái đăng ký hiện tại
  getRegistrationStatus() {
    return {
      phoneNumber: this.registrationData.phoneNumber,
      isPhoneVerified: this.registrationData.isPhoneVerified,
      hasPersonalInfo: !!this.registrationData.personalInfo,
      currentStep: this.getCurrentStep()
    };
  }

  getCurrentStep() {
    if (!this.registrationData.phoneNumber) return 1; // Nhập số điện thoại
    if (!this.registrationData.isPhoneVerified) return 2; // Xác thực OTP
    if (!this.registrationData.personalInfo) return 3; // Thông tin cá nhân
    if (!this.registrationData.locationInfo) return 4; // Xác thực địa điểm
    return 5; // Tạo mật khẩu
  }

}

const registrationService = new RegistrationService();
export default registrationService;