import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, CheckSquare, TrendingUp,
  UserCircle, Settings, LogOut, Bell, AlignLeft, Users,
  Sliders, FileText, ScrollText, Zap
} from 'lucide-react';

const studentNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: CalendarDays, label: 'My Sessions', path: '/' },
  { icon: CheckSquare, label: 'Tasks', path: '/' },
  { icon: TrendingUp, label: 'Progress', path: '/' },
  { icon: UserCircle, label: 'Profile', path: '/' },
  { icon: Settings, label: 'Settings', path: '/' },
];

const adminNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Sliders, label: 'Rules', path: '/rules' },
  { icon: FileText, label: 'Templates', path: '/templates' },
  { icon: ScrollText, label: 'Logs', path: '/logs' },
  { icon: Settings, label: 'Settings', path: '/' },
];

export default function Sidebar({ view, setView }) {
  const navigate = useNavigate();
  const location = useLocation();
  const nav = view === 'student' ? studentNav : adminNav;

  return (
    <aside style={{
      width: 'var(--sidebar-w)',
      background: 'var(--bg-surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 0',
      flexShrink: 0,
      position: 'relative',
      zIndex: 2,
    }}>
      {/* Logo */}
      <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'var(--grad-blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Zap size={16} color="white" />
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            Offbit
          </span>
        </div>
      </div>

      {/* View toggle */}
      <div style={{ padding: '16px 16px 8px' }}>
        <div style={{
          display: 'flex',
          background: 'var(--bg-base)',
          borderRadius: 8,
          padding: 3,
          gap: 3,
          border: '1px solid var(--border)',
        }}>
          {['student', 'admin'].map(v => (
            <button
              key={v}
              onClick={() => { setView(v); navigate('/'); }}
              style={{
                flex: 1,
                padding: '5px 0',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 600,
                background: view === v ? 'var(--grad-blue)' : 'transparent',
                color: view === v ? 'white' : 'var(--text-muted)',
                textTransform: 'capitalize',
                transition: 'all 0.2s',
              }}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {nav.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path && (path !== '/' || (path === '/' && location.pathname === '/'));
          const isActive = location.pathname === path;
          return (
            <button
              key={label}
              onClick={() => navigate(path)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                background: isActive ? 'var(--blue-dim)' : 'transparent',
                color: isActive ? 'var(--blue)' : 'var(--text-secondary)',
                fontWeight: isActive ? 600 : 400,
                fontSize: 13,
                transition: 'all 0.15s',
                width: '100%',
                textAlign: 'left',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
            >
              <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '9px 12px', borderRadius: 8, width: '100%',
            background: 'transparent', color: 'var(--text-muted)',
            fontSize: 13, transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-dim)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </aside>
  );
}