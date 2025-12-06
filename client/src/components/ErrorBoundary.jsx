// client/src/components/ErrorBoundary.jsx
import React from 'react';

const overlayStyles = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(10,11,13,0.95)',
  color: '#ff6b6b',
  zIndex: 2147483647,
  padding: 24,
  fontFamily: 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
  overflow: 'auto',
};

const boxStyles = {
  maxWidth: 1100,
  margin: '24px auto',
  background: '#1f1f23',
  borderRadius: 8,
  padding: 20,
  boxShadow: '0 10px 40px rgba(0,0,0,0.7)',
  color: '#f8fafc',
};

const preStyles = {
  whiteSpace: 'pre-wrap',
  wordBreak: 'break-word',
  background: '#111',
  padding: 12,
  borderRadius: 6,
  color: '#f1f5f9',
  fontSize: 13,
  lineHeight: 1.45,
  marginTop: 12,
};

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ hasError: true, error, info });
    // eslint-disable-next-line no-console
    console.error('Uncaught error in ErrorBoundary:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error, info } = this.state;

    // attempt to read the debug dump populated by index.js monkeypatch (dev-only)
    let invalidDumpText = null;
    try {
      const dump = window.__lastInvalidReactType;
      if (dump) {
        invalidDumpText = `=== Detected invalid React element type dump (window.__lastInvalidReactType) ===\n\n${JSON.stringify(dump, null, 2)}\n\n` +
          `Also inspect window.__lastInvalidReactTypeRaw in console for the raw object (best viewed in DevTools).`;
      }
    } catch (e) {
      invalidDumpText = `Could not read window.__lastInvalidReactType: ${String(e)}`;
    }

    return (
      <div style={overlayStyles} role="alert" aria-live="assertive">
        <div style={boxStyles}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
            <div>
              <h2 style={{ margin: 0, color: '#ff6b6b' }}>Application error — check details below</h2>
              <div style={{ color: '#94a3b8', marginTop: 6, fontSize: 13 }}>
                This overlay is from ErrorBoundary. Use the Reload button to refresh the app.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={this.handleReload}
                type="button"
                style={{
                  background: '#0ea5a5',
                  border: 'none',
                  padding: '8px 12px',
                  borderRadius: 6,
                  color: '#042',
                  cursor: 'pointer',
                }}
              >
                Reload
              </button>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <strong style={{ color: '#f97316' }}>Error:</strong>
            <pre style={preStyles}>{error ? (error.stack || String(error)) : 'Unknown error'}</pre>

            {info && info.componentStack && (
              <>
                <strong style={{ color: '#f97316' }}>Component stack:</strong>
                <pre style={preStyles}>{info.componentStack}</pre>
              </>
            )}

            {invalidDumpText && (
              <>
                <strong style={{ color: '#f97316', marginTop: 12 }}>Invalid element debug dump (dev-only):</strong>
                <pre style={preStyles}>{invalidDumpText}</pre>
              </>
            )}

            <div style={{ marginTop: 12, color: '#94a3b8', fontSize: 13 }}>
              Copy the above stack + dump and paste here. I will patch the exact file causing the invalid export/import.
            </div>
          </div>
        </div>
      </div>
    );
  }
}
