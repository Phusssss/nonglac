import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db, googleProvider } from '../firebase/config';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, increment } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email, password, displayName) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', result.user.uid), {
      displayName,
      email,
      reputation: 0,
      joinDate: new Date(),
      postsCount: 0,
      likesReceived: 0
    });
    return result;
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Tạo hoặc cập nhật user profile
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          displayName: user.displayName,
          email: user.email,
          avatar: user.photoURL,
          reputation: 0,
          joinDate: new Date(),
          postsCount: 0,
          likesReceived: 0
        });
      }
      return result;
    } catch (error) {
      // Bỏ qua lỗi CORS warning, chỉ throw lỗi thật sự
      if (error.code !== 'auth/popup-closed-by-user') {
        throw error;
      }
    }
  };

  const logout = () => signOut(auth);

  const updateReputation = async (userId, points) => {
    await updateDoc(doc(db, 'users', userId), {
      reputation: increment(points)
    });
  };

  const value = {
    user,
    userProfile,
    login,
    loginWithGoogle,
    register,
    logout,
    updateReputation,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};