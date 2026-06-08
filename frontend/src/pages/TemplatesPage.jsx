import React, { useEffect, useState } from 'react';
import { get, put } from '../api/client.js';
import { Pencil, Save, X } from 'lucide-react';

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    get('/templates').then(d => setTemplates(Array.isArray(d) ? d : []));
  }, []);

  const startEdit = (t) => { setEditing(t.id); setDraft({ ...t }); };
  const cancelEdit = () => { setEditing(null); setDraft({}); };

  const saveEdit = async () => {
    await put(`/templates/${editing}`, draft);
    setTemplates(prev => prev.map(t => t.id === editing ? { ...draft } : t));
    setSaved(true);
    setEditing(null);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>Templates</div>
        <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
          Edit notification copy. Use {'{variable}'} placeholders.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {templates.map(t => (
          <div key={t.id} className="card">
            {editing === t.id ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <input
                    className="input"
                    value={draft.name}
                    onChange={e => setDraft(d => ({ ...d, name: e.target.value }))}
                    style={{ fontWeight: 700, maxWidth: 260 }}
                  />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" onClick={saveEdit} style={{ padding: '7px 14px', fontSize: 12 }}>
                      <Save size={13} /> Save
                    </button>
                    <button className="btn btn-ghost" onClick={cancelEdit} style={{ padding: '7px 14px', fontSize: 12 }}>
                      <X size={13} /> Cancel
                    </button>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Subject</div>
                  <input className="input" value={draft.subject} onChange={e => setDraft(d => ({ ...d, subject: e.target.value }))} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Body</div>
                  <textarea
                    className="input"
                    value={draft.body}
                    onChange={e => setDraft(d => ({ ...d, body: e.target.value }))}
                    rows={3}
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{t.name}</div>
                  <button
                    className="btn btn-ghost"
                    onClick={() => startEdit(t)}
                    style={{ padding: '5px 12px', fontSize: 12 }}
                  >
                    <Pencil size={12} /> Edit
                  </button>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Subject: </span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{t.subject}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {t.body.replace(/\{(\w+)\}/g, (_, k) => `[${k}]`)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {saved && (
        <div className="toast">
          <div className="toast-icon">✓</div>
          <div>
            <div className="toast-title">Template saved</div>
            <div className="toast-sub">Changes applied successfully</div>
          </div>
        </div>
      )}
    </div>
  );
}