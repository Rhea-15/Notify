import React, { useState } from 'react';
import { Zap } from 'lucide-react';

const USERS = [
  { id: 1, name: 'Ananya Sharma', email: 'ananya@offbit.io', password: 'student123', role: 'student' },
  { id: 2, name: 'Rohit Verma',   email: 'rohit@offbit.io',  password: 'student123', role: 'student' },
  { id: 4, name: 'Arjun Mehta',   email: 'arjun@offbit.io',  password: 'mentor123',  role: 'mentor'  },
  { id: 5, name: 'Admin User',    email: 'admin@offbit.io',  password: 'admin123',   role: 'admin'   },
];

export default function Login({ onLogin }) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 600));
    const user = USERS.find(u => u.email === email && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid email or password.');
    }
    setLoading(false);
  };

  const quickLogin = (u) => {
    setEmail(u.email);
    setPassword(u.password);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-base)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div className="bg-mesh" />

      <div style={{ width: '100%', maxWidth: 420, padding: '0 24px', position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'var(--grad-blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 8px 32px rgba(79,142,247,0.3)',
          }}>
            <Zap size={24} color="white" />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--text-primary)' }}>
            Offbit
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>
            Sign in to your workspace
          </div>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 28 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Email
              </div>
              <input
                className="input"
                type="email"
                placeholder="you@offbit.io"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
                Password
              </div>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
            </div>

            {error && (
              <div style={{
                background: 'var(--red-dim)', border: '1px solid var(--red)',
                borderRadius: 8, padding: '10px 14px',
                fontSize: 13, color: 'var(--red)',
              }}>
                {error}
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              style={{ justifyContent: 'center', width: '100%', padding: '11px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? (
                <span style={{
                  display: 'inline-block', width: 14, height: 14,
                  border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white',
                  borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                }} />
              ) : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </div>
        </div>

        {/* Quick login pills */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
            Quick login (demo)
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {USERS.map(u => (
              <button
                key={u.id}
                onClick={() => quickLogin(u)}
                style={{
                  padding: '6px 14px', borderRadius: 100,
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  color: 'var(--text-secondary)', fontSize: 12, fontWeight: 500,
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--blue)'; e.currentTarget.style.color = 'var(--blue)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {u.name.split(' ')[0]} · {u.role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}