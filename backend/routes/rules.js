const express = require('express');
const router = express.Router();
const { getDb, dbAll, dbRun } = require('../db/init');

router.get('/', async (req, res) => {
  const db = await getDb();
  const rules = dbAll(db,
    `SELECT r.*, t.name as template_name
     FROM notification_rules r
     LEFT JOIN notification_templates t ON t.id = r.template_id
     ORDER BY r.id ASC`
  );
  res.json(rules);
});

router.patch('/:id', async (req, res) => {
  const db = await getDb();
  const { is_active, cooldown_hours, channel } = req.body;

  const current = dbAll(db, 'SELECT * FROM notification_rules WHERE id = ?', [req.params.id])[0];
  if (!current) return res.status(404).json({ error: 'Rule not found' });

  dbRun(db,
    `UPDATE notification_rules SET
       is_active = ?,
       cooldown_hours = ?,
       channel = ?
     WHERE id = ?`,
    [
      is_active !== undefined ? (is_active ? 1 : 0) : current.is_active,
      cooldown_hours !== undefined ? cooldown_hours : current.cooldown_hours,
      channel !== undefined ? channel : current.channel,
      req.params.id,
    ]
  );
  res.json({ success: true });
});

module.exports = router;