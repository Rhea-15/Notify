require('dotenv').config();
const { Resend } = require('resend');
const { getDb, dbRun } = require('../db/init');

const resend = new Resend(process.env.RESEND_API_KEY);

// In-memory retry queue: [{ user, subject, body, userId, triggerType, meta, attempts }]
const retryQueue = [];

// Retry runner — checks every 5 minutes
setInterval(async () => {
  if (retryQueue.length === 0) return;
  console.log(`[Retry] Processing ${retryQueue.length} failed email(s)...`);
  const batch = [...retryQueue];
  retryQueue.length = 0;

  for (const item of batch) {
    const ok = await sendEmail(item.user, item.subject, item.body);
    const db = await require('../db/init').getDb();
    await writeLog(db, item.userId, item.triggerType, 'email', ok ? 'sent' : 'failed', item.meta);
    if (!ok) console.log(`[Retry] Still failed for ${item.user.email}, dropping.`);
  }
}, 5 * 60 * 1000);

function fillTemplate(text, vars) {
  return text.replace(/\{(\w+)\}/g, (_, key) =>
    vars[key] !== undefined ? vars[key] : `{${key}}`
  );
}

function buildVars(user, meta) {
  return {
    name:              user.name,
    session_name:      meta.session_title  || '',
    session_date:      meta.session_date   || '',
    session_time:      meta.session_time   || '',
    session_link:      meta.session_link   || '#',
    streak_count:      String(meta.streak_count       || '3'),
    task_title:        meta.task_title     || '',
    due_date:          meta.due_date       || '',
    sessions_attended: String(meta.sessions_attended  || '0'),
    tasks_completed:   String(meta.tasks_completed    || '0'),
  };
}

async function sendEmail(user, subject, body) {
  try {
    const { data, error } = await resend.emails.send({
      from:    'Notify <onboarding@resend.dev>',
      to:      [user.email],
      subject: subject,
      text:    body,
      html:    `<div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px">
                  <h2 style="color:#4f8ef7">${subject}</h2>
                  <p style="color:#444;line-height:1.6">${body.replace(/\n/g, '<br/>')}</p>
                  <hr style="margin:24px 0;border:none;border-top:1px solid #eee"/>
                  <p style="color:#aaa;font-size:12px">Notify Notification Engine</p>
                </div>`,
    });

    if (error) {
      console.error('[Email] Resend error:', error.message);
      return false;
    }

    console.log(`[Email] Sent → ${user.email} | ID: ${data.id}`);
    return true;
  } catch (err) {
    console.error('[Email] Exception:', err.message);
    return false;
  }
}

async function saveInApp(db, user, triggerType, title, body) {
  dbRun(db,
    `INSERT INTO notifications (user_id, trigger_type, title, body) VALUES (?,?,?,?)`,
    [user.id, triggerType, title, body]
  );
}

async function writeLog(db, userId, triggerType, channel, status, meta) {
  dbRun(db,
    `INSERT INTO notification_log (user_id, trigger_type, channel, status, meta) VALUES (?,?,?,?,?)`,
    [userId, triggerType, channel, status, meta ? JSON.stringify(meta) : null]
  );
}

async function dispatch({ rule, user, template, meta }) {
  const db      = await require('../db/init').getDb();
  const vars    = buildVars(user, meta);
  const title   = fillTemplate(template.subject, vars);
  const body    = fillTemplate(template.body, vars);
  const channel = rule.channel;

  console.log(`[Dispatcher] ${rule.trigger_type} → ${user.name} via ${channel}`);

  if (channel === 'in_app' || channel === 'both') {
    await saveInApp(db, user, rule.trigger_type, title, body);
    await writeLog(db, user.id, rule.trigger_type, 'in_app', 'sent', meta);
  }

  if (channel === 'email' || channel === 'both') {
    const ok = await sendEmail(user, title, body);

    if (!ok) {
      // Queue for retry in 5 min
      retryQueue.push({
        user,
        subject:     title,
        body,
        userId:      user.id,
        triggerType: rule.trigger_type,
        meta,
        attempts:    1,
      });
      console.log(`[Dispatcher] Queued retry for ${user.email}`);
    }

    await writeLog(db, user.id, rule.trigger_type, 'email', ok ? 'sent' : 'failed', meta);
  }
}

module.exports = { dispatch };