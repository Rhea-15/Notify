const cron = require('node-cron');
const { getDb, dbAll } = require('../db/init');
const { evaluate } = require('../engine/triggerEvaluator');

async function run() {
  const db = await getDb();
  const windowStart = new Date(Date.now() + 45 * 60000).toISOString();
  const windowEnd   = new Date(Date.now() + 75 * 60000).toISOString();

  const rows = dbAll(db,
    `SELECT s.id, s.title, s.scheduled_at, se.user_id
     FROM sessions s
     JOIN session_enrollments se ON se.session_id = s.id
     WHERE s.scheduled_at BETWEEN ? AND ?
     AND se.checked_in = 0`,
    [windowStart, windowEnd]
  );

  for (const row of rows) {
    const dt = new Date(row.scheduled_at);
    await evaluate('session_reminder', row.user_id, {
      session_title: row.title,
      session_date: dt.toLocaleDateString(),
      session_time: dt.toLocaleTimeString(),
    });
  }

  if (rows.length > 0) console.log(`[SessionReminderJob] ${rows.length} reminders sent`);
}

function start() {
  run(); // fire once on boot for demo
  cron.schedule('*/15 * * * *', run);
  console.log('[SessionReminderJob] Scheduled every 15 min');
}

module.exports = { start };