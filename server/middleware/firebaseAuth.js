// server/middleware/firebaseAuth.js
const admin = require('../firebaseAdmin');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null; // unauthenticated
    return next();
  }

  const idToken = authHeader.split(' ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    // decoded contains uid, email, and any custom claims (e.g., admin)
    req.user = {
      uid: decoded.uid,
      email: decoded.email || null,
      isAdmin: !!decoded.admin // set custom claim 'admin' on admin users
    };
  } catch (err) {
    console.warn('Firebase token verify failed:', err.message);
    req.user = null;
  }
  return next();
};
