import React, { useEffect, useState } from 'react';
import Timer from '../../components/Timer';

// localStorage keys
const ROUTINES_KEY = 'pt_routines_v1';
const ACTIVITIES_KEY = 'pt_activities_v1';

function loadRoutines() {
  try {
    const raw = localStorage.getItem(ROUTINES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveRoutines(list) {
  localStorage.setItem(ROUTINES_KEY, JSON.stringify(list));
}

function loadActivities() {
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function saveActivities(list) {
  localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(list));
}

export default function Routine() {
  const [routines, setRoutines] = useState(loadRoutines());
  const [title, setTitle] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration] = useState(10);

  // which routine id is currently running (shows timer)
  const [running, setRunning] = useState(null);

  useEffect(() => {
    // persist when routines change
    saveRoutines(routines);
  }, [routines]);

  // Add a new routine
  const addRoutine = () => {
    if (!title.trim()) return alert('Please enter a title');
    const r = {
      _id: 'r_' + Date.now(),
      title: title.trim(),
      scheduledTime: scheduledTime || '',
      durationMinutes: Number(duration) || 0,
      createdAt: new Date().toISOString()
    };
    setRoutines(prev => [r, ...prev]);
    setTitle('');
    setScheduledTime('');
    setDuration(10);
  };

  // Delete routine
  const deleteRoutine = (id) => {
    if (!window.confirm('Delete this routine?')) return;
    setRoutines(prev => prev.filter(r => r._id !== id));
    // if it was running, stop
    if (running === id) setRunning(null);
  };

  // Called when timer finishes or user marks done
  const markDoneLocal = (r) => {
    // record activity entry
    const activities = loadActivities();
    const activity = {
      _id: 'a_' + Date.now(),
      type: 'routine',
      refId: r._id,
      title: r.title,
      completedAt: new Date().toISOString(),
      dateString: new Date().toISOString().split('T')[0]
    };
    activities.unshift(activity);
    saveActivities(activities);

    // stop timer UI
    setRunning(null);
    alert(`Marked "${r.title}" done — recorded locally.`);
  };

  const startTimer = (id) => {
    const r = routines.find(x => x._id === id);
    if (!r) return;
    if (!r.durationMinutes || r.durationMinutes <= 0) {
      // If no duration, treat start as mark-done (quick)
      if (window.confirm('No duration set — mark as done now?')) markDoneLocal(r);
      return;
    }
    setRunning(id);
  };

  // UI helpers: get activities count per routine
  const activities = loadActivities();
  const getCount = (id) => activities.filter(a => a.refId === id).length;

  return (
    <div>
      <div className="header-row">
        <h2>Routine</h2>
        <span style={{ color: '#6b7280' }}>Daily habits to follow</span>
      </div>

      <div className="card" style={{ marginBottom: 12 }}>
        <h4>Add / Edit Routine</h4>

        <input
          placeholder="Routine title (e.g. 'Meditate')"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ marginBottom: 8 }}
        />

        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            placeholder="Scheduled time (HH:MM) optional"
            value={scheduledTime}
            onChange={(e) => setScheduledTime(e.target.value)}
            style={{ width: 160 }}
          />
          <input
            type="number"
            min={0}
            placeholder="Duration (minutes)"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            style={{ width: 140 }}
          />
        </div>

        <div>
          <button className="button" onClick={addRoutine}>Save Routine</button>
        </div>
      </div>

      <div className="card">
        <h3>Your routines</h3>

        {routines.length === 0 && <div style={{ color: '#6b7280' }}>No routines yet. Add one above.</div>}

        <ul style={{ paddingLeft: 18 }}>
          {routines.map(r => (
            <li key={r._id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div>
                  <strong>{r.title}</strong>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {r.scheduledTime ? `At ${r.scheduledTime}` : 'No time set'}
                    {r.durationMinutes ? ` · ${r.durationMinutes} min` : ''}
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>
                    Done {getCount(r._id)} time(s)
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {running === r._id ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                      <Timer
                        minutes={r.durationMinutes || 1}
                        onFinish={() => markDoneLocal(r)}
                        onCancel={() => setRunning(null)}
                      />
                      <div>
                        <button className="button small" onClick={() => markDoneLocal(r)}>Mark Done Now</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button className="button small" onClick={() => startTimer(r._id)}>Start</button>
                      <button className="button small" style={{ background: 'red', color: '#fff' }} onClick={() => deleteRoutine(r._id)}>Delete</button>
                      <button
                        className="button small"
                        onClick={() => {
                          // quick proxy to mark done without timer
                          if (window.confirm(`Mark "${r.title}" done now?`)) markDoneLocal(r);
                        }}
                      >
                        Mark Done
                      </button>
                    </>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280' }}>
          Note: routines are saved locally (browser). When we add backend activity endpoints later, we will sync these.
        </div>
      </div>
    </div>
  );
}
