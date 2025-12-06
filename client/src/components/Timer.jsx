import React, { useEffect, useState } from 'react';

export default function Timer({ targetTime, onFinish, onCancel }) {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      const remaining = Math.max(0, targetTime - now);
      if (remaining === 0) onFinish();
      return remaining;
    };

    setTimeLeft(calculateTime());
    const interval = setInterval(() => {
      const remaining = calculateTime();
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [targetTime, onFinish]);

  const formatTime = (ms) => {
    const totalSeconds = Math.floor(ms / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const pad = (n) => String(n).padStart(2, '0');
    
    // If > 1 hour, show H:MM:SS, else MM:SS
    if (h > 0) return `${h}:${pad(m)}:${pad(s)}`;
    return `${pad(m)}:${pad(s)}`;
  };

  return (
    <div style={{ 
      display: 'flex', alignItems: 'center', gap: 10, 
      background: 'var(--bg-highlight, #f0f0f0)', 
      padding: '4px 8px 4px 12px', borderRadius: 99,
      border: '1px solid rgba(0,0,0,0.1)'
    }}>
      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'var(--primary, #007bff)' }}>
        {formatTime(timeLeft)}
      </span>
      <button 
        onClick={onCancel}
        style={{
          border: 'none', background: '#ff4d4f', color: 'white',
          borderRadius: '50%', width: 20, height: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', fontSize: 16
        }}
        title="Stop Timer"
      >
        ×
      </button>
    </div>
  );
}