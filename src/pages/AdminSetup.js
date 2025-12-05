import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AdminSetup = () => {
  const [email, setEmail] = useState('admin@nonglac.com');
  const [password, setPassword] = useState('admin123456');
  const [loading, setLoading] = useState(false);

  const createAdmin = async () => {
    setLoading(true);
    try {
      // Tạo tài khoản Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Tạo profile admin trong Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: email,
        displayName: 'Super Admin',
        role: 'admin',
        reputation: 1000,
        joinDate: new Date(),
        postsCount: 0,
        likesReceived: 0
      });

      alert('Tạo tài khoản admin thành công!\nEmail: ' + email + '\nPassword: ' + password);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        alert('Email đã tồn tại. Hãy đăng nhập với tài khoản này.');
      } else {
        alert('Lỗi tạo admin: ' + error.message);
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '400px', 
      margin: '50px auto',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{ color: '#4CAF50', textAlign: 'center', marginBottom: '30px' }}>
        Setup Admin Account
      </h2>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Email Admin:
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        />
      </div>

      <div style={{ marginBottom: '30px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
          Mật khẩu:
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '16px'
          }}
        />
      </div>

      <button
        onClick={createAdmin}
        disabled={loading}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: loading ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          fontSize: '16px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Đang tạo...' : 'Tạo Admin Account'}
      </button>

      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#f9f9f9', 
        borderRadius: '4px',
        fontSize: '14px'
      }}>
        <strong>Lưu ý:</strong>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Chỉ chạy một lần để tạo admin</li>
          <li>Sau khi tạo, truy cập /admin để quản lý</li>
          <li>Có thể thay đổi email/password trước khi tạo</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminSetup;