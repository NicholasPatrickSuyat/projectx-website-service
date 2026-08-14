-- Local Cloudflare D1 schema for Project X Website Service website drafts.
-- One Website per Client in V1. Do not modify 0001_create_clients.sql.

CREATE TABLE websites (
  id TEXT PRIMARY KEY NOT NULL,
  client_id TEXT NOT NULL UNIQUE,
  template_id TEXT NOT NULL CHECK (template_id IN ('service-modern-01')),
  name TEXT NOT NULL,
  status TEXT NOT NULL CHECK (
    status IN ('DRAFT', 'READY_FOR_APPROVAL', 'READY_TO_PUBLISH')
  ) DEFAULT 'DRAFT',
  content_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (client_id) REFERENCES clients (id)
);

CREATE INDEX idx_websites_updated_at ON websites (updated_at);
CREATE INDEX idx_websites_status ON websites (status);
