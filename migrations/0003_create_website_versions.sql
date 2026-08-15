-- Local Cloudflare D1 schema for Project X Website Service website version history.
-- Append-only recovery snapshots. Do not modify 0001 or 0002.

CREATE TABLE website_versions (
  id TEXT PRIMARY KEY NOT NULL,
  website_id TEXT NOT NULL,
  version_number INTEGER NOT NULL CHECK (version_number >= 1),
  content_json TEXT NOT NULL,
  website_status TEXT NOT NULL CHECK (
    website_status IN ('DRAFT', 'READY_FOR_APPROVAL', 'READY_TO_PUBLISH')
  ),
  created_at TEXT NOT NULL,
  FOREIGN KEY (website_id) REFERENCES websites (id),
  UNIQUE (website_id, version_number)
);

CREATE INDEX idx_website_versions_website_number
  ON website_versions (website_id, version_number DESC);

CREATE INDEX idx_website_versions_website_created
  ON website_versions (website_id, created_at DESC);
