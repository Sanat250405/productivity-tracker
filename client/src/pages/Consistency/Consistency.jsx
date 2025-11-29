// client/src/pages/Consistency/Consistency.jsx
import React, { useEffect, useState } from 'react';
import API from '../../api';
import { useToast } from '../../components/Toast';

const ACTIVITIES_KEY = 'pt_activities_v1';
const ROUTINES_KEY = 'pt_routines_v1';

function loadLocalActivities() {
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalActivities(list) {
  try {
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(list));
  } catch {}
}

function loadLocalRoutines() {
  try {
    const raw = localStorage.getItem(ROUTINES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalRoutines(list) {
  try {
    localStorage.setItem(ROUTINES_KEY, JSON.stringify(list));
  } catch {}
}

function dateOnly(iso) {
  try {
    return new Date(iso).toISOString().split('T')[0];
  } catch {
    return iso;
  }
}

export default function Consistency() {
  const { show } = useToast();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]); // { id, refId, title, type, daysCount, days: [] }
  const [filter, setFilter] = useState('all'); // all | routine | goal

  // Delete modal state: { show: bool, item: object|null }
  const [deleteModal, setDeleteModal] = useState({ show: false, item: null, action: null, busy: false });

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      // load completed goals from backend (if offline -> empty)
      const res = await API.get('/goals').catch(() => ({ data: [] }));
      const goals = (res.data || []).filter(g => g.completed).map(g => ({
        id: 'g_' + g._id,
        refId: g._id,
        title: g.title,
        type: 'goal',
        dates: new Set([ dateOnly(g.completedAt || g.createdAt) ])
      }));

      // local routine activities
      const localActs = loadLocalActivities() || [];
      const routinesMap = {};
      localActs.forEach(a => {
        const refKey = a.refId ? ('r_' + a.refId) : (a._id || ('a_' + Date.now()));
        if (!routinesMap[refKey]) {
          routinesMap[refKey] = { id: refKey, refId: a.refId, title: a.title || 'Routine', type: 'routine', dates: new Set() };
        }
        const d = dateOnly(a.completedAt || a.dateString || new Date().toISOString());
        routinesMap[refKey].dates.add(d);
      });

      // merge
      const merged = [...goals];
      Object.values(routinesMap).forEach(r => merged.push(r));

      const final = merged.map(it => ({
        id: it.id,
        refId: it.refId,
        title: it.title,
        type: it.type,
        daysCount: it.dates ? it.dates.size : 0,
        days: Array.from(it.dates || []).sort().reverse()
      }));

      final.sort((a,b) => (b.daysCount - a.daysCount) || a.title.localeCompare(b.title));
      setItems(final);
      show('Consistency refreshed', 'success');
    } catch (err) {
      console.error('Failed to load consistency', err);
      show('Failed to load consistency data', 'error');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Deletion helpers ----------
  // Clear history (remove activity logs) for item
  const clearHistory = async (item) => {
    try {
      if (item.type === 'routine') {
        // remove activities with refId matching routine refId OR id when refId missing
        const all = loadLocalActivities();
        const filtered = all.filter(a => {
          // activity's refId might be like 'r_<id>' or plain id; match by refId or refId missing
          if (!a.refId) return true;
          return a.refId !== (item.refId || item.id.replace(/^r_/, ''));
        });
        saveLocalActivities(filtered);
        show('History cleared for routine', 'success');
      } else if (item.type === 'goal') {
        // For goals we clear the completed flag via backend: set completed=false, clear completedAt
        try {
          await API.put(`/goals/${item.refId}`, { completed: false });
          show('Goal history cleared', 'success');
        } catch (err) {
          console.error('Failed to clear goal history', err);
          show('Failed to clear goal history', 'error');
        }
      }
    } catch (err) {
      console.error('clearHistory error', err);
      show('Failed to clear history', 'error');
    } finally {
      // refresh view
      await refresh();
      setDeleteModal({ show: false, item: null, action: null, busy: false });
    }
  };

  // Delete entire item
  const deleteEntireItem = async (item) => {
    try {
      setDeleteModal(prev => ({ ...prev, busy: true }));
      if (item.type === 'routine') {
        // remove routine and its activities locally
        const routines = loadLocalRoutines().filter(r => r._id !== (item.refId || item.id.replace(/^r_/, '')));
        saveLocalRoutines(routines);

        const activities = loadLocalActivities().filter(a => a.refId !== (item.refId || item.id.replace(/^r_/, '')));
        saveLocalActivities(activities);

        show('Routine deleted', 'success');
      } else if (item.type === 'goal') {
        // delete goal on backend
        try {
          await API.delete(`/goals/${item.refId}`);
          show('Goal deleted', 'success');
        } catch (err) {
          console.error('Failed to delete goal', err);
          show('Failed to delete goal', 'error');
        }
      }
    } catch (err) {
      console.error('deleteEntireItem error', err);
      show('Delete failed', 'error');
    } finally {
      // refresh and close modal
      await refresh();
      setDeleteModal({ show: false, item: null, action: null, busy: false });
    }
  };

  // ---------- UI handlers ----------
  const onRequestDelete = (item) => {
    setDeleteModal({ show: true, item, action: null, busy: false });
  };

  const performDeleteAction = async (choice) => {
    const item = deleteModal.item;
    if (!item) {
      setDeleteModal({ show: false, item: null, action: null, busy: false });
      return;
    }
    // choice: 'clear' | 'delete'
    setDeleteModal(prev => ({ ...prev, action: choice }));
    if (choice === 'clear') {
      await clearHistory(item);
    } else if (choice === 'delete') {
      await deleteEntireItem(item);
    } else {
      setDeleteModal({ show: false, item: null, action: null, busy: false });
    }
  };

  const visible = items.filter(it => filter === 'all' ? true : (it.type === filter));

  return (
    <div>
      <div className="header-row">
        <h2>Consistency</h2>
        <div style={{ color: '#6b7280' }}>See how many distinct days you've completed each item</div>
      </div>

      <div className="card" style={{ marginBottom:12 }}>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <strong>Filter:</strong>
          <button className="button small" onClick={()=>setFilter('all')}>All</button>
          <button className="button small" onClick={()=>setFilter('routine')}>Routines</button>
          <button className="button small" onClick={()=>setFilter('goal')}>Goals</button>
          <div style={{ marginLeft:'auto', color:'#6b7280' }}>
            <button className="button small" onClick={refresh}>Refresh</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Most consistent items</h3>

        {loading && <div style={{ color:'#6b7280' }}>Loading...</div>}
        {!loading && items.length === 0 && <div style={{ color:'#6b7280' }}>No completed items yet.</div>}

        <ul style={{ paddingLeft:18 }}>
          {visible.map(it => (
            <li key={it.id} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <strong>{it.title}</strong>
                  <div style={{ fontSize:12, color:'#6b7280' }}>{it.type} · {it.daysCount} distinct day(s)</div>
                  {it.days && it.days.length > 0 && (
                    <div style={{ fontSize:11, color:'#9ca3af', marginTop:6 }}>
                      Recent days: {it.days.slice(0,6).join(', ')}
                    </div>
                  )}
                </div>

                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <button className="button small" onClick={() => {
                    navigator.clipboard && navigator.clipboard.writeText(it.title);
                    show('Title copied to clipboard', 'success');
                  }}>Copy</button>

                  <button className="button small btn-ghost" onClick={() => {
                    // quick: clear history directly (but we prefer the modal so user sees options)
                    onRequestDelete(it);
                  }}>
                    Manage
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* ------------------------
          Delete / Manage Modal
          ------------------------ */}
      {deleteModal.show && deleteModal.item && (
        <div className="modal-overlay">
          <div className="modal-card">
            <h3 style={{ marginTop: 0 }}>Manage "{deleteModal.item.title}"</h3>

            <p style={{ color:'#6b7280', marginTop: 6 }}>
              Choose an action for this item. <strong style={{ color:'#111827' }}>Clear history</strong> removes only the recorded activity days (consistency); <strong style={{ color:'#111827' }}>Delete item</strong> removes the item entirely.
            </p>

            <div style={{ display:'flex', gap:12, marginTop:16 }}>
              <button
                className="button"
                onClick={() => performDeleteAction('clear')}
                disabled={deleteModal.busy}
              >
                Clear history
              </button>

              <button
                className="button btn-danger"
                onClick={() => performDeleteAction('delete')}
                disabled={deleteModal.busy}
              >
                Delete item
              </button>

              <button
                className="button btn-ghost"
                onClick={() => setDeleteModal({ show: false, item: null, action: null, busy: false })}
              >
                Cancel
              </button>
            </div>

            <div style={{ marginTop:12, fontSize:12, color:'#6b7280' }}>
              Note: Clearing history cannot be undone. Deleting a goal removes it from the backend; deleting a routine removes it from this browser.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
