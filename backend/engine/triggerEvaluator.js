const { getDb, dbGet, dbRun } = require('../db/init');
const { dispatch } = require('./notificationDispatcher');

async function canSend(userId, triggerType, cooldownHours) {
  if (cooldownHours === 0) return true;
  const db = await getDb();
  const cutoff = new Date(Date.now() - cooldownHours * 3600000).toISOString();
  const existing = dbGet(db,
    `SELECT id FROM notification_log
     WHERE user_id = ? AND trigger_type = ? AND sent_at > ? AND status = 'sent'
     LIMIT 1`,
    [userId, triggerType, cutoff]
  );
  return !existing;
}

async function evaluate(triggerType, userId, meta = {}) {
  const db = await getDb();

  const rule = dbGet(db, 'SELECT * FROM notification_rules WHERE trigger_type = ?', [triggerType]);
  if (!rule || !rule.is_active) return false;

  const user = dbGet(db, 'SELECT * FROM users WHERE id = ?', [userId]);
  if (!user) return false;

  const ok = await canSend(userId, triggerType, rule.cooldown_hours);
  if (!ok) {
    console.log(`[Evaluator] Skipping ${triggerType} for user ${userId} — cooldown active`);
    return false;
  }

  const template = dbGet(db, 'SELECT * FROM notification_templates WHERE id = ?', [rule.template_id]);
  if (!template) return false;

  await dispatch({ rule, user, template, meta });

  dbRun(db,
    'UPDATE notification_rules SET last_triggered = ? WHERE id = ?',
    [new Date().toISOString(), rule.id]
  );

  return true;
}

module.exports = { evaluate };