import React from 'react';

export default function AppLayout({ children, page, onNavigate }) {
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">Productivity</div>

        <div style={{fontSize:12, color:'#9ca3af'}}>Navigation</div>
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

        <div style={{marginTop:'auto', fontSize:12, color:'#9ca3af'}}>
          Backend: <span style={{color:'#d1d5db'}}>http://localhost:5000</span>
        </div>
      </aside>

      <main className="main">
        {children}
      </main>
    </div>
  );
}
