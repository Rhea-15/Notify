const cron = require('node-cron');
const { getDb, dbAll, dbGet } = require('../db/init');
const { evaluate } = require('../engine/triggerEvaluator');

async function run() {
  const db = await getDb();
  const students = dbAll(db, `SELECT id FROM users WHERE role = 'student'`);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();

  for (const { id } of students) {
    const attended = dbGet(db,
      `SELECT COUNT(*) as c FROM attendance_log WHERE user_id = ? AND status = 'present' AND recorded_at > ?`,
      [id, weekAgo]
    );
    const completed = dbGet(db,
      `SELECT COUNT(*) as c FROM tasks WHERE assigned_to = ? AND status = 'done' AND created_at > ?`,
      [id, weekAgo]
    );
    await evaluate('weekly_summary', id, {
      sessions_attended: attended ? attended.c : 0,
      tasks_completed: completed ? completed.c : 0,
    });
  }

  console.log('[WeeklySummaryJob] Sent weekly summaries');
}

function start() {
  run(); // fire once on boot
  cron.schedule('* * * * *', run); // every minute for demo
  console.log('[WeeklySummaryJob] Scheduled every minute (demo mode)');
}

module.exports = { start };