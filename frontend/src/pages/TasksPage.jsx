import React, { useEffect, useState } from 'react';
import { get, patch } from '../api/client.js';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export default function TasksPage({ userId }) {
  const [tasks,  setTasks]  = useState([]);
  const [filter, setFilter] = useState('all');

  const load = () => get(`/tasks?user_id=${userId}`).then(d => setTasks(Array.isArray(d) ? d : []));

  useEffect(() => { load(); }, [userId]);

  const toggleDone = async (t) => {
    const newStatus = t.status === 'done' ? 'pending' : 'done';
    await patch(`/tasks/${t.id}/status`, { status: newStatus });
    setTasks(prev => prev.map(x => x.id === t.id ? { ...x, status: newStatus } : x));
  };

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const pending  = tasks.filter(t => t.status === 'pending').length;
  const done     = tasks.filter(t => t.status === 'done').length;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Work</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>My Tasks</div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total',   count: tasks.length, color: 'var(--blue)',  bg: 'var(--blue-dim)'  },
          { label: 'Pending', count: pending,       color: 'var(--amber)', bg: 'var(--amber-dim)' },
          { label: 'Done',    count: done,          color: 'var(--green)', bg: 'var(--green-dim)' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className="card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle2 size={18} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{count}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {['all', 'pending', 'done'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 16px', borderRadius: 100, fontSize: 12, fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s', textTransform: 'capitalize',
            background: filter === f ? 'var(--blue-dim)' : 'var(--bg-card)',
            color: filter === f ? 'var(--blue)' : 'var(--text-muted)',
            border: filter === f ? '1px solid rgba(79,142,247,0.3)' : '1px solid var(--border)',
          }}>
            {f}
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No tasks found.</div>
        )}
        {filtered.map((t, i) => {
          const due = new Date(t.due_at);
          const isOverdue = due < new Date() && t.status !== 'done';
          const isSoon = !isOverdue && due < new Date(Date.now() + 2 * 86400000) && t.status !== 'done';
          return (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              {/* Clickable circle to toggle done */}
              <div
                onClick={() => toggleDone(t)}
                title={t.status === 'done' ? 'Mark pending' : 'Mark done'}
                style={{
                  width: 22, height: 22, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                  border: `2px solid ${t.status === 'done' ? 'var(--green)' : isOverdue ? 'var(--red)' : 'var(--border-strong)'}`,
                  background: t.status === 'done' ? 'var(--green-dim)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.15s',
                }}
              >
                {t.status === 'done' && <CheckCircle2 size={13} color="var(--green)" />}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: 14, fontWeight: 500, marginBottom: 4,
                  color: t.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: t.status === 'done' ? 'line-through' : 'none',
                }}>
                  {t.title}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                  {isOverdue ? (
                    <><AlertTriangle size={12} color="var(--red)" /><span style={{ color: 'var(--red)' }}>Overdue</span></>
                  ) : isSoon ? (
                    <><Clock size={12} color="var(--amber)" /><span style={{ color: 'var(--amber)' }}>Due soon — {due.toLocaleDateString()}</span></>
                  ) : (
                    <><Clock size={12} color="var(--text-muted)" /><span style={{ color: 'var(--text-muted)' }}>Due {due.toLocaleDateString()}</span></>
                  )}
                </div>
              </div>

              <span style={{
                fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 100,
                background: t.status === 'done' ? 'var(--green-dim)' : isOverdue ? 'var(--red-dim)' : 'var(--amber-dim)',
                color: t.status === 'done' ? 'var(--green)' : isOverdue ? 'var(--red)' : 'var(--amber)',
              }}>
                {t.status === 'done' ? 'Done' : isOverdue ? 'Overdue' : 'Pending'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}