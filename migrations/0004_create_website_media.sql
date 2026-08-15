-- Local Cloudflare D1 schema for Project X Website Service website media metadata.
-- Binary files are stored on the local filesystem, not in D1.
-- Do not modify 0001, 0002, or 0003.

CREATE TABLE website_media (
  id TEXT PRIMARY KEY NOT NULL,
  website_id TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  stored_filename TEXT NOT NULL,
  mime_type TEXT NOT NULL CHECK (
    mime_type IN ('image/jpeg', 'image/png', 'image/webp')
  ),
  file_size INTEGER NOT NULL CHECK (file_size > 0),
  created_at TEXT NOT NULL,
  FOREIGN KEY (website_id) REFERENCES websites (id),
  UNIQUE (website_id, stored_filename)
);

CREATE INDEX idx_website_media_website_created
  ON website_media (website_id, created_at DESC);
