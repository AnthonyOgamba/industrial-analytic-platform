PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  normalized_username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  normalized_email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer',
  active INTEGER NOT NULL DEFAULT 1,
  created_at_utc TEXT NOT NULL,
  updated_at_utc TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at_utc TEXT NOT NULL,
  created_at_utc TEXT NOT NULL,
  used_at_utc TEXT,
  revoked_at_utc TEXT,
  requested_ip TEXT
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  jwt_id_hash TEXT NOT NULL UNIQUE,
  expires_at_utc TEXT NOT NULL,
  created_at_utc TEXT NOT NULL,
  revoked_at_utc TEXT
);

CREATE TABLE IF NOT EXISTS auth_audit_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  outcome TEXT NOT NULL,
  ip_address TEXT,
  created_at_utc TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_expiry ON password_reset_tokens(expires_at_utc);
CREATE INDEX IF NOT EXISTS idx_auth_session_user ON auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_session_expiry ON auth_sessions(expires_at_utc);
CREATE INDEX IF NOT EXISTS idx_auth_audit_created ON auth_audit_events(created_at_utc);
