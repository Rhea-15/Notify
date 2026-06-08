const express = require('express');
const router = express.Router();
const { getDb, dbAll, dbRun, dbGet } = require('../db/init');
const { evaluate } = require('../engine/triggerEvaluator');

router.get('/', async (req, res) => {
  const db = await getDb();
  const rows = dbAll(db,
    `SELECT s.*, u.name as mentor_name FROM sessions s
     LEFT JOIN users u ON u.id = s.mentor_id
     ORDER BY s.scheduled_at ASC`
  );
  res.json(rows);
});

router.post('/', async (req, res) => {
  const { title, scheduled_at, mentor_id } = req.body;
  const db = await getDb();
  const result = dbRun(db,
    'INSERT INTO sessions (title, scheduled_at, mentor_id) VALUES (?,?,?)',
    [title, scheduled_at, mentor_id]
  );
  res.json({ id: result.lastInsertRowid });
});

router.post('/:id/checkin', async (req, res) => {
  const { user_id } = req.body;
  const db = await getDb();
  const enrollment = dbGet(db,
    'SELECT * FROM session_enrollments WHERE session_id=? AND user_id=?',
    [req.params.id, user_id]
  );
  if (!enrollment) return res.status(404).json({ error: 'Enrollment not found' });
  dbRun(db,
    'UPDATE session_enrollments SET checked_in=1, check_in_at=? WHERE session_id=? AND user_id=?',
    [new Date().toISOString(), req.params.id, user_id]
  );
  dbRun(db,
    'INSERT INTO attendance_log (user_id, session_id, status) VALUES (?,?,?)',
    [user_id, req.params.id, 'present']
  );
  res.json({ success: true });
});

// Get enrollments for a user
router.get('/enrollments/:user_id', async (req, res) => {
  const db = await getDb();
  const rows = dbAll(db,
    'SELECT * FROM session_enrollments WHERE user_id=?',
    [req.params.user_id]
  );
  res.json(rows);
});

module.exports = router;