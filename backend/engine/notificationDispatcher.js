const nodemailer = require('nodemailer');
const { getDb, dbRun } = require('../db/init');

let transporter;
async function getTransporter() {
  if (!transporter) {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    console.log('[Email] Ethereal test account:', testAccount.user);
  }
  return transporter;
}

function fillTemplate(text, vars) {
  return text.replace(/\{(\w+)\}/g, (_, key) => vars[key] !== undefined ? vars[key] : `{${key}}`);
}

function buildVars(user, meta) {
  return {
    name: user.name,
    session_name: meta.session_title || '',
    session_date: meta.session_date || '',
    session_time: meta.session_time || '',
    session_link: meta.session_link || '#',
    streak_count: String(meta.streak_count || '3'),
    task_title: meta.task_title || '',
    due_date: meta.due_date || '',
    sessions_attended: String(meta.sessions_attended || '0'),
    tasks_completed: String(meta.tasks_completed || '0'),
  };
}

async function sendEmail(user, subject, body) {
  try {
    const transport = await getTransporter();
    const info = await transport.sendMail({
      from: '"Offbit Notify" <notify@offbit.io>',
      to: user.email,
      subject,
      text: body,
    });
    console.log(`[Email] Sent → ${user.email} | Preview: ${nodemailer.getTestMessageUrl(info)}`);
    return true;
  } catch (err) {
    console.error('[Email] Failed:', err.message);
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
  const db = await require('../db/init').getDb();
  const vars = buildVars(user, meta);
  const title = fillTemplate(template.subject, vars);
  const body  = fillTemplate(template.body, vars);
  const channel = rule.channel;

  console.log(`[Dispatcher] ${rule.trigger_type} → ${user.name} via ${channel}`);

  if (channel === 'in_app' || channel === 'both') {
    await saveInApp(db, user, rule.trigger_type, title, body);
    await writeLog(db, user.id, rule.trigger_type, 'in_app', 'sent', meta);
  }

  if (channel === 'email' || channel === 'both') {
    const ok = await sendEmail(user, title, body);
    await writeLog(db, user.id, rule.trigger_type, 'email', ok ? 'sent' : 'failed', meta);
  }
}

module.exports = { dispatch };