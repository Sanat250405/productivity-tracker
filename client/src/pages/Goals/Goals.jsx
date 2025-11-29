// client/src/pages/Goals/Goals.jsx
import React, { useEffect, useState } from 'react';
import API from '../../api';

export default function Goals() {
    const [goals, setGoals] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    // fetch goals
    const fetchGoals = async () => {
        try {
            setLoading(true);
            const res = await API.get('/goals');
            setGoals(res.data || []);
        } catch (err) {
            console.error('Failed to load goals', err);
            alert('Could not load goals. Is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGoals();
    }, []);

    // add a goal
    const addGoal = async () => {
        if (!title.trim()) return alert('Title is required');
        try {
            const res = await API.post('/goals', { title: title.trim(), description: description.trim() });
            setTitle('');
            setDescription('');
            // prepend new goal
            setGoals(prev => [res.data, ...prev]);
        } catch (err) {
            console.error('Add failed', err);
            alert('Failed to add goal');
        }
    };

    // mark complete
    const completeGoal = async (id) => {
        try {
            await API.post(`/goals/${id}/complete`);
            // refresh list (simple)
            fetchGoals();
        } catch (err) {
            console.error('Complete failed', err);
            alert('Failed to mark complete');
        }
    };
    // delete goal
    const deleteGoal = async (id) => {
        if (!window.confirm("Delete this goal?")) return;

        try {
            await API.delete(`/goals/${id}`);
            // remove from UI
            setGoals(prev => prev.filter(goal => goal._id !== id));
        } catch (err) {
            console.error('Delete failed', err);
            alert('Failed to delete goal');
        }
    };

    return (
        <div>
            <div className="header-row">
                <h2>Goals</h2>
                <span style={{ color: '#6b7280' }}>Manage your long-term goals</span>
            </div>

            <div className="card" style={{ marginBottom: 12 }}>
                <h4>Add new goal</h4>
                <input
                    placeholder="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    style={{ marginBottom: 8 }}
                />
                <textarea
                    placeholder="Description (optional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                />
                <div style={{ marginTop: 8 }}>
                    <button className="button" onClick={addGoal}>Save Goal</button>
                </div>
            </div>

            <div className="card">
                <h3>Your goals</h3>
                {loading && <div style={{ color: '#6b7280' }}>Loading...</div>}
                {!loading && goals.length === 0 && <div style={{ color: '#6b7280' }}>No goals yet.</div>}
                <ul style={{ paddingLeft: 18 }}>
                    {goals.map(g => (
                        <li key={g._id} style={{ marginBottom: 10 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong style={{ textDecoration: g.completed ? 'line-through' : 'none' }}>
                                        {g.title}
                                    </strong>
                                    <div style={{ fontSize: 12, color: '#6b7280' }}>{g.description}</div>
                                    <div style={{ fontSize: 11, color: '#9ca3af' }}>
                                        {g.completed
                                            ? `Completed at ${new Date(g.completedAt).toLocaleString()}`
                                            : `Created: ${new Date(g.createdAt).toLocaleString()}`}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {!g.completed && (
                                        <button className="button small" onClick={() => completeGoal(g._id)}>
                                            Complete
                                        </button>
                                    )}

                                    <button
                                        className="button small"
                                        style={{ background: 'red', color: 'white' }}
                                        onClick={() => deleteGoal(g._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>

            </div>
        </div>
    );
}
