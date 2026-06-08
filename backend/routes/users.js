const express = require('express');
const router = express.Router();
const { getDb, dbAll, dbGet, dbRun } = require('../db/init');

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

router.patch('/:id', async (req, res) => {
  const db = await getDb();
  const { bio, skills, availability } = req.body;
  const current = dbGet(db, 'SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!current) return res.status(404).json({ error: 'User not found' });
  dbRun(db,
    'UPDATE users SET bio=?, skills=?, availability=? WHERE id=?',
    [
      bio !== undefined ? bio : current.bio,
      skills !== undefined ? skills : current.skills,
      availability !== undefined ? availability : current.availability,
      req.params.id,
    ]
  );
  res.json({ success: true });
});

module.exports = router;