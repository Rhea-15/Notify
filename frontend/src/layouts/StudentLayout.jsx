import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, CheckSquare, TrendingUp,
  UserCircle, Settings, LogOut, Bell, Zap, ChevronDown
} from 'lucide-react';
import NotificationDrawer from '../components/NotificationDrawer.jsx';
import StudentDashboard from '../pages/StudentDashboard.jsx';
import { get } from '../api/client.js';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard',   path: '/student' },
  { icon: CalendarDays,    label: 'My Sessions', path: '/student/sessions' },
  { icon: CheckSquare,     label: 'Tasks',        path: '/student/tasks' },
  { icon: TrendingUp,      label: 'Progress',     path: '/student/progress' },
  { icon: UserCircle,      label: 'Profile',      path: '/student/profile' },
  { icon: Settings,        label: 'Settings',     path: '/student/settings' },
];

export default function StudentLayout({ user, onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [unread, setUnread]         = useState(0);
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    const fetch = async () => {
      const data = await get(`/notifications?user_id=${user.id}&unread=true`);
      setUnread(Array.isArray(data) ? data.length : 0);
    };
    fetch();
    const iv = setInterval(fetch, 30000);
    return () => clearInterval(iv);
  }, [user.id]);

  return (
    <div className="layout">
      <div className="bg-mesh" />

      {/* Sidebar */}
      <aside style={{
        width: 'var(--sidebar-w)', minWidth: 'var(--sidebar-w)',
        background: 'var(--bg-surface)', borderRight: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column',
        padding: '20px 0', flexShrink: 0,
        height: '100vh', overflowY: 'auto', zIndex: 2,
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
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700 }}>Offbit</span>
          </div>
        </div>

        {/* User chip */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 8,
            background: 'var(--bg-card)', border: '1px solid var(--border)',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--grad-blue)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {user.name[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--blue)', textTransform: 'capitalize', fontWeight: 600 }}>
                {user.role}
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {NAV.map(({ icon: Icon, label, path }) => {
            const isActive = location.pathname === path;
            return (
              <button
                key={label}
                onClick={() => navigate(path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 8,
                  background: isActive ? 'var(--blue-dim)' : 'transparent',
                  color: isActive ? 'var(--blue)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 13, transition: 'all 0.15s',
                  width: '100%', textAlign: 'left', cursor: 'pointer',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
              >
                <Icon size={16} strokeWidth={isActive ? 2.5 : 1.8} />
                {label}
              </button>
            );
          })}

          {/* Bell */}
          <button
            onClick={() => setDrawerOpen(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8,
              background: 'transparent', color: 'var(--text-secondary)',
              fontSize: 13, fontWeight: 400,
              width: '100%', textAlign: 'left', cursor: 'pointer',
              transition: 'all 0.15s', marginTop: 4,
              borderTop: '1px solid var(--border)', paddingTop: 13,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--blue-dim)'; e.currentTarget.style.color = 'var(--blue)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <div style={{ position: 'relative' }}>
              <Bell size={16} strokeWidth={1.8} />
              {unread > 0 && (
                <span style={{
                  position: 'absolute', top: -5, right: -6,
                  background: 'var(--red)', color: 'white',
                  fontSize: 9, fontWeight: 700,
                  width: 15, height: 15, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1.5px solid var(--bg-surface)',
                }}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </div>
            Notifications
            {unread > 0 && (
              <span style={{
                marginLeft: 'auto',
                background: 'var(--red-dim)', color: 'var(--red)',
                fontSize: 11, fontWeight: 700,
                padding: '1px 7px', borderRadius: 100,
              }}>
                {unread}
              </span>
            )}
          </button>
        </nav>

        {/* Logout */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={onLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '9px 12px', borderRadius: 8, width: '100%',
              background: 'transparent', color: 'var(--text-muted)',
              fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.background = 'var(--red-dim)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content" style={{ position: 'relative', zIndex: 1 }}>
        {/* Topbar */}
        <header style={{
          height: 60, background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 28px',
          flexShrink: 0, zIndex: 10,
        }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Student Dashboard</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--grad-blue)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: 'white',
            }}>{user.name[0]}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </div>
        </header>

        <div className="page fade-up">
          <Routes>
            <Route path="/student"          element={<StudentDashboard userId={user.id} userName={user.name} />} />
            <Route path="/student/sessions" element={<StudentDashboard userId={user.id} userName={user.name} />} />
            <Route path="/student/tasks"    element={<StudentDashboard userId={user.id} userName={user.name} />} />
            <Route path="/student/progress" element={<StudentDashboard userId={user.id} userName={user.name} />} />
            <Route path="/student/profile"  element={<StudentDashboard userId={user.id} userName={user.name} />} />
            <Route path="/student/settings" element={<StudentDashboard userId={user.id} userName={user.name} />} />
            <Route path="*"                 element={<Navigate to="/student" />} />
          </Routes>
        </div>
      </div>

      {drawerOpen && (
        <NotificationDrawer
          userId={user.id}
          onClose={() => {
            setDrawerOpen(false);
            get(`/notifications?user_id=${user.id}&unread=true`)
              .then(d => setUnread(Array.isArray(d) ? d.length : 0));
          }}
        />
      )}
    </div>
  );
}