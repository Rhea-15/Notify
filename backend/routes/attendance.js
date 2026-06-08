const express = require('express');
const router = express.Router();
const { getDb, dbAll, dbRun } = require('../db/init');
const { evaluate } = require('../engine/triggerEvaluator');

router.post('/', async (req, res) => {
  const { user_id, session_id, status } = req.body;
  const db = await getDb();
  dbRun(db, 'INSERT INTO attendance_log (user_id, session_id, status) VALUES (?,?,?)', [user_id, session_id, status]);
  if (status === 'absent') await evaluate('missed_session', user_id, { session_id });
  res.json({ success: true });
});

router.get('/', async (req, res) => {
  const db = await getDb();
  res.json(dbAll(db, 'SELECT * FROM attendance_log ORDER BY recorded_at DESC'));
});

module.exports = router;