const express = require('express');
const cors = require('cors');
const { initDb } = require('./db/init');
const { seed } = require('./db/seed');

const app = express();
app.use(cors());
app.use(express.json());

async function bootstrap() {
  // Must await DB init before anything else
  await initDb();
  await seed();

  // Routes
  app.use('/api/users',         require('./routes/users'));
  app.use('/api/sessions',      require('./routes/sessions'));
  app.use('/api/attendance',    require('./routes/attendance'));
  app.use('/api/tasks',         require('./routes/tasks'));
  app.use('/api/notifications', require('./routes/notifications'));
  app.use('/api/rules',         require('./routes/rules'));
  app.use('/api/templates',     require('./routes/templates'));
  app.use('/api',               require('./routes/trigger'));

  // Cron jobs
  require('./jobs/sessionReminderJob').start();
  require('./jobs/attendanceStreakJob').start();
  require('./jobs/profileCheckJob').start();
  require('./jobs/weeklySummaryJob').start();

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`[Server] Running on http://localhost:${PORT}`));
}

bootstrap().catch(err => {
  console.error('[Server] Fatal startup error:', err);
  process.exit(1);
});