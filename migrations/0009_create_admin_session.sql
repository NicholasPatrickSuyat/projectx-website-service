-- One-operator admin session plus login throttling.
-- Additive tables only. Required so logout can revoke a signed session cookie
-- and so password guesses are rate-limited. Does not modify migrations
-- 0001–0008 or existing Client/Website data.

CREATE TABLE admin_auth_session (
  id TEXT PRIMARY KEY NOT NULL CHECK (id = 'current'),
  session_id TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE TABLE admin_auth_login_throttle (
  key_hash TEXT PRIMARY KEY NOT NULL,
  failed_count INTEGER NOT NULL,
  window_started_at INTEGER NOT NULL,
  locked_until INTEGER
);
