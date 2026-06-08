const express = require('express');
const router = express.Router();
const { getDb, dbGet, dbAll } = require('../db/init');

// Real streak: count consecutive sessions attended from most recent
function calcStreak(attendanceRows) {
  let streak = 0;
  for (const row of attendanceRows) {
    if (row.status === 'present') streak++;
    else break;
  }
  return streak;
}

router.get('/:user_id', async (req, res) => {
  const db = await getDb();
  const uid = req.params.user_id;

  const attendance = dbAll(db,
    `SELECT status FROM attendance_log WHERE user_id=? ORDER BY recorded_at DESC`,
    [uid]
  );

  const streak = calcStreak(attendance);

  const totalTasks = dbGet(db, 'SELECT COUNT(*) as c FROM tasks WHERE assigned_to=?', [uid]);
  const doneTasks  = dbGet(db, "SELECT COUNT(*) as c FROM tasks WHERE assigned_to=? AND status='done'", [uid]);
  const attended   = dbGet(db, "SELECT COUNT(*) as c FROM attendance_log WHERE user_id=? AND status='present'", [uid]);
  const missed     = dbGet(db, "SELECT COUNT(*) as c FROM attendance_log WHERE user_id=? AND status='absent'", [uid]);

  // Weekly breakdown — last 4 weeks
  const weeks = [];
  for (let w = 3; w >= 0; w--) {
    const start = new Date(Date.now() - (w + 1) * 7 * 86400000).toISOString();
    const end   = new Date(Date.now() - w * 7 * 86400000).toISOString();
    const s = dbGet(db,
      "SELECT COUNT(*) as c FROM attendance_log WHERE user_id=? AND status='present' AND recorded_at BETWEEN ? AND ?",
      [uid, start, end]
    );
    const t = dbGet(db,
      "SELECT COUNT(*) as c FROM tasks WHERE assigned_to=? AND status='done' AND created_at BETWEEN ? AND ?",
      [uid, start, end]
    );
    weeks.push({ week: `W${4 - w}`, sessions: s ? s.c : 0, tasks: t ? t.c : 0 });
  }

  // Activity days this month
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
  const activeDays = dbAll(db,
    "SELECT recorded_at FROM attendance_log WHERE user_id=? AND status='present' AND recorded_at >= ?",
    [uid, monthStart]
  ).map(r => new Date(r.recorded_at).getDate());

  res.json({
    streak,
    totalTasks:   totalTasks ? totalTasks.c : 0,
    doneTasks:    doneTasks  ? doneTasks.c  : 0,
    attended:     attended   ? attended.c   : 0,
    missed:       missed     ? missed.c     : 0,
    weeks,
    activeDays,
  });
});

module.exports = router;