const express = require('express');
const router = express.Router();
const { getDb, dbAll } = require('../db/init');
const { evaluate } = require('../engine/triggerEvaluator');

router.get('/logs', async (req, res) => {
  const db = await getDb();
  const { trigger_type, channel, status } = req.query;

  let sql = `
    SELECT l.*, u.name as user_name
    FROM notification_log l
    JOIN users u ON u.id = l.user_id
    WHERE 1=1
  `;
  const params = [];

  if (trigger_type && trigger_type !== 'all') { sql += ' AND l.trigger_type = ?'; params.push(trigger_type); }
  if (channel && channel !== 'all')           { sql += ' AND l.channel = ?';       params.push(channel); }
  if (status && status !== 'all')             { sql += ' AND l.status = ?';        params.push(status); }

  sql += ' ORDER BY l.sent_at DESC LIMIT 100';
  res.json(dbAll(db, sql, params));
});

router.post('/trigger', async (req, res) => {
  const { user_id, trigger_type, meta } = req.body;
  if (!user_id || !trigger_type) return res.status(400).json({ error: 'user_id and trigger_type required' });
  const result = await evaluate(trigger_type, parseInt(user_id), meta || {});
  res.json({
    success: result,
    message: result ? 'Notification dispatched' : 'Blocked by rule or cooldown',
  });
});

module.exports = router;