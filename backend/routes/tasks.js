const express = require('express');
const router = express.Router();
const { getDb, dbAll, dbRun } = require('../db/init');
const { evaluate } = require('../engine/triggerEvaluator');

router.get('/', async (req, res) => {
  const db = await getDb();
  const { user_id } = req.query;
  const tasks = user_id
    ? dbAll(db, 'SELECT * FROM tasks WHERE assigned_to = ? ORDER BY due_at ASC', [user_id])
    : dbAll(db, 'SELECT * FROM tasks ORDER BY created_at DESC');
  res.json(tasks);
});

router.post('/', async (req, res) => {
  const { title, assigned_to, assigned_by, due_at } = req.body;
  const db = await getDb();
  const result = dbRun(db,
    'INSERT INTO tasks (title, assigned_to, assigned_by, due_at) VALUES (?,?,?,?)',
    [title, assigned_to, assigned_by, due_at]
  );
  await evaluate('task_assigned', assigned_to, {
    task_title: title,
    due_date: due_at ? new Date(due_at).toLocaleDateString() : 'TBD',
  });
  res.json({ id: result.lastInsertRowid });
});

module.exports = router;