// client/src/App.js
import React, { useContext, useEffect, useMemo } from 'react'; // Added useMemo
import AppLayout from './layout/AppLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Goals from './pages/Goals/Goals';
import Routine from './pages/Routine/Routine';
import Consistency from './pages/Consistency/Consistency';
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import { AuthContext } from './contexts/AuthContext';

import { getAuth, signOut } from 'firebase/auth';

export default function App() {
  const [page, setPage] = React.useState('dashboard');
  const { user, loading } = useContext(AuthContext);

  // Define protected pages (Wrapped in useMemo to stop re-render warnings)
  const appPages = useMemo(() => new Set(['dashboard', 'goals', 'routine', 'consistency']), []);

  const handleLogout = async () => {
    try {
      // 1. CLEAR BROWSER MEMORY (The Fix)
      localStorage.removeItem('pt_routines_v1');      // Clear Routines
      localStorage.removeItem('pt_activities_v1');    // Clear Activities
      localStorage.removeItem('pt_timer_active_v1');  // Clear active timers
      
      // 2. Sign out from Firebase
      const auth = getAuth();
      await signOut(auth);
      
      // 3. Send user to Login Page
      // We use setPage because your app uses state navigation, not URL routing
      setPage('login'); 
      
      // Optional: Force a reload to ensure all RAM/Component states are wiped clean
      window.location.reload(); 
      
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Effect: Redirect to Login if user is not found
  useEffect(() => {
    if (!loading && !user && appPages.has(page)) {
      setPage('login');
    }
  }, [user, loading, page, appPages]);

  if (loading) return <div style={{ display:'flex', height:'100vh', justifyContent:'center', alignItems:'center' }}>Loading...</div>;

  // --- FULL SCREEN AUTH PAGES (No Sidebar) ---
  if (page === 'login') {
    return (
      <Login 
        onSuccess={() => setPage('dashboard')} 
        onSwitch={() => setPage('signup')} 
      />
    );
  }

  if (page === 'signup') {
    return (
      <Signup 
        onSuccess={() => setPage('dashboard')} 
        onSwitch={() => setPage('login')} 
      />
    );
  }

  // --- MAIN APP PAGES (With Sidebar) ---
  return (
    <AppLayout
      page={page}
      onNavigate={setPage}
      user={user}
      onLogout={handleLogout} // Pass the fixed logout function here
    >
      {page === 'dashboard' && <Dashboard />}
      {page === 'goals' && <Goals />}
      {page === 'routine' && <Routine />}
      {page === 'consistency' && <Consistency />}
    </AppLayout>
  );
}