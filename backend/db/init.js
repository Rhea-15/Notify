const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../notifyengine.db');

let db = null;
let SQL = null;

async function getDb() {
  if (db) return db;

  SQL = await require('sql.js')();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  // Patch: enable foreign keys each session
  db.run('PRAGMA foreign_keys = ON;');

  return db;
}

// Call this after every write to persist to disk
function persist() {
  if (!db) return;
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

// Unified query helpers that mirror better-sqlite3 API style
function dbAll(database, sql, params = []) {
  try {
    const stmt = database.prepare(sql);
    stmt.bind(params);
    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();
    return rows;
  } catch (e) {
    return [];
  }
}

function dbGet(database, sql, params = []) {
  const rows = dbAll(database, sql, params);
  return rows[0] || null;
}

function dbRun(database, sql, params = []) {
  try {
    database.run(sql, params);
    const lastId = dbGet(database, 'SELECT last_insert_rowid() as id');
    persist();
    return { lastInsertRowid: lastId ? lastId.id : null };
  } catch (e) {
    console.error('[DB Run Error]', e.message, sql);
    throw e;
  }
}

function dbExec(database, sql) {
  database.exec(sql);
  persist();
}

async function initDb() {
  const database = await getDb();

  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      bio TEXT,
      skills TEXT,
      availability TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      scheduled_at DATETIME NOT NULL,
      mentor_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS session_enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      checked_in INTEGER DEFAULT 0,
      check_in_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS attendance_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_id INTEGER NOT NULL,
      status TEXT NOT NULL,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      assigned_to INTEGER NOT NULL,
      assigned_by INTEGER NOT NULL,
      due_at DATETIME,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notification_templates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      subject TEXT NOT NULL,
      body TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notification_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trigger_type TEXT NOT NULL UNIQUE,
      cooldown_hours INTEGER DEFAULT 24,
      channel TEXT DEFAULT 'both',
      is_active INTEGER DEFAULT 1,
      template_id INTEGER,
      last_triggered DATETIME
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      trigger_type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notification_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      trigger_type TEXT NOT NULL,
      channel TEXT NOT NULL,
      status TEXT DEFAULT 'sent',
      sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      meta TEXT
    );
  `);

  persist();
  console.log('[DB] Tables initialized');
  return database;
}

module.exports = { getDb, initDb, dbAll, dbGet, dbRun, dbExec, persist };