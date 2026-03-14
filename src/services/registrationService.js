import { auth, db } from '../firebase/config';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import phoneAuthService from './phoneAuthService';
import { getErrorMessage } from '../constants/errorMessages';

class RegistrationService {
  constructor() {
    this.registrationData = {
      phoneNumber: '',
      isPhoneVerified: false,
      personalInfo: null,
      locationInfo: null,
      studentInfo: null,
      referralCode: null,
      password: ''
    };
  }

  // Bước 1: Lưu số điện thoại (tạm thời bỏ qua OTP)
  async sendPhoneOTP(phoneNumber) {
    try {
      this.registrationData.phoneNumber = phoneNumber;
      this.registrationData.isPhoneVerified = true; // Giả lập đã verify cho luồng hiện tại

      return {
        success: true,
        message: 'Số điện thoại hợp lệ'
      };
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
        // Đăng xuất ngay sau khi verify để không giữ user Auth tạm
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

    if (!personalInfo?.displayName || !personalInfo?.gender || !personalInfo?.age) {
      return {
        success: false,
        message: 'Vui lòng nhập đầy đủ tên người dùng, giới tính và tuổi'
      };
    }

    this.registrationData.personalInfo = {
      displayName: String(personalInfo.displayName).trim(),
      gender: personalInfo.gender,
      age: Number(personalInfo.age)
    };

    return {
      success: true,
      message: 'Thông tin cơ bản đã được lưu'
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

  // Lưu thông tin sinh viên
  saveStudentInfo(studentInfo) {
    if (!this.registrationData.personalInfo) {
      return {
        success: false,
        message: 'Vui lòng nhập thông tin cá nhân trước'
      };
    }

    if (!studentInfo?.studentId || !studentInfo?.university) {
      return {
        success: false,
        message: 'Vui lòng nhập đầy đủ mã sinh viên và trường học'
      };
    }

    this.registrationData.studentInfo = {
      studentId: String(studentInfo.studentId).trim(),
      university: String(studentInfo.university).trim(),
      studentType: 'student'
    };

    return {
      success: true,
      message: 'Thông tin sinh viên đã được lưu'
    };
  }

  // Lưu mã giới thiệu
  saveReferralCode(referralCode) {
    if (!this.registrationData.personalInfo) {
      return {
        success: false,
        message: 'Vui lòng nhập thông tin cá nhân trước'
      };
    }

    // Mã giới thiệu là tùy chọn
    if (referralCode) {
      // Chỉ kiểm tra xem mã có tồn tại trong database không
      // Không kiểm tra định dạng nữa
      this.registrationData.referralCode = referralCode;
    } else {
      this.registrationData.referralCode = null;
    }

    return {
      success: true,
      message: 'Mã giới thiệu đã được lưu'
    };
  }

  // Gửi thông báo cho Admin khi có user mới
  async notifyAdminNewRegistration(userData) {
    try {
      await addDoc(collection(db, 'admin_notifications'), {
        type: 'NEW_REGISTRATION',
        userId: userData.uid,
        userName: userData.displayName,
        phoneNumber: userData.phoneNumber,
        timestamp: new Date(),
        status: 'unread',
        message: `Người dùng mới đăng ký: ${userData.displayName} (${userData.phoneNumber})`
      });

      return true;
    } catch (error) {
      console.error('Error notifying admin:', error);
      return false;
    }
  }

  // Tạo tài khoản đơn giản với phone + password
  async createSimpleAccount(password) {
    try {
      const { phoneNumber, personalInfo, studentInfo, referralCode } = this.registrationData;

      if (!phoneNumber) {
        throw new Error('Vui lòng nhập số điện thoại');
      }

      if (!personalInfo?.displayName || !personalInfo?.gender || !personalInfo?.age) {
        throw new Error('Vui lòng nhập đầy đủ thông tin cơ bản trước khi tạo mật khẩu');
      }

      // Tạo email tạm từ số điện thoại
      const tempEmail = `${phoneNumber.replace('+84', '0').replace(/\D/g, '')}@nonglac.temp`;

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        tempEmail,
        password
      );

      const user = userCredential.user;
      const displayName = personalInfo.displayName;

      await updateProfile(user, { displayName });

      const userData = {
        uid: user.uid,
        phoneNumber,
        email: tempEmail,
        displayName,
        // Thông tin sẽ được bổ sung dần trong các nhiệm vụ
        dateOfBirth: null,
        gender: personalInfo.gender,
        age: personalInfo.age,
        address: null,
        province: null,
        coordinates: null,
        locationVerified: false,
        profileCompleted: false,
        reputation: 0,
        joinDate: new Date(),
        postsCount: 0,
        likesReceived: 0,
        isActive: true,
        verificationStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Thêm thông tin sinh viên nếu có
      if (studentInfo) {
        userData.studentId = studentInfo.studentId;
        userData.university = studentInfo.university;
        userData.userType = 'student';
      }

      // Thêm mã giới thiệu nếu có
      if (referralCode) {
        userData.referredBy = referralCode;
      }

      await setDoc(doc(db, 'users', user.uid), userData);

      await this.notifyAdminNewRegistration({
        uid: user.uid,
        displayName,
        phoneNumber
      });

      this.resetRegistrationData();

      return {
        success: true,
        user,
        message: 'Đăng ký thành công. Tài khoản đang chờ xác thực bởi Admin.'
      };
    } catch (error) {
      console.error('Error creating simple account:', error);
      return {
        success: false,
        message: getErrorMessage(error)
      };
    }
  }

  // Bước 4 (luồng đầy đủ): Tạo tài khoản với email + mật khẩu
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

      const { personalInfo, phoneNumber, locationInfo, referralCode } = this.registrationData;

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        personalInfo.email,
        password
      );

      const user = userCredential.user;

      await updateProfile(user, {
        displayName: personalInfo.displayName
      });

      const userData = {
        uid: user.uid,
        phoneNumber,
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
        verificationStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Thêm referredBy nếu có mã giới thiệu
      if (referralCode) {
        userData.referredBy = referralCode;
      }

      await setDoc(doc(db, 'users', user.uid), userData);

      await this.notifyAdminNewRegistration({
        uid: user.uid,
        displayName: personalInfo.displayName,
        phoneNumber
      });

      this.resetRegistrationData();

      return {
        success: true,
        user,
        message: 'Đăng ký thành công. Tài khoản đang chờ xác thực bởi Admin.'
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
      const userDoc = await this.findUserByPhone(phoneNumber);

      if (!userDoc) {
        throw new Error('Số điện thoại chưa được đăng ký');
      }

      const tempEmail = `${phoneNumber.replace('+84', '0').replace(/\D/g, '')}@nonglac.temp`;

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

  // Tìm user theo số điện thoại (thử nhiều format)
  async findUserByPhone(phoneNumber) {
    try {
      const phoneFormats = [
        phoneAuthService.formatPhoneNumber(phoneNumber), // +84395752407
        phoneNumber, // 0395752407
        phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber, // 395752407
        phoneNumber.startsWith('+84') ? `0${phoneNumber.substring(3)}` : phoneNumber // 0395752407
      ];

      console.log('Searching for phone formats:', phoneFormats);

      const usersRef = collection(db, 'users');

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

  // Tìm user theo referral code
  async findUserByReferralCode(referralCode) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referralCode', '==', referralCode));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        return {
          uid: querySnapshot.docs[0].id,
          ...userData
        };
      }

      return null;
    } catch (error) {
      console.error('Error finding user by referral code:', error);
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
      studentInfo: null,
      referralCode: null,
      password: ''
    };
    phoneAuthService.cleanup();
  }

  // Trạng thái đăng ký hiện tại
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
    if (!this.registrationData.locationInfo) return 4; // Thông tin địa điểm
    return 5; // Tạo mật khẩu
  }
}

const registrationService = new RegistrationService();
export default registrationService;
