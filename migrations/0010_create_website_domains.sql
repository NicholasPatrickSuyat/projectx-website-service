-- Hostname → Website mapping for local public host resolution.
-- Additive table only. Do not modify migrations 0001–0009.
-- Hostnames are stored normalized (lowercase, no port, no protocol, no path).
-- This is internal routing configuration, not DNS or domain ownership.

CREATE TABLE website_domains (
  id TEXT PRIMARY KEY NOT NULL,
  website_id TEXT NOT NULL,
  hostname TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (website_id) REFERENCES websites (id),
  UNIQUE (hostname)
);

CREATE INDEX idx_website_domains_website_id
  ON website_domains (website_id);

CREATE INDEX idx_website_domains_hostname
  ON website_domains (hostname);
