const cron = require('node-cron');
const { getDb, dbAll } = require('../db/init');
const { evaluate } = require('../engine/triggerEvaluator');

async function run() {
  const db = await getDb();
  const incomplete = dbAll(db,
    `SELECT id FROM users WHERE role = 'student'
     AND (bio IS NULL OR skills IS NULL OR availability IS NULL)`
  );

  for (const { id } of incomplete) {
    await evaluate('profile_incomplete', id);
  }

  console.log(`[ProfileCheckJob] Found ${incomplete.length} incomplete profiles`);
}

function start() {
  cron.schedule('0 8 * * *', run);
  console.log('[ProfileCheckJob] Scheduled daily at 8am');
}

module.exports = { start };