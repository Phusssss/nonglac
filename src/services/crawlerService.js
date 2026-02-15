/**
 * Crawler Service
 * Handles communication with Firebase Functions for price crawling
 */

const FUNCTION_URL = 'https://asia-southeast1-nonglac-2026.cloudfunctions.net/crawlCoffeeManual';

/**
 * Trigger manual crawler
 * Note: This may fail due to CORS/IAM restrictions
 * Alternative: Use Firebase Admin SDK or scheduled function
 */
export const triggerCrawler = async () => {
  try {
    // Try direct call first
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Direct crawler call failed:', error);
    
    // Fallback: Return instruction to use scheduled function
    throw new Error(
      'Không thể gọi crawler trực tiếp do giới hạn IAM. ' +
      'Crawler sẽ tự động chạy mỗi 30 phút. ' +
      'Hoặc liên hệ admin để trigger thủ công qua Firebase Console.'
    );
  }
};

export default {
  triggerCrawler
};
