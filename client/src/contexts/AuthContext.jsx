// client/src/contexts/AuthContext.jsx
// Robust AuthContext with safe fallback and Firebase integration.
// Exports: AuthProvider (default) and useAuth() hook (named).

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged as firebaseOnAuthStateChanged } from '../firebase'; // wrapper from firebase.js (may throw if not configured)

export const AuthContext = createContext(null);

/**
 * useAuth hook - safe fallback if provider is missing.
 * Consumers can destructure safely: const { user, token, loading } = useAuth();
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    // Return a consistent default object to prevent destructuring runtime errors.
    return {
      user: null,
      token: null,
      loading: false,
      isAdmin: false,
      setUser: () => {},
      refreshToken: async () => null,
    };
  }
  return ctx;
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('pt_auth_user_v1');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('pt_auth_token_v1') || null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // helper to persist
  useEffect(() => {
    try {
      if (user) localStorage.setItem('pt_auth_user_v1', JSON.stringify(user));
      else localStorage.removeItem('pt_auth_user_v1');
    } catch (e) {
      // ignore
      // eslint-disable-next-line no-console
      console.warn('Failed to persist auth user', e);
    }
  }, [user]);

  useEffect(() => {
    try {
      if (token) localStorage.setItem('pt_auth_token_v1', token);
      else localStorage.removeItem('pt_auth_token_v1');
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Failed to persist auth token', e);
    }
  }, [token]);

  // refresh token helper
  const refreshToken = useCallback(async () => {
    if (!user) return null;
    try {
      const idToken = await user.getIdToken();
      setToken(idToken);
      return idToken;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to refresh token', err);
      setToken(null);
      return null;
    }
  }, [user]);

  // mount: subscribe to firebase auth state if available
  useEffect(() => {
    let unsub;
    setLoading(true);

    try {
      // firebaseOnAuthStateChanged will throw if firebase not configured; guard it
      unsub = firebaseOnAuthStateChanged((fbUser) => {
        if (fbUser) {
          // build minimal user object (keep non-sensitive fields)
          const minimal = {
            uid: fbUser.uid,
            email: fbUser.email || null,
            displayName: fbUser.displayName || null,
            photoURL: fbUser.photoURL || null,
            // keep firebase user instance for token retrieval — store non-enumerable so it doesn't break localStorage
            __fbUserInstance: fbUser,
          };
          setUser(minimal);
          // get token
          fbUser.getIdToken().then((t) => {
            setToken(t || null);
            // Optional: parse admin custom claims if provided (backend sets custom claims)
            fbUser.getIdTokenResult().then((res) => {
              const claims = res?.claims || {};
              setIsAdmin(Boolean(claims?.admin || claims?.isAdmin));
            }).catch(() => {
              setIsAdmin(false);
            });
          }).catch(() => {
            setToken(null);
          });
        } else {
          setUser(null);
          setToken(null);
          setIsAdmin(false);
        }
        setLoading(false);
      });
    } catch (err) {
      // Firebase not configured or onAuthStateChanged not available — fall back gracefully
      // eslint-disable-next-line no-console
      console.warn('Firebase auth not available on mount:', err);
      setLoading(false);
    }

    return () => {
      try {
        if (typeof unsub === 'function') unsub();
      } catch {}
    };
  }, []);

  const contextValue = useMemo(() => ({
    user,
    token,
    loading,
    isAdmin,
    setUser,
    refreshToken,
  }), [user, token, loading, isAdmin, refreshToken]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}
