// client/src/components/Toast.jsx
// Optimized Toast (Context + hook + portal).
// Named exports: ToastProvider, useToast
// Default export: ToastProvider (so both `import ToastProvider from '...'`
// and `import { ToastProvider } from '...'` work)

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

const containerStyle = {
  position: 'fixed',
  right: 16,
  bottom: 16,
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column-reverse',
  gap: 8,
  maxWidth: 360,
};

const toastBase = {
  minWidth: 220,
  maxWidth: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  boxShadow: '0 6px 18px rgba(2,6,23,0.4)',
  color: '#fff',
  fontSize: 14,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 12,
  boxSizing: 'border-box',
};

const typeStyles = {
  success: { background: 'linear-gradient(90deg,#059669,#10b981)' },
  error: { background: 'linear-gradient(90deg,#ef4444,#f97316)' },
  info: { background: 'linear-gradient(90deg,#3b82f6,#06b6d4)' },
  warn: { background: 'linear-gradient(90deg,#f59e0b,#f97316)' },
};

const msgStyle = { flex: 1, lineHeight: 1.2, marginRight: 8, wordBreak: 'break-word' };
const btnStyle = {
  background: 'transparent',
  border: 'none',
  color: 'rgba(255,255,255,0.95)',
  cursor: 'pointer',
  fontSize: 13,
  padding: '6px 8px',
  borderRadius: 6,
};

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // fallback no-op implementation to avoid runtime destructuring errors
    return {
      show: () => {},
      hide: () => {},
      clear: () => {},
      toasts: [],
    };
  }
  return ctx;
}

let idCounter = 1;

export function ToastProvider({ children, autoClose = 4200 }) {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef(new Map());

  useEffect(() => {
    return () => {
      //eslint-disable-next-line
      for (const t of timersRef.current.values()) clearTimeout(t);
      timersRef.current.clear();
    };
  }, []);

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const t = timersRef.current.get(id);
    if (t) {
      clearTimeout(t);
      timersRef.current.delete(id);
    }
  }, []);

  const clear = useCallback(() => {
    setToasts([]);
    for (const t of timersRef.current.values()) clearTimeout(t);
    timersRef.current.clear();
  }, []);

  const show = useCallback(
    (message, type = 'info', opts = {}) => {
      const normalizedType = ['success', 'error', 'info', 'warn'].includes(type) ? type : 'info';
      const id = `toast_${Date.now()}_${idCounter++}`;

      const toast = {
        id,
        message: typeof message === 'string' ? message : (message && message.message) || String(message),
        type: normalizedType,
        createdAt: Date.now(),
        ...opts,
      };

      setToasts((prev) => [...prev, toast]);

      const ttl = typeof opts.ttl === 'number' ? opts.ttl : autoClose;
      if (ttl > 0) {
        const timer = setTimeout(() => {
          remove(id);
        }, ttl);
        timersRef.current.set(id, timer);
      }
      return id;
    },
    [autoClose, remove]
  );

  const hide = useCallback((id) => remove(id), [remove]);

  const value = useMemo(() => ({ show, hide, clear, toasts }), [show, hide, clear, toasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastPortal toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  );
}

/* Portal renderer */
function ToastPortal({ toasts = [], onClose }) {
  if (typeof document === 'undefined') return null;

  const rootId = 'app-toast-portal-root';
  let root = document.getElementById(rootId);
  if (!root) {
    root = document.createElement('div');
    root.id = rootId;
    document.body.appendChild(root);
  }

  const content = (
    <div style={containerStyle} aria-live="polite" role="status">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => onClose(t.id)} />
      ))}
    </div>
  );
  return createPortal(content, root);
}

function ToastItem({ toast, onClose }) {
  const { message, type } = toast;
  const style = { ...toastBase, ...(typeStyles[type] || typeStyles.info) };

  return (
    <div role="article" aria-label={`Notification: ${type}`} style={style}>
      <div style={msgStyle}>{message}</div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button aria-label="Dismiss" style={btnStyle} onClick={onClose} type="button">✕</button>
      </div>
    </div>
  );
}

/* Default export is the provider (function) to ensure compatibility with different import styles */
export default ToastProvider;
