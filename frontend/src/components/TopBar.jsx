import React, { useEffect, useState } from 'react';
import { Bell, ChevronDown } from 'lucide-react';
import { get } from '../api/client.js';

export default function TopBar({ user, view, onBellClick }) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (view !== 'student') return;
    const fetchUnread = async () => {
      const data = await get(`/notifications?user_id=${user.id}&unread=true`);
      setUnread(Array.isArray(data) ? data.length : 0);
    };
    fetchUnread();
    const iv = setInterval(fetchUnread, 30000);
    return () => clearInterval(iv);
  }, [view, user.id]);

  return (
    <header style={{
      height: 60,
      background: 'var(--bg-surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      flexShrink: 0,
      position: 'relative',
      zIndex: 10,
    }}>
      <div>
        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>
          {view === 'student' ? 'Student Dashboard' : 'Admin Panel'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {view === 'student' && (
          <button
            onClick={onBellClick}
            style={{
              position: 'relative',
              width: 36, height: 36,
              borderRadius: 8,
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-secondary)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.color = 'var(--blue)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <Bell size={16} />
            {unread > 0 && (
              <span style={{
                position: 'absolute', top: -4, right: -4,
                background: 'var(--red)',
                color: 'white',
                fontSize: 10, fontWeight: 700,
                width: 18, height: 18,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid var(--bg-surface)',
                animation: 'pulse-dot 2s ease infinite',
              }}>
                {unread}
              </span>
            )}
          </button>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--grad-blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, color: 'white',
          }}>
            {user.name[0]}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</div>
          </div>
          <ChevronDown size={14} color="var(--text-muted)" />
        </div>
      </div>
    </header>
  );
}