import React, { useEffect, useState } from 'react';
import { patch } from '../api/client.js';
import { get } from '../api/client.js';

export default function RulesPage() {
  const [rules, setRules] = useState([]);

  useEffect(() => {
    get('/rules').then(d => setRules(Array.isArray(d) ? d : []));
  }, []);

  const toggle = async (id, current) => {
    await patch(`/rules/${id}`, { is_active: !current });
    setRules(prev => prev.map(r => r.id === id ? { ...r, is_active: current ? 0 : 1 } : r));
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>Rules</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          Configure trigger conditions, cooldowns, and channels.
        </div>
      </div>

      <div className="card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Trigger Type</th>
                <th>Channel</th>
                <th>Cooldown</th>
                <th>Template</th>
                <th>Last Triggered</th>
                <th>Active</th>
              </tr>
            </thead>
            <tbody>
              {rules.map(r => (
                <tr key={r.id}>
                  <td>
                    <code style={{ fontSize: 12, color: 'var(--blue)', background: 'var(--blue-dim)', padding: '2px 8px', borderRadius: 4 }}>
                      {r.trigger_type}
                    </code>
                  </td>
                  <td style={{ textTransform: 'capitalize', color: 'var(--text-primary)' }}>{r.channel}</td>
                  <td style={{ color: r.cooldown_hours === 0 ? 'var(--green)' : 'var(--text-secondary)' }}>
                    {r.cooldown_hours === 0 ? 'Instant' : `${r.cooldown_hours}h`}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{r.template_name}</td>
                  <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {r.last_triggered ? new Date(r.last_triggered).toLocaleString() : '—'}
                  </td>
                  <td>
                    <div
                      className={`toggle ${r.is_active ? 'on' : ''}`}
                      onClick={() => toggle(r.id, r.is_active)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}