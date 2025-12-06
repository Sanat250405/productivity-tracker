// client/src/pages/Auth/Signup.jsx
import React, { useState } from 'react';
import { createUser } from '../../firebase';
import { useToast } from '../../components/Toast';

export default function Signup({ onSuccess, onSwitch }) {
  const { show } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      await createUser(email.trim(), password);
      show('Account created successfully!', 'success');
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Signup error:', err);
      show(err.message || 'Signup failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Start tracking your productivity today</p>
        
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
              placeholder="Min 6 chars" 
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength={6}
              style={styles.input}
            />
          </div>

          <button type="submit" disabled={submitting} style={styles.button}>
            {submitting ? 'Creating...' : 'Sign Up'}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account?{' '}
          <span onClick={onSwitch} style={styles.link}>
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}

// Reusing same styles for consistency
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6', 
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
  },
  button: {
    backgroundColor: '#2563eb',
    color: 'white',
    padding: '0.75rem',
    borderRadius: '6px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem',
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