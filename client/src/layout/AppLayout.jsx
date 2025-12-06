// client/src/layout/AppLayout.js
import React from 'react';

export default function AppLayout({ children, page, onNavigate, user, onLogout }) {
  
  // Helper for mobile active state
  const isActive = (p) => page === p ? 'active' : '';

  return (
    <div className="app">
      
      {/* 1. ADDED 'desktop-sidebar' CLASS HERE 👇 */}
      <aside className="sidebar desktop-sidebar">
        <div
          className="brand"
          role="button"
          tabIndex={0}
          onClick={() => onNavigate('dashboard')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate('dashboard');
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          ⚒️Productivity
        </div>

        <nav className="nav">
          <button
            className={page === 'dashboard' ? 'active' : ''}
            onClick={() => onNavigate('dashboard')}
          >
            Dashboard
          </button>

          <button
            className={page === 'goals' ? 'active' : ''}
            onClick={() => onNavigate('goals')}
          >
            Goals
          </button>

          <button
            className={page === 'routine' ? 'active' : ''}
            onClick={() => onNavigate('routine')}
          >
            Routine
          </button>

          <button
            className={page === 'consistency' ? 'active' : ''}
            onClick={() => onNavigate('consistency')}
          >
            Consistency
          </button>
        </nav>

        {/* ======== FOOTER SECTION ======== */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {user && (
            <div style={{ 
              padding: '10px', 
              background: 'rgba(255,255,255,0.03)', 
              borderRadius: '8px',
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px' 
            }}>
              <span style={{ fontSize: '11px', color: '#9ca3af', wordBreak: 'break-all' }}>
                {user.email}
              </span>
              <button
                onClick={onLogout}
                style={{
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '500',
                  textAlign: 'center'
                }}
              >
                Sign Out
              </button>
            </div>
          )}

          <div style={{ fontSize: 12, color: '#9ca3af' }}>
            <span style={{ color: '#d1d5db' }}>Made with ❤️</span>
          </div>
        </div>
      </aside>

      {/* 2. ADDED 'app-main-content' CLASS HERE 👇 */}
      <main className="main app-main-content">
        {children}
      </main>

      {/* 3. NEW MOBILE BOTTOM NAV (Visible only on mobile via CSS) 👇 */}
      <nav className="mobile-bottom-nav">
        <button className={`nav-item ${isActive('dashboard')}`} onClick={() => onNavigate('dashboard')}>
          <span className="nav-icon">📊</span>
          <span>Dash</span>
        </button>

        <button className={`nav-item ${isActive('goals')}`} onClick={() => onNavigate('goals')}>
          <span className="nav-icon">🎯</span>
          <span>Goals</span>
        </button>

        <button className={`nav-item ${isActive('routine')}`} onClick={() => onNavigate('routine')}>
          <span className="nav-icon">📅</span>
          <span>Routine</span>
        </button>

        <button className={`nav-item ${isActive('consistency')}`} onClick={() => onNavigate('consistency')}>
          <span className="nav-icon">🔥</span>
          <span>Streak</span>
        </button>

        <button className="nav-item" onClick={onLogout} style={{ color: '#ef4444' }}>
          <span className="nav-icon">🚪</span>
          <span>Exit</span>
        </button>
      </nav>

    </div>
  );
}