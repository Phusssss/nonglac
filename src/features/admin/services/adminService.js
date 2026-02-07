import { 
  collection, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { missionsService } from '../../missions/services';

export const adminService = {
  async getStats() {
    const [u, p, m] = await Promise.all([
      getDocs(collection(db, 'users')), 
      getDocs(collection(db, 'posts')), 
      getDocs(collection(db, 'marketplace_products'))
    ]);
    return { totalUsers: u.size, totalPosts: p.size, totalProducts: m.size };
  },

  async getUsers() {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getPosts() {
    const snap = await getDocs(collection(db, 'posts'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getPrices() {
    const [p, c] = await Promise.all([
      getDocs(collection(db, 'prices')), 
      getDocs(collection(db, 'priceCategories'))
    ]);
    return {
      prices: p.docs.map(d => ({ id: d.id, ...d.data() })),
      categories: c.docs.map(d => ({ id: d.id, ...d.data() }))
    };
  },

  async getProducts() {
    const snap = await getDocs(collection(db, 'marketplace_products'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  },

  async getAnalytics() {
    const [u, p, a] = await Promise.all([
      getDocs(query(collection(db, 'users'), orderBy('reputation', 'desc'), limit(10))),
      getDocs(collection(db, 'posts')),
      getDocs(query(collection(db, 'userActions'), orderBy('timestamp', 'desc'), limit(100)))
    ]);
    
    const allPosts = p.docs.map(d => d.data());
    const catCount = {};
    allPosts.forEach(i => catCount[i.category] = (catCount[i.category] || 0) + 1);
    
    const actCount = {};
    const actions = a.docs.map(d => d.data());
    actions.forEach(i => actCount[i.action] = (actCount[i.action] || 0) + 1);
    
    return {
      topUsers: u.docs.map(d => ({ id: d.id, ...d.data() })),
      postsByCategory: Object.entries(catCount).map(([name, count]) => ({ name, count })),
      actionStats: Object.entries(actCount).map(([action, count]) => ({ action, count })),
      recentActivity: a.docs.map(d => ({ id: d.id, ...d.data() })).slice(0, 20)
    };
  },

  async verifyUser(userId) {
    await updateDoc(doc(db, 'users', userId), { verificationStatus: 'verified' });
    return await missionsService.verifyUserPhone(userId);
  },

  async updateUserRole(userId, role) {
    return await updateDoc(doc(db, 'users', userId), { role });
  },

  async deleteUser(userId) {
    return await deleteDoc(doc(db, 'users', userId));
  },

  async deletePost(postId) {
    return await deleteDoc(doc(db, 'posts', postId));
  }
};