import React from 'react';

export default function StatCard({ icon: Icon, color, bg, label, value, sub }) {
  return (
    <div className="card" style={{
      display: 'flex', flexDirection: 'column', gap: 12,
      background: `linear-gradient(145deg, ${bg}22 0%, var(--bg-card) 100%)`,
      border: `1px solid ${bg}33`,
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -20, right: -20,
        width: 80, height: 80, borderRadius: '50%',
        background: `${bg}18`,
      }} />
      <div style={{
        width: 36, height: 36, borderRadius: 9,
        background: bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={17} color={color} strokeWidth={2} />
      </div>
      <div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
        <div style={{
          fontSize: 28, fontWeight: 800,
          fontFamily: 'var(--font-display)',
          color: 'var(--text-primary)',
          lineHeight: 1,
        }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
      </div>
    </div>
  );
}