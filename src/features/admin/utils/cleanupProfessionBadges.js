import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { MISSIONS_CONSTANTS } from '../../missions/constants';

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

/**
 * Migration một lần: set selectedDisplayBadge cho toàn bộ tài khoản cũ
 * Chỉ cập nhật các user chưa có selectedDisplayBadge.
 */
export const migrateSelectedDisplayBadgeForLegacyUsers = async () => {
  try {
    console.log('🚀 Bắt đầu migration selectedDisplayBadge cho tài khoản cũ...');

    const userMissionsRef = collection(db, 'userMissions');
    const snapshot = await getDocs(userMissionsRef);

    const validBadges = Object.keys(MISSIONS_CONSTANTS.BADGES);
    const professionBadges = ['PRODUCER', 'SUPPLIER', 'TRADER'];

    let totalUsers = 0;
    let migratedUsers = 0;
    let skippedUsers = 0;
    let errorUsers = 0;
    const results = [];

    for (const docSnap of snapshot.docs) {
      totalUsers++;
      const userId = docSnap.id;
      const data = docSnap.data() || {};

      // Chỉ migrate tài khoản cũ chưa có selectedDisplayBadge
      if (typeof data.selectedDisplayBadge === 'string' && data.selectedDisplayBadge.trim()) {
        skippedUsers++;
        continue;
      }

      const unlockedBadges = Array.isArray(data.unlockedBadges) ? data.unlockedBadges : [];
      const selectedProfessionBadge = data.selectedProfessionBadge;

      let nextSelectedDisplayBadge = null;

      // Ưu tiên badge chuyên môn đã lưu
      if (selectedProfessionBadge && validBadges.includes(selectedProfessionBadge)) {
        nextSelectedDisplayBadge = selectedProfessionBadge;
      }

      // Nếu không có, lấy profession badge đầu tiên trong unlockedBadges
      if (!nextSelectedDisplayBadge) {
        const unlockedProfession = unlockedBadges.find((badge) => professionBadges.includes(badge));
        if (unlockedProfession && validBadges.includes(unlockedProfession)) {
          nextSelectedDisplayBadge = unlockedProfession;
        }
      }

      // Nếu vẫn không có, lấy badge đầu tiên hợp lệ trong unlockedBadges
      if (!nextSelectedDisplayBadge) {
        const firstValidUnlocked = unlockedBadges.find((badge) => validBadges.includes(badge));
        if (firstValidUnlocked) {
          nextSelectedDisplayBadge = firstValidUnlocked;
        }
      }

      // Không có badge nào để hiển thị thì bỏ qua
      if (!nextSelectedDisplayBadge) {
        skippedUsers++;
        continue;
      }

      try {
        await updateDoc(doc(db, 'userMissions', userId), {
          selectedDisplayBadge: nextSelectedDisplayBadge,
          selectedDisplayBadgeMigratedAt: new Date().toISOString()
        });

        migratedUsers++;
        results.push({
          userId,
          selectedDisplayBadge: nextSelectedDisplayBadge,
          success: true
        });
      } catch (error) {
        errorUsers++;
        results.push({
          userId,
          error: error.message,
          success: false
        });
        console.error(`❌ Error migrating user ${userId}:`, error);
      }
    }

    const summary = {
      totalUsers,
      migratedUsers,
      skippedUsers,
      errorUsers,
      results
    };

    console.log('📊 Migration Summary:');
    console.log(`- Total users checked: ${totalUsers}`);
    console.log(`- Users migrated: ${migratedUsers}`);
    console.log(`- Users skipped: ${skippedUsers}`);
    console.log(`- Errors: ${errorUsers}`);

    return summary;
  } catch (error) {
    console.error('❌ Error in selectedDisplayBadge migration:', error);
    throw error;
  }
};
