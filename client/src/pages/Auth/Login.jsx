// client/src/pages/Auth/Login.jsx
import React, { useState, useContext } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import { AuthContext } from '../../contexts/AuthContext';

export default function Login({ onSuccess, onSwitch }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(AuthContext);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const token = await cred.user.getIdToken();
      setUser({
        uid: cred.user.uid,
        email: cred.user.email,
        token
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError('Invalid email or password');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome Back</h2>
        <p style={styles.subtitle}>Sign in to continue to Productivity</p>
        
        {error && <div style={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input 
              type="email" 
              placeholder="you@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)} 
              required 
              style={styles.input}
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required 
              style={styles.input}
            />
          </div>

          <button type="submit" style={styles.button}>
            Sign In
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account?{' '}
          <span onClick={onSwitch} style={styles.link}>
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6', // Light gray background
    padding: '20px',
  },
  card: {
    backgroundColor: '#ffffff',
    width: '100%',
    maxWidth: '400px',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  title: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '0.5rem',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '0.875rem',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    padding: '0.75rem',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    backgroundColor: '#2563eb', // Blue
    color: 'white',
    padding: '0.75rem',
    borderRadius: '6px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem',
    transition: 'background-color 0.2s',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#ef4444',
    padding: '0.75rem',
    borderRadius: '6px',
    fontSize: '0.875rem',
    textAlign: 'center',
    marginBottom: '1rem',
  },
  footerText: {
    textAlign: 'center',
    fontSize: '0.875rem',
    color: '#6b7280',
    marginTop: '1.5rem',
  },
  link: {
    color: '#2563eb',
    fontWeight: '600',
    cursor: 'pointer',
  }
};