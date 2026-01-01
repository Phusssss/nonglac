import { auth, db } from '../firebase/config';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Subscription Tiers System
export const SUBSCRIPTION_TIERS = {
  APPRENTICE: {
    id: 'apprentice',
    name: 'TẬP SỰ',
    subtitle: 'Hạt Giống',
    icon: '🌱',
    price: 0,
    duration: '1 năm',
    status: 'ACTIVE',
    isDefault: true,
    limits: {
      postsPerDay: 10,
      aiQuestionsPerDay: 20,
      voiceCallsPerDay: 5,
      imageAnalysisPerDay: 10,
      marketplaceBoosts: 0
    },
    features: [
      'Đăng tin bán: 10 tin/ngày',
      'AI Trợ lý Lạc Lạc: 20 câu hỏi/ngày',
      'Live voice call với AI',
      'Chẩn đoán bệnh bằng camera',
      'Phí giao dịch tiêu chuẩn'
    ]
  },
  FARMER: {
    id: 'farmer',
    name: 'NHÀ NÔNG',
    subtitle: 'Mầm Xanh',
    icon: '🌿',
    price: 99000,
    duration: '1 tháng',
    status: 'LOCKED',
    limits: {
      postsPerDay: 50,
      aiQuestionsPerDay: 100,
      voiceCallsPerDay: 20,
      imageAnalysisPerDay: 50,
      marketplaceBoosts: 4
    },
    features: [
      'Đăng tin bán: 50 tin/ngày',
      'AI Trợ lý Lạc Lạc: 100 câu hỏi/ngày',
      'Phản hồi AI nhanh hơn',
      'Đẩy tin: 1 lần/tuần',
      'Ưu tiên hỗ trợ'
    ]
  },
  EXPERT: {
    id: 'expert',
    name: 'CHUYÊN GIA',
    subtitle: 'Cây Cổ Thụ',
    icon: '💎',
    price: 149000,
    duration: '1 tháng',
    status: 'LOCKED',
    limits: {
      postsPerDay: -1, // Unlimited
      aiQuestionsPerDay: -1, // Unlimited
      voiceCallsPerDay: -1, // Unlimited
      imageAnalysisPerDay: -1, // Unlimited
      marketplaceBoosts: -1 // Unlimited
    },
    features: [
      'Đăng tin bán: Không giới hạn',
      'AI Trợ lý Lạc Lạc: Không giới hạn',
      'Model AI cao cấp',
      'Vị trí ưu tiên tìm kiếm',
      'Hỗ trợ VIP 24/7'
    ]
  }
};

class SubscriptionService {
  constructor() {
    this.storageKey = 'nonglac_user_subscription';
  }

