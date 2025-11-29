import React, { useEffect, useState } from 'react';
import API from '../../api';

// must match keys used in Routine page
const ACTIVITIES_KEY = 'pt_activities_v1';

// helper: load local activities
function loadLocalActivities() {
    try {
        const raw = localStorage.getItem(ACTIVITIES_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

// helper: format ISO to readable
function fmt(iso) {
    try {
        return new Date(iso).toLocaleString();
    } catch {
        return iso;
    }
}

// helper: get date string YYYY-MM-DD
function dateStr(iso) {
    return new Date(iso).toISOString().split('T')[0];
}

export default function Dashboard() {
    const [loading, setLoading] = useState(false);
    const [activities, setActivities] = useState([]); // merged activities
    const [streak, setStreak] = useState(0);

    // fetch backend goals and merge with local activities
    const refresh = async () => {
        setLoading(true);
        try {
            // fetch goals from backend
            const res = await API.get('/goals').catch(() => ({ data: [] }));
            const goals = res.data || [];

            // map completed goals to activity-like objects
            const goalActivities = (goals || [])
                .filter(g => g.completed)
                .map(g => ({
                    _id: 'g_' + g._id,
                    type: 'goal',
                    refId: g._id,
                    title: g.title,
                    completedAt: g.completedAt || g.createdAt
                }));

            // local routine activities
            const local = loadLocalActivities().map(a => ({
                ...a,
                // ensure fields match
                completedAt: a.completedAt || a.createdAt
            }));

            // combine and sort by completedAt desc
            const merged = [...goalActivities, ...local].sort((a, b) => {
                return new Date(b.completedAt) - new Date(a.completedAt);
            });

            setActivities(merged);
            computeStreak(merged);
        } catch (err) {
            console.error('Failed to refresh dashboard', err);
            const localOnly = loadLocalActivities().sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
            setActivities(localOnly);
            computeStreak(localOnly);
        } finally {
            setLoading(false);
        }
    };

    // compute simple streak: consecutive days upto today that have >=1 activity
    function computeStreak(list) {
        if (!list || list.length === 0) {
            setStreak(0);
            return;
        }
        const daysSet = new Set(list.map(a => dateStr(a.completedAt)));
        // start from today, count back consecutive days present in daysSet
        let count = 0;
        let cur = new Date();

        // if no activity today, we still allow streak to be based on most recent day (your rule can be changed)
        while (true) {
            const ds = dateStr(cur.toISOString());
            if (daysSet.has(ds)) {
                count++;
                cur.setDate(cur.getDate() - 1);
            } else {
                break;
            }
        }
        setStreak(count);
    }


    useEffect(() => {
        refresh();

        const onStorage = (e) => {
            if (e.key === ACTIVITIES_KEY) refresh();
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    // quick: mark an activity as "locally removed" (UI only) - won't affect backend
    const removeLocalActivity = (id) => {
        const keep = activities.filter(a => a._id !== id);
        setActivities(keep);
        // also remove from localStorage if it is a local activity id (starts with 'a_')
        if (id.startsWith('a_')) {
            const local = loadLocalActivities().filter(a => a._id !== id);
            localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(local));
        }
    };

    const todayStr = new Date().toISOString().split('T')[0];
    const todays = activities.filter(a => dateStr(a.completedAt) === todayStr);

    return (
        <div>
            <div className="header-row">
                <h2>Dashboard</h2>
                <div className="streak-display">
                    <span style={{ fontSize: '22px' }}>🔥</span>
                    {streak} day streak
                </div>


            </div>

            <div className="card" style={{ marginBottom: 12 }}>
                <h3>Today's Activity</h3>
                {loading && <div style={{ color: '#6b7280' }}>Loading...</div>}
                {!loading && todays.length === 0 && <div style={{ color: '#6b7280' }}>No activity recorded today.</div>}
                <ul style={{ paddingLeft: 18 }}>
                    {todays.map(a => (
                        <li key={a._id} style={{ marginBottom: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong>{a.title}</strong>
                                    <div style={{ fontSize: 12, color: '#6b7280' }}>{a.type} · {fmt(a.completedAt)}</div>
                                </div>
                                <div>
                                    <button className="button small" onClick={() => removeLocalActivity(a._id)}>Remove</button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="card">
                <h3>Recent activity</h3>
                {activities.length === 0 && <div style={{ color: '#6b7280' }}>No activity yet.</div>}
                <ul style={{ paddingLeft: 18 }}>
                    {activities.map(a => (
                        <li key={a._id} style={{ marginBottom: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong>{a.title}</strong>
                                    <div style={{ fontSize: 12, color: '#6b7280' }}>{a.type} · {fmt(a.completedAt)}</div>
                                </div>
                                <div>
                                    <button className="button small" onClick={() => removeLocalActivity(a._id)}>Remove</button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
