const express = require('express');
const router = express.Router();
const { getDb, dbAll, dbRun } = require('../db/init');

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

module.exports = router;