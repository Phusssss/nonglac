import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyCNSAOYEC_2u6HrksybGPv6kw-dGJvOM60",
  authDomain: "nonglac-2026.firebaseapp.com",
  projectId: "nonglac-2026",
  storageBucket: "nonglac-2026.firebasestorage.app",
  messagingSenderId: "645893701216",
  appId: "1:645893701216:web:6c606f6d56510e46790d05",
  measurementId: "G-5CMPQ5QC3F"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
export default app;