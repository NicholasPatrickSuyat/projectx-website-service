-- Development-only seed. Run explicitly with `npm run db:seed`.
-- Never run automatically. Do not use for production.

INSERT INTO clients (
  id,
  business_name,
  category,
  service_model,
  plan,
  status,
  contact_first_name,
  contact_last_name,
  email,
  phone,
  address_line1,
  city,
  state,
  postal_code,
  internal_notes,
  created_at,
  updated_at
) VALUES (
  '11111111-1111-4111-8111-111111111111',
  'Sample Heating Co',
  'SERVICE_BUSINESS',
  'MODEL_A',
  'STARTER',
  'LEAD',
  'Alex',
  'Rivera',
  'alex@sampleheating.example',
  '555-0101',
  '100 Main St',
  'Mesa',
  'AZ',
  '85201',
  'Development seed only.',
  '2026-08-13T12:00:00.000Z',
  '2026-08-13T12:00:00.000Z'
);
