import React, { useEffect, useState } from 'react';
import { get, post } from '../api/client.js';
import { Send, FileJson, CheckCircle2 } from 'lucide-react';

const TRIGGERS = ['all','session_reminder','missed_session','streak_alert','profile_incomplete','task_assigned','weekly_summary'];
const CHANNELS = ['all','email','in_app','both'];
const STATUSES = ['all','sent','failed'];

export default function LogsPage() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ trigger_type: 'all', channel: 'all', status: 'all' });
  const [manualUser, setManualUser] = useState('1');
  const [manualType, setManualType] = useState('session_reminder');
  const [toast, setToast] = useState(null);
  const [firing, setFiring] = useState(false);

  const loadLogs = async () => {
    const qs = new URLSearchParams(filters).toString();
    const data = await get(`/logs?${qs}`);
    setLogs(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    get('/users').then(d => setUsers(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => { loadLogs(); }, [filters]);

  const fire = async () => {
    setFiring(true);
    const res = await post('/trigger', { user_id: parseInt(manualUser), trigger_type: manualType });
    setFiring(false);
    const userName = users.find(u => u.id === parseInt(manualUser))?.name || 'user';
    setToast({ ok: res.success, msg: res.success ? `${manualType} sent to ${userName}` : res.message });
    setTimeout(() => { setToast(null); loadLogs(); }, 3000);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>
      {/* Logs table */}
      <div>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>Logs</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>Full notification dispatch history</div>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {[
            { key: 'trigger_type', opts: TRIGGERS },
            { key: 'channel', opts: CHANNELS },
            { key: 'status', opts: STATUSES },
          ].map(({ key, opts }) => (
            <select
              key={key}
              className="input"
              style={{ width: 'auto', flex: 1 }}
              value={filters[key]}
              onChange={e => setFilters(f => ({ ...f, [key]: e.target.value }))}
            >
              {opts.map(o => <option key={o} value={o}>{o === 'all' ? `All ${key.replace('_', ' ')}s` : o}</option>)}
            </select>
          ))}
        </div>

        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap" style={{ border: 'none', borderRadius: 'var(--radius)' }}>
            <table>
              <thead>
                <tr>
                  <th>User</th><th>Trigger</th><th>Channel</th><th>Status</th><th>Sent At</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id}>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{l.user_name}</td>
                    <td>
                      <code style={{ fontSize: 11, color: 'var(--blue)', background: 'var(--blue-dim)', padding: '2px 7px', borderRadius: 4 }}>
                        {l.trigger_type}
                      </code>
                    </td>
                    <td style={{ textTransform: 'capitalize', fontSize: 12 }}>{l.channel}</td>
                    <td>
                      <span className="badge" style={{
                        background: l.status === 'sent' ? 'var(--green-dim)' : l.status === 'failed' ? 'var(--red-dim)' : 'var(--amber-dim)',
                        color: l.status === 'sent' ? 'var(--green)' : l.status === 'failed' ? 'var(--red)' : 'var(--amber)',
                      }}>{l.status}</span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(l.sent_at).toLocaleString()}</td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>No logs found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Manual Trigger */}
      <div style={{ position: 'sticky', top: 0 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Manual Trigger</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Fire a notification immediately</div>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Select User</div>
            <select className="input" value={manualUser} onChange={e => setManualUser(e.target.value)}>
              {users.filter(u => u.role !== 'admin').map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </div>
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em' }}>Trigger Type</div>
            <select className="input" value={manualType} onChange={e => setManualType(e.target.value)}>
              {TRIGGERS.filter(t => t !== 'all').map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-primary"
            onClick={fire}
            disabled={firing}
            style={{ justifyContent: 'center', opacity: firing ? 0.7 : 1 }}
          >
            {firing ? (
              <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            ) : <Send size={14} />}
            {firing ? 'Firing...' : 'Fire Now'}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast" style={{ borderColor: toast.ok ? 'var(--green)' : 'var(--red)' }}>
          <CheckCircle2 size={20} color={toast.ok ? 'var(--green)' : 'var(--red)'} />
          <div>
            <div className="toast-title">{toast.ok ? 'Trigger fired!' : 'Blocked'}</div>
            <div className="toast-sub">{toast.msg}</div>
          </div>
        </div>
      )}
    </div>
  );
}