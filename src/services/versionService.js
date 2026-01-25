import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

class VersionService {
  constructor() {
    this.currentVersion = process.env.REACT_APP_VERSION || '1.0.0';
    this.versionKey = 'app_version';
    this.lastCheckKey = 'version_last_check';
    this.checkInterval = 5 * 60 * 1000; // Check every 5 minutes
  }

  // Lấy version hiện tại từ Firebase
  async getRemoteVersion() {
    try {
      const versionDoc = await getDoc(doc(db, 'system', 'version'));
      if (versionDoc.exists()) {
        return versionDoc.data().version;
      }
      return null;
    } catch (error) {
      console.error('Error getting remote version:', error);
      return null;
    }
  }

  // Cập nhật version trên Firebase (dành cho admin)
  async updateRemoteVersion(version) {
    try {
      await setDoc(doc(db, 'system', 'version'), {
        version: version,
        updatedAt: new Date(),
        updatedBy: 'admin'
      });
      console.log('Version updated to:', version);
      return true;
    } catch (error) {
      console.error('Error updating version:', error);
      return false;
    }
  }

  // Lấy version đã lưu trong localStorage
  getLocalVersion() {
    return localStorage.getItem(this.versionKey);
  }

  // Lưu version vào localStorage
  setLocalVersion(version) {
    localStorage.setItem(this.versionKey, version);
  }

  // Lấy thời gian check cuối cùng
  getLastCheckTime() {
    const lastCheck = localStorage.getItem(this.lastCheckKey);
    return lastCheck ? parseInt(lastCheck) : 0;
  }

  // Lưu thời gian check
  setLastCheckTime() {
    localStorage.setItem(this.lastCheckKey, Date.now().toString());
  }

  // Xóa toàn bộ cache
  async clearAllCache() {
    try {
      // Clear localStorage (trừ thông tin đăng nhập quan trọng)
      const keysToKeep = [
        'firebase:authUser:',
        'admin_authenticated',
        'user_preferences'
      ];
      
      const allKeys = Object.keys(localStorage);
      allKeys.forEach(key => {
        const shouldKeep = keysToKeep.some(keepKey => key.includes(keepKey));
        if (!shouldKeep) {
          localStorage.removeItem(key);
        }
      });

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear service worker cache nếu có
      if ('serviceWorker' in navigator && 'caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      console.log('All cache cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing cache:', error);
      return false;
    }
  }

  // Check version và clear cache nếu cần
  async checkAndUpdateVersion() {
    try {
      const now = Date.now();
      const lastCheck = this.getLastCheckTime();
      
      // Chỉ check nếu đã qua thời gian interval
      if (now - lastCheck < this.checkInterval) {
        return false;
      }

      const remoteVersion = await this.getRemoteVersion();
      if (!remoteVersion) {
        this.setLastCheckTime();
        return false;
      }

      const localVersion = this.getLocalVersion();
      
      // Nếu version khác nhau, clear cache và reload
      if (localVersion && localVersion !== remoteVersion) {
        console.log(`Version mismatch: Local ${localVersion} vs Remote ${remoteVersion}`);
        
        // Show notification trước khi reload
        this.showUpdateNotification(remoteVersion);
        
        // Clear cache
        await this.clearAllCache();
        
        // Update local version
        this.setLocalVersion(remoteVersion);
        
        // Reload page sau 2 giây
        setTimeout(() => {
          window.location.reload(true);
        }, 2000);
        
        return true;
      }

      // Nếu chưa có local version, set nó
      if (!localVersion) {
        this.setLocalVersion(remoteVersion);
      }

      this.setLastCheckTime();
      return false;
    } catch (error) {
      console.error('Error checking version:', error);
      this.setLastCheckTime();
      return false;
    }
  }

  // Hiển thị thông báo update
  showUpdateNotification(newVersion) {
    // Tạo notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #52c41a;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 300px;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 20px; height: 20px; border-radius: 50%; background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center;">
          ✓
        </div>
        <div>
          <div style="font-weight: 600; margin-bottom: 4px;">Phiên bản mới!</div>
          <div style="opacity: 0.9; font-size: 12px;">Đang cập nhật lên v${newVersion}...</div>
        </div>
      </div>
    `;

    // Add animation keyframes
    if (!document.getElementById('update-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'update-notification-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Remove notification sau 5 giây
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);
  }

  // Initialize version checking
  init() {
    // Check version ngay khi khởi động
    this.checkAndUpdateVersion();

    // Set interval để check định kỳ
    setInterval(() => {
      this.checkAndUpdateVersion();
    }, this.checkInterval);

    // Check khi user focus vào tab
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        setTimeout(() => {
          this.checkAndUpdateVersion();
        }, 1000);
      }
    });
  }

  // Lấy thông tin version hiện tại
  getCurrentVersionInfo() {
    return {
      local: this.getLocalVersion(),
      current: this.currentVersion,
      lastCheck: new Date(this.getLastCheckTime()).toLocaleString()
    };
  }
}

export default new VersionService();