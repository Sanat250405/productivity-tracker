import React, { useEffect, useState } from 'react';

/**
 * Timer component
 * props:
 * - minutes (number) default: 1
 * - onFinish() called when timer reaches 0
 * - onCancel() optional
 */
export default function Timer({ minutes = 1, onFinish, onCancel }) {
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    setSecondsLeft(minutes * 60);
    setRunning(true);
  }, [minutes]);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecondsLeft(s => {
        if (s <= 1) {
          clearInterval(id);
          setRunning(false);
          if (onFinish) onFinish();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, onFinish]);

  const mm = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const ss = (secondsLeft % 60).toString().padStart(2, '0');

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
      <div style={{ fontFamily: 'monospace', fontSize: 16 }}>{mm}:{ss}</div>
      <div>
        {running ? (
          <button className="button small" onClick={() => setRunning(false)}>Pause</button>
        ) : (
          <button className="button small" onClick={() => setRunning(true)}>Resume</button>
        )}
      </div>
      <div>
        <button
          className="button small"
          style={{ background: '#ef4444', color: '#fff' }}
          onClick={() => { setRunning(false); if (onCancel) onCancel(); }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