  // Get user's current subscription
  async getUserSubscription(userId) {
    if (!userId) {
      const user = auth.currentUser;
      if (!user) return null;
      userId = user.uid;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        
        // Nếu chưa có subscription fields, tạo mặc định
        if (!data.subscription) {
          await this.createDefaultSubscription(userId);
          return await this.getUserSubscription(userId);
        }
        
        const subscription = {
          userId,
          tierId: data.subscription.tierId || 'apprentice',
          tier: SUBSCRIPTION_TIERS[data.subscription.tierId] || SUBSCRIPTION_TIERS.APPRENTICE,
          startDate: data.subscription.startDate?.toDate() || new Date(),
          endDate: data.subscription.endDate?.toDate() || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          isActive: data.subscription.isActive !== false,
          quota: data.quota || this.getDefaultQuota()
        };
        
        return subscription;
      } else {
        return await this.createDefaultSubscription(userId);
      }
    } catch (error) {
      console.error('Error getting subscription:', error);
      return await this.createDefaultSubscription(userId);
    }
  }

  // Get default quota
  getDefaultQuota() {
    return {
      aiQuestions: 20,
      doctorAI: 10,
      agriMap: 10,
      marketInsights: 10,
      posts: 10,
      lastReset: new Date().toISOString().split('T')[0]
    };
  }

  // Create default subscription (Apprentice)
  async createDefaultSubscription(userId) {
    const defaultData = {
      subscription: {
        tierId: 'apprentice',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        isActive: true
      },
      quota: this.getDefaultQuota()
    };
    
    try {
      await updateDoc(doc(db, 'users', userId), defaultData);
    } catch (error) {
      console.error('Error creating subscription:', error);
    }
    
    return {
      userId,
      tierId: 'apprentice',
      tier: SUBSCRIPTION_TIERS.APPRENTICE,
      startDate: defaultData.subscription.startDate,
      endDate: defaultData.subscription.endDate,
      isActive: true,
      quota: defaultData.quota
    };
  }



  // Check if subscription is expired
  isExpired(subscription) {
    return new Date() > new Date(subscription.endDate);
  }

  // Check if user can perform action
  async canPerformAction(userId, actionType) {
    const quota = await this.getRemainingQuota(userId);
    if (!quota) return false;

    switch (actionType) {
      case 'askAI':
        return quota.aiQuestions > 0;
      case 'doctorAI':
        return quota.doctorAI > 0;
      case 'agriMap':
        return quota.agriMap > 0;
      case 'marketInsights':
        return quota.marketInsights > 0;
      case 'createPost':
        return quota.posts > 0;
      default:
        return false;
    }
  }



  // Record usage
  async recordUsage(userId, actionType) {
    if (!userId) {
      const user = auth.currentUser;
      if (!user) return null;
      userId = user.uid;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (!userDoc.exists()) return null;
      
      const data = userDoc.data();
      let quota = data.quota || this.getDefaultQuota();
      
      // Reset quota nếu qua ngày mới
      const today = new Date().toISOString().split('T')[0];
      if (quota.lastReset !== today) {
        quota = this.getDefaultQuota();
      }

      switch (actionType) {
        case 'askAI':
          quota.aiQuestions = Math.max(0, quota.aiQuestions - 1);
          break;
        case 'doctorAI':
          quota.doctorAI = Math.max(0, quota.doctorAI - 1);
          break;
        case 'agriMap':
          quota.agriMap = Math.max(0, quota.agriMap - 1);
          break;
        case 'marketInsights':
          quota.marketInsights = Math.max(0, quota.marketInsights - 1);
          break;
        case 'createPost':
          quota.posts = Math.max(0, quota.posts - 1);
          break;
      }

      await updateDoc(doc(db, 'users', userId), { quota });
      return quota;
    } catch (error) {
      console.error('Error recording usage:', error);
      return null;
    }
  }



  // Get remaining quota
  async getRemainingQuota(userId) {
    if (!userId) {
      const user = auth.currentUser;
      if (!user) return this.getDefaultQuota();
      userId = user.uid;
    }

    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        
        if (!data.quota) {
          await this.createDefaultSubscription(userId);
          return this.getDefaultQuota();
        }
        
        // Reset quota nếu qua ngày mới
        const today = new Date().toISOString().split('T')[0];
        if (data.quota.lastReset !== today) {
          const newQuota = this.getDefaultQuota();
          await updateDoc(doc(db, 'users', userId), { quota: newQuota });
          return newQuota;
        }
        
        return data.quota;
      } else {
        return this.getDefaultQuota();
      }
    } catch (error) {
      console.error('Error getting quota:', error);
      return this.getDefaultQuota();
    }
  }

  // Get all tiers for display
  getAllTiers() {
    return Object.values(SUBSCRIPTION_TIERS);
  }

  // Reset quota for all apprentice users (Admin function)
  async resetApprenticeQuotas() {
    try {
      const { collection, getDocs, query, where } = await import('firebase/firestore');
      
      const usersQuery = query(
        collection(db, 'users'),
        where('subscription.tierId', '==', 'apprentice')
      );
      
      const snapshot = await getDocs(usersQuery);
      const resetPromises = [];
      
      snapshot.forEach((docSnap) => {
        const resetPromise = updateDoc(docSnap.ref, {
          quota: this.getDefaultQuota()
        });
        resetPromises.push(resetPromise);
      });
      
      await Promise.all(resetPromises);
      return { success: true, count: snapshot.size };
    } catch (error) {
      console.error('Error resetting apprentice quotas:', error);
      return { success: false, error: error.message };
    }
  }
}

const subscriptionService = new SubscriptionService();
export default subscriptionService;