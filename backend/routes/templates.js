const express = require('express');
const router = express.Router();
const { getDb, dbAll, dbRun } = require('../db/init');

router.get('/', async (req, res) => {
  const db = await getDb();
  res.json(dbAll(db, 'SELECT * FROM notification_templates'));
});

router.put('/:id', async (req, res) => {
  const db = await getDb();
  const { name, subject, body } = req.body;
  dbRun(db,
    'UPDATE notification_templates SET name=?, subject=?, body=? WHERE id=?',
    [name, subject, body, req.params.id]
  );
  res.json({ success: true });
});

module.exports = router;