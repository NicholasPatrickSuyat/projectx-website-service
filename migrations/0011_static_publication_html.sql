-- Immutable public HTML for each publication snapshot, plus an explicit
-- pointer to the live publication. Additive only. Do not modify 0001–0010.
-- public_html is generated at Publish (or local backfill) from validated
-- publication content. Draft content_json is never copied here except
-- through Publish. Rollback updates websites.active_publication_id only.

ALTER TABLE website_publications
  ADD COLUMN public_html TEXT NOT NULL DEFAULT '';

ALTER TABLE websites
  ADD COLUMN active_publication_id TEXT;

CREATE INDEX idx_websites_active_publication
  ON websites (active_publication_id);

-- Existing local publications become the live snapshot. public_html is filled
-- by a separate local Node backfill, not by this SQL. Empty HTML fails closed
-- on the public path. Websites with no publications keep NULL.
UPDATE websites
SET active_publication_id = (
  SELECT p.id
  FROM website_publications p
  WHERE p.website_id = websites.id
  ORDER BY p.publication_number DESC
  LIMIT 1
)
WHERE active_publication_id IS NULL;
