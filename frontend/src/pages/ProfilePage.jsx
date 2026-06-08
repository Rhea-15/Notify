import React, { useEffect, useState } from 'react';
import { get, patch } from '../api/client.js';
import { User, Mail, Briefcase, Clock, BookOpen, Pencil, Save, X } from 'lucide-react';

export default function ProfilePage({ userId }) {
  const [profile,  setProfile]  = useState(null);
  const [editing,  setEditing]  = useState(false);
  const [draft,    setDraft]    = useState({});
  const [saving,   setSaving]   = useState(false);
  const [toast,    setToast]    = useState(false);

  const load = () => get(`/users/${userId}`).then(d => setProfile(d));
  useEffect(() => { load(); }, [userId]);

  const startEdit = () => { setDraft({ bio: profile.bio || '', skills: profile.skills || '', availability: profile.availability || '' }); setEditing(true); };
  const cancelEdit = () => setEditing(false);

  const save = async () => {
    setSaving(true);
    await patch(`/users/${userId}`, draft);
    await load();
    setSaving(false);
    setEditing(false);
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  };

  if (!profile) return <div style={{ padding: 48, textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>;

  const skills = profile.skills ? profile.skills.split(',') : [];
  const filledCount = [profile.bio, profile.skills, profile.availability].filter(Boolean).length;
  const incomplete = filledCount < 3;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Account</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800 }}>My Profile</div>
      </div>

      {incomplete && !editing && (
        <div style={{
          background: 'var(--amber-dim)', border: '1px solid rgba(247,178,79,0.3)',
          borderRadius: 10, padding: '12px 18px', marginBottom: 20,
          fontSize: 13, color: 'var(--amber)',
        }}>
          ⚠️ Profile is incomplete — fill in the missing fields to unlock all features.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Avatar card */}
        <div className="card" style={{ textAlign: 'center', padding: 28 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'var(--grad-blue)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, fontWeight: 800, color: 'white', margin: '0 auto 16px',
          }}>
            {profile.name[0]}
          </div>
          <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-primary)', marginBottom: 4 }}>{profile.name}</div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'var(--blue-dim)', color: 'var(--blue)',
            padding: '3px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600, textTransform: 'capitalize',
          }}>
            {profile.role}
          </div>
          <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
              <Mail size={14} color="var(--text-muted)" /> {profile.email}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--text-secondary)' }}>
              <Clock size={14} color="var(--text-muted)" />
              {profile.availability || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Not set</span>}
            </div>
          </div>
          <div style={{ marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
              <span>Completion</span><span>{Math.round((filledCount / 3) * 100)}%</span>
            </div>
            <div style={{ height: 6, borderRadius: 100, background: 'var(--border-strong)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 100, background: 'var(--grad-blue)',
                width: `${Math.round((filledCount / 3) * 100)}%`, transition: 'width 0.5s ease',
              }} />
            </div>
          </div>
        </div>

        {/* Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Edit button */}
          {!editing ? (
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={startEdit} style={{ gap: 8 }}>
                <Pencil size={13} /> Edit Profile
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button className="btn btn-primary" onClick={save} disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
                <Save size={13} /> {saving ? 'Saving...' : 'Save'}
              </button>
              <button className="btn btn-ghost" onClick={cancelEdit}><X size={13} /> Cancel</button>
            </div>
          )}

          {/* Bio */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <User size={16} color="var(--blue)" />
              <div style={{ fontWeight: 700, fontSize: 14 }}>About</div>
            </div>
            {editing ? (
              <textarea
                className="input"
                value={draft.bio}
                onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))}
                rows={3} placeholder="Write something about yourself..."
                style={{ resize: 'vertical' }}
              />
            ) : (
              <div style={{ fontSize: 14, color: profile.bio ? 'var(--text-secondary)' : 'var(--text-muted)', lineHeight: 1.7, fontStyle: profile.bio ? 'normal' : 'italic' }}>
                {profile.bio || 'No bio added yet.'}
              </div>
            )}
          </div>

          {/* Skills */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <BookOpen size={16} color="var(--green)" />
              <div style={{ fontWeight: 700, fontSize: 14 }}>Skills</div>
            </div>
            {editing ? (
              <div>
                <input
                  className="input"
                  value={draft.skills}
                  onChange={e => setDraft(d => ({ ...d, skills: e.target.value }))}
                  placeholder="e.g. React, Node.js, Python (comma separated)"
                />
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Separate skills with commas</div>
              </div>
            ) : skills.length > 0 ? (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {skills.map(s => (
                  <span key={s} style={{
                    padding: '5px 14px', borderRadius: 100,
                    background: 'var(--green-dim)', color: 'var(--green)',
                    fontSize: 12, fontWeight: 600, border: '1px solid rgba(79,188,142,0.2)',
                  }}>{s.trim()}</span>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic' }}>No skills added yet.</div>
            )}
          </div>

          {/* Availability */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <Briefcase size={16} color="var(--purple)" />
              <div style={{ fontWeight: 700, fontSize: 14 }}>Availability</div>
            </div>
            {editing ? (
              <input
                className="input"
                value={draft.availability}
                onChange={e => setDraft(d => ({ ...d, availability: e.target.value }))}
                placeholder="e.g. Mon-Fri 9am-5pm"
              />
            ) : (
              <div style={{ fontSize: 14, color: profile.availability ? 'var(--text-secondary)' : 'var(--text-muted)', fontStyle: profile.availability ? 'normal' : 'italic' }}>
                {profile.availability || 'Not set yet.'}
              </div>
            )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="toast">
          <div className="toast-icon">✓</div>
          <div>
            <div className="toast-title">Profile updated</div>
            <div className="toast-sub">Your changes have been saved</div>
          </div>
        </div>
      )}
    </div>
  );
}