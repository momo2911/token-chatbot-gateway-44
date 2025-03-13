
const admin = require('firebase-admin');
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT) 
  : null;

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length && serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} else if (!admin.apps.length) {
  console.warn('Firebase Admin SDK not initialized: missing service account');
}

/**
 * Middleware to verify Firebase authentication token
 */
const authenticateJWT = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    if (!admin.apps.length) {
      // Fall back to demo mode if Firebase Admin is not initialized
      console.warn('Firebase Admin not initialized, falling back to demo authentication');
      req.user = { uid: 'demo-user-id', role: 'user' };
      return next();
    }

    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      // Add other user details as needed
    };

    // Get user role from Firestore
    const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
    
    if (userDoc.exists) {
      req.user.role = userDoc.data().role || 'user';
    } else {
      req.user.role = 'user'; // Default role
    }

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ error: 'Forbidden: Invalid or expired token' });
  }
};

/**
 * Middleware to check if user has admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized: Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }

  next();
};

/**
 * Rate limiting middleware for API requests
 */
const rateLimiter = (options = {}) => {
  const requestCounts = new Map();
  const { windowMs = 60000, max = 100 } = options;

  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const uid = req.user?.uid || 'anonymous';
    const key = `${ip}-${uid}`;
    const now = Date.now();
    
    // Clean up old entries
    for (const [entryKey, entry] of requestCounts.entries()) {
      if (now - entry.startTime > windowMs) {
        requestCounts.delete(entryKey);
      }
    }
    
    // Get or create entry
    if (!requestCounts.has(key)) {
      requestCounts.set(key, {
        count: 0,
        startTime: now
      });
    }
    
    const entry = requestCounts.get(key);
    entry.count++;
    
    if (entry.count > max) {
      return res.status(429).json({
        error: 'Too many requests, please try again later'
      });
    }
    
    next();
  };
};

module.exports = {
  authenticateJWT,
  requireAdmin,
  rateLimiter
};
