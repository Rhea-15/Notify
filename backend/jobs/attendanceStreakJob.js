const cron = require('node-cron');
const { getDb, dbAll } = require('../db/init');
const { evaluate } = require('../engine/triggerEvaluator');

async function run() {
  const db = await getDb();
  const students = dbAll(db, `SELECT id FROM users WHERE role = 'student'`);

  for (const { id } of students) {
    const recent = dbAll(db,
      `SELECT status FROM attendance_log WHERE user_id = ? ORDER BY recorded_at DESC LIMIT 3`,
      [id]
    );
    if (recent.length === 3 && recent.every(r => r.status === 'absent')) {
      await evaluate('streak_alert', id, { streak_count: 3 });
    }
  }

  console.log('[AttendanceStreakJob] Ran attendance check');
}

function start() {
  run(); // fire once on boot
  cron.schedule('* * * * *', run); // every minute for demo
  console.log('[AttendanceStreakJob] Scheduled every minute (demo mode)');
}

module.exports = { start };