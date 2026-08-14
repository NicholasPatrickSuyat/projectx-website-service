-- Local Cloudflare D1 schema for Project X Website Service clients.
-- database_id in wrangler.jsonc is a local placeholder only; no remote D1 is created.

CREATE TABLE clients (
  id TEXT PRIMARY KEY NOT NULL,
  business_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (
    category IN ('SERVICE_BUSINESS', 'RESTAURANT_FOOD', 'SALON_BEAUTY')
  ),
  service_model TEXT NOT NULL CHECK (
    service_model IN ('MODEL_A', 'MODEL_B')
  ),
  plan TEXT NOT NULL CHECK (plan IN ('STARTER', 'BUSINESS', 'PLUS')),
  status TEXT NOT NULL CHECK (status IN ('LEAD', 'ACTIVE', 'INACTIVE')),
  contact_first_name TEXT,
  contact_last_name TEXT,
  email TEXT,
  phone TEXT,
  address_line1 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  internal_notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_clients_status ON clients (status);
CREATE INDEX idx_clients_updated_at ON clients (updated_at);
CREATE INDEX idx_clients_business_name ON clients (business_name);
