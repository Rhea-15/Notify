import React, { useEffect, useState } from 'react';
import { CalendarDays, ClipboardList, Flame, CheckCircle2 } from 'lucide-react';
import { get } from '../api/client.js';
import StatCard from '../components/StatCard.jsx';

function relTime(dt) {
  const d = new Date(dt);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function StudentDashboard({ userId, userName }) {
  const [sessions, setSessions] = useState([]);
  const [tasks,    setTasks]    = useState([]);
  const [stats,    setStats]    = useState(null);

  useEffect(() => {
    get('/sessions').then(d => setSessions(Array.isArray(d) ? d.slice(0, 3) : []));
    get(`/tasks?user_id=${userId}`).then(d => setTasks(Array.isArray(d) ? d : []));
    get(`/stats/${userId}`).then(d => setStats(d));
  }, [userId]);

  const pending = tasks.filter(t => t.status === 'pending').length;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Welcome back,</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>{userName || 'Student'}</div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        <StatCard icon={CalendarDays} color="var(--blue)"   bg="var(--blue-dim)"   label="Upcoming Sessions" value={sessions.length} />
        <StatCard icon={ClipboardList} color="var(--green)" bg="var(--green-dim)"  label="Tasks Pending"     value={pending} />
        <StatCard icon={Flame}        color="var(--amber)"  bg="var(--amber-dim)"  label="Current Streak"    value={stats ? stats.streak : '—'} sub="days" />
        <StatCard icon={CheckCircle2} color="var(--teal)"   bg="var(--teal-dim)"   label="Completed Tasks"   value={stats ? stats.doneTasks : '—'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Upcoming Sessions */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Upcoming Sessions</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sessions.length === 0 && <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No upcoming sessions.</div>}
            {sessions.map(s => (
              <div key={s.id} className="card-sm" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  background: 'var(--blue-dim)', borderRadius: 8,
                  padding: '6px 10px', textAlign: 'center', minWidth: 44, flexShrink: 0,
                }}>
                  <div style={{ fontSize: 10, color: 'var(--blue)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {new Date(s.scheduled_at).toLocaleString('en-US', { month: 'short' })}
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--blue)', fontFamily: 'var(--font-display)', lineHeight: 1 }}>
                    {new Date(s.scheduled_at).getDate()}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text-primary)', marginBottom: 2 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {relTime(s.scheduled_at)} — {relTime(new Date(new Date(s.scheduled_at).getTime() + 90 * 60000))}
                  </div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, background: 'var(--blue-dim)', color: 'var(--blue)', padding: '3px 10px', borderRadius: 100 }}>
                  Upcoming
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* My Tasks */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ fontWeight: 700, fontSize: 15 }}>My Tasks</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {tasks.slice(0, 5).map(t => {
              const due = new Date(t.due_at);
              const isOverdue = due < new Date() && t.status !== 'done';
              const isSoon = !isOverdue && due < new Date(Date.now() + 2 * 86400000) && t.status !== 'done';
              return (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 0', borderBottom: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: '50%',
                    border: `2px solid ${t.status === 'done' ? 'var(--green)' : 'var(--border-strong)'}`,
                    background: t.status === 'done' ? 'var(--green-dim)' : 'transparent',
                    flexShrink: 0,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 500,
                      color: t.status === 'done' ? 'var(--text-muted)' : 'var(--text-primary)',
                      textDecoration: t.status === 'done' ? 'line-through' : 'none',
                    }}>{t.title}</div>
                    <div style={{
                      fontSize: 11, marginTop: 2,
                      color: isOverdue ? 'var(--red)' : isSoon ? 'var(--amber)' : 'var(--text-muted)',
                    }}>
                      {isOverdue ? 'Overdue' : `Due in ${Math.ceil((due - Date.now()) / (1000 * 60 * 60 * 24))} days`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}