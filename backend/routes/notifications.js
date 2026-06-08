const express = require('express');
const router = express.Router();
const { getDb, dbAll, dbRun } = require('../db/init');

router.get('/', async (req, res) => {
  const db = await getDb();
  const { user_id, unread } = req.query;
  let sql = 'SELECT * FROM notifications WHERE user_id = ?';
  const params = [user_id];
  if (unread === 'true') sql += ' AND is_read = 0';
  sql += ' ORDER BY created_at DESC LIMIT 50';
  res.json(dbAll(db, sql, params));
});

router.patch('/:id/read', async (req, res) => {
  const db = await getDb();
  dbRun(db, 'UPDATE notifications SET is_read = 1 WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

router.patch('/read-all/:user_id', async (req, res) => {
  const db = await getDb();
  dbRun(db, 'UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.params.user_id]);
  res.json({ success: true });
});

module.exports = router;