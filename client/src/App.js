import React from 'react';
import AppLayout from './layout/AppLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Goals from './pages/Goals/Goals';
import Routine from './pages/Routine/Routine';
import Consistency from './pages/Consistency/Consistency';

export default function App() {
  // simple client-side "router" using state for now
  const [page, setPage] = React.useState('dashboard');

  const renderPage = () => {
    switch (page) {
      case 'dashboard': return <Dashboard />;
      case 'goals': return <Goals />;
      case 'routine': return <Routine />;
      case 'consistency': return <Consistency />;
      default: return <Dashboard />;
    }
  };

  return (
    <AppLayout page={page} onNavigate={setPage}>
      {renderPage()}
    </AppLayout>
  );
}
