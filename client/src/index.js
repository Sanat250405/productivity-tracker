// client/src/index.js
import React from 'react';
import * as ReactNamespace from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import AuthProvider from './contexts/AuthContext';
import ToastProvider from './components/Toast';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import './App.css';
/**
 * DEV GUARD: monkeypatch React.createElement to detect invalid element types early
 * and store a machine-readable dump at window.__lastInvalidReactType for use by ErrorBoundary.
 */
if (process.env.NODE_ENV !== 'production') {
  const origCreateElement = ReactNamespace.createElement;
  ReactNamespace.createElement = function patchedCreateElement(type, props, ...children) {
    if (typeof type === 'object' && type !== null) {
      // build helpful debug dump
      const dump = { note: 'Invalid React element type (object)', time: new Date().toISOString() };
      try {
        dump.keys = Object.keys(type);
      } catch (e) {
        dump.keys = `unreadable (${String(e)})`;
      }
      try {
        // shallow preview of enumerable values (non-circular)
        const preview = {};
        const keys = Array.isArray(dump.keys) ? dump.keys.slice(0, 8) : [];
        keys.forEach((k) => {
          try {
            const v = type[k];
            preview[k] = (v && v.name) ? `[fn ${v.name}]` : typeof v;
          } catch {
            preview[k] = 'unreadable';
          }
        });
        dump.preview = preview;
      } catch {
        dump.preview = 'unreadable';
      }
      try {
        dump.props = props ? Object.keys(props) : null;
      } catch {
        dump.props = 'unreadable';
      }
      dump.stack = (new Error()).stack;

      // expose to window so ErrorBoundary can show it in the overlay
      try {
        window.__lastInvalidReactType = dump;
        // also put raw object for inspection (non-serializable, but helpful in console)
        window.__lastInvalidReactTypeRaw = type;
      } catch (e) {
        // ignore
      }

      // print a rich console.error to help local debugging
      // eslint-disable-next-line no-console
      console.error('Invalid React element type detected (object). Dump:', dump, 'Object:', type);
      // throw to trigger ErrorBoundary overlay as before
      throw new Error('Invalid React element type (object). See window.__lastInvalidReactType in console for details.');
    }
    return origCreateElement(type, props, ...children);
  };
}

// Ensure #root exists
(function ensureRootExists() {
  if (typeof document !== 'undefined') {
    if (!document.getElementById('root')) {
      const el = document.createElement('div');
      el.id = 'root';
      document.body.appendChild(el);
      el.style.minHeight = '100vh';
    }
  }
})();

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
