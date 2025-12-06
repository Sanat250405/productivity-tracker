// client/src/firebase.js
// Final defensive Firebase initializer for local dev.

import { initializeApp, getApps } from 'firebase/app';
import {
    getAuth,
    createUserWithEmailAndPassword as _createUserWithEmailAndPassword,
    signInWithEmailAndPassword as _signInWithEmailAndPassword,
    onAuthStateChanged as _onAuthStateChanged,
    signOut as _signOut,
} from 'firebase/auth';

/**
 * ========  CONFIGURATION  ========
 * Uses environment variables.
 * Fallback empty strings prevent "undefined" crashes but will fail validation.
 */
const CONFIG = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
};
/** ======== end CONFIG ======== **/

function looksLikePlaceholder(cfg) {
    if (!cfg || typeof cfg !== 'object') return true;
    // very basic placeholder detection: checks for 'REPLACE' substrings
    return Object.values(cfg).some(v => typeof v === 'string' && v.includes('REPLACE'));
}

function validate(cfg) {
    if (!cfg || typeof cfg !== 'object') return { ok: false, reason: 'no-config' };
    const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    const missing = required.filter(k => !cfg[k] || String(cfg[k]).trim() === '');
    if (missing.length) return { ok: false, reason: 'missing-keys', missing };
    if (looksLikePlaceholder(cfg)) return { ok: false, reason: 'contains-placeholders' };
    return { ok: true };
}

const _check = validate(CONFIG);

let app = null;
let auth = null;

if (_check.ok) {
    try {
        if (!getApps().length) {
            app = initializeApp(CONFIG);
            // eslint-disable-next-line no-console
            console.info('[firebase] initialized with config preview:', {
                apiKeyPreview: CONFIG.apiKey ? (CONFIG.apiKey.slice(0, 6) + '…') : null,
                authDomain: CONFIG.authDomain,
                projectId: CONFIG.projectId,
                appId: CONFIG.appId,
            });
        } else {
            app = getApps()[0];
            // eslint-disable-next-line no-console
            console.info('[firebase] using existing app instance');
        }
        auth = getAuth(app);
        // expose runtime flag
        try { window.__firebaseConfigured = true; } catch { }
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[firebase] initialization failed:', err);
        try { window.__firebaseConfigured = false; } catch { }
        app = null; auth = null;
    }
} else {
    // eslint-disable-next-line no-console
    console.error('[firebase] config invalid:', _check, ' — check your .env file in client folder.');
    try { window.__firebaseConfigured = false; } catch { }
}

/* Helper to assert auth is ready */
function requireAuth() {
    if (!auth) {
        const e = new Error('Firebase auth not initialized (client/src/firebase.js). Check console for details.');
        e.code = 'auth/configuration-not-found';
        throw e;
    }
}

/* Public: returns boolean whether the client was configured at runtime */
export function isFirebaseConfigured() {
    return Boolean(auth && app);
}

/* Wrap createUser with richer logging */
export async function createUser(email, password) {
    requireAuth();
    try {
        const cred = await _createUserWithEmailAndPassword(auth, email, password);
        return cred;
    } catch (err) {
        // helpful logging for common identitytoolkit errors (400 responses)
        // eslint-disable-next-line no-console
        console.error('[firebase] createUser failed:', {
            code: err.code || null,
            message: err.message || null,
            customData: err.customData || null,
            serverResponse: err?.serverResponse || null,
        });
        throw err;
    }
}

export async function signIn(email, password) {
    requireAuth();
    try {
        return await _signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
        // eslint-disable-next-line no-console
        console.error('[firebase] signIn failed:', { code: err.code, message: err.message });
        throw err;
    }
}

export async function signOut() {
    requireAuth();
    return _signOut(auth);
}

export function onAuthStateChanged(cb) {
    requireAuth();
    return _onAuthStateChanged(auth, cb);
}

export { app, auth };
//eslint-disable-next-line
export default { app, auth, isFirebaseConfigured, createUser, signIn, signOut, onAuthStateChanged };