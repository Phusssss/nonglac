import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';

/**
 * Script admin để cleanup tất cả user có nhiều hơn 1 badge profession
 * Chỉ admin mới có quyền chạy script này
 */
export const cleanupAllUsersProfessionBadges = async () => {
  try {
    console.log('🔧 Bắt đầu cleanup profession badges...');
    
    const professionBadges = ['PRODUCER', 'SUPPLIER', 'TRADER'];
    const userMissionsRef = collection(db, 'userMissions');
    const snapshot = await getDocs(userMissionsRef);
    
    let totalUsers = 0;
    let cleanedUsers = 0;
    let errors = 0;
    const results = [];

    for (const docSnap of snapshot.docs) {
      totalUsers++;
      const userId = docSnap.id;
      const data = docSnap.data();
      
      if (!data.unlockedBadges || !Array.isArray(data.unlockedBadges)) {
        continue;
      }

      // Tìm các badge profession user đang có
      const userProfessionBadges = data.unlockedBadges.filter(
        badge => professionBadges.includes(badge)
      );

      // Nếu có nhiều hơn 1 badge profession
      if (userProfessionBadges.length > 1) {
        try {
          // Giữ lại badge đầu tiên
          const badgeToKeep = userProfessionBadges[0];
          const cleanedBadges = data.unlockedBadges.filter(
            badge => !professionBadges.includes(badge) || badge === badgeToKeep
          );

          // Cập nhật Firestore
          await updateDoc(doc(db, 'userMissions', userId), {
            unlockedBadges: cleanedBadges,
            selectedProfessionBadge: badgeToKeep,
            lastCleanup: new Date().toISOString()
          });

          cleanedUsers++;
          results.push({
            userId,
            keptBadge: badgeToKeep,
            removedBadges: userProfessionBadges.filter(b => b !== badgeToKeep),
            success: true
          });

          console.log(`✅ Cleaned user ${userId}: kept ${badgeToKeep}, removed ${userProfessionBadges.filter(b => b !== badgeToKeep).join(', ')}`);
        } catch (error) {
          errors++;
          results.push({
            userId,
            error: error.message,
            success: false
          });
          console.error(`❌ Error cleaning user ${userId}:`, error);
        }
      }
    }

    const summary = {
      totalUsers,
      cleanedUsers,
      errors,
      results
    };

    console.log('📊 Cleanup Summary:');
    console.log(`- Total users checked: ${totalUsers}`);
    console.log(`- Users cleaned: ${cleanedUsers}`);
    console.log(`- Errors: ${errors}`);

    return summary;
  } catch (error) {
    console.error('❌ Error in cleanup script:', error);
    throw error;
  }
};

/**
 * Kiểm tra user nào có nhiều badge profession (không cleanup, chỉ report)
 */
export const reportDuplicateProfessionBadges = async () => {
  try {
    console.log('🔍 Checking for duplicate profession badges...');
    
    const professionBadges = ['PRODUCER', 'SUPPLIER', 'TRADER'];
    const userMissionsRef = collection(db, 'userMissions');
    const snapshot = await getDocs(userMissionsRef);
    
    const duplicates = [];

    for (const docSnap of snapshot.docs) {
      const userId = docSnap.id;
      const data = docSnap.data();
      
      if (!data.unlockedBadges || !Array.isArray(data.unlockedBadges)) {
        continue;
      }

      const userProfessionBadges = data.unlockedBadges.filter(
        badge => professionBadges.includes(badge)
      );

      if (userProfessionBadges.length > 1) {
        duplicates.push({
          userId,
          badges: userProfessionBadges,
          score: data.score || 0
        });
      }
    }

    console.log(`📊 Found ${duplicates.length} users with duplicate profession badges`);
    duplicates.forEach(({ userId, badges, score }) => {
      console.log(`- User ${userId}: ${badges.join(', ')} (score: ${score})`);
    });

    return duplicates;
  } catch (error) {
    console.error('❌ Error in report script:', error);
    throw error;
  }
};
