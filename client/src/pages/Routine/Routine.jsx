// client/src/pages/Routine/Routine.jsx
import React, { useEffect, useState, useRef } from 'react';
import Timer from '../../components/Timer';
import { useToast } from '../../components/Toast';
import API from '../../api';

// localStorage keys
const ROUTINES_KEY = 'pt_routines_v1';
const ACTIVITIES_KEY = 'pt_activities_v1';
const RUNNING_TIMER_KEY = 'pt_running_routine_timer_v1';


// --- localStorage helpers ---
//eslint-disable-next-line
function loadRoutines() {
  try {
    const raw = localStorage.getItem(ROUTINES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}
function saveRoutines(list) {
  try {
    localStorage.setItem(ROUTINES_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Failed to save routines locally', err);
  }
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
  
  try {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn('Failed to save activities locally', err);
  }
}

// running timer persistence
function loadRunningTimer() {
  try {
    const raw = localStorage.getItem(RUNNING_TIMER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function saveRunningTimer(obj) {
  try {
    localStorage.setItem(RUNNING_TIMER_KEY, JSON.stringify(obj));
  } catch {
    // ignore
  }
}
function clearRunningTimer() {
  try {
    localStorage.removeItem(RUNNING_TIMER_KEY);
  } catch {
    // ignore
  }
}

// small util: YYYY-MM-DD
const isoDate = (d = new Date()) => d.toISOString().split('T')[0];

export default function Routine() {
  const { show } = useToast();

  // Change your data states to start empty
  const [routines, setRoutines] = useState([]);
  const [activities, setActivities] = useState([]);

  // running timer: { id, targetTime } | null
  const [running, setRunning] = useState(null);

  // UI states
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // modal form fields (12-hour)
  const [title, setTitle] = useState('');
  const [startHour, setStartHour] = useState('07');   // "01"–"12"
  const [startMinute, setStartMinute] = useState('00'); // "00"–"59"
  const [amPm, setAmPm] = useState('AM');
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(10);
  const descRef = useRef(null);

  // delete modal
  const [deleteId, setDeleteId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // persist routines when changed
    saveRoutines(routines);
    // refresh activities from localStorage when routines change
    setActivities(loadActivities());
  }, [routines]);

  // Keep activities state up to date with localStorage if other pages modify it
  useEffect(() => {
    const fetchData = async () => {
      try {
        const rRes = await API.get('/routines');
        setRoutines(Array.isArray(rRes.data) ? rRes.data : []);

        const aRes = await API.get('/activities');
        setActivities(Array.isArray(aRes.data) ? aRes.data : []);
      } catch (err) {
        console.error('Failed to fetch data', err);
      }
    };
    fetchData();
  }, []);
  // restore running timer on mount (for page changes / reload)
  useEffect(() => {
    const stored = loadRunningTimer();
    if (!stored) return;
    const { id, targetTime } = stored || {};
    if (!id || !targetTime) {
      clearRunningTimer();
      return;
    }
    const now = Date.now();
    if (targetTime <= now) {
      // already finished
      clearRunningTimer();
      return;
    }
    // ensure routine still exists
    const exists = routines.some(r => r._id === id);
    if (!exists) {
      clearRunningTimer();
      return;
    }
    setRunning({ id, targetTime });
    // eslint-disable-next-line
  }, []); // only once on mount

  // --- Helpers ---

  const openNew = () => {
    setEditing(null);
    setTitle('');
    setStartHour('07');
    setStartMinute('00');
    setAmPm('AM');
    setHours(0);
    setMinutes(10);
    setIsModalOpen(true);
    setTimeout(() => descRef.current && descRef.current.focus(), 120);
  };

  const openEdit = (r) => {
    setEditing(r);
    setTitle(r.title || '');

    // start time: stored as 24-hr 'HH:MM' -> convert to 12-hour inputs
    if (r.startTime) {
      const [hhStr, mmStr] = r.startTime.split(':');
      let hh24 = Number(hhStr);
      const period = hh24 >= 12 ? 'PM' : 'AM';
      let hh12 = hh24 % 12;
      if (hh12 === 0) hh12 = 12;
      setStartHour(String(hh12).padStart(2, '0'));
      setStartMinute(String(Number(mmStr) || 0).padStart(2, '0'));
      setAmPm(period);
    } else {
      setStartHour('07');
      setStartMinute('00');
      setAmPm('AM');
    }

    // duration
    if (r.durationMinutes != null) {
      const dd = Number(r.durationMinutes);
      setHours(Math.floor(dd / 60));
      setMinutes(dd % 60);
    } else {
      setHours(0);
      setMinutes(10);
    }

    setIsModalOpen(true);
    setTimeout(() => descRef.current && descRef.current.focus(), 120);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditing(null);
  };

  // normalize duration: if minutes >= 60 convert to hours
  const normalizeDuration = (h, m) => {
    let hh = Math.max(0, Number(h) || 0);
    let mm = Math.max(0, Number(m) || 0);
    hh += Math.floor(mm / 60);
    mm = mm % 60;
    return { hh, mm, total: hh * 60 + mm };
  };

  // For display: convert stored 'HH:MM' (24h) to 12-hour friendly string
  const displayTime12 = (time24) => {
    if (!time24) return '';
    const [hhStr, mm] = time24.split(':');
    let hh = Number(hhStr);
    const period = hh >= 12 ? 'PM' : 'AM';
    hh = hh % 12;
    if (hh === 0) hh = 12;
    return `${hh}:${mm} ${period}`;
  };

// Save routine (new or edit)
  const saveRoutine = async () => { // <--- 1. ADD 'async' HERE
    const trimmed = (title || '').trim();
    if (!trimmed) {
      show('Please enter routine title', 'warning');
      return;
    }

    const norm = normalizeDuration(hours, minutes);

    // convert 12-hour inputs + amPm to 24-hour HH:MM string
    let h12 = parseInt(startHour, 10);
    let m = parseInt(startMinute, 10);

    if (isNaN(h12) || h12 < 1) h12 = 1;
    if (h12 > 12) h12 = 12;
    if (isNaN(m) || m < 0) m = 0;
    if (m > 59) m = 59;

    let h24 = h12 % 12;
    if (amPm === 'PM') h24 += 12;
    const storedStart = `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    // --- 2. REPLACE THE IF(EDITING) / ELSE BLOCK WITH THIS ---
    const payload = {
      title: trimmed,
      startTime: storedStart,
      durationMinutes: norm.total,
    };

    try {
      if (editing) {
        // Tell server to update
        const res = await API.put(`/routines/${editing._id}`, payload);
        
        // Update local state with the server's response
        setRoutines(prev =>
          prev.map(r => (r._id === editing._id ? res.data : r))
        );
        show('Routine updated', 'success');
      } else {
        // Tell server to create
        const res = await API.post('/routines', payload);
        
        // Add the new routine (with the real DB _id) to local state
        setRoutines(prev => [res.data, ...prev]);
        show('Routine added', 'success');
      }
    } catch (err) {
      console.error('Failed to save routine', err);
      show('Error saving to database', 'error');
    }

    closeModal();
  };
  // Delete routine: show modal then perform removal
  const requestDeleteRoutine = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteRoutine = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);

      // 1. Tell the database to delete the routine
      await API.delete(`/routines/${deleteId}`);

      // 2. Remove the routine from your frontend state
      setRoutines(prev => prev.filter(r => r._id !== deleteId));

      // 3. Remove any related activities from frontend state immediately 
      // (so they disappear from the screen without needing a page refresh)
      setActivities(prev => 
        prev.filter(a => !(a.type === 'routine' && String(a.refId) === String(deleteId)))
      );

      show('Routine removed successfully', 'success');
    } catch (err) {
      console.error('Delete routine error', err);
      show('Failed to delete routine', 'error');
    } finally {
      setDeleting(false);
      setDeleteId(null);
      setShowDeleteModal(false);
    }
  };
  // --- Activity helpers for "Done" / "Undo" ---

// mark done for routine r: POST to /activities
  const markDoneLocal = async (r) => {
    const now = new Date();
    const completedAt = now.toISOString();
    const dateString = isoDate(now);

    try {
      // 1. Post directly to your database
      const res = await API.post('/activities', {
        type: 'routine',
        refId: r._id, // Send the real DB _id of the routine
        title: r.title,
        completedAt,
        dateString,
      });

      // 2. Update frontend state with the newly created activity from the server
      setActivities(prev => [res.data, ...prev]);

      // 3. Stop timer
      setRunning(null);
      clearRunningTimer();
      
      show(`Marked "${r.title}" done`, 'success');
    } catch (err) {
      console.error('Failed to post routine activity to server', err);
      show('Failed to record activity', 'error');
    }
  };

  // Undo today's completion for a routine (remove today's activity)
  // Undo today's completion for a routine
  const undoDone = async (r) => {
    const date = isoDate();
    
    try {
      // 1. Find the specific activity to delete directly from our current React state
      const target = activities.find(
        a => a.type === 'routine' && String(a.refId) === String(r._id) && a.dateString === date
      );

      if (target) {
        // 2. Tell the database to delete it
        await API.delete(`/activities/${target._id}`);
        
        // 3. Remove it from the UI immediately
        setActivities(prev => prev.filter(a => a._id !== target._id));
        show('Undone for today', 'success');
      }
    } catch (err) {
      console.error('Undo error', err);
      show('Failed to undo activity', 'error');
    }
  };
  // check if a routine is done today: search activities state
  const isDoneToday = (r) => {
    const today = isoDate();
    return activities.some(
      a =>
        a.type === 'routine' &&
        String(a.refId) === String(r._id) &&
        a.dateString === today
    );
  };

  const getCount = (id) => activities.filter(a => a.refId === id).length;

  // start a timer for a routine (or auto-mark done if no duration)
  const startTimer = (id) => {
    const r = routines.find(x => x._id === id);
    if (!r) return;

    if (!r.durationMinutes || r.durationMinutes <= 0) {
      // immediate mark done
      markDoneLocal(r);
      return;
    }

    const durationMs = (r.durationMinutes || 1) * 60 * 1000;
    const targetTime = Date.now() + durationMs;
    const payload = { id, targetTime };
    setRunning(payload);
    saveRunningTimer(payload);
  };

  // search filter
  const filtered = routines.filter(r => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (r.title || '').toLowerCase().includes(q);
  });

  // UI helpers for showing duration as human-friendly (e.g., 90 -> 1h 30m)
  const showDuration = (mins) => {
    const m = Number(mins) || 0;
    if (m === 0) return '—';
    const h = Math.floor(m / 60);
    const mm = m % 60;
    if (h > 0) return `${h}h ${mm}m`;
    return `${mm}m`;
  };

  return (
    <div style={{ paddingBottom: 96 }}>
      <div
        className="header-row"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <div>
          <h2 style={{ margin: 0 }}>Routine</h2>
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>Daily habits to follow</div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div className="search-input" style={{ display: 'flex', alignItems: 'center' }}>
            <svg
              style={{ width: 18, height: 18, marginLeft: 10, marginRight: 8 }}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 21L16.65 16.65"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="11"
                cy="11"
                r="6"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
            <input
              placeholder="Search routines..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                border: 'none',
                outline: 'none',
                padding: '10px 8px',
                minWidth: 200,
                background: 'transparent',
              }}
            />
            {search && (
              <button
                className="button small"
                onClick={() => setSearch('')}
                style={{
                  marginRight: 8,
                  marginLeft: 6,
                  background: 'transparent',
                  color: 'var(--muted)',
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3 style={{ margin: 0 }}>Your routines</h3>
        <div style={{ marginTop: 10, color: 'var(--muted)' }}>
          {filtered.length} routine{filtered.length !== 1 ? 's' : ''} shown
        </div>

        <div style={{ marginTop: 12 }}>
          {filtered.length === 0 && (
            <div style={{ color: 'var(--muted)' }}>
              No routines yet. Add one using the + button.
            </div>
          )}

          <ul style={{ paddingLeft: 18, marginTop: 8 }}>
            {filtered.map(r => (
              <li key={r._id} style={{ marginBottom: 14 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>{r.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {r.startTime ? displayTime12(r.startTime) : 'No start time'} ·{' '}
                        {showDuration(r.durationMinutes)}
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: 8,
                        fontSize: 12,
                        color: 'var(--muted)',
                      }}
                    >
                      Done {getCount(r._id)} time(s)
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {running && running.id === r._id ? (
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 8,
                          alignItems: 'flex-end',
                        }}
                      >
                        <Timer
                          targetTime={running.targetTime}
                          onFinish={() => {
                            // prevent duplicate completion if already done today
                            if (!isDoneToday(r)) {
                              markDoneLocal(r);
                            } else {
                              setRunning(null);
                              clearRunningTimer();
                            }
                          }}
                          onCancel={() => {
                            setRunning(null);
                            clearRunningTimer();
                          }}
                        />
                      </div>
                    ) : (
                      <>
                        <button
                          className="button small"
                          onClick={() => startTimer(r._id)}
                        >
                          Start
                        </button>

                        {isDoneToday(r) ? (
                          // arranged Done + Undo in a row
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                            }}
                          >
                            <span
                              style={{
                                padding: '8px 10px',
                                borderRadius: 999,
                                background: 'green',
                                color: 'white',
                                fontSize: 13,
                                fontWeight: 600,
                              }}
                            >
                              Done ✓
                            </span>
                            <button
                              className="button small btn-ghost"
                              onClick={() => undoDone(r)}
                            >
                              Undo
                            </button>
                          </div>
                        ) : (
                          <button
                            className="button small"
                            onClick={() => markDoneLocal(r)}
                          >
                            Mark Done
                          </button>
                        )}

                        <button
                          className="button small btn-ghost"
                          onClick={() => openEdit(r)}
                        >
                          Edit
                        </button>
                        <button
                          className="button small btn-danger"
                          onClick={() => requestDeleteRoutine(r._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Floating Add button */}
      <div
        style={{
          position: 'fixed',
          right: 18,
          bottom: 18,
          zIndex: 1200,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <button
          className="button"
          onClick={openNew}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            borderRadius: 999,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'rgba(255,255,255,0.06)',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              boxShadow: 'var(--card-shadow)',
            }}
          >
            +
          </span>
          Add Routine
        </button>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card" role="dialog" aria-modal="true">
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <h3 style={{ margin: 0 }}>
                {editing ? 'Edit Routine' : 'Add Routine'}
              </h3>
              <button
                className="button small btn-ghost"
                onClick={closeModal}
              >
                Close
              </button>
            </div>

            <div style={{ marginTop: 12 }}>
              <label style={{ fontSize: 13, color: 'var(--muted)' }}>Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Routine name"
                style={{
                  width: '100%',
                  padding: 10,
                  marginTop: 6,
                  borderRadius: 8,
                  border: '1px solid rgba(0,0,0,0.06)',
                }}
              />

              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  marginTop: 12,
                  alignItems: 'center',
                }}
              >
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 13, color: 'var(--muted)' }}>
                    Start time (12-hour)
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      alignItems: 'center',
                      marginTop: 6,
                    }}
                  >
                    {/* Hours dropdown 1–12 */}
                    <select
                      value={startHour}
                      onChange={(e) => setStartHour(e.target.value)}
                      style={{
                        padding: 8,
                        borderRadius: 8,
                        border: '1px solid rgba(0,0,0,0.06)',
                      }}
                    >
                      {Array.from({ length: 12 }, (_, i) => {
                        const val = String(i + 1).padStart(2, '0');
                        return (
                          <option key={val} value={val}>
                            {i + 1}
                          </option>
                        );
                      })}
                    </select>

                    <span>:</span>

                    {/* Minutes dropdown 0–59 */}
                    <select
                      value={startMinute}
                      onChange={(e) => setStartMinute(e.target.value)}
                      style={{
                        padding: 8,
                        borderRadius: 8,
                        border: '1px solid rgba(0,0,0,0.06)',
                      }}
                    >
                      {Array.from({ length: 60 }, (_, i) => {
                        const val = String(i).padStart(2, '0');
                        return (
                          <option key={val} value={val}>
                            {val}
                          </option>
                        );
                      })}
                    </select>

                    <select
                      value={amPm}
                      onChange={(e) => setAmPm(e.target.value)}
                      style={{
                        padding: 8,
                        borderRadius: 8,
                        border: '1px solid rgba(0,0,0,0.06)',
                      }}
                    >
                      <option>AM</option>
                      <option>PM</option>
                    </select>
                  </div>
                </div>

                <div style={{ width: 220 }}>
                  <label style={{ fontSize: 13, color: 'var(--muted)' }}>
                    Duration
                  </label>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <input
                      type="number"
                      min={0}
                      value={hours}
                      onChange={(e) => setHours(e.target.value)}
                      placeholder="Hours"
                      style={{
                        width: 100,
                        padding: 8,
                        borderRadius: 8,
                        border: '1px solid rgba(0,0,0,0.06)',
                      }}
                    />
                    <input
                      type="number"
                      min={0}
                      value={minutes}
                      onChange={(e) => setMinutes(e.target.value)}
                      placeholder="Minutes"
                      style={{
                        width: 100,
                        padding: 8,
                        borderRadius: 8,
                        border: '1px solid rgba(0,0,0,0.06)',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: 'var(--muted)',
                    }}
                  >
                    Preview:{' '}
                    {(() => {
                      const n = normalizeDuration(hours, minutes);
                      return n.total === 0
                        ? 'No duration'
                        : `${n.hh > 0 ? n.hh + 'h ' : ''}${n.mm}m (${n.total} minutes)`;
                    })()}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  display: 'flex',
                  gap: 8,
                  justifyContent: 'flex-end',
                }}
              >
                <button
                  className="button btn-ghost"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button
                  className="button"
                  onClick={saveRoutine}
                >
                  {editing ? 'Save' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ... inside Routine.jsx return (...)*/}

      {/* Floating Add button */}
      <div
        className="floating-fab"  // <--- ADD THIS CLASS
        style={{
          position: 'fixed',
          right: 18,
          bottom: 18, // Desktop position
          zIndex: 1200,
          display: 'flex',
          gap: 10,
          alignItems: 'center'
        }}
      >
        <button
          className="button"
          onClick={openNew}
        // ...
        >
          {/* ... */}
        </button>
      </div>

      {/* Delete confirm modal */}
      {showDeleteModal && (
        <div className="modal-overlay">
          <div className="modal-card" role="dialog" aria-modal="true">
            <h3>Delete routine?</h3>
            <p>
              This will remove the routine and its local activity records. Server-side
              cleanup will be attempted but may be pending.
            </p>

            <div
              style={{
                marginTop: 14,
                display: 'flex',
                gap: 8,
                justifyContent: 'flex-end',
              }}
            >
              <button
                className="button btn-ghost"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                className="button btn-danger"
                onClick={confirmDeleteRoutine}
                disabled={deleting}
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
