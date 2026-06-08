import React, { useEffect, useState } from 'react';
import { get, post } from '../api/client.js';
import { Clock, User, CheckCircle2 } from 'lucide-react';

function relTime(dt) {
  return new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function SessionsPage({ userId }) {
  const [sessions,     setSessions]     = useState([]);
  const [enrollments,  setEnrollments]  = useState([]);
  const [checkedIn,    setCheckedIn]    = useState({});
  const [loading,      setLoading]      = useState({});

  useEffect(() => {
    get('/sessions').then(d => setSessions(Array.isArray(d) ? d : []));
    get(`/sessions/enrollments/${userId}`).then(d => {
      if (Array.isArray(d)) {
        setEnrollments(d);
        const ci = {};
        d.forEach(e => { if (e.checked_in) ci[e.session_id] = true; });
        setCheckedIn(ci);
      }
    });
  }, [userId]);

  const handleCheckIn = async (sessionId) => {
    setLoading(prev => ({ ...prev, [sessionId]: true }));
    await post(`/sessions/${sessionId}/checkin`, { user_id: userId });
    setCheckedIn(prev => ({ ...prev, [sessionId]: true }));
    setLoading(prev => ({ ...prev, [sessionId]: false }));
  };

  const isEnrolled = (sessionId) => enrollments.some(e => e.session_id === sessionId);

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Schedule</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>My Sessions</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {sessions.length === 0 && (
          <div className="card" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 48 }}>No sessions found.</div>
        )}
        {sessions.map(s => {
          const dt       = new Date(s.scheduled_at);
          const isPast   = dt < new Date();
          const isNow    = !isPast && dt < new Date(Date.now() + 90 * 60000);
          const enrolled = isEnrolled(s.id);
          const didCI    = checkedIn[s.id];
          const isLoading = loading[s.id];

          return (
            <div key={s.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {/* Date block */}
              <div style={{
                background: isPast ? 'var(--bg-hover)' : isNow ? 'var(--green-dim)' : 'var(--blue-dim)',
                borderRadius: 10, padding: '10px 16px',
                textAlign: 'center', minWidth: 56, flexShrink: 0,
              }}>
                <div style={{ fontSize: 10, color: isPast ? 'var(--text-muted)' : isNow ? 'var(--green)' : 'var(--blue)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {dt.toLocaleString('en-US', { month: 'short' })}
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)', color: isPast ? 'var(--text-muted)' : isNow ? 'var(--green)' : 'var(--blue)', lineHeight: 1.1 }}>
                  {dt.getDate()}
                </div>
              </div>

              {/* Info */}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 15, color: isPast ? 'var(--text-muted)' : 'var(--text-primary)', marginBottom: 6 }}>
                  {s.title}
                </div>
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                    <Clock size={13} />
                    {relTime(s.scheduled_at)} — {relTime(new Date(dt.getTime() + 90 * 60000))}
                  </div>
                  {s.mentor_name && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                      <User size={13} /> {s.mentor_name}
                    </div>
                  )}
                </div>
              </div>

              {/* Action */}
              <div style={{ flexShrink: 0 }}>
                {didCI ? (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 12, fontWeight: 700, color: 'var(--green)',
                    background: 'var(--green-dim)', padding: '6px 14px',
                    borderRadius: 100, border: '1px solid rgba(79,188,142,0.3)',
                  }}>
                    <CheckCircle2 size={13} /> Checked in
                  </span>
                ) : isNow && enrolled ? (
                  <button
                    onClick={() => handleCheckIn(s.id)}
                    disabled={isLoading}
                    className="btn btn-primary"
                    style={{ padding: '7px 16px', fontSize: 12, opacity: isLoading ? 0.7 : 1 }}
                  >
                    {isLoading ? 'Checking in...' : 'Check In'}
                  </button>
                ) : (
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 100,
                    background: isPast ? 'var(--bg-hover)' : 'var(--blue-dim)',
                    color: isPast ? 'var(--text-muted)' : 'var(--blue)',
                  }}>
                    {isPast ? 'Completed' : 'Upcoming'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}