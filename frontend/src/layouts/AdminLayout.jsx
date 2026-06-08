import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Sliders, FileText, ScrollText,
  Settings, LogOut, Zap, ChevronDown, ShieldCheck
} from 'lucide-react';
import AdminDashboard from '../pages/AdminDashboard.jsx';
import RulesPage      from '../pages/RulesPage.jsx';
import TemplatesPage  from '../pages/TemplatesPage.jsx';
import LogsPage       from '../pages/LogsPage.jsx';

const NAV = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Sliders,         label: 'Rules',     path: '/admin/rules' },
  { icon: FileText,        label: 'Templates', path: '/admin/templates' },
  { icon: ScrollText,      label: 'Logs',      path: '/admin/logs' },
  { icon: Settings,        label: 'Settings',  path: '/admin/settings' },
];

export default function AdminLayout({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="layout">
      <div className="bg-mesh" />

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

        {/* Admin badge */}
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 10px', borderRadius: 8,
            background: 'var(--purple-dim)', border: '1px solid rgba(167,139,250,0.2)',
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: 'var(--purple)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0,
            }}>
              {user.name[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ fontSize: 10, color: 'var(--purple)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
                <ShieldCheck size={10} /> Admin
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
                  background: isActive ? 'var(--purple-dim)' : 'transparent',
                  color: isActive ? 'var(--purple)' : 'var(--text-secondary)',
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
        <header style={{
          height: 60, background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', padding: '0 28px',
          flexShrink: 0, zIndex: 10,
        }}>
          <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Admin Panel</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--purple)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: 'white',
            }}>{user.name[0]}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
              <div style={{ fontSize: 11, color: 'var(--purple)', fontWeight: 600 }}>Admin</div>
            </div>
            <ChevronDown size={14} color="var(--text-muted)" />
          </div>
        </header>

        <div className="page fade-up">
          {/* KEY FIX: relative paths (no /admin prefix) because App already matched /admin/* */}
          <Routes>
            <Route index                  element={<AdminDashboard />} />
            <Route path="rules"           element={<RulesPage />} />
            <Route path="templates"       element={<TemplatesPage />} />
            <Route path="logs"            element={<LogsPage />} />
            <Route path="settings"        element={<AdminDashboard />} />
            <Route path="*"               element={<Navigate to="/admin" />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}