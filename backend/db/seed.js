const { getDb, dbGet, dbRun, dbAll, persist } = require('./init');

async function seed() {
  const db = await getDb();

  const existing = dbGet(db, 'SELECT COUNT(*) as c FROM users');
  if (existing && existing.c > 0) {
    console.log('[Seed] Already seeded, skipping.');
    return;
  }

  // Users
  const users = [
    ['Ananya Sharma', 'ananya@offbit.io', 'student', 'Frontend dev intern', 'React,CSS', 'Mon-Fri 9am-5pm'],
    ['Rohit Verma',   'rohit@offbit.io',  'student', null, null, null],
    ['Neha Iyer',     'neha@offbit.io',   'student', 'Backend enthusiast', 'Node,SQL', 'Mon-Wed'],
    ['Arjun Mehta',   'arjun@offbit.io',  'mentor',  'Senior Engineer', 'System Design', 'Flexible'],
    ['Admin User',    'admin@offbit.io',  'admin',   'Platform admin', null, null],
  ];

  users.forEach(([name, email, role, bio, skills, availability]) => {
    dbRun(db, `INSERT INTO users (name, email, role, bio, skills, availability) VALUES (?,?,?,?,?,?)`,
      [name, email, role, bio, skills, availability]);
  });

  // Sessions
  const soon     = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const tomorrow = new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString();
  const dayAfter = new Date(Date.now() + 50 * 60 * 60 * 1000).toISOString();

  dbRun(db, `INSERT INTO sessions (title, scheduled_at, mentor_id) VALUES (?,?,?)`, ['Web Development 101', soon, 4]);
  dbRun(db, `INSERT INTO sessions (title, scheduled_at, mentor_id) VALUES (?,?,?)`, ['Data Structures in Python', tomorrow, 4]);
  dbRun(db, `INSERT INTO sessions (title, scheduled_at, mentor_id) VALUES (?,?,?)`, ['System Design Basics', dayAfter, 4]);

  // Enrollments
  for (const sid of [1, 2, 3]) {
    for (const uid of [1, 2, 3]) {
      dbRun(db, `INSERT INTO session_enrollments (session_id, user_id) VALUES (?,?)`, [sid, uid]);
    }
  }

  // Attendance
  dbRun(db, `INSERT INTO attendance_log (user_id, session_id, status) VALUES (?,?,?)`, [2, 1, 'absent']);
  dbRun(db, `INSERT INTO attendance_log (user_id, session_id, status) VALUES (?,?,?)`, [2, 2, 'absent']);
  dbRun(db, `INSERT INTO attendance_log (user_id, session_id, status) VALUES (?,?,?)`, [2, 3, 'absent']);
  dbRun(db, `INSERT INTO attendance_log (user_id, session_id, status) VALUES (?,?,?)`, [1, 1, 'present']);
  dbRun(db, `INSERT INTO attendance_log (user_id, session_id, status) VALUES (?,?,?)`, [3, 1, 'present']);

  // Tasks
  const d1 = new Date(Date.now() + 1 * 86400000).toISOString();
  const d2 = new Date(Date.now() + 2 * 86400000).toISOString();
  const d3 = new Date(Date.now() + 3 * 86400000).toISOString();
  const d5 = new Date(Date.now() + 5 * 86400000).toISOString();

  dbRun(db, `INSERT INTO tasks (title, assigned_to, assigned_by, due_at) VALUES (?,?,?,?)`, ['Complete React Assignment', 1, 4, d1]);
  dbRun(db, `INSERT INTO tasks (title, assigned_to, assigned_by, due_at) VALUES (?,?,?,?)`, ['Read Chapter 4 - DBMS', 1, 4, d2]);
  dbRun(db, `INSERT INTO tasks (title, assigned_to, assigned_by, due_at) VALUES (?,?,?,?)`, ['Submit UI Challenge', 1, 4, d3]);
  dbRun(db, `INSERT INTO tasks (title, assigned_to, assigned_by, due_at) VALUES (?,?,?,?)`, ['Weekly Reflection', 1, 4, d5]);
  dbRun(db, `INSERT INTO tasks (title, assigned_to, assigned_by, due_at) VALUES (?,?,?,?)`, ['Fix API bug', 3, 4, d2]);

  // Templates
  dbRun(db, `INSERT INTO notification_templates (name, subject, body) VALUES (?,?,?)`,
    ['Session Reminder', 'Reminder: {session_name}', 'Hi {name}, this is a reminder for your upcoming session on {session_date} at {session_time}.']);
  dbRun(db, `INSERT INTO notification_templates (name, subject, body) VALUES (?,?,?)`,
    ['Missed Session', 'We missed you in {session_name}', 'Hello {name}, you missed the session on {session_date}. Watch the recording here: {session_link}']);
  dbRun(db, `INSERT INTO notification_templates (name, subject, body) VALUES (?,?,?)`,
    ['Streak Alert', 'Keep your streak going!', 'Hi {name}, your streak is at risk! You have missed {streak_count} sessions. Complete a task today.']);
  dbRun(db, `INSERT INTO notification_templates (name, subject, body) VALUES (?,?,?)`,
    ['Profile Incomplete', 'Complete your Offbit profile', 'Hi {name}, your profile is incomplete. Please add your bio and skills to unlock all features.']);
  dbRun(db, `INSERT INTO notification_templates (name, subject, body) VALUES (?,?,?)`,
    ['Task Assigned', 'New task assigned: {task_title}', 'Hi {name}, a new task "{task_title}" has been assigned to you. Due: {due_date}.']);
  dbRun(db, `INSERT INTO notification_templates (name, subject, body) VALUES (?,?,?)`,
    ['Weekly Summary', 'Your weekly learning summary', 'Hi {name}, here is your progress summary for the week. Sessions attended: {sessions_attended}, Tasks completed: {tasks_completed}.']);

  // Rules
  dbRun(db, `INSERT INTO notification_rules (trigger_type, cooldown_hours, channel, is_active, template_id) VALUES (?,?,?,?,?)`, ['session_reminder', 24, 'email', 1, 1]);
  dbRun(db, `INSERT INTO notification_rules (trigger_type, cooldown_hours, channel, is_active, template_id) VALUES (?,?,?,?,?)`, ['missed_session', 12, 'in_app', 1, 2]);
  dbRun(db, `INSERT INTO notification_rules (trigger_type, cooldown_hours, channel, is_active, template_id) VALUES (?,?,?,?,?)`, ['streak_alert', 24, 'in_app', 1, 3]);
  dbRun(db, `INSERT INTO notification_rules (trigger_type, cooldown_hours, channel, is_active, template_id) VALUES (?,?,?,?,?)`, ['profile_incomplete', 168, 'email', 0, 4]);
  dbRun(db, `INSERT INTO notification_rules (trigger_type, cooldown_hours, channel, is_active, template_id) VALUES (?,?,?,?,?)`, ['task_assigned', 0, 'in_app', 1, 5]);
  dbRun(db, `INSERT INTO notification_rules (trigger_type, cooldown_hours, channel, is_active, template_id) VALUES (?,?,?,?,?)`, ['weekly_summary', 168, 'email', 1, 6]);

  // Log entries
  const now = new Date().toISOString();
  const h1  = new Date(Date.now() - 1 * 3600000).toISOString();
  const h3  = new Date(Date.now() - 3 * 3600000).toISOString();
  const h5  = new Date(Date.now() - 5 * 3600000).toISOString();
  const h8  = new Date(Date.now() - 8 * 3600000).toISOString();
  const h10 = new Date(Date.now() - 10 * 3600000).toISOString();

  dbRun(db, `INSERT INTO notification_log (user_id, trigger_type, channel, status, sent_at, meta) VALUES (?,?,?,?,?,?)`, [1, 'session_reminder', 'email', 'sent', now, JSON.stringify({ session_id: 1 })]);
  dbRun(db, `INSERT INTO notification_log (user_id, trigger_type, channel, status, sent_at, meta) VALUES (?,?,?,?,?,?)`, [2, 'missed_session', 'in_app', 'failed', h1, JSON.stringify({ session_id: 2 })]);
  dbRun(db, `INSERT INTO notification_log (user_id, trigger_type, channel, status, sent_at, meta) VALUES (?,?,?,?,?,?)`, [3, 'streak_alert', 'in_app', 'sent', h3, JSON.stringify({ streak_count: 3 })]);
  dbRun(db, `INSERT INTO notification_log (user_id, trigger_type, channel, status, sent_at, meta) VALUES (?,?,?,?,?,?)`, [2, 'profile_incomplete', 'email', 'sent', h5, null]);
  dbRun(db, `INSERT INTO notification_log (user_id, trigger_type, channel, status, sent_at, meta) VALUES (?,?,?,?,?,?)`, [1, 'task_assigned', 'in_app', 'sent', h8, JSON.stringify({ task_id: 1 })]);
  dbRun(db, `INSERT INTO notification_log (user_id, trigger_type, channel, status, sent_at, meta) VALUES (?,?,?,?,?,?)`, [3, 'weekly_summary', 'email', 'sent', h10, null]);

  // In-app notifications for student view
  const m2  = new Date(Date.now() - 2  * 60000).toISOString();
  const m15 = new Date(Date.now() - 15 * 60000).toISOString();
  const h1b = new Date(Date.now() - 1 * 3600000).toISOString();
  const h2  = new Date(Date.now() - 2 * 3600000).toISOString();
  const h3b = new Date(Date.now() - 3 * 3600000).toISOString();

  dbRun(db, `INSERT INTO notifications (user_id, trigger_type, title, body, is_read, created_at) VALUES (?,?,?,?,?,?)`,
    [1, 'session_reminder', 'Upcoming session in 1 hour', 'Web Development 101 starts soon. Be ready!', 0, m2]);
  dbRun(db, `INSERT INTO notifications (user_id, trigger_type, title, body, is_read, created_at) VALUES (?,?,?,?,?,?)`,
    [1, 'streak_alert', 'Your 3-day streak is at risk!', 'Complete a task today to maintain your streak.', 0, m15]);
  dbRun(db, `INSERT INTO notifications (user_id, trigger_type, title, body, is_read, created_at) VALUES (?,?,?,?,?,?)`,
    [1, 'profile_incomplete', 'Complete your profile', 'Add your bio and skills to unlock features.', 0, h1b]);
  dbRun(db, `INSERT INTO notifications (user_id, trigger_type, title, body, is_read, created_at) VALUES (?,?,?,?,?,?)`,
    [1, 'task_assigned', 'New task assigned', 'React Assignment #4 has been assigned to you.', 0, h2]);
  dbRun(db, `INSERT INTO notifications (user_id, trigger_type, title, body, is_read, created_at) VALUES (?,?,?,?,?,?)`,
    [1, 'weekly_summary', 'Your weekly summary is ready', 'Track your progress for this week.', 0, h3b]);

  persist();
  console.log('[Seed] Database seeded successfully');
}

module.exports = { seed };