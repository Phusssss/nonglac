import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Service quản lý điều khoản sử dụng và chính sách bảo mật
 */
export const termsService = {
  // Version hiện tại của điều khoản
  CURRENT_VERSION: '1.0.0',

  /**
   * Lấy IP address của user từ client-side (best effort)
   * Nếu không lấy được, sẽ để trống
   */
  async getClientIpAddress() {
    // Fallback: Thử các public IP APIs
    const apis = [
      { 
        url: 'https://api.ipify.org?format=json', 
        parser: (data) => {
          try {
            if (typeof data === 'string') data = JSON.parse(data);
            return data?.ip || null;
          } catch (e) {
            return null;
          }
        },
        timeout: 4000
      },
      { 
        url: 'https://icanhazip.com/', 
        parser: (data) => {
          if (typeof data === 'string') {
            const ip = data.trim();
            return ip && /^\d+\.\d+\.\d+\.\d+$/.test(ip) ? ip : null;
          }
          return null;
        },
        timeout: 4000
      },
      { 
        url: 'https://api.my-ip.io/ip', 
        parser: (data) => {
          if (typeof data === 'string') {
            const ip = data.trim();
            return ip && /^\d+\.\d+\.\d+\.\d+$/.test(ip) ? ip : null;
          }
          return null;
        },
        timeout: 4000
      },
      { 
        url: 'https://checkip.amazonaws.com/', 
        parser: (data) => {
          if (typeof data === 'string') {
            const ip = data.trim();
            return ip && /^\d+\.\d+\.\d+\.\d+$/.test(ip) ? ip : null;
          }
          return null;
        },
        timeout: 4000
      },
      { 
        url: 'https://ifconfig.me/', 
        parser: (data) => {
          if (typeof data === 'string') {
            const ip = data.trim();
            return ip && /^\d+\.\d+\.\d+\.\d+$/.test(ip) ? ip : null;
          }
          return null;
        },
        timeout: 4000
      },
      { 
        url: 'https://ident.me/', 
        parser: (data) => {
          if (typeof data === 'string') {
            const ip = data.trim();
            return ip && /^\d+\.\d+\.\d+\.\d+$/.test(ip) ? ip : null;
          }
          return null;
        },
        timeout: 4000
      },
      { 
        url: 'https://bot.whatismyipaddress.com/', 
        parser: (data) => {
          if (typeof data === 'string') {
            const ip = data.trim();
            return ip && /^\d+\.\d+\.\d+\.\d+$/.test(ip) ? ip : null;
          }
          return null;
        },
        timeout: 4000
      },
      { 
        url: 'https://api.db-ip.com/v2/free/self', 
        parser: (data) => {
          try {
            if (typeof data === 'string') data = JSON.parse(data);
            return data?.ipAddress || null;
          } catch (e) {
            return null;
          }
        },
        timeout: 4000
      },
      { 
        url: 'https://geolocation-db.com/json/geoip/me.json', 
        parser: (data) => {
          try {
            if (typeof data === 'string') data = JSON.parse(data);
            return data?.IPv4 || null;
          } catch (e) {
            return null;
          }
        },
        timeout: 4000
      },
      { 
        url: 'https://ipapi.co/json/', 
        parser: (data) => {
          try {
            if (typeof data === 'string') data = JSON.parse(data);
            return data?.ip || null;
          } catch (e) {
            return null;
          }
        },
        timeout: 4000
      },
    ];

    for (const api of apis) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), api.timeout);

        const response = await fetch(api.url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json, text/plain, */*',
          },
          signal: controller.signal,
          mode: 'cors',
          credentials: 'omit'
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.warn(`API ${api.url} returned status ${response.status}`);
          continue;
        }
        
        const contentType = response.headers.get('content-type') || '';
        let data;
        
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          data = await response.text();
        }
        
        const ip = api.parser(data);
        if (ip && ip !== 'N/A' && ip !== 'unknown' && ip.length > 0) {
          console.log(`✓ Got IP from ${api.url}: ${ip}`);
          return ip;
        }
      } catch (error) {
        console.warn(`✗ Failed to get IP from ${api.url}:`, error.message);
        continue;
      }
    }

    // Nếu không lấy được từ API nào, trả về 'N/A'
    console.warn('⚠ Could not get IP from any API, using N/A');
    return 'N/A';
  },

  /**
   * Lưu thông tin đồng ý điều khoản
   * @param {string} userId - ID của user
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async recordTermsAgreement(userId) {
    try {
      console.log('📝 Recording terms agreement for user:', userId);
      
      const ipAddress = await this.getClientIpAddress();
      console.log('📍 IP Address obtained:', ipAddress);
      
      const agreementData = {
        userId,
        timestamp: new Date(),
        ipAddress,
        version: this.CURRENT_VERSION,
        termsOfService: true,
        privacyPolicy: true,
        userAgent: navigator.userAgent || 'unknown'
      };

      console.log('💾 Saving agreement data:', agreementData);
      
      const docRef = await addDoc(collection(db, 'termsAgreements'), agreementData);
      
      console.log('✅ Terms agreement saved successfully:', docRef.id);
      return { success: true };
    } catch (error) {
      console.error('❌ Error recording terms agreement:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Kiểm tra user đã đồng ý điều khoản chưa
   * @param {string} userId - ID của user
   * @returns {Promise<{agreed: boolean, agreement?: object}>}
   */
  async hasUserAgreedToTerms(userId) {
    try {
      const q = query(
        collection(db, 'termsAgreements'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return { agreed: false };
      }

      const agreement = snapshot.docs[0].data();
      return { agreed: true, agreement };
    } catch (error) {
      console.error('Error checking terms agreement:', error);
      return { agreed: false };
    }
  },

  /**
   * Lấy lịch sử đồng ý điều khoản của user
   * @param {string} userId - ID của user
   * @returns {Promise<array>}
   */
  async getUserAgreementHistory(userId) {
    try {
      const q = query(
        collection(db, 'termsAgreements'),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.() || doc.data().timestamp
      }));
    } catch (error) {
      console.error('Error getting agreement history:', error);
      return [];
    }
  }
};

export default termsService;
