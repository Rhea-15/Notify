import React, { useEffect, useState } from 'react';
import { Bell, CheckCircle2, XCircle, Clock, Users } from 'lucide-react';
import { get } from '../api/client.js';
import StatCard from '../components/StatCard.jsx';

export default function AdminDashboard() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    get('/logs').then(d => setLogs(Array.isArray(d) ? d.slice(0, 6) : []));
  }, []);

  const sent = logs.filter(l => l.status === 'sent').length;
  const failed = logs.filter(l => l.status === 'failed').length;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Overview</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>
          Notification Engine
        </div>
      </div>

      <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
        <StatCard icon={Bell} color="var(--blue)" bg="var(--blue-dim)" label="Total Sent" value={logs.length} />
        <StatCard icon={CheckCircle2} color="var(--green)" bg="var(--green-dim)" label="Delivered" value={sent} />
        <StatCard icon={XCircle} color="var(--red)" bg="var(--red-dim)" label="Failed" value={failed} />
        <StatCard icon={Users} color="var(--purple)" bg="var(--purple-dim)" label="Users Notified" value={new Set(logs.map(l => l.user_id)).size} />
      </div>

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 18 }}>Recent Activity</div>
        <div className="table-wrap">
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
                  <td><code style={{ fontSize: 12, color: 'var(--blue)', background: 'var(--blue-dim)', padding: '2px 8px', borderRadius: 4 }}>{l.trigger_type}</code></td>
                  <td style={{ textTransform: 'capitalize' }}>{l.channel}</td>
                  <td>
                    <span className="badge" style={{
                      background: l.status === 'sent' ? 'var(--green-dim)' : l.status === 'failed' ? 'var(--red-dim)' : 'var(--amber-dim)',
                      color: l.status === 'sent' ? 'var(--green)' : l.status === 'failed' ? 'var(--red)' : 'var(--amber)',
                    }}>{l.status}</span>
                  </td>
                  <td>{new Date(l.sent_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}