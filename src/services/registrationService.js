import { auth, db } from '../firebase/config';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import phoneAuthService from './phoneAuthService';
import { getErrorMessage } from '../constants/errorMessages';

class RegistrationService {
  constructor() {
    this.registrationData = {
      phoneNumber: '',
      isPhoneVerified: false,
      personalInfo: null,
      locationInfo: null,
      password: ''
    };
  }

  // BÃ†Â°Ã¡Â»â€ºc 1: LÃ†Â°u sÃ¡Â»â€˜ Ã„â€˜iÃ¡Â»â€¡n thoÃ¡ÂºÂ¡i (tÃ¡ÂºÂ¡m thÃ¡Â»Âi bÃ¡Â»Â qua OTP)
  async sendPhoneOTP(phoneNumber) {
    try {
      // TÃ¡ÂºÂ¡m thÃ¡Â»Âi bÃ¡Â»Â qua viÃ¡Â»â€¡c gÃ¡Â»Â­i OTP thÃ¡Â»Â±c tÃ¡ÂºÂ¿
      this.registrationData.phoneNumber = phoneNumber;
      this.registrationData.isPhoneVerified = true; // GiÃ¡ÂºÂ£ lÃ¡ÂºÂ­p Ã„â€˜ÃƒÂ£ verify Ã„â€˜Ã¡Â»Æ’ qua bÃ†Â°Ã¡Â»â€ºc tiÃ¡ÂºÂ¿p theo
      
      return {
        success: true,
        message: 'SÃ¡Â»â€˜ Ã„â€˜iÃ¡Â»â€¡n thoÃ¡ÂºÂ¡i hÃ¡Â»Â£p lÃ¡Â»â€¡'
      };
    } catch (error) {
      return {
        success: false,
        message: getErrorMessage(error)
      };
    }
  }

