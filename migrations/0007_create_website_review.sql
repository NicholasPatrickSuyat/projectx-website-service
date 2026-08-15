-- Client Website review sessions and append-only feedback.
-- Additive tables only. Do not modify migrations 0001–0006.
-- Existing websites, versions, and media are unchanged.

CREATE TABLE website_review_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  website_id TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('OPEN', 'APPROVED')) DEFAULT 'OPEN',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  approved_at TEXT,
  FOREIGN KEY (website_id) REFERENCES websites (id)
);

CREATE INDEX idx_website_review_sessions_token
  ON website_review_sessions (token);

CREATE TABLE website_review_feedback (
  id TEXT PRIMARY KEY NOT NULL,
  review_session_id TEXT NOT NULL,
  message TEXT NOT NULL CHECK (
    length(trim(message)) >= 1 AND length(message) <= 2000
  ),
  created_at TEXT NOT NULL,
  FOREIGN KEY (review_session_id) REFERENCES website_review_sessions (id)
);

CREATE INDEX idx_website_review_feedback_session_created
  ON website_review_feedback (review_session_id, created_at DESC);
