// client/src/components/TimePicker.jsx
import React, { useEffect, useState } from 'react';

/**
 * TimePicker (12-hour)
 * props:
 *  - value: string like "07:30 AM" or "" (empty)
 *  - onChange: fn(valueString) called when changed
 *  - minuteStep: number (default 1) - step for minute select
 */
export default function TimePicker({ value = '', onChange = () => {}, minuteStep = 1 }) {
  // parse initial value if present
  const parse = (v) => {
    if (!v || typeof v !== 'string') return { hour: '7', minute: '30', ampm: 'AM' };
    const m = v.match(/^\s*(\d{1,2}):(\d{2})\s*(AM|PM)?\s*$/i);
    if (!m) return { hour: '7', minute: '30', ampm: 'AM' };
    let hh = String(Number(m[1] || 7));
    let mm = (m[2] || '30');
    let ap = (m[3] || 'AM').toUpperCase();
    if (hh === '0') hh = '12';
    return { hour: hh, minute: mm, ampm: ap };
  };

  const initial = parse(value);
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const [ampm, setAmpm] = useState(initial.ampm);

  // build minute options based on step
  const minuteOptions = [];
  for (let i = 0; i < 60; i += (minuteStep || 1)) {
    minuteOptions.push(String(i).padStart(2, '0'));
  }

  useEffect(() => {
    // when parent changes value prop, sync local selects
    const p = parse(value);
    setHour(p.hour);
    setMinute(p.minute);
    setAmpm(p.ampm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    const out = `${String(Number(hour)).padStart(2, '0')}:${String(minute).padStart(2,'0')} ${ampm}`;
    onChange(out);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hour, minute, ampm]);

  // generate hour options 1..12
  const hours = Array.from({ length: 12 }, (_, i) => String(i + 1));

  return (
    <div className="time-picker" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <div className="time-column">
        <select
          value={String(Number(hour))}
          onChange={e => setHour(String(Number(e.target.value)))}
          aria-label="Hour"
        >
          {hours.map(h => <option key={h} value={h}>{h}</option>)}
        </select>
      </div>

      <div className="time-sep" aria-hidden>:</div>

      <div className="time-column">
        <select
          value={String(minute).padStart(2,'0')}
          onChange={e => setMinute(String(e.target.value))}
          aria-label="Minute"
        >
          {minuteOptions.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className="time-column">
        <select value={ampm} onChange={e => setAmpm(e.target.value)} aria-label="AM/PM">
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
}
