// server/firebaseAdmin.js
const admin = require('firebase-admin');

function initFirebaseAdmin() {
  if (admin.apps && admin.apps.length) return admin;

  // Preferred: set FIREBASE_SERVICE_ACCOUNT env var to the full JSON string (escaped)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    return admin;
  }

  // Local dev fallback: place serviceAccountKey.json in server/ (DO NOT commit to git)
  try {
    // eslint-disable-next-line global-require
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    return admin;
  } catch (err) {
    console.warn('Firebase admin init: no serviceAccountKey.json found and no FIREBASE_SERVICE_ACCOUNT env var set.');
    // initializeApp without credential will still allow some admin ops if running on GCP; otherwise calls will fail
    try {
      admin.initializeApp();
      return admin;
    } catch (e) {
      console.error('Failed to init firebase-admin:', e.message);
      throw e;
    }
  }
}

module.exports = initFirebaseAdmin();
