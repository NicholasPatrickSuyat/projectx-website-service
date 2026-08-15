-- Allow Restaurant Modern 01 websites without changing existing rows.
-- SQLite/D1 cannot alter a CHECK constraint in place, so websites is rebuilt.
-- Child tables are rebuilt in the same migration so foreign keys stay valid.
-- Do not modify migrations 0001–0004.
-- Existing website IDs, client relationships, content_json, status, timestamps,
-- version snapshots, and media metadata are preserved.

CREATE TABLE websites_new (
  id TEXT PRIMARY KEY NOT NULL,
  client_id TEXT NOT NULL UNIQUE,
  template_id TEXT NOT NULL CHECK (
    template_id IN ('service-modern-01', 'restaurant-modern-01')
  ),
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('DRAFT', 'READY_FOR_APPROVAL', 'READY_TO_PUBLISH')
  ) DEFAULT 'DRAFT',
  content_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (client_id) REFERENCES clients (id)
);

INSERT INTO websites_new (
  id,
  client_id,
  template_id,
  name,
  status,
  content_json,
  created_at,
  updated_at
)
SELECT
  id,
  client_id,
  template_id,
  name,
  status,
  content_json,
  created_at,
  updated_at
FROM websites;

CREATE TABLE website_versions_new (
  id TEXT PRIMARY KEY NOT NULL,
  website_id TEXT NOT NULL,
  version_number INTEGER NOT NULL CHECK (version_number >= 1),
  content_json TEXT NOT NULL,
  website_status TEXT NOT NULL CHECK (
    website_status IN ('DRAFT', 'READY_FOR_APPROVAL', 'READY_TO_PUBLISH')
  ),
  created_at TEXT NOT NULL,
  FOREIGN KEY (website_id) REFERENCES websites_new (id),
  UNIQUE (website_id, version_number)
);

INSERT INTO website_versions_new (
  id,
  website_id,
  version_number,
  content_json,
  website_status,
  created_at
)
SELECT
  id,
  website_id,
  version_number,
  content_json,
  website_status,
  created_at
FROM website_versions;

CREATE TABLE website_media_new (
  id TEXT PRIMARY KEY NOT NULL,
  website_id TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  stored_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL CHECK (
    mime_type IN ('image/jpeg', 'image/png', 'image/webp')
  ),
  file_size INTEGER NOT NULL CHECK (file_size > 0),
  created_at TEXT NOT NULL,
  FOREIGN KEY (website_id) REFERENCES websites_new (id),
  UNIQUE (website_id, stored_filename)
);

INSERT INTO website_media_new (
  id,
  website_id,
  original_filename,
  stored_filename,
  mime_type,
  file_size,
  created_at
)
SELECT
  id,
  website_id,
  original_filename,
  stored_filename,
  mime_type,
  file_size,
  created_at
FROM website_media;

DROP TABLE website_media;
DROP TABLE website_versions;
DROP TABLE websites;

ALTER TABLE websites_new RENAME TO websites;
ALTER TABLE website_versions_new RENAME TO website_versions;
ALTER TABLE website_media_new RENAME TO website_media;

CREATE INDEX idx_websites_updated_at ON websites (updated_at);
CREATE INDEX idx_websites_status ON websites (status);

CREATE INDEX idx_website_versions_website_number
  ON website_versions (website_id, version_number DESC);

CREATE INDEX idx_website_versions_website_created
  ON website_versions (website_id, created_at DESC);

CREATE INDEX idx_website_media_website_created
  ON website_media (website_id, created_at DESC);
