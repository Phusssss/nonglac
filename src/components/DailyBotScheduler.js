import { useEffect } from 'react';
import botService from '../services/botService';

/**
 * Component tự động gửi báo giá hàng ngày
 * Chạy mỗi ngày lúc 7:00 sáng
 */
const DailyBotScheduler = () => {
  useEffect(() => {
    // Kiểm tra và gửi báo giá khi component mount
    const checkAndSendDailyReport = async () => {
      const now = new Date();
      const hour = now.getHours();
      
      // Chỉ gửi vào 7h sáng
      if (hour === 7) {
        const lastSent = localStorage.getItem('lastBotReportDate');
        const today = now.toDateString();
        
        // Kiểm tra xem hôm nay đã gửi chưa
        if (lastSent !== today) {
          console.log('Sending daily price report...');
          try {
            await botService.sendDailyPriceReport();
            localStorage.setItem('lastBotReportDate', today);
            console.log('Daily price report sent successfully');
          } catch (error) {
            console.error('Failed to send daily price report:', error);
          }
        }
      }
    };

    // Chạy ngay khi mount
    checkAndSendDailyReport();

    // Kiểm tra mỗi giờ
    const interval = setInterval(checkAndSendDailyReport, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return null; // Component không render gì
};

export default DailyBotScheduler;
