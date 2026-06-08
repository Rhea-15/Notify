import React, { useEffect, useState } from 'react';
import { get } from '../api/client.js';
import { Flame, CheckCircle2, CalendarDays, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard.jsx';

export default function ProgressPage({ userId }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    get(`/stats/${userId}`).then(d => setStats(d));
  }, [userId]);

  if (!stats) return (
    <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
  );

  const pct = stats.totalTasks > 0 ? Math.round((stats.doneTasks / stats.totalTasks) * 100) : 0;
  const maxVal = Math.max(...stats.weeks.map(w => Math.max(w.sessions, w.tasks)), 1);
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Analytics</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>My Progress</div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        <StatCard icon={Flame}        color="var(--amber)"  bg="var(--amber-dim)"  label="Current Streak"    value={stats.streak}    sub="days" />
        <StatCard icon={CheckCircle2} color="var(--green)"  bg="var(--green-dim)"  label="Tasks Completed"   value={stats.doneTasks} />
        <StatCard icon={CalendarDays} color="var(--blue)"   bg="var(--blue-dim)"   label="Sessions Attended" value={stats.attended} />
        <StatCard icon={TrendingUp}   color="var(--purple)" bg="var(--purple-dim)" label="Completion Rate"   value={`${pct}%`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        {/* Donut */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Task Completion</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <div style={{ position: 'relative', width: 130, height: 130 }}>
              <svg viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border-strong)" strokeWidth="12" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke="var(--green)" strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 50}`}
                  strokeDashoffset={`${2 * Math.PI * 50 * (1 - pct / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{pct}%</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>done</div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--green)', fontFamily: 'var(--font-display)' }}>{stats.doneTasks}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Completed</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 22, color: 'var(--amber)', fontFamily: 'var(--font-display)' }}>{stats.totalTasks - stats.doneTasks}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Remaining</div>
            </div>
          </div>
        </div>

        {/* Bar chart */}
        <div className="card">
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20 }}>Weekly Activity</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 120 }}>
            {stats.weeks.map(w => (
              <div key={w.week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, height: '100%', justifyContent: 'flex-end' }}>
                <div style={{ width: '100%', display: 'flex', gap: 3, alignItems: 'flex-end', height: '100%' }}>
                  <div style={{
                    flex: 1, borderRadius: '4px 4px 0 0',
                    background: 'var(--blue-dim)', border: '1px solid rgba(79,142,247,0.3)',
                    height: `${(w.sessions / maxVal) * 100}%`, minHeight: 4,
                  }} />
                  <div style={{
                    flex: 1, borderRadius: '4px 4px 0 0',
                    background: 'var(--green-dim)', border: '1px solid rgba(79,188,142,0.3)',
                    height: `${(w.tasks / maxVal) * 100}%`, minHeight: 4,
                  }} />
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6 }}>{w.week}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--blue-dim)', border: '1px solid rgba(79,142,247,0.3)' }} />Sessions
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-muted)' }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: 'var(--green-dim)', border: '1px solid rgba(79,188,142,0.3)' }} />Tasks
            </div>
          </div>
        </div>
      </div>

      {/* Real activity calendar */}
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
          Activity This Month
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 400, marginLeft: 10 }}>
            {stats.activeDays.length} active days
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const active = stats.activeDays.includes(day);
            return (
              <div key={day} title={`Day ${day}${active ? ' — attended' : ''}`} style={{
                width: 28, height: 28, borderRadius: 6,
                background: active ? 'var(--blue-dim)' : 'var(--bg-card)',
                border: active ? '1px solid rgba(79,142,247,0.3)' : '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, color: active ? 'var(--blue)' : 'var(--text-muted)',
                fontWeight: active ? 700 : 400,
              }}>
                {day}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}