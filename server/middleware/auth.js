import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // In production, use service account key
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || 'nonglac-2026'
      });
    } else {
      // In development, use default credentials
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'nonglac-2026'
      });
    }
    console.log('Firebase Admin initialized successfully');
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

// Middleware to verify Firebase ID token
export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Token xác thực không hợp lệ',
        code: 'MISSING_TOKEN'
      });
    }

    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Add user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
      role: decodedToken.role || 'user'
    };
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        error: 'Token đã hết hạn. Vui lòng đăng nhập lại.',
        code: 'TOKEN_EXPIRED'
      });
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return res.status(401).json({
        error: 'Token đã bị thu hồi. Vui lòng đăng nhập lại.',
        code: 'TOKEN_REVOKED'
      });
    }
    
    return res.status(401).json({
      error: 'Token không hợp lệ',
      code: 'INVALID_TOKEN'
    });
  }
};

// Middleware to check if user is admin
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Yêu cầu xác thực',
        code: 'AUTHENTICATION_REQUIRED'
      });
    }

    // Check if user has admin role in custom claims
    const userRecord = await admin.auth().getUser(req.user.uid);
    const customClaims = userRecord.customClaims || {};
    
    if (customClaims.role !== 'admin') {
      return res.status(403).json({
        error: 'Yêu cầu quyền admin',
        code: 'ADMIN_REQUIRED'
      });
    }
    
    req.user.role = 'admin';
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    return res.status(500).json({
      error: 'Lỗi kiểm tra quyền admin',
      code: 'ADMIN_CHECK_ERROR'
    });
  }
};

// Middleware to check if user is verified
export const requireVerifiedEmail = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'Yêu cầu xác thực',
      code: 'AUTHENTICATION_REQUIRED'
    });
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      error: 'Vui lòng xác thực email trước khi sử dụng tính năng này',
      code: 'EMAIL_VERIFICATION_REQUIRED'
    });
  }

  next();
};

// Helper function to get user from token (without middleware)
export const getUserFromToken = async (authHeader) => {
  try {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('Invalid authorization header');
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      name: decodedToken.name,
      picture: decodedToken.picture,
      role: decodedToken.role || 'user'
    };
  } catch (error) {
    throw new Error('Token verification failed');
  }
};

// Helper function to set custom claims
export const setUserRole = async (uid, role) => {
  try {
    await admin.auth().setCustomUserClaims(uid, { role });
    return true;
  } catch (error) {
    console.error('Error setting user role:', error);
    return false;
  }
};

// Helper function to revoke user tokens
export const revokeUserTokens = async (uid) => {
  try {
    await admin.auth().revokeRefreshTokens(uid);
    return true;
  } catch (error) {
    console.error('Error revoking tokens:', error);
    return false;
  }
};

export default {
  verifyFirebaseToken,
  requireAdmin,
  requireVerifiedEmail,
  getUserFromToken,
  setUserRole,
  revokeUserTokens
};