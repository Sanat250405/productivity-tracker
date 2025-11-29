// client/src/pages/Consistency/Consistency.jsx
import React, { useEffect, useState } from 'react';
import API from '../../api';

const ACTIVITIES_KEY = 'pt_activities_v1';

// helpers
function loadLocalActivities() {
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function dateOnly(iso) {
  return new Date(iso).toISOString().split('T')[0];
}

export default function Consistency(){
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]); // { id, title, type, daysCount, days: [] }
  const [filter, setFilter] = useState('all'); // all | routine | goal

  useEffect(() => {
    refresh();
  }, []);

  const refresh = async () => {
    setLoading(true);
    try {
      // load completed goals from backend
      const res = await API.get('/goals').catch(() => ({ data: [] }));
      const goals = (res.data || []).filter(g => g.completed).map(g => ({
        id: 'g_' + g._id,
        refId: g._id,
        title: g.title,
        type: 'goal',
        dates: new Set([ dateOnly(g.completedAt || g.createdAt) ])
      }));

      // load local routine activities
      const local = loadLocalActivities() || [];
      // local activities have: _id, type:'routine', refId, title, completedAt, dateString
      const routinesMap = {};
      local.forEach(a => {
        const id = a._id || ('a_'+(a.refId || Date.now()));
        const refKey = a.refId ? ('r_' + a.refId) : id;
        if (!routinesMap[refKey]) {
          routinesMap[refKey] = { id: refKey, refId: a.refId, title: a.title || 'Routine', type: 'routine', dates: new Set() };
        }
        const d = dateOnly(a.completedAt || a.dateString || new Date().toISOString());
        routinesMap[refKey].dates.add(d);
      });

      // merge goals + routines
      const merged = [...goals];
      Object.values(routinesMap).forEach(r => merged.push(r));

      // transform to array with counts
      const final = merged.map(it => ({
        id: it.id,
        refId: it.refId,
        title: it.title,
        type: it.type,
        daysCount: it.dates ? it.dates.size : 0,
        days: Array.from(it.dates || []).sort().reverse()
      }));

      // sort by daysCount desc then title
      final.sort((a,b) => (b.daysCount - a.daysCount) || a.title.localeCompare(b.title));

      setItems(final);
    } catch (err) {
      console.error('Failed to load consistency', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const visible = items.filter(it => filter === 'all' ? true : (it.type === filter));

  return (
    <div>
      <div className="header-row">
        <h2>Consistency</h2>
        <div style={{color:'#6b7280'}}>See how many distinct days you've completed each item</div>
      </div>

      <div className="card" style={{ marginBottom:12 }}>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <strong>Filter:</strong>
          <button className={`button small ${filter==='all' ? '' : ''}`} onClick={()=>setFilter('all')}>All</button>
          <button className={`button small ${filter==='routine' ? '' : ''}`} onClick={()=>setFilter('routine')}>Routines</button>
          <button className={`button small ${filter==='goal' ? '' : ''}`} onClick={()=>setFilter('goal')}>Goals</button>
          <div style={{ marginLeft:'auto', color:'#6b7280' }}>
            <button className="button small" onClick={refresh}>Refresh</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h3>Most consistent items</h3>

        {loading && <div style={{color:'#6b7280'}}>Loading...</div>}
        {!loading && items.length === 0 && <div style={{color:'#6b7280'}}>No completed items yet.</div>}

        <ul style={{ paddingLeft:18 }}>
          {visible.map(it => (
            <li key={it.id} style={{ marginBottom:10 }}>
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
                <div>
                  <button className="button small" onClick={() => {
                    // zoom to details: open dashboard and filter by title
                    // simple approach: copy to clipboard the title (user-friendly)
                    navigator.clipboard && navigator.clipboard.writeText(it.title);
                    alert('Item title copied to clipboard. You can search for it in Goals/Routine.');
                  }}>Copy title</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
