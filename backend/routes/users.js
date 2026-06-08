const express = require('express');
const router = express.Router();
const { getDb, dbAll, dbGet } = require('../db/init');

router.get('/', async (req, res) => {
  const db = await getDb();
  res.json(dbAll(db, 'SELECT * FROM users'));
});

router.get('/:id', async (req, res) => {
  const db = await getDb();
  const user = dbGet(db, 'SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

module.exports = router;