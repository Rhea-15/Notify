import React, { useEffect, useState, useCallback } from 'react';
import { X, CalendarClock, Flame, UserX, ClipboardList, BarChart3, AlertCircle } from 'lucide-react';
import { get, patch } from '../api/client.js';

const TYPE_META = {
  session_reminder: { icon: CalendarClock, color: 'var(--blue)', bg: 'var(--blue-dim)' },
  missed_session: { icon: AlertCircle, color: 'var(--red)', bg: 'var(--red-dim)' },
  streak_alert: { icon: Flame, color: 'var(--amber)', bg: 'var(--amber-dim)' },
  profile_incomplete: { icon: UserX, color: 'var(--purple)', bg: 'var(--purple-dim)' },
  task_assigned: { icon: ClipboardList, color: 'var(--green)', bg: 'var(--green-dim)' },
  weekly_summary: { icon: BarChart3, color: 'var(--teal)', bg: 'var(--teal-dim)' },
};

function relTime(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr${hrs > 1 ? 's' : ''} ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationDrawer({ userId, onClose }) {
  const [notifs, setNotifs] = useState([]);

  const load = useCallback(async () => {
    const data = await get(`/notifications?user_id=${userId}`);
    setNotifs(Array.isArray(data) ? data : []);
  }, [userId]);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id) => {
    await patch(`/notifications/${id}/read`);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
  };

  const markAllRead = async () => {
    await patch(`/notifications/read-all/${userId}`);
    setNotifs(prev => prev.map(n => ({ ...n, is_read: 1 })));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 50, backdropFilter: 'blur(2px)',
        }}
      />
      {/* Drawer */}
      <div
        className="slide-in"
        style={{
          position: 'fixed', right: 0, top: 0, bottom: 0, width: 380,
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border)',
          zIndex: 51,
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>Notifications</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              {notifs.filter(n => !n.is_read).length} unread
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-ghost" onClick={markAllRead} style={{ padding: '6px 12px', fontSize: 12 }}>
              Mark all read
            </button>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
          {notifs.length === 0 && (
            <div style={{ padding: '48px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No notifications yet
            </div>
          )}
          {notifs.map(n => {
            const meta = TYPE_META[n.trigger_type] || TYPE_META['session_reminder'];
            const Icon = meta.icon;
            return (
              <div
                key={n.id}
                onClick={() => markRead(n.id)}
                style={{
                  display: 'flex', gap: 14, padding: '14px 20px',
                  cursor: 'pointer',
                  background: n.is_read ? 'transparent' : 'rgba(79,142,247,0.03)',
                  borderLeft: n.is_read ? '3px solid transparent' : `3px solid ${meta.color}`,
                  transition: 'background 0.15s',
                  position: 'relative',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = n.is_read ? 'transparent' : 'rgba(79,142,247,0.03)'}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: meta.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={17} color={meta.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: n.is_read ? 400 : 600,
                    color: n.is_read ? 'var(--text-secondary)' : 'var(--text-primary)',
                    marginBottom: 3,
                  }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4 }}>{n.body}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0, paddingTop: 2 }}>
                  {relTime(n.created_at)}
                </div>
                {!n.is_read && (
                  <div style={{
                    position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                    width: 7, height: 7, borderRadius: '50%', background: 'var(--blue)',
                  }} />
                )}
              </div>
            );
          })}
        </div>

        <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border)' }}>
          <button
            style={{
              width: '100%', padding: '10px',
              background: 'var(--blue-dim)',
              border: '1px solid rgba(79,142,247,0.2)',
              borderRadius: 8, color: 'var(--blue)',
              fontSize: 13, fontWeight: 600,
            }}
          >
            View all notifications
          </button>
        </div>
      </div>
    </>
  );
}