  // BÃ†Â°Ã¡Â»â€ºc 2: XÃƒÂ¡c thÃ¡Â»Â±c OTP
  async verifyPhoneOTP(otpCode) {
    try {
      const result = await phoneAuthService.verifyOTP(otpCode);
      if (result.success) {
        this.registrationData.isPhoneVerified = true;
        // Ã„ÂÃ„Æ’ng xuÃ¡ÂºÂ¥t ngay sau khi verify Ã„â€˜Ã¡Â»Æ’ khÃƒÂ´ng tÃ¡ÂºÂ¡o user Firebase Auth
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

  // BÃ†Â°Ã¡Â»â€ºc 3: LÃ†Â°u thÃƒÂ´ng tin cÃƒÂ¡ nhÃƒÂ¢n
  savePersonalInfo(personalInfo) {
    if (!this.registrationData.isPhoneVerified) {
      return {
        success: false,
        message: 'Vui lÃ²ng xÃ¡c thá»±c sá»‘ Ä‘iá»‡n thoáº¡i trÆ°á»›c'
      };
    }

    if (!personalInfo?.displayName || !personalInfo?.gender || !personalInfo?.age) {
      return {
        success: false,
        message: 'Vui lÃ²ng nháº­p Ä‘áº§y Ä‘á»§ tÃªn ngÆ°á»i dÃ¹ng, giá»›i tÃ­nh vÃ  tuá»•i'
      };
    }

    this.registrationData.personalInfo = {
      displayName: String(personalInfo.displayName).trim(),
      gender: personalInfo.gender,
      age: Number(personalInfo.age)
    };

    return {
      success: true,
      message: 'ThÃ´ng tin cÆ¡ báº£n Ä‘Ã£ Ä‘Æ°á»£c lÆ°u'
    };
  }

  // BÆ°á»›c 4: LÆ°u thÃ´ng tin Ä‘á»‹a Ä‘iá»ƒm
  saveLocationInfo(locationInfo) {
    if (!this.registrationData.personalInfo) {
      return {
        success: false,
        message: 'Vui lÃƒÂ²ng nhÃ¡ÂºÂ­p thÃƒÂ´ng tin cÃƒÂ¡ nhÃƒÂ¢n trÃ†Â°Ã¡Â»â€ºc'
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
      message: 'ThÃƒÂ´ng tin Ã„â€˜Ã¡Â»â€¹a Ã„â€˜iÃ¡Â»Æ’m Ã„â€˜ÃƒÂ£ Ã„â€˜Ã†Â°Ã¡Â»Â£c lÃ†Â°u'
    };
  }

  // GÃ¡Â»Â­i thÃƒÂ´ng bÃƒÂ¡o cho Admin khi cÃƒÂ³ user mÃ¡Â»â€ºi
  async notifyAdminNewRegistration(userData) {
    try {
      // LÃ†Â°u thÃƒÂ´ng bÃƒÂ¡o vÃƒÂ o collection admin_notifications
      await addDoc(collection(db, 'admin_notifications'), {
        type: 'NEW_REGISTRATION',
        userId: userData.uid,
        userName: userData.displayName,
        phoneNumber: userData.phoneNumber,
        timestamp: new Date(),
        status: 'unread',
        message: `NgÃ†Â°Ã¡Â»Âi dÃƒÂ¹ng mÃ¡Â»â€ºi Ã„â€˜Ã„Æ’ng kÃƒÂ½: ${userData.displayName} (${userData.phoneNumber})`
      });
      
      return true;
    } catch (error) {
      console.error('Error notifying admin:', error);
      return false;
    }
  }

  // TÃ¡ÂºÂ¡o tÃƒÂ i khoÃ¡ÂºÂ£n Ã„â€˜Ã†Â¡n giÃ¡ÂºÂ£n chÃ¡Â»â€° vÃ¡Â»â€ºi phone vÃƒÂ  password
  async createSimpleAccount(password) {
    try {
      // Ã„ÂÃƒÂ£ bÃ¡Â»Â xÃƒÂ¡c thÃ¡Â»Â±c OTP nÃƒÂªn khÃƒÂ´ng cÃ¡ÂºÂ§n check isPhoneVerified chÃ¡ÂºÂ·t chÃ¡ÂºÂ½
      const { phoneNumber, personalInfo } = this.registrationData;
      if (!phoneNumber) throw new Error('Vui lÃ²ng nháº­p sá»‘ Ä‘iá»‡n thoáº¡i');
      if (!personalInfo?.displayName || !personalInfo?.gender || !personalInfo?.age) {
        throw new Error('Vui lÃ²ng nháº­p Ä‘áº§y Ä‘á»§ thÃ´ng tin cÆ¡ báº£n trÆ°á»›c khi táº¡o máº­t kháº©u');
      }
      
      // TÃ¡ÂºÂ¡o email tÃ¡ÂºÂ¡m thÃ¡Â»Âi tÃ¡Â»Â« sÃ¡Â»â€˜ Ã„â€˜iÃ¡Â»â€¡n thoÃ¡ÂºÂ¡i
      const tempEmail = `${phoneNumber.replace('+84', '0').replace(/\D/g, '')}@nonglac.temp`;
      
      // TÃ¡ÂºÂ¡o tÃƒÂ i khoÃ¡ÂºÂ£n Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        tempEmail,
        password
      );

      const user = userCredential.user;
      
      // TÃ¡ÂºÂ¡o displayName tÃ¡Â»Â« sÃ¡Â»â€˜ Ã„â€˜iÃ¡Â»â€¡n thoÃ¡ÂºÂ¡i
      const displayName = personalInfo.displayName;

      // CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t profile
      await updateProfile(user, {
        displayName: displayName
      });

      // LÃ†Â°u thÃƒÂ´ng tin user vÃƒÂ o Firestore vÃ¡Â»â€ºi thÃƒÂ´ng tin tÃ¡Â»â€˜i thiÃ¡Â»Æ’u
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        phoneNumber: phoneNumber,
        email: tempEmail,
        displayName: displayName,
        // ThÃƒÂ´ng tin sÃ¡ÂºÂ½ Ã„â€˜Ã†Â°Ã¡Â»Â£c bÃ¡Â»â€¢ sung trong nhiÃ¡Â»â€¡m vÃ¡Â»Â¥
        dateOfBirth: null,
        gender: personalInfo.gender,
        age: personalInfo.age,
        address: null,
        province: null,
        coordinates: null,
        locationVerified: false,
        profileCompleted: false, // Flag Ã„â€˜Ã¡Â»Æ’ track nhiÃ¡Â»â€¡m vÃ¡Â»Â¥
        reputation: 0,
        joinDate: new Date(),
        postsCount: 0,
        likesReceived: 0,
        isActive: true,
        verificationStatus: 'pending', // TÃƒÂ i khoÃ¡ÂºÂ£n Ã„â€˜ang chÃ¡Â»Â xÃƒÂ¡c thÃ¡Â»Â±c
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // ThÃƒÂ´ng bÃƒÂ¡o cho admin
      await this.notifyAdminNewRegistration({
        uid: user.uid,
        displayName: displayName,
        phoneNumber: phoneNumber
      });

      // Reset registration data
      this.resetRegistrationData();

      return {
        success: true,
        user: user,
        message: 'Ã„ÂÃ„Æ’ng kÃƒÂ½ thÃƒÂ nh cÃƒÂ´ng. TÃƒÂ i khoÃ¡ÂºÂ£n Ã„â€˜ang chÃ¡Â»Â xÃƒÂ¡c thÃ¡Â»Â±c bÃ¡Â»Å¸i Admin.'
      };

    } catch (error) {
      console.error('Error creating simple account:', error);
      return {
        success: false,
        message: getErrorMessage(error)
      };
    }
  }

  // BÃ†Â°Ã¡Â»â€ºc 4: TÃ¡ÂºÂ¡o tÃƒÂ i khoÃ¡ÂºÂ£n vÃ¡Â»â€ºi mÃ¡ÂºÂ­t khÃ¡ÂºÂ©u (giÃ¡Â»Â¯ lÃ¡ÂºÂ¡i cho tÃ†Â°Ã†Â¡ng lai)
  async createAccount(password) {
    try {
      if (!this.registrationData.isPhoneVerified) {
        throw new Error('SÃ¡Â»â€˜ Ã„â€˜iÃ¡Â»â€¡n thoÃ¡ÂºÂ¡i chÃ†Â°a Ã„â€˜Ã†Â°Ã¡Â»Â£c xÃƒÂ¡c thÃ¡Â»Â±c');
      }

      if (!this.registrationData.personalInfo) {
        throw new Error('ThÃƒÂ´ng tin cÃƒÂ¡ nhÃƒÂ¢n chÃ†Â°a Ã„â€˜Ã†Â°Ã¡Â»Â£c nhÃ¡ÂºÂ­p');
      }

      if (!this.registrationData.locationInfo) {
        throw new Error('ThÃƒÂ´ng tin Ã„â€˜Ã¡Â»â€¹a Ã„â€˜iÃ¡Â»Æ’m chÃ†Â°a Ã„â€˜Ã†Â°Ã¡Â»Â£c xÃƒÂ¡c thÃ¡Â»Â±c');
      }

      const { personalInfo, phoneNumber, locationInfo } = this.registrationData;

      // TÃ¡ÂºÂ¡o tÃƒÂ i khoÃ¡ÂºÂ£n Firebase Auth vÃ¡Â»â€ºi email vÃƒÂ  password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        personalInfo.email,
        password
      );

      const user = userCredential.user;

      // CÃ¡ÂºÂ­p nhÃ¡ÂºÂ­t profile
      await updateProfile(user, {
        displayName: personalInfo.displayName
      });

      // LÃ†Â°u thÃƒÂ´ng tin user vÃƒÂ o Firestore
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
        verificationStatus: 'pending', // TÃƒÂ i khoÃ¡ÂºÂ£n Ã„â€˜ang chÃ¡Â»Â xÃƒÂ¡c thÃ¡Â»Â±c
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // ThÃƒÂ´ng bÃƒÂ¡o cho admin
      await this.notifyAdminNewRegistration({
        uid: user.uid,
        displayName: personalInfo.displayName,
        phoneNumber: phoneNumber
      });

      // Reset registration data
      this.resetRegistrationData();

      return {
        success: true,
        user: user,
        message: 'Ã„ÂÃ„Æ’ng kÃƒÂ½ thÃƒÂ nh cÃƒÂ´ng. TÃƒÂ i khoÃ¡ÂºÂ£n Ã„â€˜ang chÃ¡Â»Â xÃƒÂ¡c thÃ¡Â»Â±c bÃ¡Â»Å¸i Admin.'
      };

    } catch (error) {
      console.error('Error creating account:', error);
      return {
        success: false,
        message: getErrorMessage(error)
      };
    }
  }

  // Ã„ÂÃ„Æ’ng nhÃ¡ÂºÂ­p bÃ¡ÂºÂ±ng sÃ¡Â»â€˜ Ã„â€˜iÃ¡Â»â€¡n thoÃ¡ÂºÂ¡i vÃƒÂ  mÃ¡ÂºÂ­t khÃ¡ÂºÂ©u
  async signInWithPhone(phoneNumber, password) {
    try {
      // TÃƒÂ¬m user theo sÃ¡Â»â€˜ Ã„â€˜iÃ¡Â»â€¡n thoÃ¡ÂºÂ¡i
      const userDoc = await this.findUserByPhone(phoneNumber);
      
      if (!userDoc) {
        throw new Error('SÃ¡Â»â€˜ Ã„â€˜iÃ¡Â»â€¡n thoÃ¡ÂºÂ¡i chÃ†Â°a Ã„â€˜Ã†Â°Ã¡Â»Â£c Ã„â€˜Ã„Æ’ng kÃƒÂ½');
      }

      // TÃ¡ÂºÂ¡o email tÃ¡ÂºÂ¡m thÃ¡Â»Âi tÃ¡Â»Â« sÃ¡Â»â€˜ Ã„â€˜iÃ¡Â»â€¡n thoÃ¡ÂºÂ¡i
      const tempEmail = `${phoneNumber.replace('+84', '0').replace(/\D/g, '')}@nonglac.temp`;
      
      // Ã„ÂÃ„Æ’ng nhÃ¡ÂºÂ­p bÃ¡ÂºÂ±ng email tÃ¡ÂºÂ¡m vÃƒÂ  password
      const userCredential = await signInWithEmailAndPassword(
        auth,
        tempEmail,
        password
      );

      return {
        success: true,
        user: userCredential.user,
        message: 'Ã„ÂÃ„Æ’ng nhÃ¡ÂºÂ­p thÃƒÂ nh cÃƒÂ´ng'
      };

    } catch (error) {
      console.error('Error signing in:', error);
      return {
        success: false,
        message: getErrorMessage(error)
      };
    }
  }

  // TÃƒÂ¬m user theo sÃ¡Â»â€˜ Ã„â€˜iÃ¡Â»â€¡n thoÃ¡ÂºÂ¡i
  async findUserByPhone(phoneNumber) {
    try {
      // ThÃ¡Â»Â­ nhiÃ¡Â»Âu format khÃƒÂ¡c nhau
      const phoneFormats = [
        phoneAuthService.formatPhoneNumber(phoneNumber), // +84395752407
        phoneNumber, // 0395752407 (input gÃ¡Â»â€˜c)
        phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber, // 395752407
        phoneNumber.startsWith('+84') ? '0' + phoneNumber.substring(3) : phoneNumber // 0395752407 tÃ¡Â»Â« +84
      ];
      
      console.log('Searching for phone formats:', phoneFormats);
      
      const usersRef = collection(db, 'users');
      
      // ThÃ¡Â»Â­ tÃƒÂ¬m vÃ¡Â»â€ºi tÃ¡Â»Â«ng format
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

  // Reset dÃ¡Â»Â¯ liÃ¡Â»â€¡u Ã„â€˜Ã„Æ’ng kÃƒÂ½
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

  // LÃ¡ÂºÂ¥y trÃ¡ÂºÂ¡ng thÃƒÂ¡i Ã„â€˜Ã„Æ’ng kÃƒÂ½ hiÃ¡Â»â€¡n tÃ¡ÂºÂ¡i
  getRegistrationStatus() {
    return {
      phoneNumber: this.registrationData.phoneNumber,
      isPhoneVerified: this.registrationData.isPhoneVerified,
      hasPersonalInfo: !!this.registrationData.personalInfo,
      currentStep: this.getCurrentStep()
    };
  }

  getCurrentStep() {
    if (!this.registrationData.phoneNumber) return 1; // NhÃ¡ÂºÂ­p sÃ¡Â»â€˜ Ã„â€˜iÃ¡Â»â€¡n thoÃ¡ÂºÂ¡i
    if (!this.registrationData.isPhoneVerified) return 2; // XÃƒÂ¡c thÃ¡Â»Â±c OTP
    if (!this.registrationData.personalInfo) return 3; // ThÃƒÂ´ng tin cÃƒÂ¡ nhÃƒÂ¢n
    if (!this.registrationData.locationInfo) return 4; // XÃƒÂ¡c thÃ¡Â»Â±c Ã„â€˜Ã¡Â»â€¹a Ã„â€˜iÃ¡Â»Æ’m
    return 5; // TÃ¡ÂºÂ¡o mÃ¡ÂºÂ­t khÃ¡ÂºÂ©u
  }

}

const registrationService = new RegistrationService();
export default registrationService;
