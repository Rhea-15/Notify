import React, { useState } from 'react';
import { Bell, Moon, Shield, Smartphone } from 'lucide-react';

const SECTIONS = [
  {
    icon: Bell, color: 'var(--blue)', bg: 'var(--blue-dim)',
    title: 'Notifications',
    settings: [
      { label: 'Session reminders',      sub: 'Get notified 1 hour before sessions',   key: 'session_reminder', default: true },
      { label: 'Task assignments',       sub: 'Notify when a new task is assigned',     key: 'task_assigned',    default: true },
      { label: 'Streak alerts',          sub: 'Alert when attendance streak is at risk', key: 'streak_alert',    default: true },
      { label: 'Weekly summary',         sub: 'Receive weekly progress digest',          key: 'weekly_summary',  default: false },
    ],
  },
  {
    icon: Smartphone, color: 'var(--green)', bg: 'var(--green-dim)',
    title: 'Channels',
    settings: [
      { label: 'In-app notifications',  sub: 'Show bell icon alerts inside the app',  key: 'ch_inapp',  default: true },
      { label: 'Email notifications',   sub: 'Send notifications to your email',       key: 'ch_email',  default: true },
    ],
  },
  {
    icon: Moon, color: 'var(--purple)', bg: 'var(--purple-dim)',
    title: 'Appearance',
    settings: [
      { label: 'Dark mode',     sub: 'Always use dark theme (default)',    key: 'dark_mode',    default: true },
      { label: 'Compact view', sub: 'Reduce spacing in lists and tables',  key: 'compact_view', default: false },
    ],
  },
  {
    icon: Shield, color: 'var(--amber)', bg: 'var(--amber-dim)',
    title: 'Privacy',
    settings: [
      { label: 'Show profile to mentors', sub: 'Mentors can view your full profile', key: 'profile_visible', default: true },
      { label: 'Activity status',         sub: 'Show when you were last active',     key: 'activity_status', default: false },
    ],
  },
];

export default function SettingsPage() {
  const [prefs, setPrefs] = useState(() => {
    const init = {};
    SECTIONS.forEach(sec => sec.settings.forEach(s => { init[s.key] = s.default; }));
    return init;
  });
  const [saved, setSaved] = useState(false);

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const save = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Preferences</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>Settings</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 680 }}>
        {SECTIONS.map(({ icon: Icon, color, bg, title, settings }) => (
          <div key={title} className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={15} color={color} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>{title}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {settings.map((s, i) => (
                <div key={s.key} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '14px 0',
                  borderBottom: i < settings.length - 1 ? '1px solid var(--border)' : 'none',
                }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{s.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.sub}</div>
                  </div>
                  <div
                    className={`toggle ${prefs[s.key] ? 'on' : ''}`}
                    onClick={() => toggle(s.key)}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

        <button className="btn btn-primary" onClick={save} style={{ alignSelf: 'flex-start', padding: '10px 28px' }}>
          Save Settings
        </button>
      </div>

      {saved && (
        <div className="toast">
          <div className="toast-icon">✓</div>
          <div>
            <div className="toast-title">Settings saved</div>
            <div className="toast-sub">Your preferences have been updated</div>
          </div>
        </div>
      )}
    </div>
  );
}