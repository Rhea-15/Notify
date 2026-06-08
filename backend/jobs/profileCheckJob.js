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
  run(); // fire once on boot
  cron.schedule('* * * * *', run); // every minute for demo
  console.log('[ProfileCheckJob] Scheduled every minute (demo mode)');
}

module.exports = { start };