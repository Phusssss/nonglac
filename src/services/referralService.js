import { db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

class ReferralService {
  /**
   * Tạo mã giới thiệu duy nhất cho sinh viên
   * Format: STUDENT_[FIRST_3_CHARS_OF_NAME]_[RANDOM_6_CHARS]
   */
  generateReferralCode(displayName) {
    const namePrefix = displayName
      .substring(0, 3)
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
    
    const randomChars = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    
    return `STU_${namePrefix}_${randomChars}`;
  }

  /**
   * Lấy hoặc tạo mã giới thiệu cho sinh viên
   */
  async getOrCreateReferralCode(userId, displayName) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists() && userDoc.data().referralCode) {
        return {
          success: true,
          referralCode: userDoc.data().referralCode
        };
      }

      // Tạo mã giới thiệu mới
      const referralCode = this.generateReferralCode(displayName);

      // Kiểm tra xem mã này đã tồn tại chưa
      const existingRef = await this.checkReferralCodeExists(referralCode);
      if (existingRef) {
        // Nếu tồn tại, tạo mã mới
        return this.getOrCreateReferralCode(userId, displayName);
      }

      // Lưu mã giới thiệu
      await updateDoc(userRef, {
        referralCode: referralCode,
        referralStats: {
          totalReferred: 0,
          successfulReferred: 0,
          totalEarnings: 0,
          createdAt: new Date()
        }
      });

      return {
        success: true,
        referralCode: referralCode
      };
    } catch (error) {
      console.error('Error creating referral code:', error);
      return {
        success: false,
        message: 'Không thể tạo mã giới thiệu'
      };
    }
  }

  /**
   * Kiểm tra xem mã giới thiệu đã tồn tại chưa
   */
  async checkReferralCodeExists(referralCode) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referralCode', '==', referralCode));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking referral code:', error);
      return false;
    }
  }

  /**
   * Lấy thông tin mã giới thiệu của người dùng
   */
  async getReferralInfo(userId) {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return {
          success: false,
          message: 'Người dùng không tồn tại'
        };
      }

      const userData = userDoc.data();
      return {
        success: true,
        referralCode: userData.referralCode || null,
        referralStats: userData.referralStats || {
          totalReferred: 0,
          successfulReferred: 0,
          totalEarnings: 0
        }
      };
    } catch (error) {
      console.error('Error getting referral info:', error);
      return {
        success: false,
        message: 'Không thể lấy thông tin giới thiệu'
      };
    }
  }

  /**
   * Tạo link giới thiệu
   */
  generateReferralLink(referralCode) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/register?ref=${referralCode}`;
  }

  /**
   * Copy text vào clipboard
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return { success: true };
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      return { success: false, message: 'Không thể copy' };
    }
  }

  /**
   * Cập nhật thống kê giới thiệu khi có người đăng ký thành công
   */
  async updateReferralStats(referrerUserId, earnAmount = 50000) {
    try {
      const userRef = doc(db, 'users', referrerUserId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return { success: false };
      }

      const currentStats = userDoc.data().referralStats || {
        totalReferred: 0,
        successfulReferred: 0,
        totalEarnings: 0
      };

      await updateDoc(userRef, {
        'referralStats.successfulReferred': currentStats.successfulReferred + 1,
        'referralStats.totalEarnings': currentStats.totalEarnings + earnAmount
      });

      return { success: true };
    } catch (error) {
      console.error('Error updating referral stats:', error);
      return { success: false };
    }
  }

  /**
   * Lấy danh sách tài khoản đã đăng ký qua mã giới thiệu
   */
  async getReferredUsers(referralCode) {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('referralCode', '==', referralCode));
      const querySnapshot = await getDocs(q);

      const referredUsers = [];
      querySnapshot.forEach((doc) => {
        referredUsers.push({
          uid: doc.id,
          ...doc.data()
        });
      });

      return {
        success: true,
        users: referredUsers
      };
    } catch (error) {
      console.error('Error getting referred users:', error);
      return {
        success: false,
        message: 'Không thể lấy danh sách người dùng'
      };
    }
  }
}

export default new ReferralService();
